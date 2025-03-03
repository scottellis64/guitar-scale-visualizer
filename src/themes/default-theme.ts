import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface CustomTheme {
    fretboard: {
      wood: string;
      fret: string;
      nut: string;
      marker: string;
      string: string;
      noteScale: string;
      noteArpeggio: string;
      noteText: string;
      cagedPattern: string;
      eRelativePattern: string;
    }
  }
  interface Theme extends CustomTheme {}
  interface ThemeOptions extends Partial<CustomTheme> {}
}

export const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#D84315',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  fretboard: {
    wood: '#f5d6a8',
    fret: '#999999',
    nut: '#666666',
    marker: 'rgba(0, 0, 0, 0.1)',
    string: '#444444',
    noteScale: '#4CAF50',
    noteArpeggio: '#FF5722',
    noteText: '#ffffff',
    cagedPattern: '#FF5722',
    eRelativePattern: '#FF5722',
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});
