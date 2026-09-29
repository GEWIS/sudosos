import './assets/tailwind.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import OpenVue from 'openvue/config';
import '@gewis/splash';

import Button from 'openvue/button';
import ProgressSpinner from 'openvue/progressspinner';
import Panel from 'openvue/panel';
import Dialog from 'openvue/dialog';
import Select from 'openvue/select';
import Toast from 'openvue/toast';
import Card from 'openvue/card';

import Message from 'openvue/message';
import ToastService from 'openvue/toastservice';
import { SudososRed } from '@sudosos/themes';
import router from '@/router';
import App from '@/App.vue';
import { useSettingStore } from '@/stores/settings.store';
import beforeLoad from '@/utils/beforeLoadUtil';

const app = createApp(App);

app.use(OpenVue, {
  theme: {
    preset: SudososRed,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: {
        name: 'openvue',
        // First "basic" tailwind stuff, then overwrite that with openvue, then overwrite that with utility classes
        // See: https://tailwindcss.com/docs/preflight & https://openvue.dev/theming/styled
        order: 'theme, base, component, openvue, utilities',
      },
    },
  },
});
app.use(ToastService);

// eslint-disable-next-line
app.component('Button', Button);
app.component('ProgressSpinner', ProgressSpinner);
// eslint-disable-next-line
app.component('Dialog', Dialog);
// eslint-disable-next-line
app.component('Panel', Panel);
// eslint-disable-next-line
app.component('Select', Select);
// eslint-disable-next-line
app.component('Message', Message);
// eslint-disable-next-line
app.component('Toast', Toast);
// eslint-disable-next-line
app.component('Card', Card);
app.use(createPinia());

void beforeLoad()
  .then(() => {
    app.use(router);
    app.mount('#app');
  })
  .catch((err) => {
    console.error('Failed to initialize application:', err);
  });

// Refresh alcohol time every hour.
setInterval(
  () => {
    void useSettingStore().fetchAlcoholTimeToday();
  },
  1000 * 60 * 60,
);
