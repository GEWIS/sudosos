import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const IvvNavy = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#14213d', // navy blue as primary
          inverseColor: '#ffffff',
          hoverColor: '#23325b', // slightly lighter navy for hover
          activeColor: '#14213d',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#800020', // bordeaux red as accent/highlight
        },
      },
      dark: {
        primary: {
          color: '#800020', // navy blue as primary in dark
          inverseColor: '#ffffff',
          contrastColor: '#ffffff',
          hoverColor: '#23325b',
          activeColor: '#14213d',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#800020', // bordeaux red as accent/highlight
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#800020', // navy blue for menubar
          },
        },
        light: {
          root: {
            background: '#800020',
          },
        },
      },
    },
  },
});
