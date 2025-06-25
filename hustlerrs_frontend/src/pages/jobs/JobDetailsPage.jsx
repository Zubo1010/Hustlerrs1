import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../../services/jobService';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await getJobById(id);
        setJob(response.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading job details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!job) {
    return <div className="text-center py-8">Job not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{job.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {job.status}
            </span>
            <span className="text-xl font-bold text-gray-900">
              ${job.budget}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{job.description}</p>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Posted by:</span> {job.giver?.name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Posted on:</span>{' '}
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Category:</span> {job.category}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Location:</span> {job.location}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Deadline:</span>{' '}
                {new Date(job.deadline).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Required Skills:</span>{' '}
                {job.requiredSkills?.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {job.status === 'active' && (
            <button
              onClick={() => navigate(`/jobs/${id}/bid`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Place Bid
            </button>
          )}
          {job.giver?._id === localStorage.getItem('userId') && (
            <button
              onClick={() => navigate(`/jobs/${id}/edit`)}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Edit Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
