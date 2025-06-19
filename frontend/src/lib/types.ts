export interface Session {
  id: string;
  user_id: string;
  name: string;
  start_time: string;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Drink {
  id: string;
  session_id: string;
  user_id: string;
  units: number;
  buzz_level: number;
  drink_name?: string;
  timestamp: string;
  created_at: string;
} 