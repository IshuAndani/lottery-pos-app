import React, { useState } from 'react';
import { getTicketById } from '../../api';
import TicketResult from '../../components/agent/TicketResult';

const CheckTicketPage = () => {
  const [ticketId, setTicketId] = useState('');
  const [searchedTicket, setSearchedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticketId) return;

    setIsLoading(true);
    setError('');
    setSearchedTicket(null);

    try {
      const data = await getTicketById(ticketId.trim().toUpperCase());
      setSearchedTicket(data);
    } catch (err) {
      setError(err.message || `No ticket found with ID: ${ticketId}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePayoutSuccess = (updatedTicket) => {
    // When the child component successfully pays out, update the ticket data here
    setSearchedTicket(updatedTicket);
    alert('Payout successful!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Check Ticket Status</h1>
      <form onSubmit={handleSearch} className="max-w-md">
        <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
          Enter Ticket ID
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="ticketId"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="ABC123XYZ"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-200"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {searchedTicket && <TicketResult ticket={searchedTicket} onPayoutSuccess={handlePayoutSuccess} />}
    </div>
  );
};

export default CheckTicketPage;