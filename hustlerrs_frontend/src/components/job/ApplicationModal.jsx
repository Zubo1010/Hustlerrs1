import React, { useState, useEffect } from 'react';
import { applyForJob } from '../../services/jobService';

export default function ApplicationModal({ job, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    price: '',
    coverLetter: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && job) {
      // Reset form on open
      setFormData({ price: '', coverLetter: '' });
      setError('');
      
      // Set price automatically for Instant Hire jobs
      if (job.hiringType === 'Instant Hire' && job.pay?.amount) {
        setFormData(prev => ({ ...prev, price: job.pay.amount.toString() }));
      }
    }
  }, [isOpen, job]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.confirm('Are you sure you want to submit this application?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await applyForJob(job._id, {
        price: parseFloat(formData.price),
        coverLetter: formData.coverLetter
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to apply for job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !job) return null;

  const getPaymentDisplay = () => {
    if (job.pay?.type === 'Fixed') {
      return `Fixed: ৳${job.pay.amount}`;
    } else if (job.pay?.type === 'Hourly') {
      return `Hourly: ৳${job.pay.rate}/hr`;
    }
    return 'Bidding allowed';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Apply for Job</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{job.jobType}</p>
            <p className="text-sm text-gray-600 mb-2">
              Location: {job.location?.area || job.location}
            </p>
            <p className="text-sm text-gray-600">
              Payment: {getPaymentDisplay()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {job.hiringType === 'Allow Bidding' ? (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Bid Amount (৳)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your bid amount"
                />
              </div>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-semibold text-blue-800">This is an "Instant Hire" job.</p>
                <p className="text-sm text-blue-700">You will be applying at the listed price of <span className="font-bold">{job.pay.display}</span>.</p>
              </div>
            )}

            {/* Optional Description */}
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                Write something to the job giver (optional)
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell the job giver why you're the right person for this job..."
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.price}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Applying...' : 'Confirm & Apply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 