import React, { useState, useEffect } from 'react';
import { getAgentReport } from '../../api';
import ReportCard from '../../components/agent/ReportCard';

const AgentReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  const fetchReport = async (params) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAgentReport(params);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Could not fetch report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (dates.startDate && dates.endDate) {
      // Validate that endDate is not before startDate
      if (new Date(dates.endDate) >= new Date(dates.startDate)) {
        fetchReport(dates);
      } else {
        setError('End date must be after start date');
      }
    }
  };

  const handleClearFilter = () => {
    setDates({ startDate: '', endDate: '' });
    setError('');
    fetchReport();
  };

  // Format numbers for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Agent Reports</h1>

      {/* Date Filter Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter by Date Range</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => { setDates({ startDate: new Date().toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10) }); fetchReport({ startDate: new Date().toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10) }); }} className="px-3 py-1 rounded bg-gray-200 text-gray-800">Today</button>
          <button onClick={() => { const d=new Date(); const s=new Date(); const day=s.getDay(); const diff=s.getDate()-day+(day===0?-6:1); s.setDate(diff); const sd=s.toISOString().slice(0,10); const ed=d.toISOString().slice(0,10); setDates({ startDate: sd, endDate: ed }); fetchReport({ startDate: sd, endDate: ed }); }} className="px-3 py-1 rounded bg-gray-200 text-gray-800">This Week</button>
          <button onClick={() => { const d=new Date(); const s=new Date(); s.setDate(1); const sd=s.toISOString().slice(0,10); const ed=d.toISOString().slice(0,10); setDates({ startDate: sd, endDate: ed }); fetchReport({ startDate: sd, endDate: ed }); }} className="px-3 py-1 rounded bg-gray-200 text-gray-800">This Month</button>
          <button onClick={() => { setDates({ startDate: '', endDate: '' }); fetchReport(); }} className="px-3 py-1 rounded bg-gray-200 text-gray-800">All Time</button>
        </div>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dates.startDate}
              onChange={handleDateChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dates.endDate}
              onChange={handleDateChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors h-10"
          >
            Apply Filter
          </button>
          <button
            type="button"
            onClick={handleClearFilter}
            className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors h-10"
          >
            Clear
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>

      {/* Report Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : report ? (
        <div>
          <div className="mb-6 text-gray-600">
            Showing data for: {report.period === 'Overall' ? 'All Time' : `${report.period.startDate} to ${report.period.endDate}`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <ReportCard title="Balance Owed to Admin" value={report.currentBalance} color="blue" tooltip="Ticket sales minus commission. This is what you currently owe to admin." format="currency" />
            <ReportCard title="Tickets Sold" value={report.soldTicketsCount} color="yellow" tooltip="Number of tickets sold in the selected period." format="number" />
            <ReportCard title="Sales Amount" value={report.totalSalesAmount} color="yellow" tooltip="Total ticket sales amount in the selected period." format="currency" />
            <ReportCard title="Commission Earned" value={report.totalCommissions} color="green" tooltip="Your commission based on your commission rate." format="currency" />
            <ReportCard title="Winnings Paid to Players" value={report.totalPayouts} color="red" tooltip="Total payouts you paid to winners." format="currency" />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No report data available.</p>
      )}
    </div>
  );
};

export default AgentReportsPage;