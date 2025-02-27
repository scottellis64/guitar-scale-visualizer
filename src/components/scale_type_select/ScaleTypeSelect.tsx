import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/store';
import { setScaleType } from 'store/guitarSlice';
import { ScaleType } from 'types';

const SCALE_TYPES: ScaleType[] = ['major', 'minor', 'pentatonic', 'blues'];

export const ScaleTypeSelect = () => {
  const dispatch = useDispatch();
  const scaleType = useSelector((state: RootState) => state.guitar.scaleType);

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Scale Type</InputLabel>
      <Select
        value={scaleType}
        label="Scale Type"
        onChange={(e) => dispatch(setScaleType(e.target.value as ScaleType))}
      >
        {SCALE_TYPES.map(scale => (
          <MenuItem key={scale} value={scale}>{scale}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};  