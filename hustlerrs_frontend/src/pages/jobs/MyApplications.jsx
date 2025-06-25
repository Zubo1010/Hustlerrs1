import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyApplications, withdrawApplication } from '../../services/jobService';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getMyApplications();
        setApplications(data.applications || []);
      } catch {
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await withdrawApplication(applicationId);
      
      // Update the application status locally
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, status: 'withdrawn' }
          : app
      ));
    } catch {
      setError('Failed to withdraw application. Please try again later.');
    }
  };

  if (!user || user.role !== 'Hustler') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only hustlers can view their applications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  const getStatusInfo = (application) => {
    switch (application.status) {
        case 'accepted':
            // Distinguish between an ongoing job and a completed one
            if (application.job.status === 'completed') {
                return {
                    text: "Job Completed",
                    color: "bg-gray-500 text-white",
                    icon: "✅",
                    message: "This job has been completed successfully."
                };
            }
            return {
                text: "You've been hired!",
                color: "bg-green-100 text-green-800",
                icon: "✅",
                message: "Congratulations! You can now message the job giver."
            };
        case 'rejected':
            return {
                text: "Application Rejected",
                color: "bg-red-100 text-red-800",
                icon: "❌",
                message: "Unfortunately, your application was not selected this time."
            };
        case 'withdrawn':
            return {
                text: "Application Withdrawn",
                color: "bg-yellow-100 text-yellow-800",
                icon: "↩️",
                message: "You have withdrawn your application for this job."
            };
        default: // 'pending'
            return {
                text: "Application Pending",
                color: "bg-blue-100 text-blue-800",
                icon: "⏳",
                message: "The job giver is still reviewing applications. We'll notify you of any updates."
            };
    }
  };

  const getLocationDisplay = (location) => {
    if (typeof location === 'string') {
      return location;
    }
    if (location && typeof location === 'object') {
      return location.area || location.address || 'Location not specified';
    }
    return 'Location not specified';
  };

  const getPayDisplay = (payment) => {
    if (payment?.method === 'Fixed price') {
      return `৳${payment.amount} (Fixed)`;
    } else if (payment?.method === 'Hourly') {
      return `৳${payment.rate}/hr (Hourly)`;
    }
    return 'Bidding allowed';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
            <p className="text-gray-600 mt-1">Track your job applications and their status</p>
          </div>
          <Link
            to="/jobs/all"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse More Jobs
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="mt-2 text-gray-500">Start applying for jobs to see them here!</p>
            <div className="mt-6">
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => {
              const statusInfo = getStatusInfo(application);
              return (
                <div key={application._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl mb-6">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{application.job.title}</h3>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{statusInfo.message}</p>
                    {application.job ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Job Type:</span>
                            <span className="ml-2 text-gray-600">{application.job.jobType}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <span className="ml-2 text-gray-600">{getLocationDisplay(application.job.location)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Payment:</span>
                            <span className="ml-2 text-gray-600">{getPayDisplay(application.job.payment)}</span>
                          </div>
                        </div>

                        {application.price && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <span className="font-medium text-blue-800">Your Bid: ৳{application.price}</span>
                          </div>
                        )}

                        {application.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <span className="font-medium text-gray-700">Your Message:</span>
                            <p className="mt-1 text-gray-600">{application.notes}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-red-500">
                        <h3 className="text-lg font-medium">Job not found or deleted</h3>
                        <p className="text-sm">This job may have been removed by the job giver.</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Applied on {new Date(application.createdAt).toLocaleDateString()}</p>
                    {application.status === 'accepted' && application.job.status !== 'completed' && (
                      <button
                        onClick={() => handleWithdraw(application._id)}
                        className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 