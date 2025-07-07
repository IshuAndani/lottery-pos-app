import React, { useState } from 'react';
import { payoutTicket } from '../../api';

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