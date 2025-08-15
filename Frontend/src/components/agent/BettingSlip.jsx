import React, { useState, useEffect, useMemo } from 'react';
import { createTicket } from '../../api';

const BettingSlip = ({ lotteryId, selectedNumbers, onTicketSold, period, lottery, onClearSelectedNumbers }) => {
  const [bets, setBets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState('bolet');
  const [multiNumberBets, setMultiNumberBets] = useState([]);
  const [selectedPlayState, setSelectedPlayState] = useState(() => {
    return lottery?.states?.length > 0 ? lottery.states[0] : 'haiti';
  });
  const [playNumbers, setPlayNumbers] = useState(betType === 'play3' ? ['', '', ''] : ['', '', '', '']);
  const [mariageAmount, setMariageAmount] = useState('');
  const [showMariageAmountInput, setShowMariageAmountInput] = useState(false);
  const [playNumberAmountPairs, setPlayNumberAmountPairs] = useState([{ number: '', amount: '' }]);
  const [shouldClearNumbers, setShouldClearNumbers] = useState(false);

  // Effect to clear selected numbers after mariage confirmation
  useEffect(() => {
    if (shouldClearNumbers && onClearSelectedNumbers) {
      onClearSelectedNumbers();
      setShouldClearNumbers(false);
    }
  }, [shouldClearNumbers, onClearSelectedNumbers]);

  useEffect(() => {
    if (betType === 'bolet') {
      const newBets = selectedNumbers.reduce((acc, number) => {
        acc[number] = bets[number] || '';
        return acc;
      }, {});
      if (JSON.stringify(newBets) !== JSON.stringify(bets)) {
        setBets(newBets);
      }
    }
  }, [selectedNumbers, betType, bets]);

  useEffect(() => {
    if (betType === 'bolet') {
      setMultiNumberBets([]);
      setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
      setPlayNumbers([]);
      setMariageAmount('');
      setShowMariageAmountInput(false);
      setPlayNumberAmountPairs([{ number: '', amount: '' }]);
    } else if (betType === 'mariage') {
      setMultiNumberBets([]);
      setSelectedPlayState('haiti');
      setPlayNumbers([]);
      setBets({});
      setMariageAmount('');
      setShowMariageAmountInput(false);
      setPlayNumberAmountPairs([{ number: '', amount: '' }]);
    } else if (betType === 'play3') {
      setMultiNumberBets([]);
      setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
      setPlayNumbers(['', '', '']);
      setBets({});
      setMariageAmount('');
      setShowMariageAmountInput(false);
      setPlayNumberAmountPairs([{ number: '', amount: '' }]);
    } else if (betType === 'play4') {
      setMultiNumberBets([]);
      setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
      setPlayNumbers(['', '', '', '']);
      setBets({});
      setMariageAmount('');
      setShowMariageAmountInput(false);
      setPlayNumberAmountPairs([{ number: '', amount: '' }]);
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

  const handlePlayNumberChange = (index, value) => {
    const newValue = value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, ''); // Allow digits and single minus sign at start
    setPlayNumbers(prev => {
      const newNumbers = [...prev];
      newNumbers[index] = newValue;
      return newNumbers;
    });
  };

  const handlePlayNumberAmountChange = (index, field, value) => {
    setPlayNumberAmountPairs(prev => {
      const newPairs = [...prev];
      if (field === 'number') {
        newPairs[index][field] = value;
      } else if (field === 'amount') {
        if (value === '') {
          newPairs[index][field] = '';
        } else {
          const newAmount = Number(value);
          if (!isNaN(newAmount) && newAmount >= 0) {
            newPairs[index][field] = newAmount;
          }
        }
      }
      return newPairs;
    });
  };

  const addPlayNumberAmountField = () => {
    setPlayNumberAmountPairs(prev => [...prev, { number: '', amount: '' }]);
  };

  const removePlayNumberAmountField = (index) => {
    setPlayNumberAmountPairs(prev => prev.filter((_, i) => i !== index));
  };

  const addPlayBets = () => {
    const validPairs = playNumberAmountPairs.filter(pair => 
      pair.number.trim() !== '' && pair.amount !== '' && Number(pair.amount) > 0
    );

    if (validPairs.length === 0) {
      setError('Please enter at least one valid number-amount pair.');
      return;
    }

    const hasInvalidAmount = validPairs.some(pair => Number(pair.amount) < 1);
    if (hasInvalidAmount) {
      setError('The minimum bet amount is $1.00.');
      return;
    }

    validPairs.forEach(pair => {
      const newBet = {
        id: Date.now() + Math.random(), // Ensure unique IDs
        numbers: [pair.number.trim()],
        amounts: [Number(pair.amount)],
        betType,
        state: selectedPlayState
      };
      setMultiNumberBets(prev => [...prev, newBet]);
    });

    setError('');
    setPlayNumberAmountPairs([{ number: '', amount: '' }]);
  };

  const handleMariageAmountChange = (value) => {
    if (value === '') {
      setMariageAmount('');
      return;
    }
    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setMariageAmount(newAmount);
    }
  };

  const addMultiNumberBet = () => {
    if (betType === 'mariage') {
      if (selectedNumbers.length !== 2) {
        setError('Please select exactly two numbers from the grid for mariage.');
        return;
      }
      setShowMariageAmountInput(true);
    }
  };

  const confirmMariageBet = () => {
    if (mariageAmount === '' || Number(mariageAmount) < 1) {
      setError('Please enter a valid bet amount (minimum $1.00) for the mariage pair.');
      return;
    }
    const newBet = {
      id: Date.now(),
      numbers: [...selectedNumbers].sort((a, b) => a - b),
      amounts: [Number(mariageAmount)],
      betType: 'mariage',
      state: 'haiti'
    };
    setMultiNumberBets(prev => [...prev, newBet]);
    setError('');
    setMariageAmount('');
    setShowMariageAmountInput(false);
    setShouldClearNumbers(true);
  };

  const cancelMariageAmount = () => {
    setMariageAmount('');
    setShowMariageAmountInput(false);
    setError('');
  };

  const updateMultiNumberBetAmount = (betId, value) => {
    if (value === '') {
      setMultiNumberBets(prev => prev.map(bet => 
        bet.id === betId ? { ...bet, amounts: [''] } : bet
      ));
      return;
    }
    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setMultiNumberBets(prev => prev.map(bet => 
        bet.id === betId ? { ...bet, amounts: [newAmount] } : bet
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
      return multiNumberBets.reduce((sum, bet) => sum + (Number(bet.amounts[0]) || 0), 0);
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
        amounts: [Number(amount)],
        betType: 'bolet',
        state: 'haiti'
      }));
    } else if (['mariage', 'play3', 'play4'].includes(betType)) {
      const validBets = multiNumberBets.filter(bet => Number(bet.amounts[0]) > 0);
      if (validBets.length === 0) {
        setError(`Please add at least one ${betType} bet with a bet amount.`);
        return;
      }
      const hasInvalidBet = validBets.some(bet => Number(bet.amounts[0]) < 1);
      if (hasInvalidBet) {
        setError(`The minimum bet for each ${betType} is $1.00.`);
        return;
      }
      betsPayload = validBets.map(bet => ({
        numbers: bet.numbers,
        amounts: bet.amounts,
        betType: bet.betType,
        state: bet.state
      }));
    }
    setError('');
    setIsSubmitting(true);
    try {
      const ticket = await createTicket({ lotteryId, bets: betsPayload, period });
      onTicketSold(ticket);
      setBets({});
      setMultiNumberBets([]);
      setPlayNumbers(betType === 'play3' ? ['', '', ''] : ['', '', '', '']);
      setMariageAmount('');
      setShowMariageAmountInput(false);
      setPlayNumberAmountPairs([{ number: '', amount: '' }]);
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
    setPlayNumbers(betType === 'play3' ? ['', '', ''] : ['', '', '', '']);
    setMariageAmount('');
    setShowMariageAmountInput(false);
    setPlayNumberAmountPairs([{ number: '', amount: '' }]);
    setShouldClearNumbers(false);
  };

  const isSellDisabled = isSubmitting || totalAmount === 0 || 
    (betType === 'bolet' && Object.values(bets).some(amount => Number(amount) > 0 && Number(amount) < 1)) ||
    (['mariage', 'play3', 'play4'].includes(betType) && 
      multiNumberBets.some(bet => Number(bet.amounts[0]) > 0 && Number(bet.amounts[0]) < 1));

  return (
    <div className="p-2 sm:p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <h3 className="font-bold text-lg mb-4">Bulletin de pari</h3>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
        <label className="flex items-center">
          <input 
            type="radio" 
            name="betType" 
            value="bolet" 
            checked={betType === 'bolet'} 
            onChange={() => setBetType('bolet')} 
            className="mr-2"
          /> Bolet
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="betType" 
            value="mariage" 
            checked={betType === 'mariage'} 
            onChange={() => setBetType('mariage')} 
            className="mr-2"
          /> Mariage
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="betType" 
            value="play3" 
            checked={betType === 'play3'} 
            onChange={() => setBetType('play3')} 
            className="mr-2"
          /> Play 3
        </label>
        <label className="flex items-center">
          <input 
            type="radio" 
            name="betType" 
            value="play4" 
            checked={betType === 'play4'} 
            onChange={() => setBetType('play4')} 
            className="mr-2"
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
            className="w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
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
            <p className="text-red-500 text-xs mt-1">No states configured for this lottery.</p>
          )}
        </div>
      )}

      {betType === 'bolet' ? (
        selectedNumbers.length === 0 ? (
          <p className="text-gray-500 text-sm">Sélectionnez des numéros dans la grille pour parier.</p>
        ) : (
          <div className="space-y-2">
            {selectedNumbers.map(number => (
              <div key={number} className="flex items-center justify-between gap-2">
                <span className="font-bold text-lg text-blue-600 w-12">{number}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Montant du pari"
                  value={bets[number] || ''}
                  onChange={(e) => handleAmountChange(number, e.target.value)}
                  className="w-full max-w-[120px] px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        )
      ) : betType === 'mariage' ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
            <p className="text-gray-700 mb-2 font-semibold text-sm">
              {selectedNumbers.length === 2
                ? `Paire sélectionnée: ${selectedNumbers.sort((a, b) => a - b).join(' X ')}`
                : selectedNumbers.length < 2
                ? 'Sélectionnez exactement 2 numéros dans la grille pour mariage.'
                : 'Veuillez sélectionner seulement 2 numéros pour mariage.'}
            </p>
            {selectedNumbers.length === 2 && !showMariageAmountInput && (
              <button
                onClick={addMultiNumberBet}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Ajouter ce mariage
              </button>
            )}
            {showMariageAmountInput && (
              <div className="space-y-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Montant du pari"
                  value={mariageAmount}
                  onChange={(e) => handleMariageAmountChange(e.target.value)}
                  className="w-full px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={confirmMariageBet}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={cancelMariageAmount}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {multiNumberBets.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm">Mariage Bets:</h4>
              {multiNumberBets.map(bet => (
                <div key={bet.id} className="flex items-center justify-between gap-2 bg-white p-2 rounded-md border">
                  <span className="font-bold text-base text-blue-600">
                    {bet.numbers.join(' X ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Montant"
                      value={bet.amounts[0]}
                      onChange={(e) => updateMultiNumberBetAmount(bet.id, e.target.value)}
                      className="w-20 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
            <p className="text-gray-500 text-center italic text-sm">
              Aucun mariage ajouté.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
            <p className="text-gray-700 mb-2 font-semibold text-sm">
              Entrez des numéros et montants pour {betType}:
            </p>
            <div className="space-y-2">
              {playNumberAmountPairs.map((pair, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      placeholder="Numéro"
                      value={pair.number}
                      onChange={(e) => handlePlayNumberAmountChange(index, 'number', e.target.value)}
                      className="w-full sm:flex-1 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <span className="text-gray-500 font-bold text-sm">X</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="$"
                      value={pair.amount}
                      onChange={(e) => handlePlayNumberAmountChange(index, 'amount', e.target.value)}
                      className="w-20 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  {playNumberAmountPairs.length > 1 && (
                    <button
                      onClick={() => removePlayNumberAmountField(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors text-xs self-start sm:self-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <button
                onClick={addPlayNumberAmountField}
                className="w-full sm:flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                + Ajouter champ
              </button>
              <button
                onClick={addPlayBets}
                className="w-full sm:flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Ajouter tous
              </button>
            </div>
          </div>

          {multiNumberBets.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm">{betType.charAt(0).toUpperCase() + betType.slice(1)} Bets:</h4>
              {multiNumberBets.map(bet => (
                <div key={bet.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-2 rounded-md border">
                  <span className="font-bold text-base text-blue-600">
                    {bet.numbers[0]} X ${Number(bet.amounts[0]).toFixed(2)} ({bet.state.charAt(0).toUpperCase() + bet.state.slice(1)})
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Montant"
                      value={bet.amounts[0]}
                      onChange={(e) => updateMultiNumberBetAmount(bet.id, e.target.value)}
                      className="w-20 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
            <p className="text-gray-500 text-center italic text-sm">
              Aucun {betType} ajouté.
            </p>
          )}
        </div>
      )}
      
      <hr className="my-4" />
      <div className="flex flex-col sm:flex-row justify-between font-bold text-lg gap-2">
        <span>Total:</span>
        <span>${totalAmount.toFixed(2)}</span>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSellDisabled}
          className="w-full sm:flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isSubmitting ? 'Vente en cours...' : 'Vendre le billet'}
        </button>
        <button
          onClick={handleClear}
          className="w-full sm:flex-none bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default BettingSlip;