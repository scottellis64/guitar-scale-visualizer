import React from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { PearlIcon } from './PearlIcon';

interface PearlIconButtonProps extends Omit<IconButtonProps, 'children'> {
  size?: 'small' | 'medium' | 'large';
  pearlColor?: 'white' | 'cream' | 'pink' | 'blue';
}

const pearlColors = {
  white: {
    gradient: ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0'],
    shadow: '0 0 10px rgba(255,255,255,0.5)',
  },
  cream: {
    gradient: ['#fff9e6', '#fff3cc', '#ffecb3', '#ffe699'],
    shadow: '0 0 10px rgba(255,243,204,0.5)',
  },
  pink: {
    gradient: ['#fff0f3', '#ffe6eb', '#ffd9e3', '#ffccdb'],
    shadow: '0 0 10px rgba(255,204,219,0.5)',
  },
  blue: {
    gradient: ['#f0f8ff', '#e6f3ff', '#d9edff', '#cce7ff'],
    shadow: '0 0 10px rgba(204,231,255,0.5)',
  },
};

export const PearlIconButton = React.forwardRef<HTMLButtonElement, PearlIconButtonProps>((props, ref) => {
  const { size = 'medium', pearlColor = 'white', sx, ...rest } = props;
  
  const colors = pearlColors[pearlColor];
  
  return (
    <IconButton
      ref={ref}
      size={size}
      sx={{
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${colors.gradient[0]} 0%, ${colors.gradient[1]} 50%, ${colors.gradient[2]} 70%, ${colors.gradient[3]} 100%)`,
        boxShadow: colors.shadow,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: colors.shadow.replace('10px', '15px'),
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
        ...sx,
      }}
      {...rest}
    >
      <PearlIcon 
        fontSize={size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium'}
        sx={{
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
        }}
      />
    </IconButton>
  );
});

PearlIconButton.displayName = 'PearlIconButton'; 