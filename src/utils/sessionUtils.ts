import { DrinkEntry, DrinkSession, SessionStats, ChartData } from '../types';

const STORAGE_KEY = 'drinkwise_session';

export const createSession = (name: string): DrinkSession => ({
  id: crypto.randomUUID(),
  name,
  startTime: new Date(),
  isActive: true,
  drinks: [],
});

export const saveSession = (session: DrinkSession): void => {
  try {
    // Convert dates to ISO strings for storage
    const storageSession = {
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : undefined,
      drinks: session.drinks.map(drink => ({
        ...drink,
        timestamp: drink.timestamp.toISOString()
      }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageSession));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const loadActiveSession = (): DrinkSession | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsedData = JSON.parse(data);
    // Convert ISO strings back to Date objects
    const session: DrinkSession = {
      ...parsedData,
      startTime: new Date(parsedData.startTime),
      endTime: parsedData.endTime ? new Date(parsedData.endTime) : undefined,
      drinks: parsedData.drinks.map((drink: any) => ({
        ...drink,
        timestamp: new Date(drink.timestamp)
      }))
    };
    return session;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};

export function calculateStats(session: DrinkSession): SessionStats {
  const now = new Date();
  const timeElapsed = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
  const drinksPerHour = (session.drinks.length / timeElapsed) * 3600;

  return {
    totalDrinks: session.drinks.length,
    timeElapsed,
    drinksPerHour,
    currentBuzzLevel: session.drinks.length > 0 ? session.drinks[session.drinks.length - 1].buzzLevel : 0
  };
}

export const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const getBuzzProgression = (drinks: DrinkEntry[]): ChartData[] => {
  if (!drinks || drinks.length === 0) return [];
  
  const sortedDrinks = drinks.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const startTime = sortedDrinks[0].timestamp.getTime();
  
  return sortedDrinks.map(drink => ({
    time: Math.floor((drink.timestamp.getTime() - startTime) / 1000), // seconds since start
    value: drink.buzzLevel
  }));
};

export const getRateProgression = (drinks: DrinkEntry[]): ChartData[] => {
  if (!drinks || drinks.length === 0) return [];
  
  const sortedDrinks = drinks.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const startTime = sortedDrinks[0].timestamp.getTime();
  
  let runningTotal = 0;
  return sortedDrinks.map(drink => {
    runningTotal += drink.units;
    return {
      time: Math.floor((drink.timestamp.getTime() - startTime) / 1000), // seconds since start
      value: runningTotal
    };
  });
}; 