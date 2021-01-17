<template>
  <div class="user-form">
    <img class="mb-4 logo" :src="iconUrl" alt="" width="72" height="72" />
    <h1 class="h3 mb-3 font-weight-normal">Please Signup</h1>
    <label class="sr-only">Username</label>
    <input type="text" class="form-control" placeholder="Username" v-model="user.username" autofocus />
    <label class="sr-only">Email</label>
    <input type="email" class="form-control" placeholder="Your Email" v-model="user.email" />
    <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2" />
    <div class="input-group mb-3">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" id="button-addon2">Button</button>
      </div>
    </div>
    <label class="sr-only">Password</label>
    <input type="password" class="form-control" placeholder="Password" v-model="user.password" />
    <label class="sr-only">Password Confirmation</label>
    <input type="password" class="form-control" placeholder="Password Confirmation" v-model="user.passwordCfm" />
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
  methods: {
    showLogin() {
      this.$emit('show:login');
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

  .form-control:focus {
    z-index: 2;
  }

  input {
    margin-bottom: -1px;
    border-radius: 0;
  }

  button {
    margin-top: 11px;
  }

  .link-mouse {
    cursor: pointer;
    text-decoration: none;
  }
}
</style>
