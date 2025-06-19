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

  // Auto-close session after 3 hours of inactivity
  useEffect(() => {
    if (drinks.length === 0 || !localSession?.isActive) return;

    const checkInactivity = () => {
      const lastDrink = drinks[drinks.length - 1];
      const now = new Date();
      const timeSinceLastDrink = now.getTime() - lastDrink.timestamp.getTime();
      const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

      if (timeSinceLastDrink >= threeHoursInMs) {
        console.log('Session auto-closed due to 3 hours of inactivity');
        handleEndSession();
      }
    };

    // Check every minute for inactivity
    const inactivityInterval = setInterval(checkInactivity, 60000);
    
    return () => clearInterval(inactivityInterval);
  }, [drinks, localSession?.isActive]);

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

  const handleResumeSession = () => {
    if (!localSession) return;
    
    // Reactivate the session
    const reactivatedSession = {
      ...localSession,
      endTime: undefined,
      isActive: true,
    };
    setLocalSession(reactivatedSession);
    saveSession(reactivatedSession);
  };

  if (!localSession) {
    return (
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            mt: 4, 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #00bcd4, #ff4081)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 3
            }}
          >
            Welcome to DrinkWise
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4,
              color: 'text.secondary',
              fontWeight: 400
            }}
          >
            Track your drinks and stay mindful of your consumption
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsNamePromptOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #00bcd4, #ff4081)',
              '&:hover': {
                background: 'linear-gradient(45deg, #008ba3, #c60055)',
              }
            }}
          >
            Start New Session
          </Button>

          <Dialog 
            open={isNamePromptOpen} 
            onClose={() => setIsNamePromptOpen(false)}
            PaperProps={{
              sx: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>Name Your Session</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Session Name"
                fullWidth
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setIsNamePromptOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStartSession} 
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #00bcd4, #ff4081)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #008ba3, #c60055)',
                  }
                }}
              >
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
        onResume={handleResumeSession}
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
          <Box sx={{ mt: 4 }}>
            <SessionStats stats={stats} />
            <DrinksTable drinks={drinks} />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<LocalBar />}
            onClick={() => setIsModalOpen(true)}
            fullWidth
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #00bcd4, #ff4081)',
              '&:hover': {
                background: 'linear-gradient(45deg, #008ba3, #c60055)',
              }
            }}
          >
            Add Drink
          </Button>
          {drinks.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Stop />}
              onClick={handleEndSession}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  borderColor: 'error.main',
                }
              }}
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
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>Session Summary</DialogTitle>
          <DialogContent>
            <SessionStats stats={stats} />
            <DrinksTable drinks={drinks} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setIsSummaryOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              Continue Session
            </Button>
            <Button 
              onClick={handleCloseSession} 
              color="error" 
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #ff4081, #c60055)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c60055, #ff4081)',
                }
              }}
            >
              End Session
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
} 