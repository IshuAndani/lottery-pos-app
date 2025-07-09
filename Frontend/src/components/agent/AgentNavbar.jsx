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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // The logout function from the auth context will handle clearing state.
  // The routing logic should then handle redirecting the user to the login page.
  const handleLogout = () => {
    logout();
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
              <div className="hidden md:flex md:items-baseline">
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
            {/* Hamburger Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon for menu open/close */}
                <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>Dashboard</NavLink>
              <NavLink to="/lotteries" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Open Lotteries</NavLink>
              <NavLink to="/check-ticket" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Check Ticket</NavLink>
              <NavLink to="/reports" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Reports</NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-blue-700">
              <div className="flex items-center px-5">
                <div className="text-base font-medium leading-none">{user?.name}</div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button onClick={() => { setIsPrinterModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Printer: {selectedPrinter ? selectedPrinter.name : 'None'}</button>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">Logout</button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default AgentNavbar;