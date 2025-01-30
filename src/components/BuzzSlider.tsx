import React from 'react';
import { Slider, Box, Typography } from '@mui/material';

interface BuzzSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const marks = [
  { value: 0, label: 'Sober' },
  { value: 2, label: 'Tipsy' },
  { value: 5, label: 'Buzzed' },
  { value: 8, label: 'Drunk' },
  { value: 10, label: 'Wasted' },
];

export const BuzzSlider: React.ComponentType<BuzzSliderProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
      <Typography gutterBottom>
        How buzzed are you feeling? ({value}/10)
      </Typography>
      <Slider
        value={value}
        min={0}
        max={10}
        step={1}
        marks={marks}
        onChange={(_, newValue) => onChange(newValue as number)}
        sx={{
          '& .MuiSlider-markLabel': {
            fontSize: '0.8rem',
          },
        }}
      />
    </Box>
  );
}; 