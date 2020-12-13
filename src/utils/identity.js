const authorizeWithGoogle = () =>
  new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, token => {
      if (token) {
        resolve({ token: token });
      } else {
        reject(new Error('Retrieved token is empty'));
      }
    });
  });

const getUserId = () =>
  new Promise((resolve, reject) => {
    chrome.identity.getProfileUserInfo(userInfo => {
      if (userInfo && userInfo.id) {
        console.log('user id is ', userInfo.id);
        resolve({ id: userInfo.id });
      } else {
        reject(new Error('Cannot read user id info'));
      }
    });
  });

export default function refreshUserInfo() {
  return Promise.all([authorizeWithGoogle(), getUserId()])
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
