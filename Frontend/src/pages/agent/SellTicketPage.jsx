import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getLotteryById, getSoldNumbersForLottery, getOpenLotteries } from '../../api';
import TicketGrid from '../../components/agent/TicketGrid';
import BettingSlip from '../../components/agent/BettingSlip';
import TicketReceipt from '../../components/agent/TicketResult';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const PERIODS = [
  { value: 'matin', label: 'Matin' },
  { value: 'soir', label: 'Soir' },
];

const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' },
  { name: 'Washington, D.C.', abbreviation: 'DC' },
];

const SellTicketPage = () => {
  const { lotteryId } = useParams();
  const [lottery, setLottery] = useState(null);
  const [soldNumbers, setSoldNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSoldTicket, setLastSoldTicket] = useState(null);
  const [allLotteries, setAllLotteries] = useState([]);
  const [selectedState, setSelectedState] = useState(lotteryId || '');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('matin');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [print, setPrint] = useState(true);
  const { t } = useTranslation();
  const billRef = useRef(null);

  useEffect(() => {
    getOpenLotteries()
      .then(lotteries => {
        console.log('Fetched Lotteries:', lotteries); // Debug log
        const sorted = lotteries.sort((a, b) => {
          const aIsGeorgia = a.name.toLowerCase().includes('georgia');
          const bIsGeorgia = b.name.toLowerCase().includes('georgia');
          return bIsGeorgia - aIsGeorgia;
        });
        setAllLotteries(sorted);
        
        // Set default state if none selected
        if (!selectedState && sorted.length > 0) {
          // Try to find Georgia first, otherwise use first lottery
          const georgiaLottery = sorted.find(l => l.name.toLowerCase().includes('georgia'));
          const defaultLottery = georgiaLottery || sorted[0];
          
          // Set the lottery data
          setLottery(defaultLottery);
          
          // Try to extract state from lottery name, default to Georgia
          const state = US_STATES.find(s => defaultLottery.name.toLowerCase().includes(s.name.toLowerCase()));
          const defaultState = state || US_STATES.find(s => s.name === 'Georgia');
          
          if (defaultState) {
            setSelectedState(defaultState.abbreviation);
            setSelectedStateName(defaultState.name);
          }
        }
        
        // Handle URL parameter
        if (lotteryId) {
          const selectedLottery = sorted.find(l => l._id === lotteryId);
          if (selectedLottery) {
            setLottery(selectedLottery);
            const state = US_STATES.find(s => selectedLottery.name.toLowerCase().includes(s.name.toLowerCase()));
            if (state) {
              setSelectedState(state.abbreviation);
              setSelectedStateName(state.name);
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching lotteries:', err);
        setError('Failed to load lotteries.');
      });
  }, [lotteryId]);

  useEffect(() => {
    // Only load lottery data if we have allLotteries and selectedState
    if (!selectedState || allLotteries.length === 0) return;
    
    const loadLotteryData = async () => {
      try {
        setLoading(true);
        
        // Find lottery for the selected state
        const stateLottery = allLotteries.find(l => {
          const state = US_STATES.find(s => s.abbreviation === selectedState);
          return state && l.name.toLowerCase().includes(state.name.toLowerCase());
        });
        
        if (stateLottery) {
          const lotteryData = await getLotteryById(stateLottery._id);
          const soldNumbersData = await getSoldNumbersForLottery(stateLottery._id);
          console.log('Lottery Data:', lotteryData); // Debug log
          console.log('Sold Numbers:', soldNumbersData); // Debug log
          setLottery(lotteryData);
          setSoldNumbers(soldNumbersData);
        } else {
          // If no lottery found for state, use first available lottery
          if (allLotteries.length > 0) {
            const defaultLottery = allLotteries[0];
            const lotteryData = await getLotteryById(defaultLottery._id);
            const soldNumbersData = await getSoldNumbersForLottery(defaultLottery._id);
            setLottery(lotteryData);
            setSoldNumbers(soldNumbersData);
          }
        }
      } catch (err) {
        console.error('Error loading lottery data:', err);
        setError(err.message || 'Could not load lottery data.');
      } finally {
        setLoading(false);
      }
    };
    loadLotteryData();
  }, [selectedState, allLotteries]);

  useEffect(() => {
    if (lastSoldTicket && showReceipt && !loading) {
      const isPrinted = localStorage.getItem('isTicketPrintCall') === 'Y';
      if (!isPrinted) {
        localStorage.setItem('isTicketPrintCall', 'Y');
        setPrint(true);
      }
    }
  }, [lastSoldTicket, showReceipt, loading]);

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
    setLastSoldTicket({ 
      ...ticket, 
      state: selectedStateName,
      lottery: lottery,
      period: selectedPeriod
    });
    setShowReceipt(true);
    setShowSuccess(true);
    setCopied(false);
    const newlySold = ticket.bets.flatMap(bet =>
      bet.betType === 'bolet' ? [bet.numbers[0]] : bet.numbers
    );
    setSoldNumbers(prev => [...prev, ...newlySold]);
    setSelectedNumbers([]);
    localStorage.setItem('isTicketPrintCall', 'N');
  };

  const handleCopy = () => {
    if (lastSoldTicket?.ticketId) {
      navigator.clipboard.writeText(lastSoldTicket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handlePrint = () => {
    setPrint(false);
    const printButtonContainer = document.getElementById('print-container');
    if (printButtonContainer) {
      printButtonContainer.style.display = 'none';
    }

    const printBill = document.getElementById('print-bill');
    if (printBill && lastSoldTicket) {
      document.body.style.overflow = 'hidden';
      const otherElements = document.querySelectorAll('body > *:not(#print-bill)');
      otherElements.forEach(el => el.style.display = 'none');

      printBill.style.display = 'block';
      printBill.style.position = 'static';
      printBill.style.left = '0';

      const htmlContent = printBill.innerHTML;
      const receiptData = {
        ticketId: lastSoldTicket.ticketId,
        date: new Date(lastSoldTicket.createdAt).toLocaleString(),
        state: lastSoldTicket.state || selectedStateName,
        lottery: lastSoldTicket.lottery?.name || lottery?.name,
        period: lastSoldTicket.period || selectedPeriod,
        bets: lastSoldTicket.bets.map((bet, idx) => ({
          betType: bet.betType,
          numbers: bet.numbers,
          amount: bet.amount,
        })),
        totalAmount: lastSoldTicket.totalAmount,
      };

      if (window.PrintInterface) {
        window.PrintInterface.print(JSON.stringify(receiptData));
      } else {
        console.log(receiptData);
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Ticket Receipt</title></head><body>');
        printWindow.document.write(htmlContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      otherElements.forEach(el => el.style.display = '');
      document.body.style.overflow = '';
      printBill.style.display = 'none';
      printBill.style.position = 'absolute';
      printBill.style.left = '-9999px';
    }

    localStorage.setItem('isTicketPrintCall', 'N');
    setShowReceipt(false);
  };

  if (loading) return <p className="text-center py-4">Loading...</p>;
  if (error) return <p className="text-red-500 text-center py-4">{error}</p>;
  if (!lottery) return <p className="text-center py-4">Lottery not found.</p>;

  return (
    <div className="px-4 py-4 max-w-7xl mx-auto">
      {showReceipt && lastSoldTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="relative bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            {showSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-95 rounded-lg p-4">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                  onClick={() => {
                    setShowSuccess(false);
                    setShowReceipt(false);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="text-green-600 text-lg font-bold mb-2">{t('ticket_created')}</div>
                <div className="mb-4 text-gray-700 text-sm">
                  {t('ticket_id')}: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{lastSoldTicket.ticketId}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold mb-2"
                >
                  {copied ? t('copied') : t('copy_ticket_id')}
                </button>
                <div
                  id="print-container"
                  style={print ? { display: 'block', textAlign: 'center' } : { display: 'none' }}
                >
                  <button
                    onClick={handlePrint}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold"
                  >
                    {t('print')}
                  </button>
                </div>
              </div>
            )}
            <TicketReceipt ticket={lastSoldTicket} onClose={() => setShowReceipt(false)} />
          </div>
        </div>
      )}

      {lastSoldTicket && (
        <div
          ref={billRef}
          id="print-bill"
          style={{
            display: 'none',
            position: 'absolute',
            left: '-9999px',
          }}
        >
          <div style={{ 
            fontFamily: 'Arial, sans-serif', 
            padding: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            backgroundColor: '#fff',
            color: '#000'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
                {t('ticket_created')}
              </h2>
              <hr style={{ border: '1px solid #000', margin: '10px 0' }} />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>{t('ticket_id')}:</strong> {lastSoldTicket.ticketId}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>{t('state')}:</strong> {lastSoldTicket.state || selectedStateName}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>{t('lottery')}:</strong> {lastSoldTicket.lottery?.name || lottery?.name}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>{t('date')}:</strong> {moment(lastSoldTicket.createdAt).format('DD-MM-YYYY h:mm a')}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>{t('period')}:</strong> {lastSoldTicket.period || selectedPeriod}
              </p>
            </div>

            <hr style={{ border: '1px solid #000', margin: '15px 0' }} />
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                {t('bets')}
              </h3>
              {lastSoldTicket.bets.map((bet, index) => (
                <div key={index} style={{ marginBottom: '10px', paddingLeft: '10px', borderLeft: '2px solid #ddd' }}>
                  <p style={{ margin: '3px 0', fontSize: '13px', fontWeight: 'bold' }}>
                    {t('bet')} {index + 1}:
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    {t('type')}: {bet.betType}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    {t('numbers')}: {bet.numbers.join(', ')}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    {t('amount')}: ${bet.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <hr style={{ border: '1px solid #000', margin: '15px 0' }} />
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>
                <strong>{t('total_amount')}: ${lastSoldTicket.totalAmount.toFixed(2)}</strong>
              </p>
            </div>
            
            <hr style={{ border: '1px solid #000', margin: '15px 0' }} />
            
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
              <p style={{ margin: '5px 0' }}>Thank you for playing!</p>
              <p style={{ margin: '5px 0' }}>Good Luck!</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced State Selection Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Selection Options</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* State Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('state')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={e => {
                  const newStateId = e.target.value;
                  setSelectedState(newStateId);
                  
                  // Find the state name from US_STATES
                  const state = US_STATES.find(s => s.abbreviation === newStateId);
                  setSelectedStateName(state ? state.name : newStateId);
                }}
                className="w-full rounded-lg border-gray-300 shadow-sm px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
              >
                <option value="" disabled className="text-gray-500">
                  Select a state
                </option>
                
                {/* All US States */}
                {US_STATES.map(state => (
                  <option 
                    key={state.abbreviation} 
                    value={state.abbreviation}
                    className="text-gray-700"
                  >
                    {state.name}
                  </option>
                ))}
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Selected State Display */}
            {selectedStateName && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Selected:</span> {selectedStateName}
                </p>
              </div>
            )}
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('period')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PERIODS.map(period => (
                <label 
                  key={period.value} 
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${selectedPeriod === period.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="period"
                    value={period.value}
                    checked={selectedPeriod === period.value}
                    onChange={() => setSelectedPeriod(period.value)}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${selectedPeriod === period.value 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedPeriod === period.value && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="font-medium">{period.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lottery Info Header */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{lottery.name}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('select_numbers')}</p>
        {selectedStateName && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            📍 {selectedStateName}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
            lotteryId={lottery?._id || selectedState}
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