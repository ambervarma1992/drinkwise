import React, { useState } from 'react';
import { Button, Paper, Box } from '@mui/material';
import { LocalBar } from '@mui/icons-material';
import { BuzzSlider } from './BuzzSlider';

interface DrinkEntryProps {
  onAddDrink: (buzzLevel: number) => void;
}

export function DrinkEntry({ onAddDrink }: DrinkEntryProps): React.ReactElement {
  const [buzzLevel, setBuzzLevel] = useState<number>(0);

  const handleAddDrink = () => {
    onAddDrink(buzzLevel);
    setBuzzLevel(0);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <BuzzSlider value={buzzLevel} onChange={setBuzzLevel} />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<LocalBar />}
          onClick={handleAddDrink}
          sx={{ minWidth: 200 }}
        >
          Add Drink
        </Button>
      </Box>
    </Paper>
  );
} 