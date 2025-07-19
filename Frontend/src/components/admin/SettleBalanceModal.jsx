import React, { useState } from 'react';

const SettleBalanceModal = ({ isOpen, onClose, agent, onSave }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    const maxAmount = Math.abs(agent.balance);

    if (!numericAmount || numericAmount <= 0 || numericAmount > maxAmount) {
      setError(`Please enter an amount between 0.01 and ${maxAmount.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    // If balance is negative, the admin is paying the agent. We send a negative
    // amount so the backend logic `balance -= amount` works correctly.
    const settlementAmount = agent.balance > 0 ? numericAmount : -numericAmount;

    try {
      await onSave(agent._id, { amount: settlementAmount, description });
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const maxAmount = Math.abs(agent.balance);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Settle Balance</h2>
        <p className="mb-4 text-gray-600">Agent: <span className="font-semibold">{agent.name}</span></p>
        <p className="mb-6 text-gray-600">
          Current Balance:
          <span className={`font-semibold ${agent.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${agent.balance.toFixed(2)}
          </span>
          {agent.balance >= 0 ? ' (Owed to Admin)' : ' (Owed to Agent)'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Settlement Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" max={maxAmount.toFixed(2)} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description (Optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400">
              {isSubmitting ? 'Saving...' : 'Record Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleBalanceModal;