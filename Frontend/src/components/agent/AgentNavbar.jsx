import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePrinter } from '../../hooks/usePrinter'; // Import the new hook
import PrinterSelectionModal from './PrinterSelectionModal'; // Import the new modal

const AgentNavbar = () => {
  const { user, logout } = useAuth();
  const { selectedPrinter } = usePrinter();
  const navigate = useNavigate();
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = { color: 'white', backgroundColor: '#1D4ED8' };

  return (
    <>
      <PrinterSelectionModal isOpen={isPrinterModalOpen} onClose={() => setIsPrinterModalOpen(false)} />
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl">Agent Panel</span>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>Dashboard</NavLink>
                  <NavLink to="/lotteries" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Open Lotteries</NavLink>
                  <NavLink to="/check-ticket" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Check Ticket</NavLink>
                  <NavLink to="/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Reports</NavLink>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button onClick={() => setIsPrinterModalOpen(true)} className="text-sm mr-4 p-2 rounded-md hover:bg-blue-700">
                  Printer: {selectedPrinter ? selectedPrinter.name : 'None'}
                </button>
                <span className="mr-3">Welcome, {user?.name}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AgentNavbar;