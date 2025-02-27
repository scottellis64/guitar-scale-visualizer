import { FormControlLabel, Switch } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/store';
import { setUseNashville } from 'store/guitarSlice';

export const NotationToggle = () => {
  const dispatch = useDispatch();
  const useNashville = useSelector((state: RootState) => state.guitar.useNashville);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={useNashville}
          onChange={(e) => dispatch(setUseNashville(e.target.checked))}
        />
      }
      label="Use Nashville Numbers"
    />
  );
}; 