import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
        <span className="text-white font-bold text-lg">D</span>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        DrinkWise
      </span>
    </Link>
  );
} 