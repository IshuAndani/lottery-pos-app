import React, { useState, useEffect, useMemo } from 'react';
import { createTicket } from '../../api';

const BettingSlip = ({ lotteryId, selectedNumbers, onTicketSold, onClearSelection, period }) => {
  const [bets, setBets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState('bolet');
  const [mariagePairs, setMariagePairs] = useState([]);

  // Effect to synchronize the local 'bets' state with the 'selectedNumbers' prop for bolet
  useEffect(() => {
    if (betType === 'bolet') {
      const newBets = selectedNumbers.reduce((acc, number) => {
        acc[number] = bets[number] || '';
        return acc;
      }, {});
      setBets(newBets);
    }
  }, [selectedNumbers, betType]);

  // Effect to reset mariage pairs when switching bet types
  useEffect(() => {
    if (betType === 'mariage') {
      // Keep existing pairs, don't reset
    } else {
      setMariagePairs([]);
    }
  }, [betType]);

  const handleAmountChange = (number, value) => {
    if (value === '') {
      setBets(prev => ({ ...prev, [number]: '' }));
      return;
    }
    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setBets(prev => ({ ...prev, [number]: newAmount }));
    }
  };

  const addMariagePair = () => {
    if (selectedNumbers.length < 2) {
      setError('Please select at least 2 numbers to create a mariage pair.');
      return;
    }
    
    // Create a new pair from selected numbers (use first two if more than 2 selected)
    const newPair = {
      id: Date.now(),
      numbers: [selectedNumbers[0], selectedNumbers[1]],
      amount: ''
    };
    
    setMariagePairs(prev => [...prev, newPair]);
    setError('');
    
    // Clear selection after adding pair
    onClearSelection();
  };

  const updateMariagePairAmount = (pairId, value) => {
    if (value === '') {
      setMariagePairs(prev => prev.map(pair => 
        pair.id === pairId ? { ...pair, amount: '' } : pair
      ));
      return;
    }
    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setMariagePairs(prev => prev.map(pair => 
        pair.id === pairId ? { ...pair, amount: newAmount } : pair
      ));
    }
  };

  const removeMariagePair = (pairId) => {
    setMariagePairs(prev => prev.filter(pair => pair.id !== pairId));
  };

  const totalAmount = useMemo(() => {
    if (betType === 'bolet') {
      return Object.values(bets).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
    } else if (betType === 'mariage') {
      return mariagePairs.reduce((sum, pair) => sum + (Number(pair.amount) || 0), 0);
    }
    return 0;
  }, [bets, betType, mariagePairs]);

  const handleSubmit = async () => {
    let betsPayload = [];
    if (betType === 'bolet') {
      const betsToSubmit = Object.entries(bets).filter(([, amount]) => Number(amount) > 0);
      if (betsToSubmit.length === 0) {
        setError('Please place a bet on at least one number.');
        return;
      }
      const hasInvalidBet = betsToSubmit.some(([, amount]) => Number(amount) < 1);
      if (hasInvalidBet) {
        setError('The minimum bet for each number is $1.00.');
        return;
      }
      betsPayload = betsToSubmit.map(([number, amount]) => ({
        numbers: [number],
        amount: Number(amount),
        betType: 'bolet'
      }));
    } else if (betType === 'mariage') {
      const validPairs = mariagePairs.filter(pair => Number(pair.amount) > 0);
      if (validPairs.length === 0) {
        setError('Please add at least one mariage pair with a bet amount.');
        return;
      }
      const hasInvalidBet = validPairs.some(pair => Number(pair.amount) < 1);
      if (hasInvalidBet) {
        setError('The minimum bet for each mariage pair is $1.00.');
        return;
      }
      betsPayload = validPairs.map(pair => ({
        numbers: pair.numbers,
        amount: Number(pair.amount),
        betType: 'mariage'
      }));
    }
    setError('');
    setIsSubmitting(true);
    try {
      const ticket = await createTicket({ lotteryId, bets: betsPayload, period });
      onTicketSold(ticket);
    } catch (err) {
      setError(err.message || 'Failed to sell ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setBets({});
    setMariagePairs([]);
    setError('');
    onClearSelection();
  };

  const isSellDisabled = isSubmitting || totalAmount === 0 || 
    (betType === 'bolet' && Object.values(bets).some(amount => Number(amount) > 0 && Number(amount) < 1)) ||
    (betType === 'mariage' && mariagePairs.some(pair => Number(pair.amount) > 0 && Number(pair.amount) < 1));

  return (
    <div className="p-2 sm:p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <h3 className="font-bold text-lg mb-4">Bulletin de pari</h3>
      <div className="mb-4 flex gap-4 flex-col sm:flex-row">
        <label>
          <input type="radio" name="betType" value="bolet" checked={betType === 'bolet'} onChange={() => setBetType('bolet')} /> Bolet
        </label>
        <label>
          <input type="radio" name="betType" value="mariage" checked={betType === 'mariage'} onChange={() => setBetType('mariage')} /> Mariage
        </label>
      </div>
      
      {betType === 'bolet' ? (
        selectedNumbers.length === 0 ? (
          <p className="text-gray-500">Sélectionnez des numéros dans la grille pour parier.</p>
        ) : (
          <div className="space-y-3">
            {selectedNumbers.map(number => (
              <div key={number} className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="font-bold text-xl text-blue-600 w-12">{number}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Montant du pari"
                  value={bets[number] || ''}
                  onChange={(e) => handleAmountChange(number, e.target.value)}
                  className="w-full sm:w-32 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {/* Add new pair section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {selectedNumbers.length < 2 ? (
              <p className="text-gray-500 text-center">
                Sélectionnez 2 numéros dans la grille pour créer une paire de mariage.
              </p>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  Numéros sélectionnés: {selectedNumbers.slice(0, 2).join(' X ')}
                  {selectedNumbers.length > 2 && (
                    <span className="text-sm text-gray-500"> (Les premiers 2 seront utilisés)</span>
                  )}
                </p>
                <button
                  onClick={addMariagePair}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  Ajouter cette paire
                </button>
              </div>
            )}
          </div>

          {/* Existing pairs */}
          {mariagePairs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Paires de mariage:</h4>
              {mariagePairs.map(pair => (
                <div key={pair.id} className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white p-3 rounded-md border">
                  <span className="font-bold text-lg text-blue-600">
                    {pair.numbers[0]} X {pair.numbers[1]}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Montant"
                      value={pair.amount}
                      onChange={(e) => updateMariagePairAmount(pair.id, e.target.value)}
                      className="w-24 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={() => removeMariagePair(pair.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mariagePairs.length === 0 && (
            <p className="text-gray-500 text-center italic">
              Aucune paire de mariage ajoutée.
            </p>
          )}
        </div>
      )}
      
      <hr className="my-4" />
      <div className="flex flex-col sm:flex-row justify-between font-bold text-xl gap-2">
        <span>Total:</span>
        <span>${totalAmount.toFixed(2)}</span>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex flex-row gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSellDisabled}
          className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm sm:text-base"
        >
          {isSubmitting ? 'Vente en cours...' : 'Vendre le billet'}
        </button>
        <button
          onClick={handleClear}
          className="flex-none bg-gray-500 text-white font-bold py-1 px-2 rounded-md hover:bg-gray-600 transition-colors text-xs sm:text-sm"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default BettingSlip;