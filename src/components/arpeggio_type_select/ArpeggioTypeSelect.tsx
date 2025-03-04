import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { ArpeggioType } from 'types';

interface ArpeggioTypeSelectProps {
  value: ArpeggioType;
  onChange: (type: ArpeggioType) => void;
}

export const ArpeggioTypeSelect: React.FC<ArpeggioTypeSelectProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Arpeggio Type</InputLabel>
      <Select
        value={value}
        label="Arpeggio Type"
        onChange={(e: SelectChangeEvent<ArpeggioType>) => onChange(e.target.value as ArpeggioType)}
      >
        <MenuItem value="major">Major</MenuItem>
        <MenuItem value="minor">Minor</MenuItem>
        <MenuItem value="diminished">Diminished</MenuItem>
        <MenuItem value="augmented">Augmented</MenuItem>
        <MenuItem value="dominant7">Dominant 7</MenuItem>
      </Select>
    </FormControl>
  );
};  