import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session, Drink } from '../lib/supabase';

interface SessionCardProps {
  session: Session;
  drinks: Drink[];
  onDelete: () => void;
}

export function SessionCard({ session, drinks, onDelete }: SessionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time || new Date());
  const duration = (endTime.getTime() - startTime.getTime()) / 1000;
  const hours = Math.max(1, Math.ceil(duration / 3600));
  
  const totalDrinks = drinks.length;
  const peakBuzzLevel = Math.max(...drinks.map(drink => drink.buzz_level));
  
  // Calculate peak drinks per hour
  const peakDrinkRate = Math.max(...drinks.map((_, i) => {
    const timeDiff = (new Date(drinks[i].timestamp).getTime() - startTime.getTime()) / 1000;
    const hoursSinceStart = Math.max(1, Math.ceil(timeDiff / 3600));
    return (i + 1) / hoursSinceStart;
  }));

  async function handleDelete() {
    setIsDeleting(true);
    try {
      // Delete drinks first due to foreign key constraint
      await supabase
        .from('drinks')
        .delete()
        .eq('session_id', session.id);

      // Then delete the session
      await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      onDelete();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
    setIsDeleting(false);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{session.name}</h3>
          <p className="text-gray-400 text-sm">
            {startTime.toLocaleDateString()} {startTime.toLocaleTimeString()} - {' '}
            {endTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/session/${session.id}/summary`, { state: { fromHistory: true } })}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="View Summary"
          >
            📊
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors text-red-400"
            title="Delete Session"
          >
            {isDeleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Drinks</p>
          <p className="text-xl font-semibold">{totalDrinks}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Peak Rate</p>
          <p className="text-xl font-semibold">{peakDrinkRate.toFixed(1)}/hr</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Peak Buzz</p>
          <p className="text-xl font-semibold">{peakBuzzLevel}/10</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Duration</p>
          <p className="text-xl font-semibold">{Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m</p>
        </div>
      </div>
    </div>
  );
} 