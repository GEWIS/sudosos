import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const SudososRed = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#D40000',
          inverseColor: '#ffffff',
          hoverColor: '#C40000',
          activeColor: '#D40000',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#D40000',
        },
      },
      dark: {
        primary: {
          color: '#D40000',
          inverseColor: '#ffffff',
          contrastColor: '#ffffff',
          hoverColor: '#C40000',
          activeColor: '#D40000',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#D40000',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#B40000',
          },
        },
      },
    },
  },
});
