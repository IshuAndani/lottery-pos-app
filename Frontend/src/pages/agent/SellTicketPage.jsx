import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getLotteryById, getOpenLotteries, getCurrentUser } from '../../api';
import TicketGrid from '../../components/agent/TicketGrid';
import BettingSlip from '../../components/agent/BettingSlip';
import TicketReceipt from '../../components/agent/TicketResult';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const PERIODS = [
  { value: 'matin', label: 'Matin' },
  { value: 'soir', label: 'Soir' },
];

const SellTicketPage = () => {
  const { lotteryId } = useParams();
  const [lottery, setLottery] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSoldTicket, setLastSoldTicket] = useState(null);
  const [allLotteries, setAllLotteries] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('matin');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [print, setPrint] = useState(true);
  const [agentName, setAgentName] = useState('');
  const { t } = useTranslation();
  const billRef = useRef(null);

  useEffect(() => {
    const initializeLotteryData = async () => {
      try {
        setLoading(true);
        const lotteries = await getOpenLotteries();
        console.log('Fetched Lotteries:', lotteries);
        const sorted = lotteries.sort((a, b) => {
          const aIsGeorgia = a.name.toLowerCase().includes('georgia');
          const bIsGeorgia = b.name.toLowerCase().includes('georgia');
          return bIsGeorgia - aIsGeorgia;
        });
        setAllLotteries(sorted);

        // Fetch current user to get agent's name
        const user = await getCurrentUser();
        setAgentName(user.name || 'Unknown Agent');

        let targetLottery = null;
        let targetState = '';
        let targetStateName = '';

        if (lotteryId) {
          targetLottery = sorted.find(l => l._id === lotteryId);
          if (targetLottery) {
            const lotteryData = await getLotteryById(targetLottery._id);
            console.log('Lottery Data:', lotteryData);
            targetLottery = lotteryData;
            if (targetLottery.states && targetLottery.states.length > 0) {
              targetState = targetLottery.states[0];
              targetStateName = targetState.charAt(0).toUpperCase() + targetState.slice(1);
            }
          }
        }

        if (!targetLottery && sorted.length > 0) {
          const georgiaLottery = sorted.find(l => l.name.toLowerCase().includes('georgia'));
          targetLottery = georgiaLottery || sorted[0];
          const lotteryData = await getLotteryById(targetLottery._id);
          console.log('Lottery Data:', lotteryData);
          targetLottery = lotteryData;
          if (targetLottery.states && targetLottery.states.length > 0) {
            targetState = targetLottery.states[0];
            targetStateName = targetState.charAt(0).toUpperCase() + targetState.slice(1);
          }
        }

        if (targetLottery) {
          setLottery(targetLottery);
          setSelectedState(targetState);
          setSelectedStateName(targetStateName);
        } else {
          setError('No valid lottery found.');
        }
      } catch (err) {
        console.error('Error fetching lotteries or user:', err);
        setError('Failed to load lotteries or user data.');
      } finally {
        setLoading(false);
      }
    };

    initializeLotteryData();
  }, [lotteryId]);

  const memoizedLastSoldTicket = useMemo(() => lastSoldTicket, [lastSoldTicket]);

  useEffect(() => {
    if (memoizedLastSoldTicket && showReceipt && !loading && !print) {
      const isPrinted = localStorage.getItem('isTicketPrintCall') === 'Y';
      if (!isPrinted) {
        localStorage.setItem('isTicketPrintCall', 'Y');
        setPrint(true);
      }
    }
  }, [memoizedLastSoldTicket, showReceipt, loading, print]);

  const handleNumberSelect = (number) => {
    setSelectedNumbers(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  const handleClearSelectedNumbers = () => {
    console.log('Clearing selected numbers...');
    setSelectedNumbers([]);
  };

  const handleTicketSold = (ticket) => {
    setLastSoldTicket({ 
      ...ticket, 
      state: selectedStateName,
      lottery: lottery,
      period: selectedPeriod,
      agentName: agentName
    });
    setShowReceipt(true);
    setShowSuccess(true);
    setCopied(false);
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
        date: new Date(lastSoldTicket.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' }),
        state: lastSoldTicket.state || selectedStateName,
        lottery: lastSoldTicket.lottery?.name || lottery?.name,
        period: lastSoldTicket.period || selectedPeriod,
        agentName: lastSoldTicket.agentName || agentName,
        bets: lastSoldTicket.bets.map((bet, idx) => ({
          betType: bet.betType,
          numbers: bet.numbers,
          amounts: bet.amounts,
          state: bet.betType === 'bolet' || bet.betType === 'mariage' ? 'haiti' : bet.state || selectedStateName,
          displayText: bet.betType === 'mariage' && bet.numbers.length === 2 
            ? `${bet.numbers[0]} X ${bet.numbers[1]} ($${Number(bet.amounts[0]).toFixed(2)})`
            : bet.betType === 'play3' || bet.betType === 'play4'
            ? `${bet.numbers[0]} X $${Number(bet.amounts[0]).toFixed(2)} (${bet.state || selectedStateName})`
            : bet.numbers.map((num, i) => `${num} ($${Number(bet.amounts[i]).toFixed(2)})`).join(', ')
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
                <strong>{t('agent')}:</strong> {lastSoldTicket.agentName || agentName}
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
                    {t('numbers')}: {bet.betType === 'mariage' && bet.numbers.length === 2 
                      ? `${bet.numbers[0]} X ${bet.numbers[1]} ($${Number(bet.amounts[0]).toFixed(2)})`
                      : bet.betType === 'play3' || bet.betType === 'play4'
                      ? `${bet.numbers[0]} X $${Number(bet.amounts[0]).toFixed(2)} (${bet.state || selectedStateName})`
                      : bet.numbers.map((num, i) => `${num} ($${Number(bet.amounts[i]).toFixed(2)})`).join(', ')
                    }
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    {t('state')}: {bet.betType === 'bolet' || bet.betType === 'mariage' ? 'haiti' : bet.state || selectedStateName}
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

      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selection Options</h3>
          
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

      <div className="mb-6 bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{lottery.name}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('select_numbers')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <TicketGrid
            lottery={lottery}
            selectedNumbers={selectedNumbers}
            onNumberSelect={handleNumberSelect}
          />
        </div>
        <div>
          <BettingSlip
            lotteryId={lottery?._id || selectedState}
            selectedNumbers={selectedNumbers.sort((a, b) => a - b)}
            onTicketSold={handleTicketSold}
            period={selectedPeriod}
            lottery={lottery}
            onClearSelectedNumbers={handleClearSelectedNumbers}
          />
        </div>
      </div>
    </div>
  );
};

export default SellTicketPage;