import React, { useState, useEffect } from 'react';

const LotteryModal = ({ isOpen, onClose, onSave, lottery }) => {
  const [formData, setFormData] = useState({
    name: '',
    drawDate: '',
    numberOfWinningNumbers: 1,
    'validNumberRange.min': 0,
    'validNumberRange.max': 99,
    'payoutRules.bolet': 50,
    'payoutRules.mariage': 1000,
    states: [],
    maxPerNumber: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sample list of US states (lowercase to match backend)
  const usStates = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware',
    'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky',
    'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
    'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico',
    'new york', 'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
    'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont',
    'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'
  ];

  useEffect(() => {
    if (lottery) {
      setFormData({
        name: lottery.name || '',
        drawDate: lottery.drawDate ? new Date(lottery.drawDate).toISOString().slice(0, 16) : '',
        numberOfWinningNumbers: lottery.numberOfWinningNumbers || 1,
        'validNumberRange.min': lottery.validNumberRange?.min ?? 0,
        'validNumberRange.max': lottery.validNumberRange?.max ?? 99,
        'payoutRules.bolet': lottery.payoutRules?.bolet ?? 50,
        'payoutRules.mariage': lottery.payoutRules?.mariage ?? 1000,
        states: lottery.states || [],
        maxPerNumber: lottery.maxPerNumber ?? 50,
      });
    }
  }, [lottery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStateToggle = (state) => {
    setFormData((prev) => {
      const newStates = prev.states.includes(state)
        ? prev.states.filter((s) => s !== state)
        : [...prev.states, state];
      return { ...formData, states: newStates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.states.length === 0) {
      setError('At least one state must be selected.');
      return;
    }
    const min = Number(formData['validNumberRange.min']);
    const max = Number(formData['validNumberRange.max']);
    if (isNaN(min) || isNaN(max) || min > max) {
      setError('Valid number range: min must be less than or equal to max.');
      return;
    }
    if (Number(formData.maxPerNumber) <= 0) {
      setError('Max tickets per number must be positive.');
      return;
    }
    if (Number(formData.numberOfWinningNumbers) <= 0) {
      setError('Number of winning numbers must be positive.');
      return;
    }
    if (Number(formData['payoutRules.bolet']) <= 0 || Number(formData['payoutRules.mariage']) <= 0) {
      setError('Payout multipliers must be positive.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    const payload = {
      name: formData.name,
      drawDate: formData.drawDate,
      numberOfWinningNumbers: Number(formData.numberOfWinningNumbers),
      validNumberRange: {
        min: Number(formData['validNumberRange.min']),
        max: Number(formData['validNumberRange.max']),
      },
      payoutRules: {
        bolet: Number(formData['payoutRules.bolet']),
        mariage: Number(formData['payoutRules.mariage']),
      },
      states: formData.states,
      maxPerNumber: Number(formData.maxPerNumber),
    };

    try {
      await onSave(lottery?._id, payload);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg sm:max-w-md overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{lottery ? 'Edit Lottery' : 'Create New Lottery'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lottery Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Draw Date & Time</label>
            <input
              type="datetime-local"
              name="drawDate"
              value={formData.drawDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Winning Numbers</label>
            <input
              type="number"
              name="numberOfWinningNumbers"
              min="1"
              value={formData.numberOfWinningNumbers}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Number Range (Min)</label>
            <input
              type="number"
              name="validNumberRange.min"
              value={formData['validNumberRange.min']}
              onChange={handleChange}
              required
              disabled={lottery && lottery.ticketsSold > 0}
              className="mt-mount w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Number Range (Max)</label>
            <input
              type="number"
              name="validNumberRange.max"
              value={formData['validNumberRange.max']}
              onChange={handleChange}
              required
              disabled={lottery && lottery.ticketsSold > 0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Tickets Per Number</label>
            <input
              type="number"
              name="maxPerNumber"
              min="1"
              value={formData.maxPerNumber}
              onChange={handleChange}
              required
              disabled={lottery && lottery.ticketsSold > 0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bolet Payout Multiplier (e.g., 50x)</label>
            <input
              type="number"
              name="payoutRules.bolet"
              min="1"
              value={formData['payoutRules.bolet']}
              onChange={handleChange}
              required
              disabled={lottery && lottery.ticketsSold > 0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mariage Payout Multiplier (e.g., 1000x)</label>
            <input
              type="number"
              name="payoutRules.mariage"
              min="1"
              value={formData['payoutRules.mariage']}
              onChange={handleChange}
              required
              disabled={lottery && lottery.ticketsSold > 0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Available States</label>
            <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {usStates.map((state) => (
                <div key={state} className="flex items-center">
                  <input
                    type="checkbox"
                    id={state}
                    value={state}
                    checked={formData.states.includes(state)}
                    onChange={() => handleStateToggle(state)}
                    disabled={lottery && lottery.ticketsSold > 0}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:cursor-not-allowed"
                  />
                  <label htmlFor={state} className="ml-2 text-sm text-gray-700 capitalize">{state}</label>
                </div>
              ))}
            </div>
            {formData.states.length === 0 && error.includes('state') && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          {lottery && lottery.ticketsSold > 0 && (
            <p className="text-yellow-600 text-sm mt-2">
              Note: Fields affecting bets (number range, max per number, payout rules, states) cannot be edited as tickets have been sold.
            </p>
          )}
          {error && !error.includes('state') && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white font-medium py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : lottery ? 'Update Lottery' : 'Create Lottery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotteryModal;