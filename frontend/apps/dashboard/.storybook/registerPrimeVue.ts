/* eslint vue/multi-word-component-names: 0 */
import type { App } from 'vue';
import PrimeVue from 'openvue/config';
import ToastService from 'openvue/toastservice';
import ConfirmationService from 'openvue/confirmationservice';
import Button from 'openvue/button';
import Image from 'openvue/image';
import InputText from 'openvue/inputtext';
import Menubar from 'openvue/menubar';
import Message from 'openvue/message';
import Panel from 'openvue/panel';
import DataTable from 'openvue/datatable';
import DataView from 'openvue/dataview';
import DatePicker from 'openvue/datepicker';
import InputNumber from 'openvue/inputnumber';
import Dialog from 'openvue/dialog';
import Steps from 'openvue/steps';
import Select from 'openvue/select';
import Checkbox from 'openvue/checkbox';
import Tabs from 'openvue/tabs';
import TabList from 'openvue/tablist';
import ScrollPanel from 'openvue/scrollpanel';
import FileUpload from 'openvue/fileupload';
import Tooltip from 'openvue/tooltip';
import SelectButton from 'openvue/selectbutton';
import Toast from 'openvue/toast';
import Accordion from 'openvue/accordion';
import Skeleton from 'openvue/skeleton';
import IconField from 'openvue/iconfield';
import InputIcon from 'openvue/inputicon';
import ProgressSpinner from 'openvue/progressspinner';
import ToggleButton from 'openvue/togglebutton';
import ConfirmDialog from 'openvue/confirmdialog';
import ToggleSwitch from 'openvue/toggleswitch';
import Divider from 'openvue/divider';
import Column from 'openvue/column';
import Tab from 'openvue/tab';
import TabPanels from 'openvue/tabpanels';
import TabPanel from 'openvue/tabpanel';
import Stepper from 'openvue/stepper';
import Step from 'openvue/step';
import StepList from 'openvue/steplist';
import Card from 'openvue/card';
import Badge from 'openvue/badge';
import VirtualScroller from 'openvue/virtualscroller';
import MultiSelect from 'openvue/multiselect';
import { AccordionContent, AccordionHeader, AccordionPanel } from 'openvue';
import { SudososRed } from '@sudosos/themes';

// Mirrors src/main.ts's PrimeVue install + global component registration.
// If main.ts registers a new global component, register it here too.
export function registerPrimeVue(app: App, preset: typeof SudososRed) {
  app.use(PrimeVue, {
    theme: {
      preset,
      options: {
        darkModeSelector: '.dark-mode',
        cssLayer: {
          name: 'openvue',
          order: 'theme, base, component, openvue, utilities',
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
  app.component('MultiSelect', MultiSelect);
}
