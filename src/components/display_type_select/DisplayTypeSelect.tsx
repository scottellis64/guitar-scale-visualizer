import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { DisplayType } from 'types';

interface DisplayTypeSelectProps {
  value: DisplayType;
  onChange: (type: DisplayType) => void;
}

export const DisplayTypeSelect: React.FC<DisplayTypeSelectProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Display Type</InputLabel>
      <Select
        value={value}
        label="Display Type"
        onChange={(e: SelectChangeEvent<DisplayType>) => onChange(e.target.value as DisplayType)}
      >
        <MenuItem value="scale">Scale</MenuItem>
        <MenuItem value="arpeggio">Arpeggio</MenuItem>
        <MenuItem value="triad">Triad</MenuItem>
      </Select>
    </FormControl>
  );
};  