import React, { useState } from 'react';
import { payoutTicket } from '../../api';

// Receipt print component
const TicketReceipt = ({ ticket, onClose }) => {
  if (!ticket) return null;
  return (
    <div id="printable-receipt" className="p-6 bg-white text-black w-80 mx-auto border border-gray-300 rounded-lg">
      <div className="text-center mb-4">
        <h2 className="font-bold text-xl">GABÈL BOLÈT</h2>
        <div className="text-sm">Cap Haitien, Haiti</div>
        <hr className="my-2" />
      </div>
      <div className="mb-2">
        <div><b>Ticket ID:</b> {ticket.ticketId}</div>
        <div><b>Date:</b> {new Date(ticket.createdAt).toLocaleString()}</div>
        <div><b>Lottery:</b> {ticket.lottery?.name}</div>
        <div><b>Period:</b> {ticket.period === 'matin' ? 'Matin' : ticket.period === 'soir' ? 'Soir' : ticket.period}</div>
      </div>
      <hr className="my-2" />
      <div className="mb-2">
        <b>Bets:</b>
        <ul className="ml-4">
          {ticket.bets.map((bet, idx) => (
            <li key={idx}>
              {bet.betType === 'mariage'
                ? `${bet.numbers[0]} x ${bet.numbers[1]}`
                : bet.numbers[0]
              } - ${bet.amount}
            </li>
          ))}
        </ul>
      </div>
      <div className="font-bold mt-2">Total: ${ticket.totalAmount}</div>
      <hr className="my-2" />
      <div className="text-center text-xs mt-2">Thank you for playing!</div>
      <div className="flex justify-center mt-4">
        <button onClick={onClose} className="bg-blue-500 text-white px-4 py-1 rounded mr-2">Close</button>
        <button onClick={() => window.print()} className="bg-green-600 text-white px-4 py-1 rounded">Print</button>
      </div>
    </div>
  );
};

const TicketResult = ({ ticket, onPayoutSuccess }) => {
  const [isPayingOut, setIsPayingOut] = useState(false);
  const [error, setError] = useState('');

  const handlePayout = async () => {
    setError('');
    setIsPayingOut(true);
    try {
      const result = await payoutTicket(ticket.ticketId);
      // Notify the parent component of the successful payout
      onPayoutSuccess(result.data.ticket);
    } catch (err) {
      setError(err.message || 'Payout failed.');
    } finally {
      setIsPayingOut(false);
    }
  };

  const isWinner = ticket.isWinner;
  const isPaidOut = ticket.status === 'paid_out';
  const isLotteryCompleted = ticket.lottery.status === 'completed';

  // Determine the result message and styling
  let resultStyle = 'border-gray-300';
  let resultMessage = 'This ticket is still active. Results are not yet available.';

  if (isLotteryCompleted) {
    if (isWinner) {
      resultStyle = 'border-green-500 bg-green-50';
      resultMessage = `Congratulations! This is a winning ticket! Amount: $${ticket.payoutAmount}`;
      if (isPaidOut) {
        resultStyle = 'border-yellow-500 bg-yellow-50';
        resultMessage = `This ticket has already been paid out. Amount: $${ticket.payoutAmount}`;
      }
    } else {
      resultStyle = 'border-red-500 bg-red-50';
      resultMessage = 'Sorry, this ticket is not a winner.';
    }
  }

  return (
    <div className={`mt-6 p-6 border-2 rounded-lg ${resultStyle}`}>
      <h3 className="font-bold text-lg">Ticket Status</h3>
      <p className="mt-2">{resultMessage}</p>
      
      {isWinner && !isPaidOut && isLotteryCompleted && (
        <div className="mt-4">
          <button
            onClick={handlePayout}
            disabled={isPayingOut}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isPayingOut ? 'Processing Payout...' : `Pay Out $${ticket.payoutAmount}`}
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default TicketResult;