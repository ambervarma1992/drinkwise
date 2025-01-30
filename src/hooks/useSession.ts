import { useState, useEffect } from 'react';
import { DrinkSession, DrinkEntry, SessionStats } from '../types';
import {
  createSession,
  saveSession,
  loadActiveSession,
} from '../utils/sessionUtils';

export const useSession = () => {
  const [session, setSession] = useState<DrinkSession | null>(null);

  useEffect(() => {
    const loadedSession = loadActiveSession();
    if (loadedSession) {
      // Ensure dates are properly converted
      loadedSession.startTime = new Date(loadedSession.startTime);
      if (loadedSession.endTime) {
        loadedSession.endTime = new Date(loadedSession.endTime);
      }
      loadedSession.drinks = loadedSession.drinks.map(drink => ({
        ...drink,
        timestamp: new Date(drink.timestamp)
      }));
      setSession(loadedSession);
    }
  }, []);

  const startNewSession = (name: string) => {
    const newSession = createSession(name);
    setSession(newSession);
    saveSession(newSession);
  };

  const endSession = () => {
    if (!session) return;
    const endedSession = {
      ...session,
      endTime: new Date(),
      isActive: false,
    };
    setSession(endedSession);
    saveSession(endedSession);
  };

  const addDrink = (buzzLevel: number, units: number) => {
    if (!session) return;
    const newDrink: DrinkEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      buzzLevel,
      units
    };
    const updatedSession = {
      ...session,
      drinks: [...session.drinks, newDrink],
    };
    setSession(updatedSession);
    saveSession(updatedSession);
  };

  const stats: SessionStats | null = session ? {
    totalDrinks: session.drinks.length,
    timeElapsed: Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000),
    drinksPerHour: session.drinks.length / ((new Date().getTime() - session.startTime.getTime()) / 3600000),
    currentBuzzLevel: session.drinks.length > 0 ? session.drinks[session.drinks.length - 1].buzzLevel : 0
  } : null;

  return {
    session,
    stats,
    startNewSession,
    endSession,
    addDrink,
  };
}; 