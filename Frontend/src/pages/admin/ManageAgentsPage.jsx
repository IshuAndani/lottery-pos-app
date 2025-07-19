import React, { useState, useEffect } from 'react';
import { getAllAgents, createAgent, updateAgent, settleAgentBalance } from '../../api';
import AgentModal from '../../components/admin/AgentModal';
import SettleBalanceModal from '../../components/admin/SettleBalanceModal'; // Import the new modal

const ManageAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the Create/Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgentForEdit, setSelectedAgentForEdit] = useState(null);
  
  // State for the Settle Balance modal
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedAgentForSettle, setSelectedAgentForSettle] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await getAllAgents();
      setAgents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch agents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedAgentForEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (agent) => {
    setSelectedAgentForEdit(agent);
    setIsEditModalOpen(true);
  };
  
  const handleOpenSettleModal = (agent) => {
    setSelectedAgentForSettle(agent);
    setIsSettleModalOpen(true);
  };

  const handleSaveAgent = async (formData) => {
    if (selectedAgentForEdit) {
      await updateAgent(selectedAgentForEdit._id, formData);
    } else {
      await createAgent(formData);
    }
    await fetchAgents();
    setIsEditModalOpen(false);
  };
  
  const handleSettleBalance = async (agentId, settlementData) => {
    await settleAgentBalance(agentId, settlementData);
    await fetchAgents();
    setIsSettleModalOpen(false);
  };

  if (loading) return <p>Loading agents...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Agents</h1>
        <button onClick={handleOpenCreateModal} className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700">
          + Add New Agent
        </button>
      </div>

      <AgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        agent={selectedAgentForEdit}
        onSave={handleSaveAgent}
      />
      
      <SettleBalanceModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        agent={selectedAgentForSettle}
        onSave={handleSettleBalance}
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance Owed</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commission (%)</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{agent.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{agent.email}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-semibold">${agent.balance.toFixed(2)}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{agent.commissionRate}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${agent.status === 'active' ? 'text-green-900' : 'text-red-900'}`}>
                    <span aria-hidden className={`absolute inset-0 ${agent.status === 'active' ? 'bg-green-200' : 'bg-red-200'} opacity-50 rounded-full`}></span>
                    <span className="relative">{agent.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right space-x-4">
                  <button onClick={() => handleOpenSettleModal(agent)} className="text-green-600 hover:text-green-900 font-semibold">Settle</button>
                  <button onClick={() => handleOpenEditModal(agent)} className="text-purple-600 hover:text-purple-900 font-semibold">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAgentsPage;