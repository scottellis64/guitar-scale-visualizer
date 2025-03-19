import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { ERelativePattern } from 'types';

interface ERelativePatternSelectProps {
  value: ERelativePattern;
  onChange: (pattern: ERelativePattern) => void;
}

export const ERelativePatternSelect: React.FC<ERelativePatternSelectProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>E-Relative Pattern</InputLabel>
      <Select
        value={value || 'None'}
        label="E-Relative Pattern"
        onChange={(e: SelectChangeEvent<ERelativePattern>) => 
          onChange(e.target.value === 'None' ? null : e.target.value as ERelativePattern)
        }
      >
        <MenuItem value="None">None</MenuItem>
        <MenuItem value="1E">1E Shape</MenuItem>
        <MenuItem value="2D">2D Shape</MenuItem>
        <MenuItem value="3C">3C Shape</MenuItem>
        <MenuItem value="4B">4B Shape</MenuItem>
        <MenuItem value="5A">5A Shape</MenuItem>
        <MenuItem value="6G">6G Shape</MenuItem>
        <MenuItem value="7F">7F Shape</MenuItem>
      </Select>
    </FormControl>
  );
}; 