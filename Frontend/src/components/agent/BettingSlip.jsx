import React, { useState, useEffect, useMemo } from 'react';
import { createTicket } from '../../api';

const BettingSlip = ({ lotteryId, selectedNumbers, onTicketSold, onClearSelection, period, lottery }) => {
  const [bets, setBets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState('bolet');
  const [multiNumberBets, setMultiNumberBets] = useState([]);
  const [selectedPlayState, setSelectedPlayState] = useState(() => {
    return lottery?.states?.length > 0 ? lottery.states[0] : 'haiti'; // Default to first state or 'haiti' as fallback
  });

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

  // Effect to reset multi-number bets when switching bet types
  useEffect(() => {
    if (betType === 'bolet') {
      setMultiNumberBets([]);
      setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
    } else if (['mariage', 'play3', 'play4'].includes(betType)) {
      // Keep existing bets, but ensure state is Haiti for mariage or first state for play3/play4
      if (betType === 'mariage') {
        setSelectedPlayState('haiti');
      } else if (lottery?.states?.length > 0) {
        setSelectedPlayState(lottery.states[0]);
      }
    }
  }, [betType, lottery?.states]);

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

  const addMultiNumberBet = () => {
    const requiredNumbers = betType === 'mariage' ? 2 : betType === 'play3' ? 3 : 4;
    if (selectedNumbers.length < requiredNumbers) {
      setError(`Please select at least ${requiredNumbers} numbers to create a ${betType} bet.`);
      return;
    }

    // Create a new bet with the required number of selected numbers
    const newBet = {
      id: Date.now(),
      numbers: selectedNumbers.slice(0, requiredNumbers),
      amount: '',
      betType,
      state: betType === 'mariage' ? 'haiti' : selectedPlayState
    };

    setMultiNumberBets(prev => [...prev, newBet]);
    setError('');
    onClearSelection();
  };

  const updateMultiNumberBetAmount = (betId, value) => {
    if (value === '') {
      setMultiNumberBets(prev => prev.map(bet => 
        bet.id === betId ? { ...bet, amount: '' } : bet
      ));
      return;
    }
    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setMultiNumberBets(prev => prev.map(bet => 
        bet.id === betId ? { ...bet, amount: newAmount } : bet
      ));
    }
  };

  const removeMultiNumberBet = (betId) => {
    setMultiNumberBets(prev => prev.filter(bet => bet.id !== betId));
  };

  const totalAmount = useMemo(() => {
    if (betType === 'bolet') {
      return Object.values(bets).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
    } else if (['mariage', 'play3', 'play4'].includes(betType)) {
      return multiNumberBets.reduce((sum, bet) => sum + (Number(bet.amount) || 0), 0);
    }
    return 0;
  }, [bets, betType, multiNumberBets]);

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
        betType: 'bolet',
        state: 'haiti'
      }));
    } else if (['mariage', 'play3', 'play4'].includes(betType)) {
      const validBets = multiNumberBets.filter(bet => Number(bet.amount) > 0);
      if (validBets.length === 0) {
        setError(`Please add at least one ${betType} bet with a bet amount.`);
        return;
      }
      const hasInvalidBet = validBets.some(bet => Number(bet.amount) < 1);
      if (hasInvalidBet) {
        setError(`The minimum bet for each ${betType} is $1.00.`);
        return;
      }
      betsPayload = validBets.map(bet => ({
        numbers: bet.numbers,
        amount: Number(bet.amount),
        betType: bet.betType,
        state: bet.state
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
    setMultiNumberBets([]);
    setError('');
    setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
    onClearSelection();
  };

  const isSellDisabled = isSubmitting || totalAmount === 0 || 
    (betType === 'bolet' && Object.values(bets).some(amount => Number(amount) > 0 && Number(amount) < 1)) ||
    (['mariage', 'play3', 'play4'].includes(betType) && 
      multiNumberBets.some(bet => Number(bet.amount) > 0 && Number(bet.amount) < 1));

  return (
    <div className="p-2 sm:p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <h3 className="font-bold text-lg mb-4">Bulletin de pari</h3>
      <div className="mb-4 flex gap-4 flex-col sm:flex-row">
        <label>
          <input 
            type="radio" 
            name="betType" 
            value="bolet" 
            checked={betType === 'bolet'} 
            onChange={() => setBetType('bolet')} 
          /> Bolet
        </label>
        <label>
          <input 
            type="radio" 
            name="betType" 
            value="mariage" 
            checked={betType === 'mariage'} 
            onChange={() => setBetType('mariage')} 
          /> Mariage
        </label>
        <label>
          <input 
            type="radio" 
            name="betType" 
            value="play3" 
            checked={betType === 'play3'} 
            onChange={() => setBetType('play3')} 
          /> Play 3
        </label>
        <label>
          <input 
            type="radio" 
            name="betType" 
            value="play4" 
            checked={betType === 'play4'} 
            onChange={() => setBetType('play4')} 
          /> Play 4
        </label>
      </div>

      {['play3', 'play4'].includes(betType) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State
          </label>
          <select
            value={selectedPlayState}
            onChange={(e) => setSelectedPlayState(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            disabled={!lottery?.states?.length}
          >
            {lottery?.states?.length > 0 ? (
              lottery.states.map(state => (
                <option key={state} value={state}>
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </option>
              ))
            ) : (
              <option value="" disabled>No states available</option>
            )}
          </select>
          {!lottery?.states?.length && (
            <p className="text-red-500 text-sm mt-1">No states configured for this lottery.</p>
          )}
        </div>
      )}

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
          {/* Add new bet section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {selectedNumbers.length < (betType === 'mariage' ? 2 : betType === 'play3' ? 3 : 4) ? (
              <p className="text-gray-500 text-center">
                Sélectionnez {betType === 'mariage' ? 2 : betType === 'play3' ? 3 : 4} numéros dans la grille pour créer un {betType}.
              </p>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  Numéros sélectionnés: {selectedNumbers.slice(0, betType === 'mariage' ? 2 : betType === 'play3' ? 3 : 4).join(', ')}
                  {selectedNumbers.length > (betType === 'mariage' ? 2 : betType === 'play3' ? 3 : 4) && (
                    <span className="text-sm text-gray-500"> (Les premiers {betType === 'mariage' ? 2 : betType === 'play3' ? 3 : 4} seront utilisés)</span>
                  )}
                </p>
                <button
                  onClick={addMultiNumberBet}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  Ajouter ce {betType}
                </button>
              </div>
            )}
          </div>

          {/* Existing bets */}
          {multiNumberBets.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">{betType.charAt(0).toUpperCase() + betType.slice(1)} Bets:</h4>
              {multiNumberBets.map(bet => (
                <div key={bet.id} className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white p-3 rounded-md border">
                  <span className="font-bold text-lg text-blue-600">
                    {bet.numbers.join(', ')} {['play3', 'play4'].includes(bet.betType) && `(${bet.state.charAt(0).toUpperCase() + bet.state.slice(1)})`}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Montant"
                      value={bet.amount}
                      onChange={(e) => updateMultiNumberBetAmount(bet.id, e.target.value)}
                      className="w-24 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={() => removeMultiNumberBet(bet.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {multiNumberBets.length === 0 && (
            <p className="text-gray-500 text-center italic">
              Aucun {betType} ajouté.
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