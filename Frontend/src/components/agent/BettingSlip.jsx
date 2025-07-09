import React, { useState, useEffect, useMemo } from 'react';
import { createTicket } from '../../api';

const BettingSlip = ({ lotteryId, selectedNumbers, onTicketSold, onClearSelection }) => {
  const [bets, setBets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Effect to synchronize the local 'bets' state with the 'selectedNumbers' prop.
  // This ensures that if numbers are deselected, their corresponding bets are removed.
  useEffect(() => {
    const newBets = selectedNumbers.reduce((acc, number) => {
      // Keep the existing bet for the number, or default to an empty string for the input.
      acc[number] = bets[number] || '';
      return acc;
    }, {});
    setBets(newBets);
  }, [selectedNumbers]);
  
  const handleAmountChange = (number, value) => {
    // Allow empty input to clear the bet amount
    if (value === '') {
      setBets(prev => ({ ...prev, [number]: '' }));
      return;
    }
    const newAmount = Number(value);
    // Allow only positive numbers. Let validation on submit handle the minimum.
    if (!isNaN(newAmount) && newAmount >= 0) {
      setBets(prev => ({ ...prev, [number]: newAmount }));
    }
  };

  // Memoize totalAmount calculation to avoid re-calculating on every render.
  const totalAmount = useMemo(() => {
    return Object.values(bets).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
  }, [bets]);

  const handleSubmit = async () => {
    // Filter for bets that have a valid, positive amount.
    const betsToSubmit = Object.entries(bets).filter(([, amount]) => Number(amount) > 0);

    if (betsToSubmit.length === 0) {
      setError('Please place a bet on at least one number.');
      return;
    }

    // Validate that every submitted bet is at least $1.
    const hasInvalidBet = betsToSubmit.some(([, amount]) => Number(amount) < 1);
    if (hasInvalidBet) {
      setError('The minimum bet for each number is $1.00.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const betsPayload = betsToSubmit.map(([number, amount]) => ({
      number,
      amount: Number(amount),
      betType: 'bolet'
    }));

    try {
      const {ticket,transactionId,agentId} = await createTicket({ lotteryId, bets: betsPayload });
      onTicketSold(ticket,transactionId,agentId); // This will clear selectedNumbers in parent, which clears local state via useEffect
    } catch (err) {
      setError(err.message || 'Failed to sell ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // This function now clears local state and calls the parent's handler.
  const handleClear = () => {
    setBets({});
    setError('');
    onClearSelection();
  };

  // Determine if the sell button should be disabled.
  const isSellDisabled = isSubmitting || totalAmount === 0 || Object.values(bets).some(amount => Number(amount) > 0 && Number(amount) < 1);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-4">Betting Slip</h3>
      {selectedNumbers.length === 0 ? (
        <p className="text-gray-500">Select numbers from the grid to place a bet.</p>
      ) : (
        <>
          <div className="space-y-3">
            {selectedNumbers.map(number => (
              <div key={number} className="flex items-center justify-between">
                <span className="font-bold text-xl text-blue-600 w-12">{number}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Bet Amount"
                  // Make this a controlled component
                  value={bets[number] || ''}
                  onChange={(e) => handleAmountChange(number, e.target.value)}
                  className="w-32 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-xl">
            <span>Total:</span>
            {/* Format to 2 decimal places */}
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={isSellDisabled}
              className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Selling...' : 'Sell Ticket'}
            </button>
            <button
              onClick={handleClear} // Use the new clear handler
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BettingSlip;