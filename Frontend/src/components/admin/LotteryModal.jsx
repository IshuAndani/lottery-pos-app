import React, { useState } from 'react';

const LotteryModal = ({ isOpen, onClose, onSave }) => {
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

  // Sample list of US states
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

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
      await onSave(payload);
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Lottery</h2>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
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
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={state} className="ml-2 text-sm text-gray-700">{state}</label>
                </div>
              ))}
            </div>
            {formData.states.length === 0 && error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          {error && formData.states.length > 0 && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white font-medium py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Lottery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotteryModal;