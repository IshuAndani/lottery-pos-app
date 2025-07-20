import React, { useState, useEffect, useMemo } from 'react';
import { createTicket } from '../../api';

const BettingSlip = ({ lotteryId, selectedNumbers, onTicketSold, onClearSelection, period }) => {
  const [bets, setBets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [betType, setBetType] = useState('bolet');
  const [mariageNumbers, setMariageNumbers] = useState(['', '']);

  // Effect to synchronize the local 'bets' state with the 'selectedNumbers' prop.
  useEffect(() => {
    if (betType === 'bolet') {
      const newBets = selectedNumbers.reduce((acc, number) => {
        acc[number] = bets[number] || '';
        return acc;
      }, {});
      setBets(newBets);
    }
  }, [selectedNumbers, betType]);

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

  const handleMariageNumberChange = (idx, value) => {
    setMariageNumbers(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  const handleMariageAmountChange = (value) => {
    setBets({ mariage: value });
  };

  const totalAmount = useMemo(() => {
    if (betType === 'bolet') {
      return Object.values(bets).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
    } else if (betType === 'mariage') {
      return Number(bets.mariage) || 0;
    }
    return 0;
  }, [bets, betType]);

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
      if (!mariageNumbers[0] || !mariageNumbers[1]) {
        setError('Please enter two numbers for mariage.');
        return;
      }
      if (mariageNumbers[0] === mariageNumbers[1]) {
        setError('The two numbers must be different for mariage.');
        return;
      }
      if (!bets.mariage || Number(bets.mariage) < 1) {
        setError('The minimum bet for mariage is $1.00.');
        return;
      }
      betsPayload = [{
        numbers: [mariageNumbers[0], mariageNumbers[1]],
        amount: Number(bets.mariage),
        betType: 'mariage'
      }];
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
    setError('');
    setMariageNumbers(['', '']);
    onClearSelection();
  };

  const isSellDisabled = isSubmitting || totalAmount === 0 || (betType === 'bolet' && Object.values(bets).some(amount => Number(amount) > 0 && Number(amount) < 1));

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
          <>
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
          </>
        )
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              maxLength={2}
              placeholder="Numéro 1"
              value={mariageNumbers[0]}
              onChange={e => handleMariageNumberChange(0, e.target.value)}
              className="w-full sm:w-16 px-2 py-1 border rounded-md shadow-sm"
            />
            <span className="font-bold text-xl">x</span>
            <input
              type="text"
              maxLength={2}
              placeholder="Numéro 2"
              value={mariageNumbers[1]}
              onChange={e => handleMariageNumberChange(1, e.target.value)}
              className="w-full sm:w-16 px-2 py-1 border rounded-md shadow-sm"
            />
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Montant du pari"
              value={bets.mariage || ''}
              onChange={e => handleMariageAmountChange(e.target.value)}
              className="w-full sm:w-32 px-2 py-1 border rounded-md shadow-sm"
            />
          </div>
        </div>
      )}
      <hr className="my-4" />
      <div className="flex flex-col sm:flex-row justify-between font-bold text-xl gap-2">
        <span>Total:</span>
        <span>${totalAmount.toFixed(2)}</span>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSellDisabled}
          className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? 'Vente en cours...' : 'Vendre le billet'}
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default BettingSlip;