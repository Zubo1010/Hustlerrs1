import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApplicationModal from '../job/ApplicationModal';
import { useAuth } from '../../contexts/AuthContext';

export default function JobFeed() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedType, setFeedType] = useState('all'); // 'all' or 'forYou'
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  const categories = [
    'all', 'Physical Job', 'Cleaning', 'Shop Helper', 'Online Work', 
    'Delivery Help', 'Event Setup', 'Tutoring', 'Packaging', 'Other'
  ];

  // Sample jobs for demonstration
  const sampleJobs = [
    {
      _id: 'sample-1',
      title: 'House Cleaning Assistant Needed',
      description: 'Looking for a reliable student to help with house cleaning. Perfect for someone who wants to earn some extra money. No experience needed, we\'ll provide all cleaning supplies. The job involves basic cleaning tasks like dusting, vacuuming, and organizing.',
      jobType: 'Cleaning',
      location: { area: 'Dhanmondi, Dhaka' },
      date: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '10:00 AM',
      duration: '3 hours',
      payment: { method: 'Fixed price', amount: 800 },
      hiringType: 'Instant Hire',
      skillRequirements: ['No skill needed'],
      workerPreference: { studentOnly: true },
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      createdBy: {
        name: 'Sarah Ahmed',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      _id: 'sample-2',
      title: 'Delivery Helper for Restaurant',
      description: 'Urgent need for a delivery helper for our restaurant. You will be responsible for delivering food orders to customers in the local area. Must have a bicycle or motorcycle. Flexible hours, perfect for students.',
      jobType: 'Delivery Help',
      location: { area: 'Gulshan, Dhaka' },
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      startTime: '6:00 PM',
      duration: '4 hours',
      payment: { method: 'Hourly', rate: 150 },
      hiringType: 'Allow Bidding',
      skillRequirements: ['No skill needed'],
      workerPreference: { studentOnly: true },
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      createdBy: {
        name: 'Restaurant Manager',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      _id: 'sample-3',
      title: 'Online Data Entry Work',
      description: 'Looking for students to help with online data entry work. This is a remote job that you can do from home. We need help entering data into spreadsheets and organizing information. Basic computer skills required.',
      jobType: 'Online Work',
      location: { area: 'Remote' },
      date: new Date(Date.now() + 259200000), // 3 days from now
      startTime: 'Flexible',
      duration: '2-3 hours',
      payment: { method: 'Fixed price', amount: 500 },
      hiringType: 'Instant Hire',
      skillRequirements: ['Basic computer skills'],
      workerPreference: { studentOnly: true },
      createdAt: new Date(Date.now() - 10800000), // 3 hours ago
      createdBy: {
        name: 'Tech Solutions Ltd',
        profilePicture: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=face'
      }
    }
  ];

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setJobs(sampleJobs); // Show sample for logged-out users
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/jobs/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      // Check if we have real jobs
      if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
        console.log('Using real jobs from API:', data.jobs.length);
        setJobs(data.jobs);
      } else {
        console.log('No real jobs found, using sample jobs');
        setJobs(sampleJobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      console.log('Using sample jobs due to API error');
      setJobs(sampleJobs);
    } finally {
      setLoading(false);
    }
  };

  const toggleDescription = (jobId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getJobLabels = (job) => {
    const labels = [];
    
    if (job.skillRequirements?.includes('No skill needed')) {
      labels.push({ text: 'No Skill Needed', color: 'bg-green-100 text-green-800' });
    }
    
    if (job.jobType === 'Delivery Help') {
      labels.push({ text: 'Delivery', color: 'bg-blue-100 text-blue-800' });
    }
    
    if (job.workerPreference?.studentOnly) {
      labels.push({ text: 'Student-Friendly', color: 'bg-purple-100 text-purple-800' });
    }
    
    return labels;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInMinutes = Math.floor((now - jobDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  const handleApply = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    // Refetch jobs to update the 'userHasApplied' status
    fetchJobs(); 
  };

  const sortedJobs = jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredJobs = sortedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || job.jobType === selectedCategory;

    const matchesFeedType = feedType === 'all' || (feedType === 'forYou' && job.workerPreference?.studentOnly);
    
    return matchesSearch && matchesCategory && matchesFeedType;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <img
            src={user?.profilePicture || 'https://via.placeholder.com/40'}
            alt={user?.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <Link
            to={user?.role === 'Job Giver' ? '/jobs/create' : '/jobs/all'}
            className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
          >
            {user?.role === 'Job Giver' ? 'Post a new job...' : 'Find work opportunities...'}
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed Type Toggle */}
      <div className="flex items-center justify-center space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setFeedType('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            feedType === 'all' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Jobs
        </button>
        <button
          onClick={() => setFeedType('forYou')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            feedType === 'forYou' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          For You
        </button>
      </div>

      {/* Jobs Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Jobs Feed</h2>
          <span className="text-sm text-gray-500">{filteredJobs.length} jobs</span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 text-sm mb-4">Try adjusting your search or filters</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={user?.role === 'Job Giver' ? '/jobs/create' : '/jobs/all'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {user?.role === 'Job Giver' ? 'Post Your First Job' : 'Browse All Jobs'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Job Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={job.createdBy?.profilePicture || 'https://via.placeholder.com/40'}
                      alt={job.createdBy?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{job.createdBy?.name}</h3>
                      <p className="text-gray-500 text-xs">{formatTimeAgo(job.createdAt)} • {job.location.area}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {job.payment.method === 'Fixed price' 
                        ? `৳${job.payment.amount}`
                        : `৳${job.payment.rate}/hr`}
                    </div>
                    <div className="text-xs text-gray-500">{job.payment.method}</div>
                  </div>
                </div>

                {/* Job Content */}
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h2>
                  
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {expandedDescriptions[job._id] 
                        ? job.description 
                        : truncateText(job.description)}
                    </p>
                    {job.description.length > 150 && (
                      <button
                        onClick={() => toggleDescription(job._id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
                      >
                        {expandedDescriptions[job._id] ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>

                  {/* Job Labels */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getJobLabels(job).map((label, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${label.color}`}
                      >
                        {label.text}
                      </span>
                    ))}
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Type</p>
                      <p className="font-medium text-gray-900">{job.jobType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {new Date(job.date).toLocaleDateString()} • {job.startTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Duration</p>
                      <p className="font-medium text-gray-900">{job.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Hiring Type</p>
                      <p className="font-medium text-gray-900">{job.hiringType}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  
                  {user?.role === 'Hustler' && (
                    <button
                      onClick={() => handleApply(job)}
                      disabled={job.userHasApplied}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {job.userHasApplied ? 'Applied' : (job.hiringType === 'Instant Hire' ? 'Apply Now' : 'Place Bid')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
} 