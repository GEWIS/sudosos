import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';
import '@fortawesome/fontawesome-free/css/all.css';

import Button from 'primevue/button';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ProgressSpinner from 'primevue/progressspinner';
import router from './router';
import App from './App.vue';

const app = createApp(App);

// Add all icons to the library so you can use it in your page
library.add(fas, far, fab);

app.use(router);
app.use(PrimeVue);

// eslint-disable-next-line
app.component('Button', Button)
app.component('ProgressSpinner', ProgressSpinner);
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia());
app.mount('#app');
