interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function handlePrevMonth() {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() - 1);
    onMonthChange(newDate);
  }

  function handleNextMonth() {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + 1);
    onMonthChange(newDate);
  }

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <button
        onClick={handlePrevMonth}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        ←
      </button>
      <div className="text-xl font-semibold">
        {months[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
      </div>
      <button
        onClick={handleNextMonth}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        disabled={selectedMonth >= new Date()}
      >
        →
      </button>
    </div>
  );
} 