import React, { useState, useEffect, useMemo } from 'react';
import { getAllLotteriesAdmin, createLottery, updateLottery, deleteLottery, declareWinners } from '../../api';
import LotteryModal from '../../components/admin/LotteryModal';
import DeclareWinnersModal from '../../components/admin/DeclareWinnersModal';

const ManageLotteriesPage = () => {
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState(null);

  const fetchLotteries = async () => {
    try {
      setLoading(true);
      const data = await getAllLotteriesAdmin();
      setLotteries(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch lotteries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotteries();
  }, []);

  const handleSaveLottery = async (formData) => {
    try {
      await createLottery(formData);
      await fetchLotteries();
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create lottery.');
    }
  };

  const handleEditLottery = async (lotteryId, formData) => {
    try {
      await updateLottery(lotteryId, formData);
      await fetchLotteries();
      setIsEditModalOpen(false);
      setSelectedLottery(null);
    } catch (err) {
      setError(err.message || 'Failed to update lottery.');
    }
  };

  const handleDeleteLottery = async (lotteryId, lotteryName) => {
    if (window.confirm(`Are you sure you want to delete the lottery "${lotteryName}"?`)) {
      try {
        await deleteLottery(lotteryId);
        await fetchLotteries();
      } catch (err) {
        setError(err.message || 'Failed to delete lottery.');
      }
    }
  };

  const handleDeclareWinners = async (lotteryId, winningNumbers) => {
    try {
      await declareWinners(lotteryId, winningNumbers);
      await fetchLotteries();
      setIsDeclareModalOpen(false);
      setSelectedLottery(null);
    } catch (err) {
      setError(err.message || 'Failed to declare winners.');
    }
  };

  const handleOpenEditModal = (lottery) => {
    setSelectedLottery(lottery);
    setIsEditModalOpen(true);
  };

  const handleOpenDeclareModal = (lottery) => {
    setSelectedLottery(lottery);
    setIsDeclareModalOpen(true);
  };

  const categorizedLotteries = useMemo(() => {
    return lotteries.reduce((acc, lottery) => {
      const status = lottery.status || 'open';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(lottery);
      return acc;
    }, {});
  }, [lotteries]);

  if (loading) return <p className="text-gray-600">Loading lotteries...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const renderLotteryList = (list) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map(lottery => (
        <div key={lottery._id} className="bg-white p-6 rounded-lg shadow-md relative">
          <h3 className="text-xl font-bold text-purple-800">{lottery.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Draw: {new Date(lottery.drawDate).toLocaleString()}</p>
          <p className="mt-2">Tickets Sold: {lottery.ticketsSold}</p>
          <p className="mt-2">Available in: {lottery.states.join(', ')}</p>
          <p className="mt-2">Payout Multipliers: Bolet: {lottery.payoutRules.bolet}, Mariage: {lottery.payoutRules.mariage}</p>
          {lottery.status === 'completed' && (
            <p className="font-semibold mt-2">Winners: {lottery.winningNumbers.join(', ')}</p>
          )}
          <div className="mt-4 flex flex-col gap-2">
            {lottery.status === 'closed' && (
              <button
                onClick={() => handleOpenDeclareModal(lottery)}
                className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors"
              >
                Declare Winners
              </button>
            )}
            {lottery.status !== 'completed' && (
              <>
                <button
                  onClick={() => handleOpenEditModal(lottery)}
                  className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLottery(lottery._id, lottery.name)}
                  className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Lotteries</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
        >
          + Create New Lottery
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <LotteryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveLottery}
      />
      <LotteryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditLottery}
        lottery={selectedLottery}
      />
      <DeclareWinnersModal
        isOpen={isDeclareModalOpen}
        onClose={() => setIsDeclareModalOpen(false)}
        lottery={selectedLottery}
        onSave={handleDeclareWinners}
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-purple-200 pb-2">Open</h2>
          {categorizedLotteries.open?.length > 0 ? renderLotteryList(categorizedLotteries.open) : <p className="text-gray-500">No open lotteries.</p>}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-purple-200 pb-2">Closed (Awaiting Winners)</h2>
          {categorizedLotteries.closed?.length > 0 ? renderLotteryList(categorizedLotteries.closed) : <p className="text-gray-500">No lotteries awaiting winners.</p>}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-purple-200 pb-2">Completed</h2>
          {categorizedLotteries.completed?.length > 0 ? renderLotteryList(categorizedLotteries.completed) : <p className="text-gray-500">No completed lotteries.</p>}
        </div>
      </div>
    </div>
  );
};

export default ManageLotteriesPage;