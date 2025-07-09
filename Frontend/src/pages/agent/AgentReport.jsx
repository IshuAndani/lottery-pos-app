// import React, { useState, useEffect } from 'react';
// import { getAgentReport } from '../../api';

// const AgentReport = () => {
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         setLoading(true);
//         // Assuming the API returns a default report (e.g., for the current day)
//         const reportData = await getAgentReport();
//         setReport(reportData);
//       } catch (err) {
//         setError('Failed to fetch report data.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchReport();
//   }, []);

//   if (loading) return <div className="text-center p-8">Loading report...</div>;
//   if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
//   if (!report) return <div className="text-center p-8">No report data available.</div>;

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <h1 className="text-3xl font-bold">Agent Dashboard</h1>
//         {/* You can add date filter components here */}
//       </div>

//       {/* Responsive Stat Cards: Uses grid that adjusts columns based on screen size */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatCard title="Total Sales" value={`$${report.totalSales.toFixed(2)}`} />
//         <StatCard title="Tickets Sold" value={report.ticketsSold} />
//         <StatCard title="Total Payouts" value={`$${report.totalPayouts.toFixed(2)}`} />
//         <StatCard title="Net Balance" value={`$${report.netBalance.toFixed(2)}`} isPositive={report.netBalance >= 0} />
//       </div>

//       {/* Responsive Recent Sales Table */}
//       <h2 className="text-2xl font-bold mb-4">Recent Sales</h2>
//       <div className="bg-white shadow-md rounded-lg overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Ticket ID</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Lottery</th>
//               <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {report.recentTickets.map(ticket => (
//               <tr key={ticket._id} className="border-b border-gray-200 hover:bg-gray-50">
//                 <td className="py-3 px-4 font-mono">{ticket.ticketId}</td>
//                 <td className="py-3 px-4">{ticket.lottery.name}</td>
//                 <td className="py-3 px-4 text-right">${ticket.totalAmount.toFixed(2)}</td>
//                 <td className="py-3 px-4">{new Date(ticket.createdAt).toLocaleString()}</td>
//                 <td className="py-3 px-4">
//                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.isWinner ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
//                     {ticket.isWinner ? 'Winner' : 'Not Winner'}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // A reusable StatCard component
// const StatCard = ({ title, value, isPositive }) => (
//   <div className="bg-white p-6 rounded-lg shadow">
//     <h3 className="text-sm font-medium text-gray-500">{title}</h3>
//     <p className={`text-3xl font-bold mt-1 ${isPositive === false ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
//   </div>
// );

// export default AgentReport;