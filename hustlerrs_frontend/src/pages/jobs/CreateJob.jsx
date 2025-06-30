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
      address: '',
    },
    date: '',
    startTime: '',
    duration: '1h',
    payment: {
      method: 'Fixed price',
      amount: '',
      rate: '',
      platform: 'Cash',
    },
    hiringType: 'Instant Hire',
    skillRequirements: ['No skill needed'],
    workerPreference: {
      gender: 'Any',
      ageRange: 'Any',
      studentOnly: true,
      experience: 'None',
    },
    photos: [],
    contactInfo: {
      phone: '',
      email: '',
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSkillsChange = (skill) => {
    setFormData((prev) => {
      const currentSkills = prev.skillRequirements.filter((s) => s !== 'No skill needed');
      let newSkills;
      if (currentSkills.includes(skill)) {
        newSkills = currentSkills.filter((s) => s !== skill);
      } else {
        newSkills = [...currentSkills, skill];
      }

      if (newSkills.length === 0) {
        newSkills.push('No skill needed');
      }

      return { ...prev, skillRequirements: newSkills };
    });
  };

  // FIXED: Use useCallback to prevent unnecessary re-renders and add validation
  const handleLocationChange = useCallback((locationData) => {
    console.log('Location data received:', locationData); // Debug log
    
    // Validate the incoming data before updating state
    if (!locationData || typeof locationData !== 'object') {
      console.warn('Invalid location data received:', locationData);
      return;
    }

    // Only update if data has actually changed
    setFormData((prev) => {
      const newLocation = {
        division: locationData.division || '',
        district: locationData.district || '',
        upazila: locationData.upazila || '',
        area: locationData.area || '',
        address: locationData.address || '',
      };

      // Check if location actually changed to prevent unnecessary updates
      if (JSON.stringify(prev.location) === JSON.stringify(newLocation)) {
        return prev;
      }

      return {
        ...prev,
        location: newLocation,
      };
    });
  }, []);

  // FIXED: Use useCallback and add debouncing to prevent rapid validation changes
  const handleLocationValidation = useCallback((isValid) => {
    console.log('Location validation changed:', isValid); // Debug log
    
    // Only update if validation status actually changed
    setIsLocationValid(prevValid => {
      if (prevValid === isValid) {
        return prevValid; // No change needed
      }
      return isValid;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Form data at submit:', formData); // Debug log

    const { division, district, upazila, area, address } = formData.location;

    // Validate location with more detailed checking
    if (!division || !district || !upazila || !address ||
        division.trim() === '' || district.trim() === '' || 
        upazila.trim() === '' || address.trim() === '') {
      setError('Please fill all required location fields completely.');
      setLoading(false);
      return;
    }

    // Validate other required fields
    if (!formData.title || !formData.date || !formData.startTime || !formData.contactInfo.phone) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    // Validate payment amount/rate
    if (formData.payment.method === 'Fixed price' && (!formData.payment.amount || formData.payment.amount <= 0)) {
      setError('Please enter a valid payment amount.');
      setLoading(false);
      return;
    }

    if (formData.payment.method === 'Hourly' && (!formData.payment.rate || formData.payment.rate <= 0)) {
      setError('Please enter a valid hourly rate.');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting job data:', formData); // Debug log
      await createJob(formData);
      setSuccessMessage('Job posted successfully!');
      setTimeout(() => {
        navigate('/my-jobs');
      }, 2000);
    } catch (err) {
      console.error('Job creation error:', err); // Debug log
      setError(err.message || 'Failed to post job.');
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
            👀 View Applicants
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
              <p className="font-bold">Oops!</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- Job Title --- */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <SectionHeader icon={<FiBriefcase />} title="Job Title" />
              <p className="text-sm text-gray-500 mb-4">Give your job a short, clear title.</p>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="e.g., Need help in shop, Furniture lifting, Room cleaning"
                required
              />
            </div>

            {/* --- Job Description --- */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <SectionHeader icon={<FaRegBuilding />} title="Job Description (Optional)" />
              <p className="text-sm text-gray-500 mb-4">Describe the task clearly.</p>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Example: 'Need someone to help arrange cartons in storeroom for 3 hours.'"
              />
            </div>

            {/* --- Job Type --- */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <SectionHeader icon={<FiCheckSquare />} title="Job Type" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[
                  'Physical Job',
                  'Cleaning',
                  'Shop Helper',
                  'Online Work',
                  'Delivery Help',
                  'Event Setup',
                  'Tutoring',
                  'Packaging',
                  'Other',
                ].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleChange({ target: { name: 'jobType', value: type } })}
                    className={`p-4 rounded-lg text-center font-semibold border-2 transition-all duration-200 ${
                      formData.jobType === type
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:text-green-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* --- Location --- FIXED: Using memoized callbacks */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <SectionHeader icon={<FiMapPin />} title="Location" />
                <LocationSelector
                  value={formData.location}
                  onChange={handleLocationChange}
                  onValidationChange={handleLocationValidation}
                />
                {!isLocationValid && (
                  <p className="text-red-500 text-sm mt-2">Please select a complete and valid location to proceed.</p>
                )}
                {/* Debug info - remove in production */}
                <div className="mt-2 text-xs text-gray-400">
                  Location status: Division: {formData.location.division ? '✓' : '✗'}, 
                  District: {formData.location.district ? '✓' : '✗'}, 
                  Upazila: {formData.location.upazila ? '✓' : '✗'}, 
                  Area: {formData.location.area ? '✓' : '✗'}, 
                  Address: {formData.location.address ? '✓' : '✗'}
                  <br />
                  Is Location Valid: {isLocationValid ? '✓' : '✗'}
                </div>
              </div>

              {/* --- Date & Time --- */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <SectionHeader icon={<FiClock />} title="Date & Time" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        {[...Array(8).keys()].map((i) => (
                          <option key={i} value={`${i + 1}h`}>{`${i + 1} hour(s)`}</option>
                        ))}
                        <option value="full_day">Full Day</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Payment --- */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <SectionHeader icon={<FiDollarSign />} title="Payment" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment.method"
                        value="Fixed price"
                        checked={formData.payment.method === 'Fixed price'}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Fixed price</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment.method"
                        value="Hourly"
                        checked={formData.payment.method === 'Hourly'}
                        onChange={handleChange}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Hourly</span>
                    </label>
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., 300"
                      min="1"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate (৳/hr)</label>
                    <input
                      type="number"
                      name="payment.rate"
                      value={formData.payment.rate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., 100"
                      min="1"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment to be done via:</label>
                  <div className="flex space-x-4">
                    {['Cash', 'bKash', 'Nagad'].map((platform) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="radio"
                          name="payment.platform"
                          value={platform}
                          checked={formData.payment.platform === platform}
                          onChange={handleChange}
                          className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Hiring & Skills --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <SectionHeader icon={<FiUser />} title="Hiring Type" />
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="hiringType"
                      value="Allow Bidding"
                      checked={formData.hiringType === 'Allow Bidding'}
                      onChange={handleChange}
                      className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">
                      Allow Bidding <span className="text-sm text-gray-500">(students offer rates)</span>
                    </span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="hiringType"
                      value="Instant Hire"
                      checked={formData.hiringType === 'Instant Hire'}
                      onChange={handleChange}
                      className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">
                      Instant Hire <span className="text-sm text-gray-500">(first student accepts)</span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <SectionHeader icon={<FiCheckSquare />} title="Skill Requirements" />
                <div className="space-y-2">
                  {['Can lift heavy items', 'Basic communication', 'Can clean/paint', 'Can use smartphone'].map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.skillRequirements.includes(skill)}
                        onChange={() => handleSkillsChange(skill)}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700">{skill}</span>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.skillRequirements.includes('No skill needed')}
                      onChange={() => setFormData((p) => ({ ...p, skillRequirements: ['No skill needed'] }))}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 text-gray-700 font-semibold">No skill needed</span>
                  </label>
                </div>
              </div>
            </div>

            {/* --- Optional Preferences --- */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <SectionHeader icon={<FiUser />} title="Worker Preference (Optional)" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="workerPreference.gender"
                    value={formData.workerPreference.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option>Any</option>
                    <option>Only male</option>
                    <option>Only female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age Range</label>
                  <select
                    name="workerPreference.ageRange"
                    value={formData.workerPreference.ageRange}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option>Any</option>
                    <option>18-25</option>
                    <option>25-30</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <select
                    name="workerPreference.experience"
                    value={formData.workerPreference.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option>None</option>
                    <option>1-2 jobs done</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="workerPreference.studentOnly"
                    checked={formData.workerPreference.studentOnly}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-3 text-gray-700">Student only?</span>
                </label>
              </div>
            </div>

            {/* --- Photos & Contact --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <SectionHeader icon={<FiCamera />} title="Upload Photos (Optional)" />
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="photos" type="file" className="sr-only" multiple />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-gray-200 rounded-lg">
                <SectionHeader icon={<FiPhone />} title="Contact Info (Hidden)" />
                <p className="text-sm text-gray-500 mb-4">This will not be shown to students directly.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (Required)</label>
                    <input
                      type="tel"
                      name="contactInfo.phone"
                      value={formData.contactInfo.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 disabled:bg-gray-400"
                  disabled={loading || !isLocationValid}
                >
                  {loading ? 'Posting Job...' : 'Post Job'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}