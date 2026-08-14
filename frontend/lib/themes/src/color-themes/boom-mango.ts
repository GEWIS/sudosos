import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const BoomMango = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#9EFF00',
          inverseColor: '#000000',
          contrastColor: '#000000',
          hoverColor: '#7FCC00',
          activeColor: '#74B800',
        },
        secondary: {
          color: '#000000',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#9EFF00',
        },
      },
      dark: {
        primary: {
          color: '#9EFF00',
          inverseColor: '#000000',
          contrastColor: '#000000',
          hoverColor: '#7FCC00',
          activeColor: '#74B800',
        },
        secondary: {
          color: '#9EFF00',
        },
        highlight: {
          background: 'rgba(0,0,0,0)',
          color: '#9EFF00',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#74B800',
          },
        },
      },
    },
  },
});
