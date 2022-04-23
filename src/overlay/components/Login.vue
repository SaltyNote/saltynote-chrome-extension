<template>
  <div class="user-form">
    <img class="mb-4 saltynote-logo" :src="iconUrl" alt="" width="72" height="72" />
    <h1 class="h3 mb-3 font-weight-normal">Please Login</h1>

    <div class="form-group">
      <label class="sr-only">Username</label>
      <input type="text" class="form-control" placeholder="Username" v-model="user.username" autofocus />
    </div>
    <div class="form-group">
      <label class="sr-only">Password</label>
      <input type="password" class="form-control" placeholder="Password" v-model="user.password" />
    </div>
    <button class="btn btn-lg btn-primary btn-block" @click="login">Login</button>
    <p>
      Don't have an account?
      <a class="link-mouse" @click="showSignup">Sign Up</a>
    </p>
  </div>
</template>

<script>
import * as BaseUtils from '../../utils/base';
import toastr from 'toastr';
import * as types from '../../utils/action-types';
import 'toastr/build/toastr.min.css';

export default {
  name: 'Login',
  data() {
    return {
      user: {
        username: '',
        password: '',
      },
      iconUrl: chrome.runtime.getURL('icons/icon.png'),
    };
  },
  created() {
    toastr.options.progressBar = true;
  },
  methods: {
    showSignup() {
      this.$emit('show:signup');
    },
    login() {
      if (!BaseUtils.isUsernameValid(this.user.username) || !BaseUtils.isPasswordValid(this.user.password)) {
        toastr.error('Username or password is not valid');
        return;
      }
      chrome.runtime.sendMessage({ action: types.LOGIN, user: this.user }, response => {
        if (!response.done) {
          toastr.error('Login failed. Username or password may be wrong');
        }
        return true;
      });
    },
  },
};
</script>

<style scoped lang="scss">
.user-form {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
  text-align: center;

  img.saltynote-logo {
    margin: auto;
  }

  .form-control {
    position: relative;
    box-sizing: border-box;
    height: auto;
    padding: 10px;
    font-size: 16px;
  }

  p {
    color: #454343;
  }

  .link-mouse {
    cursor: pointer;
    text-decoration: none;
  }
}
</style>
