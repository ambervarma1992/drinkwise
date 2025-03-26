import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MonthSelector } from '../components/MonthSelector';
import { SessionCard } from '../components/SessionCard';
import type { Session, Drink } from '../lib/supabase';

export function History() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drinks, setDrinks] = useState<Record<string, Drink[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [selectedMonth]);

  async function loadMonthData() {
    setLoading(true);
    try {
      // Get start and end of selected month
      const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);

      // Get all sessions for the month
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time', { ascending: false });

      if (sessionError) throw sessionError;

      // Get all drinks for these sessions
      if (sessionData && sessionData.length > 0) {
        const sessionIds = sessionData.map(s => s.id);
        const { data: drinkData, error: drinkError } = await supabase
          .from('drinks')
          .select('*')
          .in('session_id', sessionIds)
          .order('timestamp', { ascending: true });

        if (drinkError) throw drinkError;

        // Group drinks by session
        const drinksBySession = drinkData?.reduce((acc, drink) => {
          acc[drink.session_id] = acc[drink.session_id] || [];
          acc[drink.session_id].push(drink);
          return acc;
        }, {} as Record<string, Drink[]>) || {};

        setSessions(sessionData);
        setDrinks(drinksBySession);
      } else {
        setSessions([]);
        setDrinks({});
      }
    } catch (error) {
      console.error('Error loading month data:', error);
    }
    setLoading(false);
  }

  // Calculate monthly statistics
  const monthlyStats = {
    totalSessions: sessions.length,
    totalDrinks: Object.values(drinks).reduce((sum, sessionDrinks) => sum + sessionDrinks.length, 0),
    avgDrinksPerSession: sessions.length > 0 
      ? (Object.values(drinks).reduce((sum, sessionDrinks) => sum + sessionDrinks.length, 0) / sessions.length).toFixed(1)
      : '0',
    peakBuzz: Math.max(
      0,
      ...Object.values(drinks).flatMap(sessionDrinks => 
        sessionDrinks.map(drink => drink.buzz_level)
      )
    ),
    avgDrinksPerWeek: (() => {
      const now = new Date();
      const isCurrentMonth = selectedMonth.getMonth() === now.getMonth() && 
                           selectedMonth.getFullYear() === now.getFullYear();
      
      // For current month, use days elapsed
      const daysInCalculation = isCurrentMonth 
        ? now.getDate()  // Days elapsed in current month
        : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate(); // Total days in past month
      
      const completedWeeks = Math.ceil(daysInCalculation / 7); // Round up weeks
      const totalDrinks = Object.values(drinks).reduce((sum, sessionDrinks) => sum + sessionDrinks.length, 0);
      
      // Return the exact division without rounding
      return completedWeeks > 0 ? (totalDrinks / completedWeeks) : 0;
    })().toFixed(1), // Format to 1 decimal place for display
    peakDrinkRate: Math.max(
      0,
      ...Object.values(drinks).map(sessionDrinks => {
        if (sessionDrinks.length === 0) return 0;
        const sessionStart = new Date(sessionDrinks[0].timestamp);
        return Math.max(...sessionDrinks.map((_, i) => {
          const drinkTime = new Date(sessionDrinks[i].timestamp);
          const timeDiff = (drinkTime.getTime() - sessionStart.getTime()) / 1000;
          const hoursSinceStart = Math.max(1, Math.ceil(timeDiff / 3600));
          return (i + 1) / hoursSinceStart;
        }));
      })
    )
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Drinking History</h1>
      
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Total Sessions</h3>
          <p className="text-2xl font-bold">{monthlyStats.totalSessions}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Total Drinks</h3>
          <p className="text-2xl font-bold">{monthlyStats.totalDrinks}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Drinks/Session</h3>
          <p className="text-2xl font-bold">{monthlyStats.avgDrinksPerSession}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Peak Buzz</h3>
          <p className="text-2xl font-bold">{monthlyStats.peakBuzz}/10</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Peak Rate</h3>
          <p className="text-2xl font-bold">{monthlyStats.peakDrinkRate.toFixed(1)}/hr</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Avg. Drinks/Week</h3>
          <p className="text-2xl font-bold">{monthlyStats.avgDrinksPerWeek}</p>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No drinking sessions found for this month
          </div>
        ) : (
          sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              drinks={drinks[session.id] || []}
              onDelete={loadMonthData}
            />
          ))
        )}
      </div>
    </div>
  );
} 