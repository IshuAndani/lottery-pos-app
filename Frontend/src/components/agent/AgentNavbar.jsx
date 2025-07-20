import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePrinter } from '../../hooks/usePrinter';
import PrinterSelectionModal from './PrinterSelectionModal';

const AgentNavbar = () => {
  const { user, logout } = useAuth();
  const { selectedPrinter } = usePrinter();
  const navigate = useNavigate();
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              {/* Desktop Nav Links */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>Dashboard</NavLink>
                  <NavLink to="/lotteries" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Open Lotteries</NavLink>
                  <NavLink to="/check-ticket" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Check Ticket</NavLink>
                  <NavLink to="/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Reports</NavLink>
                </div>
              </div>
            </div>
            {/* Desktop Actions */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button onClick={() => setIsPrinterModalOpen(true)} className="text-sm mr-4 p-2 rounded-md hover:bg-blue-700">
                  Printer: {selectedPrinter ? selectedPrinter.name : 'None'}
                </button>
                <span className="mr-3">Welcome, {user?.name}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
              </div>
            </div>
            {/* Hamburger for Mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-700 px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
            <NavLink to="/lotteries" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setMobileMenuOpen(false)}>Open Lotteries</NavLink>
            <NavLink to="/check-ticket" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setMobileMenuOpen(false)}>Check Ticket</NavLink>
            <NavLink to="/reports" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setMobileMenuOpen(false)}>Reports</NavLink>
            <button onClick={() => { setIsPrinterModalOpen(true); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800">Printer: {selectedPrinter ? selectedPrinter.name : 'None'}</button>
            <span className="block px-3 py-2 text-base">Welcome, {user?.name}</span>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2">Logout</button>
          </div>
        )}
      </nav>
    </>
  );
};

export default AgentNavbar;