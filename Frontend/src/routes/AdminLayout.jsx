import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = () => {
  return (
    <div>
      <AdminNavbar />
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;