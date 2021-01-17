<template>
  <div class="user-form">
    <img class="mb-4 logo" :src="iconUrl" alt="" width="72" height="72" />
    <h1 class="h3 mb-3 font-weight-normal">Please Signup</h1>

    <div class="form-group">
      <input type="text" class="form-control" placeholder="Username" v-model="user.username" autofocus />
    </div>
    <div class="form-group">
      <input type="email" class="form-control" v-model="user.email" placeholder="Your Email" aria-describedby="emailHelp" />
      <small id="emailHelp" class="form-text text-muted text-left">We'll never share your email with anyone else.</small>
    </div>

    <div class="input-group">
      <input type="text" class="form-control" v-model="user.token" placeholder="Verification Code" />
      <div class="input-group-append">
        <button class="btn btn-outline-primary" type="button" @click="sendCode">Send Code</button>
      </div>
    </div>

    <div class="form-group">
      <input type="password" class="form-control" placeholder="Password" v-model="user.password" />
    </div>

    <div class="form-group">
      <input type="password" class="form-control" placeholder="Password Confirmation" v-model="user.passwordCfm" />
    </div>

    <button class="btn btn-lg btn-primary btn-block" @click="signup">Signup</button>
    <p>
      Have An Account ?
      <a class="link-mouse" @click="showLogin">Login</a>!
    </p>
  </div>
</template>

<script>
import * as BaseUtils from '../../utils/base';
import toastr from 'toastr';
import * as types from '../../utils/action-types';
import 'toastr/build/toastr.min.css';

export default {
  name: 'Signup',
  data() {
    return {
      user: {
        username: '',
        password: '',
        passwordCfm: '',
        email: '',
        token: '',
      },
      iconUrl: chrome.runtime.getURL('icons/icon.png'),
    };
  },
  created() {
    toastr.options.progressBar = true;
  },
  methods: {
    showLogin() {
      this.$emit('show:login');
    },
    sendCode() {
      if (!BaseUtils.isEmail(this.user.email)) {
        toastr.error('Email is not valid', 'SaltyNote');
      }

      toastr.info('Processing, please wait...');

      chrome.runtime.sendMessage({ action: types.VERIFY_EMAIL, email: this.user.email }, response => {
        if (!response.done) {
          toastr.error('Sending code failed. Please try again later');
        } else {
          toastr.success('Verification code is sent to your email.');
        }
        return true;
      });
    },
    signup() {
      if (!BaseUtils.isUsernameValid(this.user.username)) {
        toastr.error('Username should be at least 6 characters with alphanumeric and "-", "_"', 'SaltyNote');
        return;
      }
      if (!BaseUtils.isEmail(this.user.email)) {
        toastr.error('Email is not valid', 'SaltyNote');
        return;
      }
      if (!this.user.token) {
        toastr.error('Email verification code is required', 'SaltyNote');
        return;
      }
      if (!BaseUtils.isPasswordValid(this.user.password) || this.user.password !== this.user.passwordCfm) {
        toastr.error('Password is not valid, it should be at least 6 characters, and be confirmed', 'SaltyNote');
        return;
      }
      chrome.runtime.sendMessage({ action: types.SIGNUP, user: this.user }, response => {
        if (!response.done) {
          toastr.error('Signup failed. Please try again later');
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

  img.logo {
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
