import React, { useState, useEffect } from 'react';

const DeclareWinnersModal = ({ isOpen, onClose, lottery, onSave }) => {
  // Initialize state for all bet types
  const [winners, setWinners] = useState({
    bolet: [],
    mariage: [],
    play3: [],
    play4: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Effect to reset the form when the lottery prop changes.
  useEffect(() => {
    if (lottery) {
      setWinners({
        bolet: ['', ''],
        mariage: [''], // Single combination for mariage
        play3: ['', ''],
        play4: ['', '']
      });
    }
  }, [lottery]);

  const handleChange = (betType, index, value) => {
    const newWinners = { ...winners };
    newWinners[betType][index] = value;
    setWinners(newWinners);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Enhanced Validation ---

    // Validate each bet type
    const betTypes = ['bolet', 'mariage', 'play3', 'play4'];
    for (const betType of betTypes) {
      const betWinners = winners[betType];
      
      if (betType === 'mariage') {
        // Special validation for mariage - should be a single combination like "12-34"
        if (betWinners.length !== 1 || betWinners[0].trim() === '') {
          setError('Please provide a mariage winning combination (e.g., "12-34").');
          return;
        }
        
        const combination = betWinners[0].trim();
        if (!combination.includes('-')) {
          setError('Mariage combination must be in format "number-number" (e.g., "12-34").');
          return;
        }
        
        const parts = combination.split('-');
        if (parts.length !== 2) {
          setError('Mariage combination must have exactly two numbers separated by a dash.');
          return;
        }
        
        const num1 = parseInt(parts[0], 10);
        const num2 = parseInt(parts[1], 10);
        
        if (isNaN(num1) || isNaN(num2)) {
          setError('Mariage combination must contain valid numbers.');
          return;
        }
        
        const { min, max } = lottery.validNumberRange;
        if (num1 < min || num1 > max || num2 < min || num2 > max) {
          setError(`Mariage numbers must be between ${min} and ${max}.`);
          return;
        }
        
        if (num1 === num2) {
          setError('Mariage combination numbers must be different.');
          return;
        }
      } else {
        // Regular validation for other bet types
        if (betWinners.some(w => w.trim() === '')) {
          setError(`Please fill in all ${betType} winning numbers.`);
          return;
        }

        const winningNumbersAsNumbers = betWinners.map(w => parseInt(w, 10));

        // Check for invalid number formats
        if (winningNumbersAsNumbers.some(isNaN)) {
          setError(`Please enter valid numbers only for ${betType}.`);
          return;
        }

        // Check for duplicate numbers within the same bet type
        const uniqueNumbers = new Set(winningNumbersAsNumbers);
        if (uniqueNumbers.size !== winningNumbersAsNumbers.length) {
          setError(`${betType} winning numbers must be unique.`);
          return;
        }

        // Check if numbers are within the valid range
        const { min, max } = lottery.validNumberRange;
        if (winningNumbersAsNumbers.some(num => num < min || num > max)) {
          setError(`All ${betType} numbers must be between ${min} and ${max}.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSave(lottery._id, winners); // Send as object with bet types
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Declare Winners</h2>
          <p className="mb-2 text-sm sm:text-base text-gray-600">For lottery: <span className="font-semibold">{lottery?.name}</span></p>
          <p className="mb-6 text-sm sm:text-base text-gray-600">Enter numbers between <span className="font-semibold">{lottery?.validNumberRange?.min}</span> and <span className="font-semibold">{lottery?.validNumberRange?.max}</span></p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {['bolet', 'mariage', 'play3', 'play4'].map(betType => (
              <div key={betType} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-base sm:text-lg font-semibold mb-4 capitalize text-gray-800 flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  {betType} Winners
                </h3>
                
                {betType === 'mariage' ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`${betType}-winner-0`} className="block text-sm font-medium text-gray-700 mb-2">
                        Winning Combination
                      </label>
                      <input
                        id={`${betType}-winner-0`}
                        type="text"
                        value={winners[betType][0]}
                        onChange={(e) => handleChange(betType, 0, e.target.value)}
                        required
                        placeholder="12-34"
                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-2">Format: two numbers separated by dash (e.g., 12-34)</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {winners[betType].map((winner, index) => (
                      <div key={index}>
                        <label htmlFor={`${betType}-winner-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Winner #{index + 1}
                        </label>
                        <input
                          id={`${betType}-winner-${index}`}
                          type="number"
                          value={winner}
                          onChange={(e) => handleChange(betType, index, e.target.value)}
                          required
                          min={lottery?.validNumberRange?.min}
                          max={lottery?.validNumberRange?.max}
                          className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors text-base"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-base"
              >
                {isSubmitting ? 'Declaring...' : 'Declare Winners'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeclareWinnersModal;