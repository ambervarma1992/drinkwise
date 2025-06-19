import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AddDrinkModal } from '../components/AddDrinkModal';
import type { Session as SessionType, Drink } from '../lib/supabase';
import { formatTimeElapsed, formatTimeElapsedShort } from '../lib/utils';

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionType | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDrinkModal, setShowAddDrinkModal] = useState(false);

  useEffect(() => {
    loadSessionData();
    const interval = setInterval(loadSessionData, 1000);
    return () => clearInterval(interval);
  }, [id]);

  // Auto-close session after 3 hours of inactivity
  useEffect(() => {
    if (!session?.is_active || drinks.length === 0) return;

    const checkInactivity = () => {
      const lastDrinkTime = new Date(drinks[drinks.length - 1].timestamp);
      const now = new Date();
      const timeSinceLastDrink = now.getTime() - lastDrinkTime.getTime();
      const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

      if (timeSinceLastDrink >= threeHoursInMs) {
        console.log('Session auto-closed due to 3 hours of inactivity');
        handleEndSession();
      }
    };

    // Check every minute for inactivity
    const inactivityInterval = setInterval(checkInactivity, 60000);
    
    return () => clearInterval(inactivityInterval);
  }, [session, drinks, id]);

  async function loadSessionData() {
    if (!id) return;

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
  }

  async function handleAddDrink(units: number, buzzLevel: number) {
    if (!id || !session) {
      console.error('No session found');
      return;
    }

    // Check session state
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError || !sessionData) {
      console.error('Error checking session:', sessionError);
      return;
    }

    if (!sessionData.is_active) {
      console.error('Session is not active');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error('No user found');
      return;
    }

    // Ensure buzz_level is a valid integer between 0 and 10
    const validatedBuzzLevel = Math.min(10, Math.max(0, Math.round(buzzLevel)));
    
    // Ensure units is a valid number greater than 0
    const validatedUnits = Math.max(0.1, Number(units.toFixed(2)));

    const drinkData = {
      session_id: id,
      user_id: userData.user.id,
      units: validatedUnits,
      buzz_level: validatedBuzzLevel,
      timestamp: new Date().toISOString(),
    };

    console.log('Attempting to add drink:', drinkData);

    const { error: insertError } = await supabase
      .from('drinks')
      .insert([drinkData]);

    if (insertError) {
      console.error('Error adding drink:', insertError);
      return;
    }

    loadSessionData();
  }

  async function handleEndSession() {
    if (!id || !session) return;

    const { error } = await supabase
      .from('sessions')
      .update({
        end_time: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', id);

    if (error) {
      console.error('Error ending session:', error);
      return;
    }

    navigate(`/session/${id}/summary`);
  }

  async function handleResumeSession() {
    if (!id || !session) return;

    const { error } = await supabase
      .from('sessions')
      .update({
        is_active: true,
        end_time: null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error resuming session:', error);
      return;
    }

    // Reload session data to reflect the change
    loadSessionData();
  }

  async function handleStartNewSession() {
    navigate('/dashboard');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-200">Session not found</h2>
      </div>
    );
  }

  // Show empty state for closed sessions
  if (!session.is_active) {
    const startTime = new Date(session.start_time);
    const endTime = session.end_time ? new Date(session.end_time) : new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    const hours = Math.max(1, Math.ceil(duration / 3600));
    const totalUnits = drinks.reduce((sum, drink) => sum + drink.units, 0);
    const peakDrinkRate = drinks.length > 0 ? Math.max(...drinks.map((_, i) => {
      const timeDiff = (new Date(drinks[i].timestamp).getTime() - startTime.getTime()) / 1000;
      const hoursSinceStart = Math.max(1, Math.ceil(timeDiff / 3600));
      return drinks.slice(0, i + 1).reduce((sum, d) => sum + d.units, 0) / hoursSinceStart;
    })) : 0;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Session Closed</h1>
          <p className="text-gray-400">This session has ended</p>
        </div>

        {/* Session Stats */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Session Name</p>
              <p className="text-lg font-semibold">{session.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Date</p>
              <p className="text-lg font-semibold">{startTime.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Time Spent</p>
              <p className="text-lg font-semibold">{formatTimeElapsed(duration)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Units</p>
              <p className="text-lg font-semibold">{totalUnits.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Peak Units/Hour</p>
              <p className="text-lg font-semibold">{peakDrinkRate.toFixed(1)}/hr</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Start Time</p>
              <p className="text-lg font-semibold">{startTime.toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">End Time</p>
              <p className="text-lg font-semibold">{endTime.toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Final Buzz Level</p>
              <p className="text-lg font-semibold">{drinks.length > 0 ? drinks[drinks.length - 1].buzz_level : 0}/10</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleResumeSession}
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Resume Session
          </button>
          <button
            onClick={handleStartNewSession}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start New Session
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const startTime = new Date(session.start_time);
  const now = new Date();
  const duration = (now.getTime() - startTime.getTime()) / 1000;
  const hours = Math.max(1, Math.ceil(duration / 3600));
  const totalUnits = drinks.reduce((sum, drink) => sum + drink.units, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Go Back"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold">Session: {session.name}</h1>
        </div>
        <button
          onClick={handleEndSession}
          className="px-4 py-2 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          End Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Total Units</h3>
          <p className="text-2xl font-bold">{totalUnits.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Time</h3>
          <p className="text-2xl font-bold">
            {drinks.length === 0 ? (
              'Waiting for first drink...'
            ) : (
              formatTimeElapsed(duration)
            )}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Units/Hour</h3>
          <p className="text-2xl font-bold">{drinks.length === 0 ? '-' : (drinks.length > 0 ? drinks[drinks.length - 1].buzz_level : 0)/10}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Buzz Level</h3>
          <p className="text-2xl font-bold">{drinks.length > 0 ? drinks[drinks.length - 1].buzz_level : 0}/10</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="pb-2">Time</th>
              <th className="pb-2">Drink</th>
              <th className="pb-2">Units</th>
              <th className="pb-2">Buzz Level</th>
              <th className="pb-2">Units/Hour</th>
              <th className="pb-2">Time Since Start</th>
            </tr>
          </thead>
          <tbody>
            {drinks.map((drink, index) => {
              const drinkTime = new Date(drink.timestamp);
              const timeSinceStart = (drinkTime.getTime() - startTime.getTime()) / 1000;
              const hoursSinceStart = Math.max(1, Math.ceil(timeSinceStart / 3600));
              const currentUnitsPerHour = drinks
                .slice(0, index + 1)
                .reduce((sum, d) => sum + d.units, 0) / hoursSinceStart;

              return (
                <tr key={drink.id} className="border-b border-gray-700">
                  <td className="py-2">{drinkTime.toLocaleTimeString()}</td>
                  <td className="py-2">{drink.drink_name || 'Standard Drink'}</td>
                  <td className="py-2">{drink.units.toFixed(1)}</td>
                  <td className="py-2">{drink.buzz_level}/10</td>
                  <td className="py-2">{currentUnitsPerHour.toFixed(1)}</td>
                  <td className="py-2">
                    {formatTimeElapsedShort(timeSinceStart)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setShowAddDrinkModal(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-6 py-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg z-[90] touch-manipulation min-h-[56px] min-w-[56px] flex items-center justify-center"
        title="Add a new drink to your session"
      >
        <span className="hidden sm:inline">🍸 Add Drink</span>
        <span className="sm:hidden text-2xl">🍸</span>
      </button>

      <AddDrinkModal
        isOpen={showAddDrinkModal}
        onClose={() => setShowAddDrinkModal(false)}
        onAddDrink={handleAddDrink}
      />
    </div>
  );
} 