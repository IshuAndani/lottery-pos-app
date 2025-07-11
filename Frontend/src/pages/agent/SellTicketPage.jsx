import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getLotteryById, getSoldNumbersForLottery } from '../../api';
import TicketGrid from '../../components/agent/TicketGrid';
import BettingSlip from '../../components/agent/BettingSlip';
import TicketReceipt from '../../components/agent/TicketReceipt';

const SellTicketPage = () => {
  const { lotteryId } = useParams();
  const [lottery, setLottery] = useState(null);
  const [soldNumbers, setSoldNumbers] = useState([]);
  const [transactionId,setTransactionId] = useState();
  const [agentId,setAgentId] = useState();  
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSoldTicket, setLastSoldTicket] = useState(null);
  const receiptRef = useRef(null);

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

  const handlePrintReceipt = () => {
    if (!lastSoldTicket || !lottery) {
      console.error("Ticket or lottery data is missing for printing.");
      return;
    }

    // This is the structured data object the native print interface will receive.
    const printDetails = {
      lotteryName: lottery.name,
      createdAt: lastSoldTicket.createdAt,
      ticketId: lastSoldTicket.ticketId,
      bets: lastSoldTicket.bets,
      totalAmount: lastSoldTicket.bets.reduce((sum, bet) => sum + bet.amount, 0),
      transactionId: transactionId,
      agentId: agentId,
    };

    // Check if the native PrintInterface is available (e.g., in an Android WebView).
    if (window.PrintInterface && typeof window.PrintInterface.print === 'function') {
      // If it exists, send the structured data directly to the native code.
      // The native code is now responsible for formatting and printing the receipt.
      console.log("Using native print interface.");
      window.PrintInterface.print(JSON.stringify(printDetails));
    } else {
      // --- Fallback for standard web browsers ---
      console.log("Native print interface not found. Falling back to browser print dialog.");
      const receiptNode = receiptRef.current;
      if (!receiptNode) {
        console.error("Receipt component is not available for printing for fallback.");
        return;
      }

      // The existing iframe logic remains as a fallback for development and web-only use.
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(tag => tag.outerHTML).join('');
      doc.write(`<html><head><title>Print Receipt</title>${styleTags}</head><body>${receiptNode.innerHTML}</body></html>`);
      doc.close();

      iframe.onload = function() {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 500);
      };
    }
  };

  const handleTicketSold = (ticket,transactionId,agentId) => {
    // Add newly sold numbers to the sold list to disable them immediately
    const newlySold = ticket.bets.map(b => b.number);
    setSoldNumbers(prev => [...prev, ...newlySold]);
    setSelectedNumbers([]); // Clear selection
    toast.success(`Ticket sold successfully! Ticket ID: ${ticket.ticketId}`);
    // This state update will trigger the useEffect below to print the receipt
    setLastSoldTicket(ticket);
    setTransactionId(transactionId);
    setAgentId(agentId);
  };

  // This effect runs *after* the component re-renders with the new `lastSoldTicket`
  useEffect(() => {
    if (lastSoldTicket) {
      // Delay the print action slightly. This ensures the user has a moment
      // to see the "Ticket Sold" toast notification before the browser's
      // print dialog appears and blocks the UI.
      const printTimer = setTimeout(() => {
        handlePrintReceipt();
      }, 1000); // 1-second delay

      // Clean up the timer if the component unmounts before it fires
      return () => clearTimeout(printTimer);
    }
  }, [lastSoldTicket]); // Dependency array ensures this runs only when a new ticket is sold

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

      {/* This component is rendered off-screen so html2canvas can capture it */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <TicketReceipt ref={receiptRef} ticket={lastSoldTicket} lottery={lottery} transactionId={transactionId} agentId={agentId}/>
      </div>
    </div>
  );
};

export default SellTicketPage;