import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setERelativePattern } from 'store';
import { ERelativePattern } from 'types';

export const ERelativePatternSelect: React.FC = () => {
  const dispatch = useDispatch();
  const currentPattern = useSelector((state: RootState) => state.guitar.eRelativePattern);

  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel>E Relative Pattern</InputLabel>
      <Select
        value={currentPattern || ''}
        label="E Relative Pattern"
        onChange={(e) => dispatch(setERelativePattern(e.target.value as ERelativePattern))}
      >
        <MenuItem value="">None</MenuItem>
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