import axios from 'axios';
import jwtDecode from 'jwt-decode';
import camelcaseKeys from 'camelcase-keys';

const instance = createInstance('http://pi.hole:8888');

function createInstance(baseURL) {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const isTokenExpired = token => {
  if (!token) return false;
  const decoded = jwtDecode(token);
  return Date.now() >= decoded.exp * 1000;
};

const checkUserAuthInfo = () => {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(['token'], result => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        if (result.token && isTokenExpired(result.token.access_token)) {
          if (isTokenExpired(result.token.refresh_token)) {
            reject(new Error('Access token is expired, and no refresh token found.'));
            return;
          }
          // Use refresh token to renew access token.
          refreshToken(result.token.refresh_token)
            .catch(r => resolve(r))
            .catch(e => reject(e));
        } else {
          resolve(result.token);
        }
      }
    });
  });
};

export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    instance
      .post('/login', {
        username: username,
        password: password,
      })
      .then(response => {
        // Token should be returned here.
        console.log('login response = ', JSON.stringify(response));
        const token = response.data;
        chrome.storage.local.set({ token: token }, function() {
          resolve(token.access_token);
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const signup = (username, email, password) => {
  return new Promise((resolve, reject) => {
    instance
      .post('/signup', {
        username: username,
        email: email,
        password: password,
      })
      .then(response => {
        console.log(response);
        login(username, password)
          .then(r => resolve(r))
          .catch(e => reject(e));
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
};

export const refreshToken = refreshToken => {
  return new Promise((resolve, reject) => {
    instance
      .post('/refresh_token', {
        refresh_token: refreshToken,
      })
      .then(response => {
        // Token should be returned here.
        const token = response.data;
        token.refresh_token = refreshToken;
        chrome.storage.local.set({ token: token }, function() {
          resolve(token.access_token);
        });
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
};

export const fetchAllMyNotes = () => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        instance
          .get('/notes', { headers: { Authorization: authStr } })
          .then(response => {
            // Token should be returned here.
            console.log('notes = ', JSON.stringify(response.data));
            resolve(camelcaseKeys(response.data));
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const fetchAllMyNotesByUrl = url => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        instance
          .post('/notes', { url: url }, { headers: { Authorization: authStr } })
          .then(response => {
            // Token should be returned here.
            resolve(camelcaseKeys(response.data));
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const savePageAnnotation = pageAnnotation => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        instance
          .post('/note', pageAnnotation, { headers: { Authorization: authStr } })
          .then(response => {
            // Token should be returned here.
            console.log('note = ', JSON.stringify(response.data));
            resolve(camelcaseKeys(response.data));
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const updatePageAnnotation = pageAnnotation => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotation.id) {
      reject(new Error('Note update: Missing note id.'));
    }
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        instance
          .post('/note/' + pageAnnotation.id, pageAnnotation, { headers: { Authorization: authStr } })
          .then(response => {
            // Token should be returned here.
            console.log('note = ', JSON.stringify(response.data));
            resolve(camelcaseKeys(response.data));
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};
