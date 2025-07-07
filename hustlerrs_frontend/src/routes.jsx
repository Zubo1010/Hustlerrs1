import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HustlerRegister from './pages/auth/HustlerRegister';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import GiverJobsPage from './pages/jobs/GiverJobsPage';
import HustlerJobsPage from './pages/jobs/HustlerJobsPage';
import CreateJob from './pages/jobs/CreateJob';
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import MyApplications from './pages/jobs/MyApplications';
import JobApplications from './pages/jobs/JobApplications';
import ProfilePage from './pages/profile/ProfilePage';
import MyProfilePage from './pages/profile/MyProfilePage';
import HustlerProfilePage from './pages/profile/HustlerProfilePage';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import AllJobs from "./pages/jobs/AllJobs";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'register', element: <RegisterPage /> },
            { path: 'hustler-register', element: <HustlerRegister /> },
            { path: 'jobs', element: <AllJobs /> },
            { path: 'job/:id', element: <JobDetailsPage /> },
            { path: 'messages', element: <ProtectedRoute><Messages /></ProtectedRoute> },
            { path: 'notifications', element: <ProtectedRoute><Notifications /></ProtectedRoute> },
            
            // Job Giver Routes
            { path: 'my-jobs', element: <ProtectedRoute allowedRoles={['Job Giver']}><GiverJobsPage /></ProtectedRoute> },
            { path: 'post-job', element: <ProtectedRoute allowedRoles={['Job Giver']}><CreateJob /></ProtectedRoute> },
            { path: 'job/:id/applications', element: <ProtectedRoute allowedRoles={['Job Giver']}><JobApplications /></ProtectedRoute> },

            // Hustler Routes
            { path: 'my-applications', element: <ProtectedRoute allowedRoles={['Hustler']}><MyApplications /></ProtectedRoute> },

            // Profile Routes
            { path: 'profile', element: <ProtectedRoute><MyProfilePage /></ProtectedRoute> },
            { path: 'profile/:userId', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
            { path: 'hustler-profile/:hustlerId', element: <ProtectedRoute><HustlerProfilePage /></ProtectedRoute> },

            // Admin Routes
            { path: 'admin/login', element: <AdminLoginPage /> },
            {
                path: 'admin/dashboard',
                element: (
                    <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                )
            },
        ]
    }
]);

export default router;
