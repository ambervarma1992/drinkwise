import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { DrinkEntry } from '../types';

interface DrinksTableProps {
  drinks: DrinkEntry[];
}

export function DrinksTable({ drinks }: DrinksTableProps): React.ReactElement {
  const calculateDrinksPerHour = (currentDrinkIndex: number): string => {
    if (currentDrinkIndex === 0) return "0.0";
    const currentDrink = drinks[currentDrinkIndex];
    const firstDrink = drinks[0];
    const hoursDiff = (currentDrink.timestamp.getTime() - firstDrink.timestamp.getTime()) / 3600000;
    const totalDrinks = drinks.slice(0, currentDrinkIndex).reduce((sum, d) => sum + d.units, 0);
    return (totalDrinks / Math.max(hoursDiff, 1)).toFixed(1);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell align="right">Units</TableCell>
            <TableCell align="right">Buzz Level</TableCell>
            <TableCell align="right">Drinks/Hour</TableCell>
            <TableCell align="right">Time Since Start</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drinks.map((drink, index) => (
            <TableRow key={drink.timestamp.getTime()}>
              <TableCell>
                {drink.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell align="right">{drink.units}</TableCell>
              <TableCell align="right">{drink.buzzLevel}</TableCell>
              <TableCell align="right">{calculateDrinksPerHour(index)}</TableCell>
              <TableCell align="right">
                {formatTimeDifference(drink.timestamp, drinks[0].timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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