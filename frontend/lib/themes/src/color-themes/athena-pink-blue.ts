import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const AthenaPinkBlue = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#4ec7e5',
          inverseColor: '#ffffff',
          hoverColor: '#d53d86',
          activeColor: '#ee4a9b',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#4ec7e5',
        },
      },
      dark: {
        primary: {
          color: '#4ec7e5',
          inverseColor: '#ffffff',
          contrastColor: '#ffffff',
          hoverColor: '#d53d86',
          activeColor: '#ee4a9b',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#4ec7e5',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#ee4a9b',
          },
        },
        light: {
          root: {
            background: '#ee4a9b',
          },
        },
      },
    },
  },
});
