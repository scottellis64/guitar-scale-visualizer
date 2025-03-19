import { Box, styled } from '@mui/material';
import { GuitarTheme } from 'themes';

export const Marker = styled(Box)(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: (theme as GuitarTheme).fretboard.marker,
})); 