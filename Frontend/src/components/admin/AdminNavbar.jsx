import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = { color: 'white', backgroundColor: '#7C3AED' };

  return (
    <nav className="bg-purple-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl">Admin Panel</span>
            {/* Desktop Nav Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>Dashboard</NavLink>
                <NavLink to="/admin/manage-agents" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Manage Agents</NavLink>
                <NavLink to="/admin/manage-lotteries" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Manage Lotteries</NavLink>
                <NavLink to="/admin/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Reports</NavLink>
              </div>
            </div>
          </div>
          {/* Desktop Actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="mr-3">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
            </div>
          </div>
          {/* Hamburger for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-700 focus:outline-none"
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
        <div className="md:hidden bg-purple-700 px-2 pt-2 pb-3 space-y-1">
          <NavLink to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/admin/manage-agents" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setMobileMenuOpen(false)}>Manage Agents</NavLink>
          <NavLink to="/admin/manage-lotteries" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setMobileMenuOpen(false)}>Manage Lotteries</NavLink>
          <NavLink to="/admin/reports" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-800" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={() => setMobileMenuOpen(false)}>Reports</NavLink>
          <span className="block px-3 py-2 text-base">Welcome, {user?.name}</span>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;