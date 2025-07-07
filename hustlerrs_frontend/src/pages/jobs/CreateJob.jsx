import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; // Assuming this will be used
import { createJob } from '../../services/jobService'; // Assuming this service will be updated
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiUser, FiCheckSquare, FiCamera, FiPhone } from 'react-icons/fi';
import LocationSelector from '../../common/LocationSelector';
import { FaRegBuilding } from 'react-icons/fa';

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center space-x-3 mb-4">
    <div className="bg-green-100 text-green-700 p-2 rounded-full">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
  </div>
);

// Job types available for selection
const JOB_TYPES = [
  'Cleaning',
  'Moving',
  'Delivery',
  'Gardening',
  'Painting',
  'Assembly',
  'Repair',
  'Other'
];

// Duration options
const DURATION_OPTIONS = ['1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', 'More than 8h'];

// Experience levels
const EXPERIENCE_LEVELS = ['None', 'Beginner', 'Intermediate', 'Expert'];

// Age range options
const AGE_RANGES = ['Any', '18-25', '26-35', '36-45', '46+'];

export default function CreateJob() {
  const navigate = useNavigate();
  // const { user } = useAuth(); // Will be needed for createdBy

  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Add state for location validity
  const [isLocationValid, setIsLocationValid] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: '',
    location: {
      division: '',
      district: '',
      upazila: '',
      area: '',
      address: ''
    },
    date: '',
    startTime: '',
    duration: '1h',
    payment: {
      method: 'Fixed price',
      amount: '',
      rate: '',
      platform: 'Cash'
    },
    hiringType: 'Instant Hire',
    skillRequirements: ['No skill needed'],
    workerPreference: {
      gender: 'Any',
      ageRange: 'Any',
      studentOnly: false,
      experience: 'None'
    },
    photos: [],
    contactInfo: {
      phone: '',
      email: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        method,
        // Reset amount/rate when switching methods
        amount: method === 'Fixed price' ? prev.payment.amount : '',
        rate: method === 'Hourly' ? prev.payment.rate : ''
      }
    }));
  };

  const handleLocationChange = useCallback((locationData) => {
    if (!locationData || typeof locationData !== 'object') {
      console.warn('Invalid location data received:', locationData);
      return;
    }

    setFormData((prev) => {
      const newLocation = {
        division: locationData.division || '',
        district: locationData.district || '',
        upazila: locationData.upazila || '',
        area: locationData.upazila || '', // Set area to upazila name
        address: locationData.address || ''
      };

      if (JSON.stringify(prev.location) === JSON.stringify(newLocation)) {
        return prev;
      }

      return {
        ...prev,
        location: newLocation
      };
    });
  }, []);

  const handleLocationValidation = useCallback((isValid) => {
    setIsLocationValid((prevValid) => {
      if (prevValid === isValid) {
        return prevValid;
      }
      return isValid;
    });
  }, []);

  const validateForm = () => {
    const errors = [];

    // Validate title
    if (!formData.title.trim()) {
      errors.push('Job title is required');
    }

    // Validate job type
    if (!formData.jobType) {
      errors.push('Job type is required');
    }

    // Validate location
    const { division, district, upazila, address } = formData.location;
    if (!division || !district || !upazila || !address) {
      errors.push('All location fields are required');
    }

    // Validate date and time
    if (!formData.date) {
      errors.push('Date is required');
    }
    if (!formData.startTime) {
      errors.push('Start time is required');
    }

    // Validate payment
    if (formData.payment.method === 'Fixed price' && (!formData.payment.amount || parseFloat(formData.payment.amount) <= 0)) {
      errors.push('Please enter a valid fixed payment amount');
    }
    if (formData.payment.method === 'Hourly' && (!formData.payment.rate || parseFloat(formData.payment.rate) <= 0)) {
      errors.push('Please enter a valid hourly rate');
    }

    // Validate contact info
    if (!formData.contactInfo.phone) {
      errors.push('Contact phone is required');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      setLoading(false);
      return;
    }

    // Clean up the form data
    const cleanedFormData = {
      ...formData,
      title: formData.title.trim(),
      payment: {
        ...formData.payment,
        amount: formData.payment.amount
          ? Number(formData.payment.amount)
          : undefined,
        rate: formData.payment.rate
          ? Number(formData.payment.rate)
          : undefined,
      }
    };

    try {
      await createJob(cleanedFormData);
      setSuccessMessage('Job posted successfully!');
      setTimeout(() => {
        navigate('/my-jobs');
      }, 2000);
    } catch (err) {
      console.error('Job creation error:', err);
      const errorMessage = err.message || err.error || (typeof err === 'string' ? err : 'Failed to post job.');
      setError(`Error posting job: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
        <div className="bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{successMessage}</h2>
          <button
            onClick={() => navigate('/jobs/my-jobs')}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300"
          >
            👀 View My Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Post a New Job</h2>
          <p className="text-gray-600 mb-8">Fill in the details below to find the perfect Hustler for your task.</p>

          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Error!</p>
              <p className="whitespace-pre-line">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Job Information */}
            <div className="space-y-4">
              <SectionHeader icon={<FiBriefcase />} title="Basic Job Information" />
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Need help moving furniture"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Job Type</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input"
                  placeholder="Describe the job in detail..."
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <SectionHeader icon={<FiMapPin />} title="Location" />
              <LocationSelector
                value={formData.location}
                onChange={handleLocationChange}
                onValidationChange={handleLocationValidation}
              />
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <SectionHeader icon={<FiClock />} title="Schedule" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    {DURATION_OPTIONS.map((duration) => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <SectionHeader icon={<FiDollarSign />} title="Payment" />
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="flex space-x-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('Fixed price')}
                      className={`px-4 py-2 rounded-lg ${
                        formData.payment.method === 'Fixed price'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Fixed Price
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('Hourly')}
                      className={`px-4 py-2 rounded-lg ${
                        formData.payment.method === 'Hourly'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Hourly Rate
                    </button>
                  </div>
                </div>

                {formData.payment.method === 'Fixed price' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fixed Amount (৳)</label>
                    <input
                      type="number"
                      name="payment.amount"
                      value={formData.payment.amount}
                      onChange={handleChange}
                      className="input"
                      min="1"
                      placeholder="Enter fixed amount"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate (৳/hour)</label>
                    <input
                      type="number"
                      name="payment.rate"
                      value={formData.payment.rate}
                      onChange={handleChange}
                      className="input"
                      min="1"
                      placeholder="Enter hourly rate"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Platform</label>
                  <select
                    name="payment.platform"
                    value={formData.payment.platform}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Worker Preferences */}
            <div className="space-y-4">
              <SectionHeader icon={<FiUser />} title="Worker Preferences" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender Preference</label>
                  <select
                    name="workerPreference.gender"
                    value={formData.workerPreference.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="Any">Any</option>
                    <option value="Only male">Only male</option>
                    <option value="Only female">Only female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Age Range</label>
                  <select
                    name="workerPreference.ageRange"
                    value={formData.workerPreference.ageRange}
                    onChange={handleChange}
                    className="input"
                  >
                    {AGE_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                  <select
                    name="workerPreference.experience"
                    value={formData.workerPreference.experience}
                    onChange={handleChange}
                    className="input"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="workerPreference.studentOnly"
                    checked={formData.workerPreference.studentOnly}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-700">Student Only</label>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <SectionHeader icon={<FiPhone />} title="Contact Information" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !isLocationValid}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
                  loading || !isLocationValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } transition duration-300`}
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}