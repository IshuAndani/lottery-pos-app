import React, { useState, useEffect } from 'react';

const AgentModal = ({ isOpen, onClose, agent, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    commissionRate: 0,
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        commissionRate: agent.commissionRate || 0,
        status: agent.status || 'active',
      });
    } else {
      setFormData({ name: '', email: '', commissionRate: 0, status: 'active' });
    }
  }, [agent, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">{agent ? 'Edit Agent' : 'Create New Agent'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 py-3 px-4 text-base touch-manipulation"
            >
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded hover:bg-gray-300 text-base w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 text-white font-bold py-3 px-6 rounded hover:bg-purple-700 disabled:bg-gray-400 text-base w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentModal;