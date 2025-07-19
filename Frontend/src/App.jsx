import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './routes/ProtectedRoute';

// Agent Imports
import AgentLayout from './routes/AgentLayout';
import AgentDashboard from './pages/agent/AgentDashboard';
import OpenLotteriesPage from './pages/agent/OpenLotteriesPage';
import SellTicketPage from './pages/agent/SellTicketPage';
import CheckTicketPage from './pages/agent/CheckTicketPage';
import AgentReportsPage from './pages/agent/AgentReportsPage';

// Admin Imports
import AdminLayout from './routes/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAgentsPage from './pages/admin/ManageAgentsPage';
import ManageLotteriesPage from './pages/admin/ManageLotteriesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage'; // Import the new page

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Agent Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
        <Route element={<AgentLayout />}>
          <Route path="/" element={<AgentDashboard />} />
          <Route path="/lotteries" element={<OpenLotteriesPage />} />
          <Route path="/lotteries/:lotteryId" element={<SellTicketPage />} />
          <Route path="/check-ticket" element={<CheckTicketPage />} />
          <Route path="/reports" element={<AgentReportsPage />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/manage-agents" element={<ManageAgentsPage />} />
          <Route path="/admin/manage-lotteries" element={<ManageLotteriesPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} /> {/* Add new route */}
        </Route>
      </Route>

      {/* Fallback for any other URL */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;