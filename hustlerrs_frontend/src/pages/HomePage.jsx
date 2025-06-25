import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GreetingHeader from '../components/dashboard/GreetingHeader';
import QuickActions from '../components/dashboard/QuickActions';
import JobFeed from '../components/dashboard/JobFeed';
import ActivityOverview from '../components/dashboard/ActivityOverview';
import NotificationsWidget from '../components/dashboard/NotificationsWidget';

const HomePage = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    weeklyEarnings: 0,
    monthlyJobs: 0,
    totalApplications: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalJobs: 0,
    totalApplicants: 0,
    hiredWorkers: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Guest user - redirect to login/signup
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Hustlerrs
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with clients and hustlers. Post jobs, find work, and grow your business. 
              The ultimate platform for students and job seekers in Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-block bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Post Jobs</h3>
                <p className="text-gray-600">Find the perfect hustler for your tasks</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-lg font-semibold mb-2">Find Work</h3>
                <p className="text-gray-600">Discover opportunities that match your skills</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-lg font-semibold mb-2">Earn Money</h3>
                <p className="text-gray-600">Get paid for your hustle and skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Greeting Header */}
        <div className="mb-6">
          <GreetingHeader user={user} stats={userStats} />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions user={user} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Job Feed */}
          <div className="lg:col-span-8">
            <JobFeed user={user} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Activity Overview */}
            <ActivityOverview user={user} stats={userStats} />
            
            {/* Notifications Widget */}
            <NotificationsWidget />
            
            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Profile Completion</span>
                  <span className="font-medium text-green-600">
                    {user.isProfileComplete ? '100%' : '75%'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Rating</span>
                  <span className="font-medium text-yellow-600">
                    ⭐ {user.rating || 0}/5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-600 text-sm mb-4">
                Get support and learn how to make the most of Hustlerrs
              </p>
              <div className="space-y-2">
                <Link
                  to="/help"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  📖 Help Center
                </Link>
                <Link
                  to="/contact"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  💬 Contact Support
                </Link>
                <Link
                  to="/faq"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  ❓ FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 