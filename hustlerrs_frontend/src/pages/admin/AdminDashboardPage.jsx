import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import HustlerApplications from '../../components/admin/HustlerApplications';

const ADMIN_JWT_KEY = 'admin_jwt';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-500 text-white p-4 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}!</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">System Overview</h2>
            <p>Welcome to the admin dashboard. You can manage users and jobs from here.</p>
            {/* Statistics and other admin components can be added here later */}
        </div>
        <HustlerApplications />
    </div>
  );
};

export default AdminDashboardPage; 