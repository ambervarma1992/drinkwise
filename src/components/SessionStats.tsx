import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { SessionStats as SessionStatsType } from '../types';

interface SessionStatsProps {
  stats: SessionStatsType;
}

export function SessionStats({ stats }: SessionStatsProps): React.ReactElement {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <StatsBox
            title="Total Drinks"
            value={stats.totalDrinks.toString()}
          />
        </Grid>
        <Grid item xs={3}>
          <StatsBox
            title="Time Elapsed"
            value={formatSeconds(stats.timeElapsed)}
          />
        </Grid>
        <Grid item xs={3}>
          <StatsBox
            title="Drinks/Hour"
            value={stats.drinksPerHour.toFixed(1)}
          />
        </Grid>
        <Grid item xs={3}>
          <StatsBox
            title="Current Buzz"
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
    <Box textAlign="center">
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">
        {value}
      </Typography>
    </Box>
  );
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
} 