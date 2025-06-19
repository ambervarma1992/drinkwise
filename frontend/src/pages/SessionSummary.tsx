import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session as SessionType, Drink } from '../lib/supabase';
import { formatTimeElapsed } from '../lib/utils';

export function SessionSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionType | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
  }, [id]);

  async function loadSessionData() {
    if (!id) return;

    try {
      // Load current session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError || !sessionData) {
        console.error('Error loading session:', sessionError);
        navigate('/dashboard');
        return;
      }

      // Load drinks
      const { data: drinksData, error: drinksError } = await supabase
        .from('drinks')
        .select('*')
        .eq('session_id', id)
        .order('timestamp', { ascending: true });

      if (drinksError) {
        console.error('Error loading drinks:', drinksError);
        return;
      }

      setSession(sessionData);
      setDrinks(drinksData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }

  const handleResumeSession = async () => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: true, end_time: null })
        .eq('id', session.id);

      if (error) throw error;
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session || !drinks.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-200">No drinks recorded in this session</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time || new Date());
  const duration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
  const hours = Math.max(1, Math.ceil(duration / 3600)); // Round up to nearest hour, minimum 1
  const drinksPerHour = drinks.length / hours;
  const peakBuzzLevel = Math.max(...drinks.map(drink => drink.buzz_level));
  const finalBuzzLevel = drinks[drinks.length - 1].buzz_level;
  const peakDrinkRate = Math.max(...drinks.map((_, i) => {
    if (i === 0) return drinksPerHour;
    const timeDiff = (new Date(drinks[i].timestamp).getTime() - new Date(drinks[0].timestamp).getTime()) / 1000;
    const hoursSinceStart = Math.max(1, Math.ceil(timeDiff / 3600)); // Round up to nearest hour, minimum 1
    return (i + 1) / hoursSinceStart;
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Session Summary: {session?.name}</h1>
      
      <div className="text-gray-300 text-center mb-8">
        {startTime.toLocaleString()} - {endTime.toLocaleString()}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Session Stats</h2>
        <div className="space-y-2">
          <p>Total Drinks: {drinks.length}</p>
          <p>Time Elapsed: {formatTimeElapsed(duration)}</p>
          <p>Drinks Per Hour: {Math.round(drinksPerHour)}</p>
          <p>Final Buzz Level: {finalBuzzLevel}/10</p>
          <p>Peak Buzz Level: {peakBuzzLevel}/10</p>
          <p>Peak Drink Rate: {Math.round(peakDrinkRate)}/hr</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full max-w-md"
        >
          Go Home
        </button>
        <button
          onClick={handleResumeSession}
          className="text-gray-300 hover:text-white underline font-medium transition-colors"
        >
          Resume Session
        </button>
      </div>
    </div>
  );
} 