import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setCagedPattern } from 'store';
import { CagedPattern } from 'types';

export const CagedPatternSelect: React.FC = () => {
  const dispatch = useDispatch();
  const currentPattern = useSelector((state: RootState) => state.guitar.cagedPattern);

  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel>CAGED Pattern</InputLabel>
      <Select
        value={currentPattern || ''}
        label="CAGED Pattern"
        onChange={(e) => dispatch(setCagedPattern(e.target.value as CagedPattern))}
      >
        <MenuItem value="">None</MenuItem>
        <MenuItem value="C">C Shape</MenuItem>
        <MenuItem value="A">A Shape</MenuItem>
        <MenuItem value="G">G Shape</MenuItem>
        <MenuItem value="E">E Shape</MenuItem>
        <MenuItem value="D">D Shape</MenuItem>
      </Select>
    </FormControl>
  );
}; 