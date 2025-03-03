import { Theme as MuiTheme } from '@mui/material';

export interface GuitarTheme extends Omit<MuiTheme, 'fretboard'> {
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
  };
} 