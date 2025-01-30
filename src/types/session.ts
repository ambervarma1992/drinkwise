export interface DrinkEntry {
  timestamp: Date;
  buzzLevel: number;
}

export interface SessionStats {
  totalDrinks: number;
  timeElapsed: number; // in seconds
  drinksPerHour: number;
}

export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  drinks: DrinkEntry[];
  stats: SessionStats;
} 