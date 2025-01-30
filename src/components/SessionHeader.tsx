import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { DrinkSession } from '../types';

interface SessionHeaderProps {
  session: DrinkSession;
}

export function SessionHeader({ session }: SessionHeaderProps): React.ReactElement {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom>
        {session.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Started at {session.startTime.toLocaleString()}
      </Typography>
    </Paper>
  );
} 