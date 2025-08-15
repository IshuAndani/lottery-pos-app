import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { getAllLotteriesAdmin, getLotteryFinancials, getSystemSummary, getAgentTicketsReport, getTicketsSoldByDate } from '../../api';
import ReportCard from '../../components/admin/ReportCard';

const AdminReportsPage = () => {
  const [lotteries, setLotteries] = useState([]);
  const [selectedLottery, setSelectedLottery] = useState('');
  const [lotteryReport, setLotteryReport] = useState(null);
  const [summaryReport, setSummaryReport] = useState(null);
  const [agentTicketsReport, setAgentTicketsReport] = useState([]);
  const [ticketsSold, setTicketsSold] = useState([]);
  const [lotteryDates, setLotteryDates] = useState({ startDate: '', endDate: '' });
  const [summaryDates, setSummaryDates] = useState({ startDate: '', endDate: '' });
  const [agentDates, setAgentDates] = useState({ startDate: '', endDate: '' });
  const [ticketsDates, setTicketsDates] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState({
    lotteries: true,
    lotteryReport: false,
    summaryReport: false,
    agentTicketsReport: false,
    ticketsSold: false,
  });
  const [error, setError] = useState({
    lotteries: '',
    lotteryReport: '',
    summaryReport: '',
    agentTicketsReport: '',
    ticketsSold: '',
  });

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const data = await getAllLotteriesAdmin();
        setLotteries(data);
      } catch (err) {
        setError(prev => ({ ...prev, lotteries: err.message || 'Failed to load lotteries' }));
      } finally {
        setLoading(prev => ({ ...prev, lotteries: false }));
      }
    };

    const fetchAgentTicketsReport = async () => {
      try {
        setLoading(prev => ({ ...prev, agentTicketsReport: true }));
        const data = await getAgentTicketsReport();
        setAgentTicketsReport(data);
      } catch (err) {
        setError(prev => ({ ...prev, agentTicketsReport: err.message || 'Failed to load agent tickets report' }));
      } finally {
        setLoading(prev => ({ ...prev, agentTicketsReport: false }));
      }
    };

    const fetchTicketsSold = async () => {
      try {
        setLoading(prev => ({ ...prev, ticketsSold: true }));
        const data = await getTicketsSoldByDate();
        setTicketsSold(data);
      } catch (err) {
        setError(prev => ({ ...prev, ticketsSold: err.message || 'Failed to load tickets sold' }));
      } finally {
        setLoading(prev => ({ ...prev, ticketsSold: false }));
      }
    };

    fetchLotteries();
    fetchAgentTicketsReport();
    fetchTicketsSold();
  }, []);

  const handleLotterySelect = async (lotteryId) => {
    setSelectedLottery(lotteryId);
    if (!lotteryId) {
      setLotteryReport(null);
      return;
    }
    try {
      setLoading(prev => ({ ...prev, lotteryReport: true }));
      setError(prev => ({ ...prev, lotteryReport: '' }));
      const data = await getLotteryFinancials(lotteryId, lotteryDates);
      setLotteryReport(data);
    } catch (err) {
      setError(prev => ({ ...prev, lotteryReport: err.message || 'Failed to load lottery report' }));
    } finally {
      setLoading(prev => ({ ...prev, lotteryReport: false }));
    }
  };

  const handleDateChange = (section, e) => {
    const tz = 'America/New_York';
    const value = e.target.value ? moment.tz(e.target.value, tz).format('YYYY-MM-DD') : '';
    if (section === 'lottery') {
      setLotteryDates(prev => ({ ...prev, [e.target.name]: value }));
    } else if (section == 'summary') {
      setSummaryDates(prev => ({ ...prev, [e.target.name]: value }));
    } else if (section == 'agent') {
      setAgentDates(prev => ({ ...prev, [e.target.name]: value }));
    } else if (section == 'tickets') {
      setTicketsDates(prev => ({ ...prev, [e.target.name]: value }));
    }
  };

  const handleLotterySubmit = async (e) => {
    e.preventDefault();
    if (!selectedLottery) return;
    await handleLotterySelect(selectedLottery);
  };

  const handleSummarySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, summaryReport: true }));
      setError(prev => ({ ...prev, summaryReport: '' }));
      const data = await getSystemSummary(summaryDates);
      setSummaryReport(data);
    } catch (err) {
      setError(prev => ({ ...prev, summaryReport: err.message || 'Failed to load summary report' }));
    } finally {
      setLoading(prev => ({ ...prev, summaryReport: false }));
    }
  };

  const handleAgentTicketsSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, agentTicketsReport: true }));
      setError(prev => ({ ...prev, agentTicketsReport: '' }));
      const data = await getAgentTicketsReport(agentDates);
      setAgentTicketsReport(data);
    } catch (err) {
      setError(prev => ({ ...prev, agentTicketsReport: err.message || 'Failed to load agent tickets report' }));
    } finally {
      setLoading(prev => ({ ...prev, agentTicketsReport: false }));
    }
  };

  const handleTicketsSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, ticketsSold: true }));
      setError(prev => ({ ...prev, ticketsSold: '' }));
      const data = await getTicketsSoldByDate(ticketsDates);
      setTicketsSold(data);
    } catch (err) {
      setError(prev => ({ ...prev, ticketsSold: err.message || 'Failed to load tickets sold' }));
    } finally {
      setLoading(prev => ({ ...prev, ticketsSold: false }));
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Admin Reports</h1>
      <div className="space-y-6 sm:space-y-8">
        {/* Lottery Specific Report */}
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Lottery Financials</h2>
          <form onSubmit={handleLotterySubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">Select Lottery</label>
              <select
                onChange={(e) => handleLotterySelect(e.target.value)}
                value={selectedLottery}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              >
                <option value="">-- Select a Lottery --</option>
                {lotteries.map(l => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={lotteryDates.startDate}
                onChange={(e) => handleDateChange('lottery', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={lotteryDates.endDate}
                onChange={(e) => handleDateChange('lottery', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700"
            >
              Generate
            </button>
          </form>
          {loading.lotteryReport && <p className="mt-4 text-sm">Loading report...</p>}
          {error.lotteryReport && <p className="mt-4 text-red-500 text-sm">{error.lotteryReport}</p>}
          {lotteryReport && (
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <ReportCard title="Total Revenue" value={lotteryReport.totalRevenue} color="green" />
              <ReportCard title="Total Payouts" value={lotteryReport.totalPayouts} color="red" />
              <ReportCard title="Total Commissions" value={lotteryReport.totalCommissions} color="yellow" />
              <ReportCard title="Net Profit" value={lotteryReport.netProfit} color="purple" />
            </div>
          )}
        </div>

        {/* System-Wide Summary */}
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">System-Wide Summary</h2>
          <form onSubmit={handleSummarySubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={summaryDates.startDate}
                onChange={(e) => handleDateChange('summary', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={summaryDates.endDate}
                onChange={(e) => handleDateChange('summary', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700"
            >
              Generate
            </button>
          </form>
          {loading.summaryReport && <p className="mt-4 text-sm">Loading summary...</p>}
          {error.summaryReport && <p className="mt-4 text-red-500 text-sm">{error.summaryReport}</p>}
          {summaryReport && (
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <ReportCard title="Total Revenue" value={summaryReport.totalRevenue} color="green" />
              <ReportCard title="Total Payouts" value={summaryReport.totalPayouts} color="red" />
              <ReportCard title="Total Commissions" value={summaryReport.totalCommissions} color="yellow" />
              <ReportCard title="Net Profit" value={summaryReport.netProfit} color="purple" />
            </div>
          )}
        </div>

        {/* Agent Tickets Report */}
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Agent Tickets Report</h2>
          <form onSubmit={handleAgentTicketsSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={agentDates.startDate}
                onChange={(e) => handleDateChange('agent', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={agentDates.endDate}
                onChange={(e) => handleDateChange('agent', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700"
            >
              Filter
            </button>
          </form>
          {loading.agentTicketsReport && <p className="mt-4 text-sm">Loading report...</p>}
          {error.agentTicketsReport && <p className="mt-4 text-red-500 text-sm">{error.agentTicketsReport}</p>}
          {agentTicketsReport.length > 0 && (
            <div className="mt-4 sm:mt-6">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Email</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tickets</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agentTicketsReport.map(agent => (
                      <tr key={agent.agentEmail}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{agent.agentName}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{agent.agentEmail}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{agent.totalTickets}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">${agent.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {agentTicketsReport.map(agent => (
                  <div key={agent.agentEmail} className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700"><span className="font-semibold">Name:</span> {agent.agentName}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Email:</span> {agent.agentEmail}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Tickets:</span> {agent.totalTickets}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Amount:</span> ${agent.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {agentTicketsReport.length === 0 && !loading.agentTicketsReport && !error.agentTicketsReport && (
            <p className="mt-4 text-gray-500 text-sm">No agent ticket data found for the selected date range.</p>
          )}
        </div>

        {/* Tickets Sold by Date Range */}
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Tickets Sold by Date Range</h2>
          <form onSubmit={handleTicketsSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={ticketsDates.startDate}
                onChange={(e) => handleDateChange('tickets', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={ticketsDates.endDate}
                onChange={(e) => handleDateChange('tickets', e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700"
            >
              Filter
            </button>
          </form>
          {loading.ticketsSold && <p className="mt-4 text-sm">Loading tickets...</p>}
          {error.ticketsSold && <p className="mt-4 text-red-500 text-sm">{error.ticketsSold}</p>}
          {ticketsSold.length > 0 && (
            <div className="mt-4 sm:mt-6">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lottery</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date (ET)</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ticketsSold.map(ticket => (
                      <tr key={ticket.ticketId}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{ticket.ticketId}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{ticket.lotteryName}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{ticket.agentName}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">${ticket.totalAmount.toFixed(2)}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{moment(ticket.purchaseDate).tz('America/New_York').format('YYYY-MM-DD HH:mm:ss')}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{ticket.period}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{ticket.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {ticketsSold.map(ticket => (
                  <div key={ticket.ticketId} className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700"><span className="font-semibold">Ticket ID:</span> {ticket.ticketId}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Lottery:</span> {ticket.lotteryName}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Agent:</span> {ticket.agentName}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Amount:</span> ${ticket.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Date (ET):</span> {moment(ticket.purchaseDate).tz('America/New_York').format('YYYY-MM-DD HH:mm:ss')}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Period:</span> {ticket.period}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Status:</span> {ticket.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ticketsSold.length === 0 && !loading.ticketsSold && !error.ticketsSold && (
            <p className="mt-4 text-gray-500 text-sm">No tickets found for the selected date range.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;