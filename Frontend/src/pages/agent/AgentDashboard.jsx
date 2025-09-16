import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAgentReport, getAgentRecentTickets, getOpenLotteries } from '../../api';
import ReportCard from '../../components/agent/ReportCard';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentTickets, setRecentTickets] = useState([]);
  const [openLotteries, setOpenLotteries] = useState([]);
  const [preset, setPreset] = useState('today');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const now = new Date();
        const start = new Date();
        if (preset === 'today') {
          start.setHours(0,0,0,0);
        } else if (preset === 'week') {
          const day = start.getDay();
          const diff = start.getDate() - day + (day === 0 ? -6 : 1);
          start.setDate(diff);
          start.setHours(0,0,0,0);
        } else if (preset === 'month') {
          start.setDate(1);
          start.setHours(0,0,0,0);
        }

        const params = preset === 'all' ? undefined : {
          startDate: start.toISOString().slice(0,10),
          endDate: now.toISOString().slice(0,10)
        };

        const [rep, tickets, lots] = await Promise.all([
          getAgentReport(params),
          getAgentRecentTickets({ limit: 10 }),
          getOpenLotteries()
        ]);
        setReport(rep);
        setRecentTickets(tickets);
        setOpenLotteries(lots || []);
      } catch (e) {
        setError(e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [preset]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-800">Agent Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {user?.name}. Here is your current performance.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setPreset('today')} className={`px-3 py-1 rounded ${preset==='today'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-800'}`}>Today</button>
        <button onClick={() => setPreset('week')} className={`px-3 py-1 rounded ${preset==='week'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-800'}`}>This Week</button>
        <button onClick={() => setPreset('month')} className={`px-3 py-1 rounded ${preset==='month'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-800'}`}>This Month</button>
        <button onClick={() => setPreset('all')} className={`px-3 py-1 rounded ${preset==='all'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-800'}`}>All Time</button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            <ReportCard title="Balance Owed to Admin" value={report.currentBalance} color="blue" tooltip="Ticket sales minus commission. This is what you currently owe to admin." format="currency" />
            <ReportCard title="Tickets Sold" value={report.soldTicketsCount} color="yellow" tooltip="Number of tickets sold in the selected period." format="number" />
            <ReportCard title="Sales Amount" value={report.totalSalesAmount} color="yellow" tooltip="Total ticket sales amount in the selected period." format="currency" />
            <ReportCard title="Commission Earned" value={report.totalCommissions} color="green" tooltip="Your commission based on your commission rate." format="currency" />
            <ReportCard title="Winnings Paid to Players" value={report.totalPayouts} color="red" tooltip="Total payouts you paid to winners." format="currency" />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Tickets</h2>
              </div>
              {recentTickets.length === 0 ? (
                <p className="text-gray-500">No recent tickets.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">Ticket</th>
                        <th className="py-2 pr-4">Lottery</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Period</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTickets.map(t => (
                        <tr key={t.ticketId} className="border-t">
                          <td className="py-2 pr-4 font-mono">{t.ticketId}</td>
                          <td className="py-2 pr-4">{t.lotteryName}</td>
                          <td className="py-2 pr-4">{formatCurrency(t.totalAmount)}</td>
                          <td className="py-2 pr-4 capitalize">{t.period}</td>
                          <td className="py-2 pr-4 uppercase">{t.status}</td>
                          <td className="py-2 pr-4">{new Date(t.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Open Lotteries</h2>
              {openLotteries.length === 0 ? (
                <p className="text-gray-500">No open lotteries right now.</p>
              ) : (
                <ul className="space-y-3">
                  {openLotteries.map(l => (
                    <li key={l._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{l.name}</p>
                        <p className="text-xs text-gray-500">Draw: {new Date(l.drawDate).toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
                      </div>
                      <a href={`/agent/sell/${l._id}`} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Sell</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <a href="/agent/open-lotteries" className="px-4 py-2 bg-indigo-600 text-white rounded">Sell Ticket</a>
              <a href="/agent/check-ticket" className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Check Ticket Status</a>
              <a href="/agent/reports" className="px-4 py-2 bg-gray-200 text-gray-800 rounded">View My Reports</a>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500 mt-4">No data available.</p>
      )}
    </div>
  );
};

export default AgentDashboard;