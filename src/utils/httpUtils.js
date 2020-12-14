import axios from 'axios';

const instance = createInstance('https://api.saltynote.com');

function createInstance(baseURL) {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// TODO: to be improved
export function login(username, password) {
  return instance
    .post('/login', {
      username: username,
      password: password,
    })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
}
