import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { SessionStats as SessionStatsType } from '../types';

interface SessionStatsProps {
  stats: SessionStatsType;
}

export function SessionStats({ stats }: SessionStatsProps): React.ReactElement {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Total Drinks"
            value={stats.totalDrinks.toString()}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Time"
            value={formatSeconds(stats.timeElapsed)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Per Hour"
            value={stats.drinksPerHour.toFixed(1)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Buzz"
            value={`${stats.currentBuzzLevel}/10`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

interface StatsBoxProps {
  title: string;
  value: string;
}

function StatsBox({ title, value }: StatsBoxProps): React.ReactElement {
  return (
    <Box textAlign="center" sx={{ p: 1 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        {value}
      </Typography>
    </Box>
  );
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
} 