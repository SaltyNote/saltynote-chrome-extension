import Vue from 'vue';
import App from './App';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faSearch);
Vue.component('fa-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

global.browser = require('webextension-polyfill');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
