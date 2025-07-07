// This component provides a consistent layout (including the navbar)
// for all pages within the agent's section.

import React from 'react';
import { Outlet } from 'react-router-dom';
import AgentNavbar from '../components/agent/AgentNavbar';

const AgentLayout = () => {
  return (
    <div>
      <AgentNavbar />
      <main className="p-8">
        {/* The <Outlet /> component renders the specific page component for the current route */}
        <Outlet />
      </main>
    </div>
  );
};

export default AgentLayout;