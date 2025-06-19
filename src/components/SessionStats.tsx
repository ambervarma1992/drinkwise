import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { SessionStats as SessionStatsType } from '../types';
import { LocalBar, Timer, Speed, EmojiEmotions } from '@mui/icons-material';

interface SessionStatsProps {
  stats: SessionStatsType;
}

export function SessionStats({ stats }: SessionStatsProps): React.ReactElement {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Total Drinks"
            value={stats.totalDrinks.toString()}
            icon={<LocalBar />}
            color="#00bcd4"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Time"
            value={formatSeconds(stats.timeElapsed)}
            icon={<Timer />}
            color="#ff4081"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Per Hour"
            value={Math.round(stats.drinksPerHour).toString()}
            icon={<Speed />}
            color="#00bcd4"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsBox
            title="Buzz"
            value={`${stats.currentBuzzLevel}/10`}
            icon={<EmojiEmotions />}
            color="#ff4081"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

interface StatsBoxProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatsBox({ title, value, icon, color }: StatsBoxProps): React.ReactElement {
  return (
    <Box 
      textAlign="center" 
      sx={{ 
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ color, mb: 1 }}>
        {icon}
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600,
          background: `linear-gradient(45deg, ${color}, ${color}80)`,
          backgroundClip: 'text',
          textFillColor: 'transparent',
        }}
      >
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