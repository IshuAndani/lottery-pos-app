import React, { useState, useEffect } from 'react';
import { getAllAgents, createAgent, updateAgent, settleAgentBalance, deleteAgent } from '../../api';
import AgentModal from '../../components/admin/AgentModal';
import SettleBalanceModal from '../../components/admin/SettleBalanceModal';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, agentName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
          Confirm Deletion
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">{agentName}</span>? This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgentForEdit, setSelectedAgentForEdit] = useState(null);
  
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedAgentForSettle, setSelectedAgentForSettle] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAgentForDelete, setSelectedAgentForDelete] = useState(null);

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

  const handleOpenDeleteModal = (agent) => {
    setSelectedAgentForDelete(agent);
    setIsDeleteModalOpen(true);
  };

  const handleSaveAgent = async (formData) => {
    try {
      if (selectedAgentForEdit) {
        await updateAgent(selectedAgentForEdit._id, formData);
      } else {
        // Ensure password is included only on create
        await createAgent({
          name: formData.name,
          email: formData.email,
          commissionRate: formData.commissionRate,
          status: formData.status,
          password: formData.password,
        });
      }
      await fetchAgents();
      setIsEditModalOpen(false);
    } catch (err) {
      throw new Error(err.message || 'Failed to save agent.');
    }
  };
  
  const handleSettleBalance = async (agentId, settlementData) => {
    try {
      await settleAgentBalance(agentId, settlementData);
      await fetchAgents();
      setIsSettleModalOpen(false);
    } catch (err) {
      throw new Error(err.message || 'Failed to settle balance.');
    }
  };

  const handleDeleteAgent = async () => {
    try {
      await deleteAgent(selectedAgentForDelete._id);
      await fetchAgents();
      setIsDeleteModalOpen(false);
      setSelectedAgentForDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete agent.');
    }
  };

  if (loading) return <p className="text-center text-gray-600 text-lg py-8">Loading agents...</p>;
  if (error) return <p className="text-center text-red-500 text-lg py-8">{error}</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Manage Agents
        </h1>
        <button
          onClick={handleOpenCreateModal}
          className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
        >
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAgentForDelete(null);
        }}
        onConfirm={handleDeleteAgent}
        agentName={selectedAgentForDelete?.name || ""}
      />

      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full leading-relaxed">
          <thead>
            <tr>
              <th className="px-6 py-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Balance Owed
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                Commission (%)
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="px-6 py-4 border-b-2 border-gray-200 bg-gray-100 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td className="px-6 py-6 border-b border-gray-200 bg-white text-sm">
                  <div className="font-semibold text-gray-800">
                    {agent.name}
                  </div>
                  <div className="text-gray-600 text-xs mt-2">
                    {agent.email}
                  </div>
                  <div className="md:hidden text-gray-600 text-xs mt-2">
                    Balance: ${agent.balance.toFixed(2)}
                  </div>
                  <div className="md:hidden text-gray-600 text-xs mt-2">
                    Commission: {agent.commissionRate}%
                  </div>
                  <div className="md:hidden text-xs mt-2">
                    <span
                      className={`inline-block px-3 py-1 font-semibold rounded-full ${
                        agent.status === "active"
                          ? "text-green-800 bg-green-100"
                          : "text-red-800 bg-red-100"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6 border-b border-gray-200 bg-white text-sm font-semibold text-gray-800 hidden md:table-cell">
                  ${agent.balance.toFixed(2)}
                </td>
                <td className="px-6 py-6 border-b border-gray-200 bg-white text-sm text-gray-800 hidden lg:table-cell">
                  {agent.commissionRate}%
                </td>
                <td className="px-6 py-6 border-b border-gray-200 bg-white text-sm hidden md:table-cell">
                  <span
                    className={`inline-block px-3 py-1 font-semibold rounded-full ${
                      agent.status === "active"
                        ? "text-green-800 bg-green-100"
                        : "text-red-800 bg-red-100"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
                <td className="px-6 py-6 border-b border-gray-200 bg-white text-sm text-right">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-5 justify-end">
                    <button
                      onClick={() => handleOpenSettleModal(agent)}
                      className="text-green-600 hover:text-green-800 font-semibold py-1 px-3 text-sm rounded hover:bg-green-50 transition-colors"
                    >
                      Settle
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(agent)}
                      className="text-purple-600 hover:text-purple-800 font-semibold py-1 px-3 text-sm rounded hover:bg-purple-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(agent)}
                      className="bg-red-600 text-white font-bold text-sm flex items-center justify-center rounded-full hover:bg-red-700 transition-colors"
                      title="Delete Agent"
                      aria-label="Delete Agent"
                    >
                      Delete
                    </button>
                  </div>
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