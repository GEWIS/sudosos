/* eslint vue/multi-word-component-names: 0 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@gewis/splash';
import './assets/main.css';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Image from 'primevue/image';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import Steps from 'primevue/steps';
import 'primeicons/primeicons.css';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import ScrollPanel from 'primevue/scrollpanel';
import FileUpload from 'primevue/fileupload';
import Tooltip from 'primevue/tooltip';
import SelectButton from 'primevue/selectbutton';
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
import ToggleSwitch from 'primevue/toggleswitch';
import Divider from 'primevue/divider';
import Column from 'primevue/column';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Stepper from 'primevue/stepper';
import Step from 'primevue/step';
import StepList from 'primevue/steplist';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import VirtualScroller from 'primevue/virtualscroller';

import { SudososRed } from '@sudosos/themes';

import { AccordionContent, AccordionHeader, AccordionPanel } from 'primevue';
import App from './App.vue';
import router from './router';
import i18n from './utils/i18nUtils';
import beforeLoad from '@/utils/beforeLoadUtil';

const app = createApp(App);

app.use(i18n);
app.use(createPinia());
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
app.use(ConfirmationService);

// eslint-disable-next-line vue/no-reserved-component-names
app.component('Button', Button);
app.component('InputText', InputText);
app.component('ToggleSwitch', ToggleSwitch);
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
// eslint-disable-next-line vue/no-reserved-component-names
app.component('Select', Select);
app.component('Checkbox', Checkbox);
app.component('ScrollPanel', ScrollPanel);
app.component('FileUpload', FileUpload);
app.component('Toast', Toast);
app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('AccordionHeader', AccordionHeader);
app.component('AccordionContent', AccordionContent);
app.component('Skeleton', Skeleton);
app.component('InputIcon', InputIcon);
app.component('IconField', IconField);
app.component('ProgressSpinner', ProgressSpinner);
app.component('SelectButton', SelectButton);
app.directive('tooltip', Tooltip);
app.component('ToggleButton', ToggleButton);
app.component('Steps', Steps);
app.component('DatePicker', DatePicker);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Divider', Divider);
app.component('Column', Column);
app.component('Tabs', Tabs);
app.component('Tab', Tab);
app.component('TabList', TabList);
app.component('TabPanels', TabPanels);
app.component('TabPanel', TabPanel);
app.component('Stepper', Stepper);
app.component('StepList', StepList);
app.component('Step', Step);
app.component('Card', Card);
app.component('Badge', Badge);
app.component('VirtualScroller', VirtualScroller);

void beforeLoad().then(() => {
  app.use(router);
  app.mount('#app');
});
