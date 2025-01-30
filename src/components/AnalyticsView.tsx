import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileDownload } from '@mui/icons-material';
import { DrinkSession, DrinkEntry } from '../types';
import { getBuzzProgression, getRateProgression } from '../utils/sessionUtils';
import * as XLSX from 'xlsx';

interface AnalyticsViewProps {
  session: DrinkSession;
}

export const AnalyticsView: React.ComponentType<AnalyticsViewProps> = ({ session }) => {
  const buzzData = getBuzzProgression(session.drinks);
  const rateData = getRateProgression(session.drinks);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(session.drinks.map((drink: DrinkEntry) => ({
      timestamp: drink.timestamp.toLocaleString(),
      buzzLevel: drink.buzzLevel,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drinks');
    XLSX.writeFile(wb, `${session.name}_drinks.xlsx`);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Buzz Level Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={buzzData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              name="Buzz Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Drinks Per Hour
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              name="Drinks"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Box>
    </Paper>
  );
}; 