import { createTheme } from '@mui/material/styles';

import { defaultTheme } from './default-theme';

export const darkTheme = createTheme({
    ...defaultTheme,
    palette: {
      mode: 'dark',
      primary: {
        main: '#81C784',
        light: '#A5D6A7',
        dark: '#66BB6A',
      },
      secondary: {
        main: '#FF8A65',
        light: '#FFAB91',
        dark: '#FF7043',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
    fretboard: {
      wood: '#3e2723',
      fret: '#9e9e9e',
      nut: '#bdbdbd',
      marker: 'rgba(255, 255, 255, 0.1)',
      string: '#e0e0e0',
      noteScale: '#81C784',
      noteArpeggio: '#FF8A65',
      noteText: '#ffffff',
      cagedPattern: '#FF8A65',
      eRelativePattern: '#FF8A65',
    },
  }); 