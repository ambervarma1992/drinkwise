import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography
} from '@mui/material';
import { LocalBar } from '@mui/icons-material';
import { BuzzSlider } from './BuzzSlider';

interface DrinkEntryModalProps {
  open: boolean;
  onClose: () => void;
  onAddDrink: (buzzLevel: number, units: number) => void;
}

export function DrinkEntryModal({ open, onClose, onAddDrink }: DrinkEntryModalProps): React.ReactElement {
  const [buzzLevel, setBuzzLevel] = useState<number>(0);
  const [units, setUnits] = useState<number>(1);

  const handleAddDrink = () => {
    onAddDrink(buzzLevel, units);
    setBuzzLevel(0);
    setUnits(1);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Drink</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography gutterBottom>Buzz Level</Typography>
          <BuzzSlider value={buzzLevel} onChange={setBuzzLevel} />
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Number of Drink Units</Typography>
            <TextField
              type="number"
              value={units}
              onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<LocalBar />}
          onClick={handleAddDrink}
        >
          Add Drink
        </Button>
      </DialogActions>
    </Dialog>
  );
} 