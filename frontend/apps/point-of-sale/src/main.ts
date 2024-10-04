// import "bootstrap/dist/css/bootstrap.css";
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css';

import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Panel from "primevue/panel";
import Dialog from "primevue/dialog";
import OverlayPanel from "primevue/overlaypanel";
import Dropdown from "primevue/dropdown";

import router from './router';
import App from './App.vue';
import { useSettingStore } from "@/stores/settings.store";
import Message from "primevue/message";

const app = createApp(App);

app.use(router);
app.use(PrimeVue);

// eslint-disable-next-line
app.component('Button', Button);
app.component('ProgressSpinner', ProgressSpinner);
// eslint-disable-next-line
app.component('Dialog', Dialog);
// eslint-disable-next-line
app.component('Panel', Panel);
app.component('OverlayPanel', OverlayPanel);
// eslint-disable-next-line
app.component('Dropdown', Dropdown);
// eslint-disable-next-line
app.component('Message', Message);

app.use(createPinia());
app.mount('#app');

// Refresh alcohol time every hour.
setInterval(() => {
  useSettingStore().fetchAlcoholTimeToday();
}, 1000*60*60);


