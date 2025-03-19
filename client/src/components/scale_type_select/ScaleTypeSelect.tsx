import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { ScaleType } from 'types';

interface ScaleTypeSelectProps {
  value: ScaleType;
  onChange: (type: ScaleType) => void;
}

export const ScaleTypeSelect: React.FC<ScaleTypeSelectProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Scale Type</InputLabel>
      <Select
        value={value}
        label="Scale Type"
        onChange={(e: SelectChangeEvent<ScaleType>) => onChange(e.target.value as ScaleType)}
      >
        <MenuItem value="major">Major</MenuItem>
        <MenuItem value="minor">Minor</MenuItem>
        <MenuItem value="pentatonic">Pentatonic</MenuItem>
        <MenuItem value="blues">Blues</MenuItem>
      </Select>
    </FormControl>
  );
};  