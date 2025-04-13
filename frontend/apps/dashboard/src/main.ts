/* eslint vue/multi-word-component-names: 0 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@gewis/splash';

import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import './styles/themes/sudosos-light/theme.scss';
import Image from 'primevue/image';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import Calendar from 'primevue/calendar';
import DataView from 'primevue/dataview';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import Steps from 'primevue/steps';
import 'primeicons/primeicons.css';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import TabView from 'primevue/tabview';
import ScrollPanel from 'primevue/scrollpanel';
import FileUpload from 'primevue/fileupload';
import Tooltip from 'primevue/tooltip';
import SelectButton from 'primevue/selectbutton';
import 'primeflex/primeflex.css';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Accordion from 'primevue/accordion';
import Skeleton from 'primevue/skeleton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ProgressSpinner from 'primevue/progressspinner';
import ToggleButton from 'primevue/togglebutton';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import InputSwitch from 'primevue/inputswitch';
import Divider from 'primevue/divider';
import Column from 'primevue/column';
import App from './App.vue';
import router from './router';
import i18n from './utils/i18nUtils';
import beforeLoad from '@/utils/beforeLoadUtil';

const app = createApp(App);

app.use(i18n);
app.use(createPinia());
app.use(PrimeVue);

app.use(ToastService);
app.use(ConfirmationService);

// eslint-disable-next-line vue/no-reserved-component-names
app.component('Button', Button);
app.component('InputText', InputText);
app.component('InputSwitch', InputSwitch);
app.component('Menubar', Menubar);
app.component('Message', Message);
app.component('Panel', Panel);
app.component('DataTable', DataTable);
app.component('DataView', DataView);
app.component('InputNumber', InputNumber);
// eslint-disable-next-line vue/no-reserved-component-names
app.component('Image', Image);
// eslint-disable-next-line vue/no-reserved-component-names
app.component('Dialog', Dialog);
app.component('Dropdown', Dropdown);
app.component('Checkbox', Checkbox);
app.component('TabView', TabView);
app.component('ScrollPanel', ScrollPanel);
app.component('FileUpload', FileUpload);
app.component('Toast', Toast);
app.component('Accordion', Accordion);
app.component('Skeleton', Skeleton);
app.component('InputIcon', InputIcon);
app.component('IconField', IconField);
app.component('ProgressSpinner', ProgressSpinner);
app.component('SelectButton', SelectButton);
app.directive('tooltip', Tooltip);
app.component('ToggleButton', ToggleButton);
app.component('Steps', Steps);
app.component('Calendar', Calendar);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Divider', Divider);
app.component('Column', Column);

void beforeLoad().then(() => {
  app.use(router);
  app.mount('#app');
});
