import { Box, styled } from '@mui/material';
import { GuitarTheme } from 'themes';

export const String = styled(Box)<{ orientation?: 'horizontal' | 'vertical' }>(({ theme, orientation = 'horizontal' }) => ({
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    height: orientation === 'vertical' ? 'auto' : 40,
    width: orientation === 'vertical' ? 40 : 'auto',
    gap: 1,
    position: 'relative',
    borderBottom: orientation === 'vertical' ? 'none' : `2px solid ${(theme as GuitarTheme).fretboard.string}`,
    borderRight: orientation === 'vertical' ? `2px solid ${(theme as GuitarTheme).fretboard.string}` : 'none',
  })); 