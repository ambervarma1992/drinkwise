import React from 'react';
import { Paper, Typography, Box, Button, Grid } from '@mui/material';
import { Home, Add } from '@mui/icons-material';
import { DrinkSession, SessionStats } from '../types';

interface SessionSummaryProps {
  session: DrinkSession;
  stats: SessionStats;
  onStartNew: () => void;
  onGoHome: () => void;
}

export function SessionSummary({ session, stats, onStartNew, onGoHome }: SessionSummaryProps): React.ReactElement {
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Session Summary: {session.name}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {new Date(session.startTime).toLocaleString()} - {session.endTime ? new Date(session.endTime).toLocaleString() : 'Ongoing'}
        </Typography>

        <Box sx={{ my: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Session Stats</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography>Total Drinks: {stats.totalDrinks}</Typography>
                <Typography>Time Elapsed: {stats.timeElapsed} seconds</Typography>
                <Typography>Drinks Per Hour: {stats.drinksPerHour.toFixed(1)}</Typography>
                <Typography>Final Buzz Level: {stats.currentBuzzLevel}/10</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Drink History</Typography>
              <Box sx={{ pl: 2 }}>
                {session.drinks.map((drink) => (
                  <Typography key={drink.id}>
                    {new Date(drink.timestamp).toLocaleTimeString()} - 
                    Buzz: {drink.buzzLevel}/10, Units: {drink.units}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onStartNew}
          >
            Start New Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={onGoHome}
          >
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 