import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, deleteJob } from '../../services/jobService';
import { FaEdit, FaTrash, FaPlus, FaUsers } from 'react-icons/fa';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getMyJobs();
        setJobs(data.jobs);
      } catch (err) {
        setError(err.message || 'Failed to fetch your jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (err) {
        setError(err.message || 'Failed to delete job.');
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your jobs...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <Link
            to="/jobs/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Post New Job</span>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow">
            <h2 className="text-xl font-medium text-gray-800">You haven't posted any jobs yet.</h2>
            <p className="text-gray-500 mt-2">Click the button above to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h2>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{job.location?.area || 'N/A'}</p>
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                  <Link
                    to={`/jobs/${job._id}/applications`}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    View Applicants ({job.bids?.length || 0})
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link to={`/jobs/${job._id}/edit`} className="text-gray-500 hover:text-blue-600">
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(job._id)} className="text-gray-500 hover:text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 