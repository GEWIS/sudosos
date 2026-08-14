import { definePreset } from '@primeuix/themes';
import { SudososPreset } from '../sudosos';

export const DefiLilac = definePreset(SudososPreset, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '#9678d3',
          inverseColor: '#ffffff',
          contrastColor: '#2d1650',
          hoverColor: '#7d62b8',
          activeColor: '#674fa0',
        },
        secondary: {
          color: '#a987ed',
          inverseColor: '#ffffff',
        },
        highlight: {
          background: '#f5f2fd',
          color: '#9678d3',
        },
      },
      dark: {
        primary: {
          color: '#9678d3',
          inverseColor: '#1a102a',
          contrastColor: '#ffffff',
          hoverColor: '#bda5e7',
          activeColor: '#d4c2f3',
        },
        secondary: {
          color: '#a987ed',
          inverseColor: '#1a102a',
        },
        highlight: {
          background: '#241740',
          color: '#d4c2f3',
        },
      },
    },
  },
  components: {
    menubar: {
      colorScheme: {
        dark: {
          root: {
            background: '#9678d3',
          },
        },
        light: {
          root: {
            background: '#9678d3',
          },
        },
      },
    },
  },
});
