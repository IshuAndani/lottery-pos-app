import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLotteryById, getSoldNumbersForLottery, getOpenLotteries } from '../../api';
import TicketGrid from '../../components/agent/TicketGrid';
import BettingSlip from '../../components/agent/BettingSlip';
import TicketReceipt from '../../components/agent/TicketResult'; // Import the receipt component

const PERIODS = [
  { value: 'matin', label: 'Matin' }, // Midday
  { value: 'soir', label: 'Soir' },  // Evening
];

const SellTicketPage = () => {
  const { lotteryId } = useParams();
  const [lottery, setLottery] = useState(null);
  const [soldNumbers, setSoldNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSoldTicket, setLastSoldTicket] = useState(null);
  // New state for dropdowns
  const [allLotteries, setAllLotteries] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('matin');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch all lotteries for the dropdown
    getOpenLotteries().then(lotteries => {
      // Move Georgia to the end
      const georgia = lotteries.find(l => l.name.toLowerCase().includes('georgia'));
      const others = lotteries.filter(l => !l.name.toLowerCase().includes('georgia'));
      const sorted = georgia ? [...others, georgia] : others;
      setAllLotteries(sorted);
      // Default to first lottery if not set
      if (!selectedState && sorted.length > 0) setSelectedState(sorted[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    const loadLotteryData = async () => {
      try {
        setLoading(true);
        const lotteryData = await getLotteryById(selectedState);
        const soldNumbersData = await getSoldNumbersForLottery(selectedState);
        setLottery(lotteryData);
        setSoldNumbers(soldNumbersData);
      } catch (err) {
        setError(err.message || 'Could not load lottery data.');
      } finally {
        setLoading(false);
      }
    };
    loadLotteryData();
  }, [selectedState]);

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
    setShowReceipt(true);
    setShowSuccess(true);
    setCopied(false);
    // Add newly sold numbers to the sold list to disable them immediately
    const newlySold = ticket.bets.flatMap(bet =>
      bet.betType === 'bolet'
        ? [bet.numbers[0]]
        : [bet.numbers[0], bet.numbers[1]]
    );
    setSoldNumbers(prev => [...prev, ...newlySold]);
    setSelectedNumbers([]); // Clear selection
    // Optional: show a success message or modal
    // alert(`Ticket sold successfully! Ticket ID: ${ticket.ticketId}`);
  };

  const handleCopy = () => {
    if (lastSoldTicket?.ticketId) {
      navigator.clipboard.writeText(lastSoldTicket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!lottery) return <p>Lottery not found.</p>;

  return (
    <div className="px-2 sm:px-4 py-2">
      {showReceipt && lastSoldTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-2">
          <div className="relative bg-white rounded-lg shadow-lg p-0 w-full max-w-md mx-auto">
            {/* Success Popup */}
            {showSuccess && (
              <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white bg-opacity-95 z-10 rounded-lg p-4 sm:p-8" style={{ minHeight: '260px', minWidth: '240px' }}>
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                  onClick={() => { setShowSuccess(false); setShowReceipt(false); }}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="text-green-600 text-xl sm:text-2xl font-bold mb-2">Ticket créé avec succès !</div>
                <div className="mb-4 text-gray-700 text-sm sm:text-base">ID du billet : <span className="font-mono bg-gray-100 px-2 py-1 rounded">{lastSoldTicket.ticketId}</span></div>
                <button
                  onClick={handleCopy}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold mb-2"
                >
                  {copied ? 'Copié !' : 'Copier l\'ID du billet'}
                </button>
                {/* <button
                  onClick={() => setShowSuccess(false)}
                  className="text-gray-600 underline mt-2 flex items-center gap-1 px-4 py-2 rounded hover:bg-gray-100"
                  aria-label="Fermer"
                > */}
                  {/* <span>Fermer</span> */}
                {/* </button> */}
              </div>
            )}
            {/* Receipt Printout (unchanged) */}
            <TicketReceipt ticket={lastSoldTicket} onClose={() => setShowReceipt(false)} />
          </div>
        </div>
      )}
      {/* State and Period Selection */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">État (State)</label>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm"
          >
            {allLotteries.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Période (Period)</label>
          <div className="flex gap-4 flex-wrap">
            {PERIODS.map(period => (
              <label key={period.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="period"
                  value={period.value}
                  checked={selectedPeriod === period.value}
                  onChange={() => setSelectedPeriod(period.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>{period.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{lottery.name}</h1>
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
            lotteryId={selectedState}
            selectedNumbers={selectedNumbers.sort((a, b) => a - b)}
            onTicketSold={handleTicketSold}
            onClearSelection={handleClearSelection}
            period={selectedPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default SellTicketPage;