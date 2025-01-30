import React from 'react';
import { List, ListItem, ListItemText, Paper } from '@mui/material';
import { DrinkEntry } from '../types';

interface DrinkListProps {
  drinks: DrinkEntry[];
}

export function DrinkList({ drinks }: DrinkListProps): React.ReactElement {
  return (
    <Paper elevation={3}>
      <List>
        {drinks.map((drink, index) => (
          <ListItem key={drink.timestamp.toISOString()}>
            <ListItemText
              primary={`Drink ${index + 1}`}
              secondary={`${drink.units} unit${drink.units > 1 ? 's' : ''} - Buzz Level: ${drink.buzzLevel}/10`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 