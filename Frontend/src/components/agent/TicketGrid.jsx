import React from 'react';

const TicketGrid = ({ lottery, selectedNumbers, onNumberSelect }) => {
  const { min, max } = lottery.validNumberRange;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => String(min + i).padStart(2, '0'));

  const getNumberStatus = (number) => {
    return selectedNumbers.includes(number) ? 'selected' : 'available';
  };

  const statusStyles = {
    available: 'bg-white hover:bg-blue-100 border-gray-300',
    selected: 'bg-blue-500 text-white border-blue-700',
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 sm:p-4 bg-gray-100 rounded-lg">
      {numbers.map((number) => {
        const status = getNumberStatus(number);
        return (
          <button
            key={number}
            onClick={() => onNumberSelect(number)}
            className={`flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-lg border font-bold text-lg transition-colors ${statusStyles[status]}`}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
};

export default TicketGrid;