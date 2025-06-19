import { useState, useMemo } from 'react';
import { drinkCategories, DrinkDefinition } from '../lib/drinks';

interface AddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrink: (units: number, buzzLevel: number) => void;
}

export function AddDrinkModal({ isOpen, onClose, onAddDrink }: AddDrinkModalProps) {
  const [selectedDrink, setSelectedDrink] = useState<DrinkDefinition | null>(null);
  const [buzzLevel, setBuzzLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter drinks based on search and category
  const filteredDrinks = useMemo(() => {
    let drinks = drinkCategories.flatMap(category => 
      category.drinks.map(drink => ({ ...drink, category: category.name }))
    );

    if (selectedCategory !== 'all') {
      drinks = drinks.filter(drink => drink.category === selectedCategory);
    }

    if (searchTerm) {
      drinks = drinks.filter(drink => 
        drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drink.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return drinks;
  }, [searchTerm, selectedCategory]);

  // Only return null after all hooks are called
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDrink) {
      setError('Please select a drink');
      return;
    }

    const finalBuzzLevel = Math.max(0, Math.min(10, Math.round(buzzLevel)));
    onAddDrink(selectedDrink.units, finalBuzzLevel);
    onClose();
  };

  const buzzLabels = ['Sober', 'Tipsy', 'Buzzed', 'Drunk', 'Wasted'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-gray-800 w-full max-w-2xl max-h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Add New Drink</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl p-2 -m-2"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Search drinks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === 'all'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {drinkCategories.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === category.name
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drink Selection */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredDrinks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No drinks found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredDrinks.map((drink) => (
                  <button
                    key={drink.name}
                    type="button"
                    onClick={() => setSelectedDrink(drink)}
                    className={`text-left p-4 rounded-lg transition-all ${
                      selectedDrink?.name === drink.name
                        ? 'bg-purple-500 ring-2 ring-purple-400'
                        : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{drink.name}</span>
                      <span className="text-xl font-bold text-purple-300 ml-2">
                        {drink.units}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {drink.volume} • {drink.abv} • {drink.units} {drink.units === 1 ? 'unit' : 'units'}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          </div>

          {/* Buzz Level and Submit */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex-shrink-0">
            <div className="space-y-4">
              <div>
                <label className="block mb-3 font-medium">Buzz Level</label>
                <div className="flex items-center space-x-4 mb-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={buzzLevel}
                    onChange={(e) => setBuzzLevel(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-lg font-bold min-w-[3rem] text-center">
                    {buzzLevel}/10
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-xs text-gray-400">
                  {buzzLabels.map((label) => (
                    <span key={label} className="text-center">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDrink}
                  className="px-6 py-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🍸 Add Drink ({selectedDrink?.units || 0} units)
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 