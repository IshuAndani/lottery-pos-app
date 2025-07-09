// import React, { useState, useEffect } from 'react';
// import { getAllAgents } from '../../api';

// const ManageAgents = () => {
//   const [agents, setAgents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAgents = async () => {
//       try {
//         setLoading(true);
//         const agentList = await getAllAgents();
//         setAgents(agentList);
//       } catch (err) {
//         setError('Failed to fetch agents. Please try again.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAgents();
//   }, []);

//   if (loading) return <div className="text-center p-8">Loading agents...</div>;
//   if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

//   return (
//     <div className="container mx-auto p-4 sm:p-6 lg:p-8">
//       <h1 className="text-3xl font-bold mb-6">Manage Agents</h1>
      
//       {/* DESKTOP TABLE VIEW: Hidden on small screens. On medium screens, it becomes scrollable if content overflows. */}
//       <div className="hidden md:block bg-white shadow-md rounded-lg overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Balance</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
//               <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {agents.map(agent => (
//               <tr key={agent._id} className="border-b border-gray-200 hover:bg-gray-50">
//                 <td className="py-3 px-4">{agent.name}</td>
//                 <td className="py-3 px-4">{agent.email}</td>
//                 <td className="py-3 px-4">${agent.balance.toFixed(2)}</td>
//                 <td className="py-3 px-4">
//                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${agent.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
//                     {agent.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </td>
//                 <td className="py-3 px-4">
//                   <button className="text-blue-600 hover:text-blue-800">Edit</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* MOBILE CARD VIEW: Visible by default, hidden on medium screens and up (md:hidden) */}
//       <div className="md:hidden">
//         <div className="space-y-4">
//           {agents.map(agent => (
//             <div key={agent._id} className="bg-white p-4 rounded-lg shadow">
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-lg font-bold">{agent.name}</h3>
//                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${agent.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{agent.isActive ? 'Active' : 'Inactive'}</span>
//               </div>
//               <p className="text-gray-600">{agent.email}</p>
//               <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
//                 <p className="text-gray-800 font-semibold">Balance: ${agent.balance.toFixed(2)}</p>
//                 <button className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm">Edit</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageAgents;