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
    // This grid is now responsive to provide a better experience on all screen sizes.
    // - It starts with 5 columns on the smallest screens and scales up to 10 on large screens.
    // - The gap between numbers is larger on smaller screens (`gap-4`) for better touch targets,
    //   and slightly smaller on large screens (`lg:gap-2`) where space is less of an issue.
    // - `max-h-[36rem]` and `overflow-y-auto` ensure the grid is vertically scrollable if it gets too tall.
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 lg:gap-2 p-4 bg-gray-100 rounded-lg max-h-[36rem] overflow-y-auto">
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