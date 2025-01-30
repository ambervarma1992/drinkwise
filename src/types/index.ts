export interface DrinkSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  drinks: DrinkEntry[];
}

export interface DrinkEntry {
  id: string;
  timestamp: Date;
  buzzLevel: number;
  units: number;
}

export interface SessionStats {
  totalDrinks: number;
  timeElapsed: number; // in seconds
  drinksPerHour: number;
  currentBuzzLevel: number;
}

export interface ChartData {
  time: number;  // seconds since session start
  value: number;
} 