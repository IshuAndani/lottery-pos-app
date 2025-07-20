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

  // Fetch the overall report on initial component load
  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (dates.startDate && dates.endDate) {
      fetchReport(dates);
    }
  };

  const handleClearFilter = () => {
    setDates({ startDate: '', endDate: '' });
    fetchReport(); // Fetch overall report again
  };

  return (
    <div className="px-2 sm:px-4 py-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Your Reports</h1>

      {/* Date Filter Form */}
      <form onSubmit={handleFilterSubmit} className="p-2 sm:p-4 mb-6 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row items-end gap-4 w-full">
        <div className="w-full sm:w-auto">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" name="startDate" value={dates.startDate} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" name="endDate" value={dates.endDate} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Filter</button>
        <button type="button" onClick={handleClearFilter} className="w-full sm:w-auto bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600">Clear</button>
      </form>

      {/* Report Display */}
      {loading ? (
        <p>Loading report...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : report ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard title="Current Balance Owed" value={report.currentBalance} color="blue" />
          <ReportCard title="Tickets Sold" value={report.soldTicketsCount} color="yellow" />
          <ReportCard title="Commissions Earned" value={report.totalCommissions} color="green" />
          <ReportCard title="Total Payouts Made" value={report.totalPayouts} color="red" />
        </div>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default AgentReportsPage;