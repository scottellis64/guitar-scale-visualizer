import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setArpeggioType } from 'store';
import { ArpeggioType } from 'types';

const ARPEGGIO_TYPES: ArpeggioType[] = ['major', 'minor', 'diminished', 'augmented', 'dominant7'];

export const ArpeggioTypeSelect = () => {
  const dispatch = useDispatch();
  const arpeggioType = useSelector((state: RootState) => state.guitar.arpeggioType);

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Arpeggio Type</InputLabel>
      <Select
        value={arpeggioType}
        label="Arpeggio Type"
        onChange={(e) => dispatch(setArpeggioType(e.target.value as ArpeggioType))}
      >
        {ARPEGGIO_TYPES.map(arpeggio => (
          <MenuItem key={arpeggio} value={arpeggio}>{arpeggio}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};  