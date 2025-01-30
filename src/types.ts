export interface SessionStats {
  totalDrinks: number;
  timeElapsed: number;
  drinksPerHour: number;
  currentBuzzLevel: number;
  peakBuzzLevel: number;
  peakDrinksPerHour: number;
}

export interface DrinkEntry {
  id: string;
  timestamp: Date;
  buzzLevel: number;
  units: number;
}

export interface DrinkSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  drinks: DrinkEntry[];
}