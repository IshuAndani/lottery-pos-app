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
    'payoutRules.play3': 500,
    'payoutRules.play4': 2000,
    states: [],
    maxPerNumber: 50,
    'betLimits.bolet.min': 1,
    'betLimits.bolet.max': 100,
    'betLimits.mariage.min': 1,
    'betLimits.mariage.max': 25,
    'betLimits.play3.min': 1,
    'betLimits.play3.max': 25,
    'betLimits.play4.min': 1,
    'betLimits.play4.max': 20,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stateSearch, setStateSearch] = useState('');

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

  const filteredStates = usStates.filter(state => state.toLowerCase().includes(stateSearch.toLowerCase()));

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
        'payoutRules.play3': lottery.payoutRules?.play3 ?? 500,
        'payoutRules.play4': lottery.payoutRules?.play4 ?? 2000,
        states: lottery.states || [],
        maxPerNumber: lottery.maxPerNumber ?? 50,
        'betLimits.bolet.min': lottery.betLimits?.bolet?.min ?? 1,
        'betLimits.bolet.max': lottery.betLimits?.bolet?.max ?? 100,
        'betLimits.mariage.min': lottery.betLimits?.mariage?.min ?? 1,
        'betLimits.mariage.max': lottery.betLimits?.mariage?.max ?? 25,
        'betLimits.play3.min': lottery.betLimits?.play3?.min ?? 1,
        'betLimits.play3.max': lottery.betLimits?.play3?.max ?? 25,
        'betLimits.play4.min': lottery.betLimits?.play4?.min ?? 1,
        'betLimits.play4.max': lottery.betLimits?.play4?.max ?? 20,
      });
    }
    setStateSearch('');
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
      setError('Max price per number must be positive.');
      return;
    }
    if (Number(formData.numberOfWinningNumbers) <= 0) {
      setError('Number of winning numbers must be positive.');
      return;
    }
    const bl = {
      bolet: { min: Number(formData['betLimits.bolet.min']), max: Number(formData['betLimits.bolet.max']) },
      mariage: { min: Number(formData['betLimits.mariage.min']), max: Number(formData['betLimits.mariage.max']) },
      play3: { min: Number(formData['betLimits.play3.min']), max: Number(formData['betLimits.play3.max']) },
      play4: { min: Number(formData['betLimits.play4.min']), max: Number(formData['betLimits.play4.max']) },
    };
    for (const key of Object.keys(bl)) {
      if (isNaN(bl[key].min) || isNaN(bl[key].max) || bl[key].min < 0 || bl[key].max < bl[key].min) {
        setError('Bet limits must be valid numbers and max >= min.');
        return;
      }
    }
    if (Number(formData['payoutRules.bolet']) <= 0 || Number(formData['payoutRules.mariage']) <= 0 || Number(formData['payoutRules.play3']) <= 0 || Number(formData['payoutRules.play4']) <= 0) {
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
        play3: Number(formData['payoutRules.play3']),
        play4: Number(formData['payoutRules.play4']),
      },
      states: formData.states,
      maxPerNumber: Number(formData.maxPerNumber),
      betLimits: bl,
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
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{lottery ? 'Edit Lottery' : 'Create New Lottery'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lottery Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Draw Date & Time</label>
            <input
              type="datetime-local"
              name="drawDate"
              value={formData.drawDate}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Winning Numbers</label>
            <input
              type="number"
              name="numberOfWinningNumbers"
              min="1"
              value={formData.numberOfWinningNumbers}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valid Number Range (Min)</label>
            <input
              type="number"
              name="validNumberRange.min"
              value={formData['validNumberRange.min']}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valid Number Range (Max)</label>
            <input
              type="number"
              name="validNumberRange.max"
              value={formData['validNumberRange.max']}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price Per Number</label>
            <input
              type="number"
              name="maxPerNumber"
              min="1"
              value={formData.maxPerNumber}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bolet Payout Multiplier (e.g., 50x)</label>
            <input
              type="number"
              name="payoutRules.bolet"
              min="1"
              value={formData['payoutRules.bolet']}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mariage Payout Multiplier (e.g., 1000x)</label>
            <input
              type="number"
              name="payoutRules.mariage"
              min="1"
              value={formData['payoutRules.mariage']}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Play3 Payout Multiplier (e.g., 500x)</label>
            <input
              type="number"
              name="payoutRules.play3"
              min="1"
              value={formData['payoutRules.play3']}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Play4 Payout Multiplier (e.g., 2000x)</label>
            <input
              type="number"
              name="payoutRules.play4"
              min="1"
              value={formData['payoutRules.play4']}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available States</label>
            <input
              type="text"
              placeholder="Search states..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base mb-3 touch-manipulation"
            />
            <div className="max-h-60 overflow-y-auto border-2 border-gray-400 rounded-md p-2 space-y-2">
              {filteredStates.length === 0 ? (
                <p className="text-sm text-gray-500">No states found.</p>
              ) : (
                filteredStates.map((state) => (
                  <div key={state} className="flex items-center">
                    <input
                      type="checkbox"
                      id={state}
                      value={state}
                      checked={formData.states.includes(state)}
                      onChange={() => handleStateToggle(state)}
                      className="h-5 w-5 text-purple-600 focus:ring-2 focus:ring-purple-500 border-2 border-gray-400 rounded"
                    />
                    <label htmlFor={state} className="ml-3 text-base text-gray-700 capitalize">{state}</label>
                  </div>
                ))
              )}
            </div>
            {formData.states.length === 0 && error.includes('state') && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          {error && !error.includes('state') && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded hover:bg-gray-300 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white font-medium py-3 px-6 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
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