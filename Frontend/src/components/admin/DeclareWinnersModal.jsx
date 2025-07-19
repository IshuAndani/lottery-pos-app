import React, { useState, useEffect } from 'react';

const DeclareWinnersModal = ({ isOpen, onClose, lottery, onSave }) => {
  // Initialize state based on the lottery prop.
  const [winners, setWinners] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Effect to reset the form when the lottery prop changes.
  useEffect(() => {
    if (lottery) {
      setWinners(Array(lottery.numberOfWinningNumbers || 0).fill(''));
    }
  }, [lottery]);

  const handleChange = (index, value) => {
    const newWinners = [...winners];
    newWinners[index] = value;
    setWinners(newWinners);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Enhanced Validation ---

    // 1. Check for empty inputs
    if (winners.some(w => w.trim() === '')) {
      setError('Please fill in all winning numbers.');
      return;
    }

    const winningNumbersAsNumbers = winners.map(w => parseInt(w, 10));

    // 2. Check for invalid number formats
    if (winningNumbersAsNumbers.some(isNaN)) {
      setError('Please enter valid numbers only.');
      return;
    }

    // 3. Check for duplicate numbers
    const uniqueNumbers = new Set(winningNumbersAsNumbers);
    if (uniqueNumbers.size !== winningNumbersAsNumbers.length) {
      setError('Winning numbers must be unique.');
      return;
    }

    // 4. Check if numbers are within the valid range
    const { min, max } = lottery.validNumberRange;
    if (winningNumbersAsNumbers.some(num => num < min || num > max)) {
      setError(`All numbers must be between ${min} and ${max}.`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSave(lottery._id, winners); // Send as strings, as per schema
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Declare Winners</h2>
        <p className="mb-2 text-gray-600">For lottery: <span className="font-semibold">{lottery?.name}</span></p>
        <p className="mb-6 text-gray-600">Enter numbers between <span className="font-semibold">{lottery?.validNumberRange?.min}</span> and <span className="font-semibold">{lottery?.validNumberRange?.max}</span>.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {winners.map((winner, index) => (
            <div key={index}>
              <label htmlFor={`winner-${index}`} className="block text-sm font-medium text-gray-700">Winning Number #{index + 1}</label>
              <input
                id={`winner-${index}`}
                type="number"
                value={winner}
                onChange={(e) => handleChange(index, e.target.value)}
                required
                min={lottery?.validNumberRange?.min}
                max={lottery?.validNumberRange?.max}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Declare'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeclareWinnersModal;