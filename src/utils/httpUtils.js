import axios from 'axios';

const instance = createInstance('http://pi.hole:8888');

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

// TODO: to be improved
export function signup(username, email, password) {
  return instance
    .post('/signup', {
      username: username,
      email: email,
      password: password,
    })
    .then(function(response) {
      console.log(response);
      // login(username, password).then(r => )
    })
    .catch(function(error) {
      console.log(error);
    });
}
