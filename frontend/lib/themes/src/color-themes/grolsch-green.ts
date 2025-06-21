import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const GrolschGreen = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#004b31',
          inverseColor: '#ffffff',
          hoverColor: '#003021',
          activeColor: '#004b31',
        },
      },
      dark: {
        primary: {
          color: '#004b31',
          inverseColor: '#ffffff',
          contrastColor: '#ffffff',
          hoverColor: '#003021',
          activeColor: '#004b31',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#35831a',
          },
        },
      },
    },
  },
});
