import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined} end>Dashboard</NavLink>
                <NavLink to="/admin/manage-agents" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Manage Agents</NavLink>
                <NavLink to="/admin/manage-lotteries" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Manage Lotteries</NavLink>
                <NavLink to="/admin/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Reports</NavLink>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="mr-3">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;