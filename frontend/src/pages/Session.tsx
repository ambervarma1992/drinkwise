import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AddDrinkModal } from '../components/AddDrinkModal';
import type { Session as SessionType, Drink } from '../lib/supabase';

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

    const { error } = await supabase
      .from('drinks')
      .insert(drinkData);

    if (error) {
      console.error('Failed to add drink:', error);
      return;
    }

    console.log('Successfully added drink');
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

  const startTime = drinks.length > 0 
    ? new Date(drinks[0].timestamp)
    : new Date(session.start_time);
  const now = new Date();
  const duration = drinks.length > 0
    ? (now.getTime() - startTime.getTime()) / 1000
    : 0;
  const hours = Math.max(1, Math.ceil(duration / 3600));
  const drinksPerHour = drinks.length / hours;

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
          <h3 className="text-gray-400 mb-1">Total Drinks</h3>
          <p className="text-2xl font-bold">{drinks.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Time</h3>
          <p className="text-2xl font-bold">
            {drinks.length === 0 ? (
              'Waiting for first drink...'
            ) : (
              `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`
            )}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 mb-1">Per Hour</h3>
          <p className="text-2xl font-bold">{drinks.length === 0 ? '-' : drinksPerHour.toFixed(1)}</p>
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
              <th className="pb-2">Units</th>
              <th className="pb-2">Buzz Level</th>
              <th className="pb-2">Drinks/Hour</th>
              <th className="pb-2">Time Since Start</th>
            </tr>
          </thead>
          <tbody>
            {drinks.map((drink, index) => {
              const drinkTime = new Date(drink.timestamp);
              const timeSinceStart = (drinkTime.getTime() - startTime.getTime()) / 1000;
              const hoursSinceStart = Math.max(1, Math.ceil(timeSinceStart / 3600));
              const currentDrinksPerHour = (index + 1) / hoursSinceStart;

              return (
                <tr key={drink.id} className="border-b border-gray-700">
                  <td className="py-2">{drinkTime.toLocaleTimeString()}</td>
                  <td className="py-2">{drink.units}</td>
                  <td className="py-2">{drink.buzz_level}/10</td>
                  <td className="py-2">{currentDrinksPerHour.toFixed(1)}</td>
                  <td className="py-2">
                    {Math.floor(timeSinceStart / 60)}m {Math.floor(timeSinceStart % 60)}s
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setShowAddDrinkModal(true)}
        className="fixed bottom-8 right-8 px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg"
      >
        🍸 Add Drink
      </button>

      <AddDrinkModal
        isOpen={showAddDrinkModal}
        onClose={() => setShowAddDrinkModal(false)}
        onAddDrink={handleAddDrink}
      />
    </div>
  );
} 