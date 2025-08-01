import React, { useState, useEffect, useMemo } from 'react';
import { createTicket } from '../../api';

const BettingSlip = ({ lotteryId, selectedNumbers, onTicketSold, period, lottery }) => {
  const [bets, setBets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState('bolet');
  const [multiNumberBets, setMultiNumberBets] = useState([]);
  const [selectedPlayState, setSelectedPlayState] = useState(() => {
    return lottery?.states?.length > 0 ? lottery.states[0] : 'haiti';
  });
  const [playNumbers, setPlayNumbers] = useState(
    betType === 'bolet'
      ? [{ number: '', amount: '' }]
      : betType === 'mariage'
        ? [{ number: '', amount: '' }, { number: '' }]
        : betType === 'play3'
          ? [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
          : [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
  );

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
    setMultiNumberBets([]);
    if (betType === 'bolet') {
      setSelectedPlayState('haiti');
      setPlayNumbers([{ number: '', amount: '' }]);
    } else if (betType === 'mariage') {
      setSelectedPlayState('haiti');
      setPlayNumbers([{ number: '', amount: '' }, { number: '' }]);
    } else if (betType === 'play3') {
      setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
      setPlayNumbers([
        { number: '', amount: '' },
        { number: '', amount: '' },
        { number: '', amount: '' }
      ]);
    } else if (betType === 'play4') {
      setSelectedPlayState(lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
      setPlayNumbers([
        { number: '', amount: '' },
        { number: '', amount: '' },
        { number: '', amount: '' },
        { number: '', amount: '' }
      ]);
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
    const newValue = value.replace(/[^0-9]/g, '');
    setPlayNumbers(prev => {
      const newNumbers = [...prev];
      newNumbers[index] = { ...newNumbers[index], number: newValue };
      return newNumbers;
    });
  };

  const handlePlayAmountChange = (index, value) => {
    const newValue = value === '' ? '' : Number(value);
    if (newValue === '' || (!isNaN(newValue) && newValue >= 0)) {
      setPlayNumbers(prev => {
        const newNumbers = [...prev];
        newNumbers[index] = { ...newNumbers[index], amount: newValue };
        return newNumbers;
      });
    }
  };

  const addMultiNumberBet = () => {
    const requiredNumbers = betType === 'mariage' ? 2 : betType === 'play3' ? 3 : betType === 'play4' ? 4 : 1;
    const requiredAmounts = betType === 'play3' ? 3 : betType === 'play4' ? 4 : 1;
    const validEntries = playNumbers
      .slice(0, requiredNumbers)
      .filter(entry =>
        entry.number.trim() !== '' &&
        !isNaN(entry.number) &&
        Number.isInteger(Number(entry.number)) &&
        (entry.amount === undefined || (entry.amount !== '' && !isNaN(entry.amount) && Number(entry.amount) >= 1))
      );

    if (validEntries.length !== requiredNumbers) {
      setError(`Please enter exactly ${requiredNumbers} valid integer numbers${betType === 'mariage' || betType === 'bolet' ? ' with one amount' : ''} (minimum $1.00) for ${betType}.`);
      return;
    }

    const amounts = betType === 'bolet' || betType === 'mariage'
      ? [Number(validEntries[0].amount)]
      : validEntries.map(entry => Number(entry.amount));

    if (amounts.length !== requiredAmounts) {
      setError(`Please provide exactly ${requiredAmounts} valid amounts (minimum $1.00 each) for ${betType}.`);
      return;
    }

    const newBet = {
      id: Date.now(),
      numbers: validEntries.map(entry => entry.number),
      amounts,
      betType,
      state: betType === 'mariage' || betType === 'bolet' ? 'haiti' : selectedPlayState
    };

    setMultiNumberBets(prev => [...prev, newBet]);
    setError('');
    setPlayNumbers(
      betType === 'bolet'
        ? [{ number: '', amount: '' }]
        : betType === 'mariage'
          ? [{ number: '', amount: '' }, { number: '' }]
          : betType === 'play3'
            ? [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
            : [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
    );
  };

  const updateMultiNumberBetAmount = (betId, index, value) => {
    if (value === '') {
      setMultiNumberBets(prev => prev.map(bet =>
        bet.id === betId
          ? { ...bet, amounts: bet.amounts.map((amt, i) => i === index ? '' : amt) }
          : bet
      ));
      return;
    }
    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setMultiNumberBets(prev => prev.map(bet =>
        bet.id === betId
          ? { ...bet, amounts: bet.amounts.map((amt, i) => i === index ? newAmount : amt) }
          : bet
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
      return multiNumberBets.reduce((sum, bet) =>
        sum + bet.amounts.reduce((acc, amt) => acc + (Number(amt) || 0), 0),
        0
      );
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
      const validBets = multiNumberBets.filter(bet =>
        bet.amounts.every(amt => Number(amt) >= 1)
      );
      if (validBets.length === 0) {
        setError(`Please add at least one ${betType} bet with valid amounts (minimum $1.00 each).`);
        return;
      }
      betsPayload = validBets.map(bet => ({
        numbers: bet.numbers,
        amounts: bet.amounts.map(Number),
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
      setPlayNumbers(
        betType === 'bolet'
          ? [{ number: '', amount: '' }]
          : betType === 'mariage'
            ? [{ number: '', amount: '' }, { number: '' }]
            : betType === 'play3'
              ? [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
              : [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
      );
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
    setSelectedPlayState(betType === 'mariage' || betType === 'bolet' ? 'haiti' : lottery?.states?.length > 0 ? lottery.states[0] : 'haiti');
    setPlayNumbers(
      betType === 'bolet'
        ? [{ number: '', amount: '' }]
        : betType === 'mariage'
          ? [{ number: '', amount: '' }, { number: '' }]
          : betType === 'play3'
            ? [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
            : [{ number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }, { number: '', amount: '' }]
    );
  };

  const isSellDisabled = isSubmitting || totalAmount === 0 ||
    (betType === 'bolet' && Object.values(bets).some(amount => Number(amount) > 0 && Number(amount) < 1)) ||
    (['mariage', 'play3', 'play4'].includes(betType) &&
      multiNumberBets.some(bet => bet.amounts.some(amt => Number(amt) > 0 && Number(amt) < 1)));

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-md mx-auto sm:p-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800 text-center sm:text-left">Bulletin de pari</h3>
      <div className="mb-4 flex flex-wrap gap-4 justify-center sm:justify-start">
        {['bolet', 'mariage', 'play3', 'play4'].map(type => (
          <label key={type} className="flex items-center gap-2">
            <input
              type="radio"
              name="betType"
              value={type}
              checked={betType === type}
              onChange={() => setBetType(type)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
          </label>
        ))}
      </div>

      {['play3', 'play4'].includes(betType) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State
          </label>
          <select
            value={selectedPlayState}
            onChange={(e) => setSelectedPlayState(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
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
          <p className="text-gray-500 text-sm text-center">Sélectionnez des numéros dans la grille pour parier.</p>
        ) : (
          <div className="space-y-3">
            {selectedNumbers.map(number => (
              <div key={number} className="flex items-center gap-2">
                <span className="font-bold text-lg text-blue-600 w-12 text-center">{number}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Montant du pari"
                  value={bets[number] || ''}
                  onChange={(e) => handleAmountChange(number, e.target.value)}
                  className="w-full px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <p className="text-gray-700 mb-2 font-semibold text-sm">
              Entrez {betType === 'mariage' ? '2 numéros (0-99) avec un montant' : betType === 'play3' ? '3 numéros (0-99) avec montants' : betType === 'play4' ? '4 numéros (0-99) avec montants' : '1 numéro (0-99) avec un montant'}:
            </p>
            <div className="space-y-2">
              {playNumbers.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Num ${index + 1}`}
                    value={entry.number}
                    onChange={(e) => handlePlayNumberChange(index, e.target.value)}
                    className="w-20 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center text-sm"
                  />
                  {entry.amount !== undefined && (
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Montant"
                      value={entry.amount}
                      onChange={(e) => handlePlayAmountChange(index, e.target.value)}
                      className="w-20 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addMultiNumberBet}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mt-3 text-sm"
            >
              Ajouter ce {betType}
            </button>
          </div>

          {multiNumberBets.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm">{betType.charAt(0).toUpperCase() + betType.slice(1)} Bets:</h4>
              {multiNumberBets.map(bet => (
                <div key={bet.id} className="flex flex-col gap-2 bg-white p-3 rounded-md border">
                  <span className="font-bold text-sm text-blue-600">
                    {bet.betType === 'mariage'
                      ? `${bet.numbers[0]} X ${bet.numbers[1]} ($${Number(bet.amounts[0]).toFixed(2)})`
                      : bet.numbers.map((num, i) => `${num} ($${Number(bet.amounts[i]).toFixed(2)})`).join(', ')}
                    {['play3', 'play4'].includes(bet.betType) && ` (${bet.state.charAt(0).toUpperCase() + bet.state.slice(1)})`}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {bet.amounts.map((amount, index) => (
                      <input
                        key={index}
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Montant"
                        value={amount}
                        onChange={(e) => updateMultiNumberBetAmount(bet.id, index, e.target.value)}
                        className="w-20 px-2 py-1 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    ))}
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
            <p className="text-gray-500 text-center text-sm italic">
              Aucun {betType} ajouté.
            </p>
          )}
        </div>
      )}

      <hr className="my-4" />
      <div className="flex justify-between font-bold text-lg gap-2">
        <span>Total:</span>
        <span>${totalAmount.toFixed(2)}</span>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSellDisabled}
          className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isSubmitting ? 'Vente en cours...' : 'Vendre le billet'}
        </button>
        <button
          onClick={handleClear}
          className="flex-none bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default BettingSlip;