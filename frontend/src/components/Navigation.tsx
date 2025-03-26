import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

export function Navigation() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <div className="flex space-x-4">
          <Link
            to="/history"
            className="text-gray-300 hover:text-white transition-colors"
          >
            History
          </Link>
          <button
            onClick={handleSignOut}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
} 