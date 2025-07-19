import React, { useState, useEffect } from 'react';
import { getAllLotteriesAdmin, getLotteryFinancials, getSystemSummary } from '../../api';
import ReportCard from '../../components/admin/ReportCard';

const AdminReportsPage = () => {
  const [lotteries, setLotteries] = useState([]);
  const [selectedLottery, setSelectedLottery] = useState('');
  const [lotteryReport, setLotteryReport] = useState(null);
  const [summaryReport, setSummaryReport] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState({ lotteries: true, lotteryReport: false, summaryReport: false });
  const [error, setError] = useState({ lotteries: '', lotteryReport: '', summaryReport: '' });

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const data = await getAllLotteriesAdmin();
        setLotteries(data);
      } catch (err) {
        setError(prev => ({ ...prev, lotteries: 'Failed to load lotteries' }));
      } finally {
        setLoading(prev => ({ ...prev, lotteries: false }));
      }
    };
    fetchLotteries();
  }, []);

  const handleLotterySelect = async (lotteryId) => {
    setSelectedLottery(lotteryId);
    if (!lotteryId) {
      setLotteryReport(null);
      return;
    }
    setLoading(prev => ({ ...prev, lotteryReport: true }));
    setError(prev => ({ ...prev, lotteryReport: '' }));
    try {
      const data = await getLotteryFinancials(lotteryId);
      setLotteryReport(data);
    } catch (err) {
      setError(prev => ({ ...prev, lotteryReport: 'Failed to load lottery report' }));
    } finally {
      setLoading(prev => ({ ...prev, lotteryReport: false }));
    }
  };

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const handleSummarySubmit = async (e) => {
    e.preventDefault();
    if (!dates.startDate || !dates.endDate) return;
    setLoading(prev => ({ ...prev, summaryReport: true }));
    setError(prev => ({ ...prev, summaryReport: '' }));
    try {
      const data = await getSystemSummary(dates);
      setSummaryReport(data);
    } catch (err) {
      setError(prev => ({ ...prev, summaryReport: 'Failed to load summary report' }));
    } finally {
      setLoading(prev => ({ ...prev, summaryReport: false }));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Reports</h1>
      <div className="space-y-8">
        {/* Lottery Specific Report */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lottery Financials</h2>
          <select onChange={(e) => handleLotterySelect(e.target.value)} value={selectedLottery} className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm">
            <option value="">-- Select a Lottery --</option>
            {lotteries.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          {loading.lotteryReport && <p className="mt-4">Loading report...</p>}
          {error.lotteryReport && <p className="mt-4 text-red-500">{error.lotteryReport}</p>}
          {lotteryReport && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ReportCard title="Total Revenue" value={lotteryReport.totalRevenue} color="green" />
              <ReportCard title="Total Payouts" value={lotteryReport.totalPayouts} color="red" />
              <ReportCard title="Total Commissions" value={lotteryReport.totalCommissions} color="yellow" />
              <ReportCard title="Net Profit" value={lotteryReport.netProfit} color="purple" />
            </div>
          )}
        </div>

        {/* System Wide Summary */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">System-Wide Summary</h2>
          <form onSubmit={handleSummarySubmit} className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input type="date" name="startDate" value={dates.startDate} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input type="date" name="endDate" value={dates.endDate} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <button type="submit" className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700">Generate</button>
          </form>
          {loading.summaryReport && <p className="mt-4">Loading summary...</p>}
          {error.summaryReport && <p className="mt-4 text-red-500">{error.summaryReport}</p>}
          {summaryReport && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ReportCard title="Total Revenue" value={summaryReport.totalRevenue} color="green" />
              <ReportCard title="Total Payouts" value={summaryReport.totalPayouts} color="red" />
              <ReportCard title="Total Commissions" value={summaryReport.totalCommissions} color="yellow" />
              <ReportCard title="Net Profit" value={summaryReport.netProfit} color="purple" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;