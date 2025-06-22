import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const BetaBlue = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#1e3a8a',
          inverseColor: '#ffffff',
          hoverColor: '#1e40af',
          activeColor: '#1e3a8a',
        },
      },
      dark: {
        primary: {
          color: '#1e3a8a',
          inverseColor: '#ffffff',
          contrastColor: '#ffffff',
          hoverColor: '#1e40af',
          activeColor: '#1e3a8a',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#1e3a8a',
          },
        },
      },
    },
  },
});
