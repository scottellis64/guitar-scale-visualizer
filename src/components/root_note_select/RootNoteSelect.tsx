import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setRootNote } from 'store';
import { Note } from 'types';

const NOTES: Note[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export const RootNoteSelect = () => {
  const dispatch = useDispatch();
  const rootNote = useSelector((state: RootState) => state.guitar.rootNote);

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Root Note</InputLabel>
      <Select
        value={rootNote}
        label="Root Note"
        onChange={(e) => dispatch(setRootNote(e.target.value as Note))}
      >
        {NOTES.map(note => (
          <MenuItem key={note} value={note}>{note}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 