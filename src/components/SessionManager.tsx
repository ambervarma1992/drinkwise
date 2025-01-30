import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import { LocalBar, Stop } from '@mui/icons-material';
import { DrinkEntryModal } from './DrinkEntryModal';
import { SessionStats } from './SessionStats';
import { DrinksTable } from './DrinksTable';
import { SessionHeader } from './SessionHeader';
import { SessionSummary } from './SessionSummary';
import type { DrinkEntry, DrinkSession } from '../types';
import { saveSession } from '../utils/sessionUtils';

interface SessionManagerProps {
  session: DrinkSession | null;
  onStartSession: (name: string) => void;
  onEndSession: () => void;
}

export function SessionManager({ session: initialSession, onStartSession, onEndSession }: SessionManagerProps): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [drinks, setDrinks] = useState<DrinkEntry[]>([]);
  const [sessionStartTime] = useState<Date>(new Date());
  const [localSession, setLocalSession] = useState(initialSession);
  const [stats, setStats] = useState({
    totalDrinks: 0,
    timeElapsed: 0,
    drinksPerHour: 0,
    currentBuzzLevel: 0,
    peakBuzzLevel: 0,
    peakDrinksPerHour: 0
  });

  // Update local session when prop changes
  useEffect(() => {
    setLocalSession(initialSession);
  }, [initialSession]);

  // Update stats every second
  useEffect(() => {
    if (drinks.length === 0 || !localSession?.isActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTime = drinks[0]?.timestamp || sessionStartTime;
      const elapsedHours = Math.max(1, Math.ceil((now.getTime() - startTime.getTime()) / 3600000));
      const lastDrink = drinks[drinks.length - 1];
      
      setStats({
        totalDrinks: drinks.reduce((sum, drink) => sum + drink.units, 0),
        timeElapsed: Math.floor((now.getTime() - startTime.getTime()) / 1000),
        drinksPerHour: drinks.reduce((sum, drink) => sum + drink.units, 0) / elapsedHours,
        currentBuzzLevel: lastDrink.buzzLevel,
        peakBuzzLevel: Math.max(
          ...drinks.map(drink => drink.buzzLevel),
          0
        ),
        peakDrinksPerHour: drinks.reduce((sum, drink) => sum + drink.units, 0) / elapsedHours
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [drinks, sessionStartTime, localSession?.isActive]);

  const handleStartSession = () => {
    if (sessionName.trim()) {
      onStartSession(sessionName.trim());
      setSessionName('');
      setIsNamePromptOpen(false);
      setDrinks([]);
      setStats({
        totalDrinks: 0,
        timeElapsed: 0,
        drinksPerHour: 0,
        currentBuzzLevel: 0,
        peakBuzzLevel: 0,
        peakDrinksPerHour: 0
      });
    }
  };

  const handleAddDrink = (buzzLevel: number, units: number) => {
    if (!localSession) return;

    const newDrink: DrinkEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      buzzLevel,
      units
    };

    // Update both local drinks state and session
    const updatedDrinks = [...drinks, newDrink];
    setDrinks(updatedDrinks);
    
    // Update session with new drink
    const updatedSession = {
      ...localSession,
      drinks: updatedDrinks
    };
    setLocalSession(updatedSession);
    saveSession(updatedSession);
  };

  const handleEndSession = () => {
    if (!localSession) return;
    const endedSession = {
      ...localSession,
      endTime: new Date(),
      isActive: false,
    };
    setLocalSession(endedSession);
    setIsSummaryOpen(true);
    onEndSession();
  };

  const handleCloseSession = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      setIsSummaryOpen(false);
      setLocalSession(null);
      setDrinks([]);
      setStats({
        totalDrinks: 0,
        timeElapsed: 0,
        drinksPerHour: 0,
        currentBuzzLevel: 0,
        peakBuzzLevel: 0,
        peakDrinksPerHour: 0
      });
      localStorage.removeItem('drinkwise_session');
    }
  };

  if (!localSession) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to DrinkWise
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Track your drinks and stay mindful of your consumption
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsNamePromptOpen(true)}
          >
            Start New Session
          </Button>

          <Dialog open={isNamePromptOpen} onClose={() => setIsNamePromptOpen(false)}>
            <DialogTitle>Name Your Session</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Session Name"
                fullWidth
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsNamePromptOpen(false)}>Cancel</Button>
              <Button onClick={handleStartSession} variant="contained">
                Start Session
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    );
  }

  if (localSession && !localSession.isActive) {
    return (
      <SessionSummary
        session={localSession}
        stats={stats}
        onStartNew={() => {
          setIsNamePromptOpen(true);
          setLocalSession(null);
          setDrinks([]);
          setStats({
            totalDrinks: 0,
            timeElapsed: 0,
            drinksPerHour: 0,
            currentBuzzLevel: 0,
            peakBuzzLevel: 0,
            peakDrinksPerHour: 0
          });
        }}
        onGoHome={() => {
          // Clear local state
          setLocalSession(null);
          setDrinks([]);
          setStats({
            totalDrinks: 0,
            timeElapsed: 0,
            drinksPerHour: 0,
            currentBuzzLevel: 0,
            peakBuzzLevel: 0,
            peakDrinksPerHour: 0
          });
          // Clear localStorage
          localStorage.removeItem('drinkwise_session');
          // Then reload
          window.location.reload();
        }}
      />
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <SessionHeader session={localSession} />
        
        {drinks.length > 0 && (
          <>
            <SessionStats stats={stats} />
            <DrinksTable drinks={drinks} />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<LocalBar />}
            onClick={() => setIsModalOpen(true)}
            fullWidth
          >
            Add Drink
          </Button>
          {drinks.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Stop />}
              onClick={handleEndSession}
            >
              End Session
            </Button>
          )}
        </Box>

        <DrinkEntryModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddDrink={handleAddDrink}
        />

        <Dialog
          open={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Session Summary</DialogTitle>
          <DialogContent>
            <SessionStats stats={stats} />
            <DrinksTable drinks={drinks} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSummaryOpen(false)}>Continue Session</Button>
            <Button onClick={handleCloseSession} color="error" variant="contained">
              End Session
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
} 