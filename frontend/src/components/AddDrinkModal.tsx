import { useState } from 'react';

interface AddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrink: (units: number, buzzLevel: number) => void;
}

export function AddDrinkModal({ isOpen, onClose, onAddDrink }: AddDrinkModalProps) {
  const [units, setUnits] = useState(1);
  const [buzzLevel, setBuzzLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate units (must be greater than 0)
    const finalUnits = parseFloat(units.toString());
    if (isNaN(finalUnits) || finalUnits <= 0) {
      setError('Units must be greater than 0');
      return;
    }

    // Ensure buzzLevel is a valid integer between 0 and 10
    const finalBuzzLevel = Math.max(0, Math.min(10, Math.round(buzzLevel)));
    onAddDrink(finalUnits, finalBuzzLevel);
    onClose();
  };

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setUnits(isNaN(value) ? 1 : value);
    setError(null);
  };

  const handleBuzzLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Explicitly allow 0 as a valid value
    setBuzzLevel(isNaN(value) ? 0 : value);
    setError(null);
  };

  const buzzLabels = ['Sober', 'Tipsy', 'Buzzed', 'Drunk', 'Wasted'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Drink</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2">Buzz Level</label>
            <p className="text-gray-400 mb-2">How buzzed are you feeling? ({buzzLevel}/10)</p>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={buzzLevel}
              onChange={handleBuzzLevelChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Buzz Level"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={buzzLevel}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              {buzzLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2">Number of Units</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={units}
              onChange={handleUnitsChange}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              🍸 Add Drink
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 