import React from 'react';
import moment from 'moment';

// We use React.forwardRef to allow the parent component (SellTicketPage)
// to get a direct reference to this component's DOM element.
const TicketReceipt = React.forwardRef(({ ticket, lottery, transactionId, agentId }, ref) => {
  if (!ticket || !lottery) {
    return null;
  }

  const totalAmount = ticket.bets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    // The ref is attached here. html2canvas will capture this div.
    // We style it to resemble a narrow thermal receipt.
    <div ref={ref} className="p-2 bg-white text-black" style={{ width: '300px', fontFamily: '"Courier New", Courier, monospace' }}>
      <div className="text-center">
        <h2 className="text-xl font-bold uppercase">{lottery.name}</h2>
        <p className="text-sm">Lottery Receipt</p>
        <p className="text-xs">{moment(ticket.createdAt).format('DD/MM/YYYY hh:mm:ss A')}</p>
      </div>

      <hr className="my-2 border-black border-dashed" />

      <div className="text-center">
        <p className="text-sm font-semibold">TICKET ID</p>
        <p className="text-2xl font-bold tracking-widest">{ticket.ticketId}</p>
      </div>

      <hr className="my-2 border-black border-dashed" />

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left font-semibold">NUMBER</th>
            <th className="text-right font-semibold">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {ticket.bets.map((bet, index) => (
            <tr key={index}>
              <td className="text-left text-lg font-mono">{bet.number}</td>
              <td className="text-right text-lg font-mono">${bet.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="my-2 border-black border-dashed" />

      <div className="text-right font-bold">
        <p className="text-lg">TOTAL: ${totalAmount.toFixed(2)}</p>
      </div>

      <hr className="my-2 border-black border-dashed" />

      <div className="text-sm">
        <p><strong>Transaction ID:</strong> {transactionId}</p>
        <p><strong>Agent ID:</strong> {agentId}</p>
      </div>

      <hr className="my-2 border-black border-dashed" />

      <div className="text-center mt-4">
        <p className="text-xs">Thank you for playing!</p>
        <p className="text-xs">Not a winning ticket until validated.</p>
      </div>
    </div>
  );
});

TicketReceipt.displayName = 'TicketReceipt';

export default TicketReceipt;