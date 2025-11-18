import './assets/tailwind.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import '@gewis/splash';

import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Panel from 'primevue/panel';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Toast from 'primevue/toast';
import Card from 'primevue/card';

import Message from 'primevue/message';
import ToastService from 'primevue/toastservice';
import { SudososRed } from '@sudosos/themes';
import router from '@/router';
import App from '@/App.vue';
import { useSettingStore } from '@/stores/settings.store';
import beforeLoad from '@/utils/beforeLoadUtil';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: SudososRed,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: {
        name: 'primevue',
        // First "basic" tailwind stuff, then overwrite that with primevue, then overwrite that with utility classes
        // See: https://tailwindcss.com/docs/preflight & https://primevue.org/theming/styled/#csslayer
        order: 'theme, base, component, primevue, utilities',
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
