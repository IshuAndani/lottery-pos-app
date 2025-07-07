import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLotteryById, getSoldNumbersForLottery } from '../../api';
import TicketGrid from '../../components/agent/TicketGrid';
import BettingSlip from '../../components/agent/BettingSlip';

const SellTicketPage = () => {
  const { lotteryId } = useParams();
  const [lottery, setLottery] = useState(null);
  const [soldNumbers, setSoldNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSoldTicket, setLastSoldTicket] = useState(null);

  useEffect(() => {
    const loadLotteryData = async () => {
      try {
        setLoading(true);
        const lotteryData = await getLotteryById(lotteryId);
        const soldNumbersData = await getSoldNumbersForLottery(lotteryId);
        setLottery(lotteryData);
        setSoldNumbers(soldNumbersData);
      } catch (err) {
        setError(err.message || 'Could not load lottery data.');
      } finally {
        setLoading(false);
      }
    };
    loadLotteryData();
  }, [lotteryId]);

  const handleNumberSelect = (number) => {
    setSelectedNumbers(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  const handleClearSelection = () => {
    setSelectedNumbers([]);
  };
  
  const handleTicketSold = (ticket) => {
    setLastSoldTicket(ticket);
    // Add newly sold numbers to the sold list to disable them immediately
    const newlySold = ticket.bets.map(b => b.number);
    setSoldNumbers(prev => [...prev, ...newlySold]);
    setSelectedNumbers([]); // Clear selection
    // Optional: show a success message or modal
    alert(`Ticket sold successfully! Ticket ID: ${ticket.ticketId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!lottery) return <p>Lottery not found.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{lottery.name}</h1>
      <p className="text-gray-600 mb-6">Select numbers from the grid to sell a ticket.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TicketGrid
            lottery={lottery}
            soldNumbers={soldNumbers}
            selectedNumbers={selectedNumbers}
            onNumberSelect={handleNumberSelect}
          />
        </div>
        <div>
          <BettingSlip
            lotteryId={lotteryId}
            selectedNumbers={selectedNumbers.sort((a, b) => a - b)}
            onTicketSold={handleTicketSold}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default SellTicketPage;