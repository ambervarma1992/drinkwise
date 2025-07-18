import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ActiveSession {
  id: string;
  name: string;
  start_time: string;
  drinks: {
    buzz_level: number;
    units: number;
    created_at: string;
  }[];
}

interface MonthlyStats {
  totalSessions: number;
  totalUnits: number;
  avgUnitsPerSession: number;
  peakBuzz: number;
  avgUnitsPerWeek: number;
  peakUnitsPerHour: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [sessionName, setSessionName] = useState('Session');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);

  useEffect(() => {
    fetchActiveSession();
    fetchMonthlyStats();
  }, []);

  const fetchActiveSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: session, error } = await supabase
        .from('sessions')
        .select(`
          id,
          name,
          start_time,
          drinks (
            buzz_level,
            units,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // No rows returned
          console.error('Error fetching active session:', error);
        }
        return;
      }

      setActiveSession(session);
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get start and end of current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get all sessions for the month
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString());

      if (sessionError) throw sessionError;

      // Get all drinks for these sessions
      const sessionIds = sessions?.map(s => s.id) || [];
      const { data: drinks, error: drinkError } = await supabase
        .from('drinks')
        .select('*')
        .in('session_id', sessionIds)
        .order('timestamp', { ascending: true });

      if (drinkError) throw drinkError;

      // Group drinks by session
      const drinksBySession = drinks?.reduce((acc, drink) => {
        acc[drink.session_id] = acc[drink.session_id] || [];
        acc[drink.session_id].push(drink);
        return acc;
      }, {} as Record<string, any>) || {};

      // Filter out sessions with no drinks
      const sessionsWithDrinks = sessions?.filter(session => 
        drinksBySession[session.id] && drinksBySession[session.id].length > 0
      ) || [];

      // Calculate stats
      const stats = {
        totalSessions: sessionsWithDrinks.length,
        totalUnits: drinks?.reduce((sum, drink) => sum + drink.units, 0) || 0,
        avgUnitsPerSession: sessionsWithDrinks.length 
          ? (drinks?.reduce((sum, drink) => sum + drink.units, 0) || 0) / sessionsWithDrinks.length 
          : 0,
        peakBuzz: Math.max(0, ...(drinks?.map(d => d.buzz_level) || [0])),
        avgUnitsPerWeek: (drinks?.reduce((sum, drink) => sum + drink.units, 0) || 0) / Math.ceil(now.getDate() / 7),
        peakUnitsPerHour: Math.max(
          0,
          ...(sessionsWithDrinks.map(session => {
            const sessionDrinks = drinks?.filter(d => d.session_id === session.id) || [];
            if (sessionDrinks.length === 0) return 0;
            const sessionStart = new Date(sessionDrinks[0].timestamp);
            return Math.max(...sessionDrinks.map((_, i) => {
              const drinkTime = new Date(sessionDrinks[i].timestamp);
              const timeDiff = (drinkTime.getTime() - sessionStart.getTime()) / 1000;
              const hoursSinceStart = Math.max(1, Math.ceil(timeDiff / 3600));
              return sessionDrinks
                .slice(0, i + 1)
                .reduce((sum, drink) => sum + drink.units, 0) / hoursSinceStart;
            }));
          }) || [0])
        )
      };

      setMonthlyStats(stats);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const startNewSession = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      const { data: session, error } = await supabase
        .from('sessions')
        .insert([
          {
            user_id: user.id,
            name: sessionName,
            start_time: new Date().toISOString(),
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Error starting new session:', error);
    } finally {
      setLoading(false);
      setShowNameDialog(false);
    }
  };

  const calculateStats = (session: ActiveSession) => {
    const drinks = session.drinks || [];
    const totalUnits = drinks.reduce((sum, drink) => sum + drink.units, 0);
    const startTime = new Date(session.start_time);
    const now = new Date();
    const durationSeconds = (now.getTime() - startTime.getTime()) / 1000;
    const hoursSinceStart = Math.max(1, Math.ceil(durationSeconds / 3600));
    const unitsPerHour = totalUnits / hoursSinceStart;
    const currentBuzzLevel = drinks.length > 0 ? drinks[drinks.length - 1].buzz_level : 0;

    return {
      totalUnits,
      unitsPerHour,
      currentBuzzLevel,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="text-center space-y-8 w-full max-w-2xl">
        <div>
          <h1 className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
            Welcome to DrinkWise
          </h1>
          <p className="mt-3 text-gray-300">
            Track your drinks and stay mindful of your consumption
          </p>
        </div>

        {activeSession ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{activeSession.name}</h2>
              <button
                onClick={() => navigate(`/session/${activeSession.id}`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Go to Session →
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(calculateStats(activeSession)).map(([key, value]) => (
                <div key={key} className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    {key === 'totalUnits' ? 'Total Units' :
                     key === 'unitsPerHour' ? 'Units/Hour' :
                     'Buzz Level'}
                  </p>
                  <p className="text-xl font-semibold">
                    {key === 'unitsPerHour' ? value.toFixed(1) : 
                     key === 'totalUnits' ? value.toFixed(1) :
                     value}
                    {key === 'currentBuzzLevel' && '/10'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNameDialog(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-lg font-medium"
          >
            Start New Session
          </button>
        )}

        {monthlyStats && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">This Month's Stats</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                <p className="text-xl font-semibold">{monthlyStats.totalSessions}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Units</p>
                <p className="text-xl font-semibold">{monthlyStats.totalUnits.toFixed(1)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Units/Session</p>
                <p className="text-xl font-semibold">{monthlyStats.avgUnitsPerSession.toFixed(1)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Peak Buzz</p>
                <p className="text-xl font-semibold">{monthlyStats.peakBuzz}/10</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Peak Rate</p>
                <p className="text-xl font-semibold">{Math.round(monthlyStats.peakUnitsPerHour)}/hr</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Avg. Units/Week</p>
                <p className="text-xl font-semibold">{monthlyStats.avgUnitsPerWeek.toFixed(1)}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/history')}
              className="text-gray-400 hover:text-white underline text-sm transition-colors w-full text-center"
            >
              View Details →
            </button>
          </div>
        )}

        {showNameDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Name Your Session</h2>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4"
                placeholder="Session Name"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={startNewSession}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-lg font-medium"
                >
                  {loading ? 'Starting...' : 'Start Session'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 