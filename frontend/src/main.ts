import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import '@fortawesome/fontawesome-free/css/all.css';

import App from './App.vue'
import router from './router'
import Button from "primevue/button";
const app = createApp(App)

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

//Add all icons to the library so you can use it in your page
library.add(fas, far, fab);

app.use(createPinia())
app.use(router)
app.use(PrimeVue);

app.component('Button', Button);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount('#app')
