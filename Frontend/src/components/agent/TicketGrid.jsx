import React from 'react';

const TicketGrid = ({ lottery, soldNumbers, selectedNumbers, onNumberSelect }) => {
  const { min, max } = lottery.validNumberRange;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => String(min + i).padStart(2, '0'));

  const getNumberStatus = (number) => {
    if (soldNumbers.includes(number)) return 'sold';
    if (selectedNumbers.includes(number)) return 'selected';
    return 'available';
  };

  const statusStyles = {
    available: "bg-white hover:bg-blue-100 border-gray-300",
    sold: "bg-gray-300 text-gray-500 cursor-not-allowed",
    selected: "bg-blue-500 text-white border-blue-700",
  };

  return (
    <div className="grid grid-cols-10 gap-2 p-4 bg-gray-100 rounded-lg">
      {numbers.map((number) => {
        const status = getNumberStatus(number);
        return (
          <button
            key={number}
            onClick={() => onNumberSelect(number)}
            disabled={status === 'sold'}
            className={`flex items-center justify-center h-12 w-12 rounded-lg border font-bold text-lg transition-colors ${statusStyles[status]}`}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
};

export default TicketGrid;