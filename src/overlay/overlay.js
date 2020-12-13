import Vue from 'vue';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBookmark, faTrashAlt, faEdit, faCloudUploadAlt, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faBookmark, faTrashAlt, faEdit, faCloudUploadAlt, faUndo);
Vue.component('fa-icon', FontAwesomeIcon);
Vue.config.productionTip = false;

// inject a custom div into current page
const body = document.querySelector('body');
const container = document.createElement('div');
body.appendChild(container);

new Vue({
  el: container,
  render: h => h(App),
});
