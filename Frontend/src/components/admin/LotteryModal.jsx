import React, { useState } from 'react';

const LotteryModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    drawDate: '',
    numberOfWinningNumbers: 1,
    'validNumberRange.min': 0,
    'validNumberRange.max': 99,
    payoutRule: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        payoutRule: formData.payoutRule
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
            <input type="text" name="name" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Draw Date & Time</label>
            <input type="datetime-local" name="drawDate" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Number of Winning Numbers</label>
            <input type="number" name="numberOfWinningNumbers" min="1" onChange={handleChange} defaultValue="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">"Bolet" Payout Multiplier (e.g., 50x)</label>
            <input type="number" name="payoutRule" min="1" onChange={handleChange} defaultValue="50" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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