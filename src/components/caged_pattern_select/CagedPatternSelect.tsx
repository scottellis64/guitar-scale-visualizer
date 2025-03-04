import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { CagedPattern } from 'types';

interface CagedPatternSelectProps {
  value: CagedPattern;
  onChange: (pattern: CagedPattern) => void;
}

export const CagedPatternSelect: React.FC<CagedPatternSelectProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>CAGED Pattern</InputLabel>
      <Select
        value={value || 'none'}
        label="CAGED Pattern"
        onChange={(e: SelectChangeEvent<CagedPattern | 'none'>) => 
          onChange(e.target.value === 'none' ? null : e.target.value as CagedPattern)
        }
      >
        <MenuItem value="none">None</MenuItem>
        <MenuItem value="C">C</MenuItem>
        <MenuItem value="A">A</MenuItem>
        <MenuItem value="G">G</MenuItem>
        <MenuItem value="E">E</MenuItem>
        <MenuItem value="D">D</MenuItem>
      </Select>
    </FormControl>
  );
}; 