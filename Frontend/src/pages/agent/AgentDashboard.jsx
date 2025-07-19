import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AgentDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Agent Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome back, {user?.name}. From here you can manage ticket sales and view your reports.
      </p>
      {/* We will add dashboard summary cards here later */}
    </div>
  );
};

export default AgentDashboard;