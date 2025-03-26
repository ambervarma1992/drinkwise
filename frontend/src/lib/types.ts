export interface Session {
  id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

export interface Drink {
  id: string;
  session_id: string;
  units: number;
  buzz_level: number;
  timestamp: string;
  created_at: string;
} 