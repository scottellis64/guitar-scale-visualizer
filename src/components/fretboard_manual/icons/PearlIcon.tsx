import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const PearlIcon = React.forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => {
  return (
    <SvgIcon ref={ref} viewBox="0 0 100 100" {...props}>
      <defs>
        <radialGradient id="pearlGradient" cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f0f0f0" />
          <stop offset="70%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#d0d0d0" />
        </radialGradient>
        <radialGradient id="pearlHighlight" cx="30%" cy="30%" r="20%" fx="25%" fy="25%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#pearlGradient)" />
      <circle cx="50" cy="50" r="45" fill="url(#pearlHighlight)" />
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="rgba(255,255,255,0.5)" 
        strokeWidth="1"
      />
    </SvgIcon>
  );
});

PearlIcon.displayName = 'PearlIcon'; 