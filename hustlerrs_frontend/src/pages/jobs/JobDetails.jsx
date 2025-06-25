import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getJobById, applyForJob } from '../../services/jobService';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const data = await getJobById(id);
        setJob(data.job);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(error.message || 'Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      let price;
      if (job.priceType === 'fixed') {
        price = job.fixedPrice;
      } else if (job.priceType === 'bidding') {
        // For now, prompt for a price (replace with a modal/input in production)
        price = window.prompt(`Enter your bid between ৳${job.minPrice} and ৳${job.maxPrice}`);
        if (!price || isNaN(Number(price))) {
          setError('Please enter a valid bid amount.');
          setApplying(false);
          return;
        }
      }
      await applyForJob(id, price);
      navigate('/jobs/my-applications');
    } catch (error) {
      console.error('Error applying for job:', error);
      setError(error.message || 'Failed to apply for the job. Please try again later.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <p className="mt-2 text-xl text-gray-600">{job.createdBy?.name || 'Anonymous'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {job.priceType === 'fixed' ? (
                    `৳${job.fixedPrice}`
                  ) : (
                    `৳${job.minPrice} - ৳${job.maxPrice}`
                  )}
                </p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.timeCommitment && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {job.timeCommitment}
                </span>
              )}
              {job.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {job.category}
                </span>
              )}
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Job Description</h2>
              <div className="mt-4 prose prose-blue max-w-none">
                <p>{job.description}</p>
              </div>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
                <ul className="mt-4 list-disc list-inside space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="text-gray-600">{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.companyDescription && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">About the Company</h2>
                <div className="mt-4 prose prose-blue max-w-none">
                  <p>{job.companyDescription}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              {user?.role === 'hustler' ? (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              ) : user?.role === 'job_giver' ? (
                <button
                  onClick={() => navigate(`/jobs/${id}/applications`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Applications
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login to Apply
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 