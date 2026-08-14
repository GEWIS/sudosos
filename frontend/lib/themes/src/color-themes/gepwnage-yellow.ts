import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const GepwnageYellow = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#013370',
          inverseColor: '#FFFF00',
          contrastColor: '#FFFF00',
          hoverColor: '#172b56',
          activeColor: '#013370',
        },
        secondary: {
          color: '#013370',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#FFFF00',
        },
      },
      dark: {
        primary: {
          color: '#013370',
          inverseColor: '#FFFF00',
          contrastColor: '#FFFF00',
          hoverColor: '#172b56',
          activeColor: '#013370',
        },
        secondary: {
          color: '#FFFF00',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#FFFF00',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#013370',
          },
        },
        light: {
          root: {
            background: '#013370',
          },
        },
      },
    },
  },
});
