import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
    const receiptNode = receiptRef.current;
    if (!receiptNode) {
      console.error("Receipt component is not available for printing.");
      return;
    }

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    // Copy all stylesheets from the main document to the iframe to preserve styling
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(tag => tag.outerHTML)
      .join('');

    doc.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          ${styleTags}
        </head>
        <body>
          ${receiptNode.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Wait for the iframe to load its content, then trigger the print dialog
    iframe.onload = function() {
      iframe.contentWindow.focus(); // Required for some browsers
      iframe.contentWindow.print();
      // Remove the iframe after a short delay to ensure the print process has started
      setTimeout(() => document.body.removeChild(iframe), 500);
    };
  };

  const handleTicketSold = (ticket,transactionId,agentId) => {
    // Add newly sold numbers to the sold list to disable them immediately
    const newlySold = ticket.bets.map(b => b.number);
    setSoldNumbers(prev => [...prev, ...newlySold]);
    setSelectedNumbers([]); // Clear selection
    alert(`Ticket sold successfully! Ticket ID: ${ticket.ticketId}.`);
    // This state update will trigger the useEffect below to print the receipt
    setLastSoldTicket(ticket);
    setTransactionId(transactionId);
    setAgentId(agentId);
  };

  // This effect runs *after* the component re-renders with the new `lastSoldTicket`
  useEffect(() => {
    if (lastSoldTicket) {
      // We check for lastSoldTicket to ensure this runs only after a sale.
      // The receiptRef will be available because the component has just re-rendered.
      handlePrintReceipt();
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