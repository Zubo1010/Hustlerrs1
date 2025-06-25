import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ApplicationModal from './ApplicationModal';

export default function JobCard({ job, isGiverView = false, onApplicationSuccess }) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyClick = () => {
    setIsModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsModalOpen(false);
    if (onApplicationSuccess) {
      onApplicationSuccess();
    }
  };

  const getJobIcon = (type) => {
    const icons = {
      'Physical Job': '💪',
      'Cleaning': '🧹',
      'Shop Helper': '🛒',
      'Online Work': '💻',
      'Delivery Help': '🚚',
      'Event Setup': '🎉',
      'Tutoring': '📚',
      'Packaging': '📦',
      'Other': '📌'
    };
    return icons[type] || '📌';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getJobIcon(job.jobType)}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                <Link to={`/jobs/${job._id}`} className="hover:text-blue-600">{job.title}</Link>
              </h3>
              <p className="text-sm text-gray-500">{job.location?.area || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">{job.pay?.display || 'N/A'}</p>
            <p className="text-xs text-gray-500">{job.pay?.type} Pay</p>
          </div>
        </div>

        <div className="my-4 text-sm text-gray-600">
          <p>{job.description?.substring(0, 100)}{job.description?.length > 100 ? '...' : ''}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags?.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="text-xs text-gray-500">
            Posted: {new Date(job.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Link 
              to={`/job/${job._id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Details
            </Link>
            {isGiverView && (
              <Link 
                to={`/job/${job._id}/applications`}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                {`View Applicants (${job.applicantCount ?? 0})`}
              </Link>
            )}
            {job.status === 'in-progress' && (
              <Link 
                to="/messages"
                className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                💬 Message
              </Link>
            )}
            {!isGiverView && user?.role === 'Hustler' && job.status === 'open' && (
              <button
                onClick={handleApplyClick}
                disabled={job.userHasApplied}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {job.userHasApplied ? 'Applied' : 'Apply Now'}
              </button>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ApplicationModal
          job={job}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
}