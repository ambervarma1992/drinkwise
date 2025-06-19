import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { DrinkEntry } from '../types';
import { LocalBar, Timer, Speed, EmojiEmotions } from '@mui/icons-material';

interface DrinksTableProps {
  drinks: DrinkEntry[];
}

export function DrinksTable({ drinks }: DrinksTableProps): React.ReactElement {
  const calculateDrinksPerHour = (drinkIndex: number): string => {
    const totalDrinks = drinkIndex + 1;
    const hoursDiff = (drinks[drinkIndex].timestamp.getTime() - drinks[0].timestamp.getTime()) / (1000 * 60 * 60);
    return Math.round(totalDrinks / Math.max(hoursDiff, 1)).toString();
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer sx={{ color: '#ff4081' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Time</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                  <LocalBar sx={{ color: '#00bcd4' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Units</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                  <EmojiEmotions sx={{ color: '#ff4081' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Buzz Level</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                  <Speed sx={{ color: '#00bcd4' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Drinks/Hour</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Time Since Start</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drinks.map((drink, index) => (
              <TableRow 
                key={drink.timestamp.getTime()}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                <TableCell>
                  {drink.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell align="right">{drink.units}</TableCell>
                <TableCell align="right">
                  <Typography
                    sx={{
                      color: drink.buzzLevel > 7 ? '#ff4081' : 
                             drink.buzzLevel > 4 ? '#00bcd4' : 
                             'text.primary'
                    }}
                  >
                    {drink.buzzLevel}/10
                  </Typography>
                </TableCell>
                <TableCell align="right">{calculateDrinksPerHour(index)}</TableCell>
                <TableCell align="right">
                  {formatTimeDifference(drink.timestamp, drinks[0].timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function formatTimeDifference(current: Date, start: Date): string {
  const diffSeconds = Math.floor((current.getTime() - start.getTime()) / 1000);
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
} 