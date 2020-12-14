import jwt_decode from 'jwt-decode';

const fetchAccessTokenFromCatch = () => {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get('token', function(items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        const accessToken = items.token.access_token;
        const decoded = jwt_decode(accessToken);
        // Check whether it is expired.
        if (Date.now() >= decoded.exp * 1000) {
          // TODO: Try to refresh token.
          reject(new Error('Access token is expired, and cannot have it refreshed.'));
        }
        resolve(items.token);
      }
    });
  });
};

export default function refreshAuthInfo() {
  return Promise.all([fetchAccessTokenFromCatch()])
    .then(vals => {
      let result = {};
      vals.forEach(v => {
        result = { ...result, ...v };
      });
      return result;
    })
    .catch(err => {
      console.error('error = ', err);
    });
}
