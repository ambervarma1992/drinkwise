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
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell align="right">Units</TableCell>
            <TableCell align="right">Buzz Level</TableCell>
            <TableCell align="right">Time Since Start</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drinks.map((drink) => (
            <TableRow key={drink.timestamp.getTime()}>
              <TableCell>
                {drink.timestamp.toLocaleTimeString()}
              </TableCell>
              <TableCell align="right">{drink.units}</TableCell>
              <TableCell align="right">{drink.buzzLevel}</TableCell>
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
  const seconds = diffSeconds % 60;
  
  return `${hours}h ${minutes}m ${seconds}s`;
} 