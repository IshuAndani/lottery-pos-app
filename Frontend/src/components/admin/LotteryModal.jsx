import React, { useState } from 'react';

const LotteryModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    drawDate: '',
    numberOfWinningNumbers: 1,
    'validNumberRange.min': '0',
    'validNumberRange.max': '99',
    payoutRule: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const min = Number(formData['validNumberRange.min']);
    const max = Number(formData['validNumberRange.max']);

    if (min >= max) {
      setError('Minimum number must be less than the maximum number.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const payload = {
        name: formData.name,
        drawDate: formData.drawDate,
        numberOfWinningNumbers: Number(formData.numberOfWinningNumbers),
        validNumberRange: {
            min: min,
            max: max,
        },
        payoutRule: Number(formData.payoutRule)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create New Lottery</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Lottery Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Draw Date & Time</label>
            <input type="datetime-local" name="drawDate" value={formData.drawDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Number of Winning Numbers</label>
            <input type="number" name="numberOfWinningNumbers" min="1" value={formData.numberOfWinningNumbers} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Min Number</label>
              <input type="number" name="validNumberRange.min" value={formData['validNumberRange.min']} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Max Number</label>
              <input type="number" name="validNumberRange.max" value={formData['validNumberRange.max']} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">"Bolet" Payout Multiplier (e.g., 50x)</label>
            <input type="number" name="payoutRule" min="1" value={formData.payoutRule} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400">
              {isSubmitting ? 'Creating...' : 'Create Lottery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotteryModal;