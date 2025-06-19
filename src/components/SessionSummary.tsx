import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Home, Add, PlayArrow } from '@mui/icons-material';
import { DrinkSession, SessionStats } from '../types';

interface SessionSummaryProps {
  session: DrinkSession;
  stats: SessionStats;
  onStartNew: () => void;
  onGoHome: () => void;
  onResume?: () => void;
}

export function SessionSummary({ session, stats, onStartNew, onGoHome, onResume }: SessionSummaryProps): React.ReactElement {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Session Summary: {session.name}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {session.startTime.toLocaleString()} - {session.endTime?.toLocaleString()}
      </Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>Session Stats</Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Total Drinks: {stats.totalDrinks}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Time Elapsed: {formatTime(stats.timeElapsed)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Drinks Per Hour: {stats.drinksPerHour.toFixed(1)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Final Buzz Level: {stats.currentBuzzLevel}/10
          </Typography>
          <Typography variant="body1" gutterBottom>
            Peak Buzz Level: {stats.peakBuzzLevel}/10
          </Typography>
          <Typography variant="body1">
            Peak Drink Rate: {stats.peakDrinksPerHour.toFixed(1)}/hr
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
        {onResume && (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={onResume}
            sx={{ 
              flex: 1,
              minWidth: '200px',
              background: 'linear-gradient(45deg, #00bcd4, #2196f3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #008ba3, #1976d2)',
              }
            }}
          >
            RESUME SESSION
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onStartNew}
          sx={{ 
            flex: 1,
            minWidth: '200px',
            background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
            '&:hover': {
              background: 'linear-gradient(45deg, #388e3c, #689f38)',
            }
          }}
        >
          START NEW SESSION
        </Button>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={onGoHome}
          sx={{ 
            flex: 1,
            minWidth: '200px',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          GO TO HOME
        </Button>
      </Box>
    </Container>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
} 