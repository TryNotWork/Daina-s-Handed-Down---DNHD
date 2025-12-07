import { createApp } from 'vue';
import App from './App.vue';
import router from './router/router.js';
import VueLazyload from 'vue-lazyload';

createApp(App).use(router).use(VueLazyload).mount('#app')
