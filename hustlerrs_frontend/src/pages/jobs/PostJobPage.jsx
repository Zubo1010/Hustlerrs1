import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/jobService';

function PostJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    timeCommitment: '',
    deadline: '',
    priceType: 'fixed',
    fixedPrice: '',
    minPrice: '',
    maxPrice: '',
    status: 'active',
    progressStatus: 'pending_review'
  });

  const validateForm = () => {
    const errors = [];
    
    // Required fields
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.timeCommitment) errors.push('Time commitment is required');
    if (!formData.deadline) errors.push('Deadline is required');

    // Price validation
    if (formData.priceType === 'fixed') {
      if (!formData.fixedPrice || parseFloat(formData.fixedPrice) <= 0) {
        errors.push('Fixed price must be greater than 0');
      }
    } else if (formData.priceType === 'bidding') {
      if (!formData.minPrice || !formData.maxPrice) {
        errors.push('Both minimum and maximum prices are required for bidding');
      } else {
        const min = parseFloat(formData.minPrice);
        const max = parseFloat(formData.maxPrice);
        if (min <= 0 || max <= 0) {
          errors.push('Prices must be greater than 0');
        }
        if (min >= max) {
          errors.push('Minimum price must be less than maximum price');
        }
      }
    }

    // Deadline validation
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    if (deadlineDate <= today) {
      errors.push('Deadline must be in the future');
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      // Prepare the job data based on price type
      const jobData = {
        ...formData,
        // Convert string numbers to actual numbers
        fixedPrice: formData.priceType === 'fixed' ? parseFloat(formData.fixedPrice) : undefined,
        minPrice: formData.priceType === 'bidding' ? parseFloat(formData.minPrice) : undefined,
        maxPrice: formData.priceType === 'bidding' ? parseFloat(formData.maxPrice) : undefined,
      };

      // Remove undefined values
      Object.keys(jobData).forEach(key => {
        if (jobData[key] === undefined) {
          delete jobData[key];
        }
      });

      await createJob(jobData);
      navigate('/my-jobs');
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Post a New Job</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the job requirements and responsibilities"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                <option value="web_development">Web Development</option>
                <option value="mobile_development">Mobile Development</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job location"
              />
            </div>

            {/* Time Commitment */}
            <div>
              <label htmlFor="timeCommitment" className="block text-sm font-medium text-gray-700 mb-1">
                Time Commitment *
              </label>
              <select
                id="timeCommitment"
                name="timeCommitment"
                required
                value={formData.timeCommitment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select time commitment</option>
                <option value="less_than_1_week">Less than 1 week</option>
                <option value="1_to_2_weeks">1-2 weeks</option>
                <option value="2_to_4_weeks">2-4 weeks</option>
                <option value="1_to_3_months">1-3 months</option>
                <option value="more_than_3_months">More than 3 months</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price Type */}
            <div>
              <label htmlFor="priceType" className="block text-sm font-medium text-gray-700 mb-1">
                Price Type *
              </label>
              <select
                id="priceType"
                name="priceType"
                required
                value={formData.priceType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="bidding">Open for Bidding</option>
              </select>
            </div>

            {/* Fixed Price */}
            {formData.priceType === 'fixed' && (
              <div>
                <label htmlFor="fixedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Fixed Price ($) *
                </label>
                <input
                  type="number"
                  id="fixedPrice"
                  name="fixedPrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.fixedPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter fixed price"
                />
              </div>
            )}

            {/* Bidding Price Range */}
            {formData.priceType === 'bidding' && (
              <>
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Price ($) *
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    required
                    min="0"
                    step="0.01"
                    value={formData.minPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter minimum price"
                  />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Price ($) *
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    required
                    min="0"
                    step="0.01"
                    value={formData.maxPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter maximum price"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJobPage; 