import React, { useState, useEffect } from 'react';
import { getOpenLotteries } from '../../api';
import { Link } from 'react-router-dom'; // Import Link

const OpenLotteriesPage = () => {
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const data = await getOpenLotteries();
        setLotteries(data);
      } catch (err) {
        setError(err.message || 'Could not fetch lotteries.');
      } finally {
        setLoading(false);
      }
    };
    fetchLotteries();
  }, []);

  if (loading) return <p>Loading lotteries...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Open Lotteries</h1>
      {lotteries.length === 0 ? (
        <p>There are no lotteries currently open for sale.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotteries.map((lottery) => (
            <Link to={`/lotteries/${lottery._id}`} key={lottery._id} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all">
              <h2 className="text-xl font-bold text-blue-600">{lottery.name}</h2>
              <p className="text-sm text-gray-500 mt-2">
                Draw Date: {new Date(lottery.drawDate).toLocaleDateString()}
              </p>
              <p className="mt-4">Tickets Sold: {lottery.ticketsSold}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenLotteriesPage;