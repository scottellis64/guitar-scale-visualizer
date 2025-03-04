import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Note } from 'types';

const NOTES: Note[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

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
        {NOTES.map(note => (
          <MenuItem key={note} value={note}>{note}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 