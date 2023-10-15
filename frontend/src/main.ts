/* eslint vue/multi-word-component-names: 0 */
/* eslint vue/no-reserved-component-names: 0 */
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Button from "primevue/button";
import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import InputText from "primevue/inputtext";
import Menubar from "primevue/menubar";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import InputNumber from "primevue/inputnumber";
import Dialog from "primevue/dialog";
import 'primeicons/primeicons.css';
import languages from "@/locales";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import TabView from "primevue/tabview";
import ScrollPanel from "primevue/scrollpanel";
import FileUpload from "primevue/fileupload";
import { populateStoresFromToken } from "@sudosos/sudosos-frontend-common";

const app = createApp(App);

const messages = Object.assign(languages);
const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});
app.use(createPinia());
app.use(router);
app.use(PrimeVue);
app.use(i18n);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Menubar', Menubar);
app.component('Panel', Panel);
app.component('DataTable', DataTable);
app.component('InputNumber', InputNumber);
app.component('Dialog', Dialog);
app.component('Dropdown', Dropdown);
app.component('Checkbox', Checkbox);
app.component('TabView', TabView);
app.component('ScrollPanel', ScrollPanel);
app.component('FileUpload', FileUpload);
app.component('InputNumber', InputNumber);
populateStoresFromToken();
app.mount('#app');
