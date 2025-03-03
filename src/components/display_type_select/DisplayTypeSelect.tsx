import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setDisplayType } from 'store';
import { DisplayType } from 'types';

export const DisplayTypeSelect = () => {
  const dispatch = useDispatch();
  const displayType = useSelector((state: RootState) => state.guitar.displayType);

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Display Type</InputLabel>
      <Select
        value={displayType}
        label="Display Type"
        onChange={(e) => dispatch(setDisplayType(e.target.value as DisplayType))}
      >
        <MenuItem value="scale">Scale</MenuItem>
        <MenuItem value="arpeggio">Arpeggio</MenuItem>
        <MenuItem value="triad">Triad</MenuItem>
      </Select>
    </FormControl>
  );
};  