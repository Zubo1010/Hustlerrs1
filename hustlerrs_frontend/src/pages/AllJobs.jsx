import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ApplicationModal from '../components/job/ApplicationModal';
import Toast from '../components/common/Toast';

// Mock data for filters - replace with API data
const MOCK_JOB_TYPES = ['Cleaning', 'Delivery', 'Tutoring', 'Handyman', 'Events', 'Moving'];
const MOCK_AREAS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];

const JobCard = ({ job, user, onApply, onManage }) => {
  const { title, pay, jobType, location, date, status, createdBy, userHasApplied } = job;

  const handleApplyClick = () => {
    if (!user) {
      // Guest user
      onApply(job, true);
    } else {
      onApply(job, false);
    }
  };

  const isJobGiverOwner = user?.role === 'Job Giver' && user?.id === createdBy?._id;

  const getPayDisplay = () => {
    // Use the transformed pay object from the backend
    if (pay && pay.display) {
      return pay.display;
    }
    // Fallback for legacy data
    if (pay?.type === 'Fixed') {
      return `৳${pay.amount} (Fixed)`;
    }
    if (pay?.type === 'Hourly') {
      return `৳${pay.amount}/hr (Hourly)`;
    }
    return 'N/A';
  };
  
  const getJobIcon = (type) => {
    switch (type) {
      case 'Cleaning': return '🧹';
      case 'Delivery': return '📦';
      case 'Tutoring': return '🎓';
      case 'Handyman': return '🛠️';
      case 'Events': return '🎉';
      case 'Moving': return '🚚';
      default: return '💼';
    }
  };

  // Handle location display - location can be an object or a string
  const getLocationDisplay = () => {
    if (typeof location === 'string') {
      return location;
    }
    if (location && typeof location === 'object') {
      return location.area || location.address || 'Location not specified';
    }
    return 'Location not specified';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">{getJobIcon(jobType)} {title}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status === 'open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {status === 'open' ? 'Open' : status}
          </span>
        </div>
        <p className="text-lg font-semibold text-blue-600 mt-2">{getPayDisplay()}</p>
        <div className="mt-4 text-sm text-gray-600 space-y-2">
          <p><strong>Type:</strong> <span className="font-medium bg-gray-100 px-2 py-1 rounded">{jobType}</span></p>
          {job.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
          <p><strong>Location:</strong> {getLocationDisplay()}</p>
          <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="mt-6">
        {user?.role === 'Hustler' && (
          <button
            onClick={handleApplyClick}
            disabled={userHasApplied}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
              userHasApplied 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {userHasApplied ? 'Applied' : 'Apply Now'}
          </button>
        )}
        {isJobGiverOwner && (
          <button onClick={() => onManage(job)} className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors">
            View Applicants
          </button>
        )}
        {!user && (
           <button onClick={handleApplyClick} className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Apply Now
           </button>
        )}
      </div>
    </div>
  );
};


export default function AllJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Filters State
  const [filters, setFilters] = useState({
    jobType: [],
    area: '',
    payRange: 5000, // Max value of slider
    date: 'any',
    noSkillNeeded: false,
  });

  const [sort, setSort] = useState('newest');

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'jobType') {
      const newJobTypes = checked 
        ? [...filters.jobType, value] 
        : filters.jobType.filter(jt => jt !== value);
      setFilters(prev => ({ ...prev, jobType: newJobTypes }));
    } else {
      setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:5000/api/jobs';

        if (user?.role === 'job_giver') {
          url = 'http://localhost:5000/api/jobs/my-jobs';
        }

        const queryParams = new URLSearchParams({
          sort,
          area: filters.area,
          maxPay: filters.payRange,
          date: filters.date,
          noSkillNeeded: filters.noSkillNeeded,
          jobType: filters.jobType.join(','),
        });

        const response = await fetch(`${url}?${queryParams.toString()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs.');
        }
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters, sort, user]);

  const handleApply = (job, isGuest) => {
    if(isGuest) {
      setShowLoginPrompt(true);
    } else {
      setSelectedJob(job);
      setShowApplicationModal(true);
    }
  }

  const handleApplicationSuccess = () => {
    setToastMessage("You've applied successfully! The job giver will be notified.");
    setShowToast(true);
    // Refresh jobs to update the "Applied" status
    window.location.reload();
  }

  const handleManage = (job) => {
    console.log('Managing job:', job.title);
    // Redirect to a job management page, e.g., /jobs/manage/:jobId
  }

  const filteredAndSortedJobs = useMemo(() => {
    // In a real app, filtering and sorting would ideally be done on the backend.
    // This is a client-side fallback.
    return jobs; 
  }, [jobs]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            {user?.role === 'job_giver' ? 'Your Posted Jobs' : 'Find Your Next Hustle'}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {user?.role === 'job_giver' 
              ? 'Manage your job postings and view applicants.'
              : 'Browse opportunities perfect for your skills and schedule.'}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h3 className="text-xl font-bold mb-4">Filter & Sort</h3>
              
              {/* Sorting */}
              <div className="mb-6">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select id="sort" name="sort" value={sort} onChange={e => setSort(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="newest">Newest</option>
                  <option value="highest_pay">Highest Pay</option>
                  <option value="closest">Closest Location</option>
                </select>
              </div>

              {/* Area Filter */}
              <div className="mb-6">
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select id="area" name="area" value={filters.area} onChange={handleFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="">All Areas</option>
                  {MOCK_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
              
              {/* Job Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <div className="space-y-2">
                  {MOCK_JOB_TYPES.map(type => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" name="jobType" value={type} checked={filters.jobType.includes(type)} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                      <span className="ml-2 text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pay Range Filter */}
              <div className="mb-6">
                <label htmlFor="payRange" className="block text-sm font-medium text-gray-700 mb-1">Pay up to ৳{filters.payRange}</label>
                <input id="payRange" type="range" name="payRange" min="500" max="10000" step="100" value={filters.payRange} onChange={handleFilterChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
              </div>

              {/* Date Filter */}
              <div className="mb-6">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select id="date" name="date" value={filters.date} onChange={handleFilterChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option value="any">Any Date</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                </select>
              </div>

              {/* No Skill Needed Filter */}
              <div>
                <label className="flex items-center">
                  <input type="checkbox" name="noSkillNeeded" checked={filters.noSkillNeeded} onChange={handleFilterChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <span className="ml-2 text-gray-700">No Skill Needed</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Job Listings */}
          <main className="lg:col-span-3">
            {loading && <p>Loading jobs...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedJobs.length > 0 ? (
                  filteredAndSortedJobs.map(job => (
                    <JobCard key={job._id} job={job} user={user} onApply={handleApply} onManage={handleManage} />
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-12 px-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700">No jobs found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or check back later!</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Join Hustlerrs to Apply!</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to apply for jobs.</p>
            <div className="flex justify-center gap-4">
              <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Register</Link>
            </div>
            <button onClick={() => setShowLoginPrompt(false)} className="mt-6 text-sm text-gray-500 hover:text-gray-700">Maybe later</button>
          </div>
        </div>
      )}

      {/* Application Modal */}
      <ApplicationModal
        job={selectedJob}
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSuccess={handleApplicationSuccess}
      />

      {/* Success Toast */}
      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
