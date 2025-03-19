import { FormControlLabel, Switch } from '@mui/material';

interface NotationToggleProps {
  value: boolean;
  onChange: (useNashville: boolean) => void;
}

export const NotationToggle: React.FC<NotationToggleProps> = ({ value, onChange }) => {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label="Use Nashville Numbers"
    />
  );
}; 