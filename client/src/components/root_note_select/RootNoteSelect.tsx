import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Note, ALL_NOTES } from 'types';

interface RootNoteSelectProps {
  value: Note;
  onChange: (note: Note) => void;
}

export const RootNoteSelect: React.FC<RootNoteSelectProps> = ({ value, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Root Note</InputLabel>
      <Select
        value={value}
        label="Root Note"
        onChange={(e: SelectChangeEvent<Note>) => onChange(e.target.value as Note)}
      >
        {ALL_NOTES.map(note => (
          <MenuItem key={note} value={note}>{note}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 