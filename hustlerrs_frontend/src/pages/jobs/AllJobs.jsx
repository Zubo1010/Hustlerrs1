import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getJobs } from '../../services/jobService';
import ApplicationModal from '../../components/job/ApplicationModal';

// Mock geocoding function (replace with real API if needed)
const geocodeLocation = async (locationName) => {
  // For demo, return some hardcoded coordinates for a few cities
  const locations = {
    'Dhaka': { lng: 90.4125, lat: 23.8103 },
    'Chittagong': { lng: 91.7832, lat: 22.3569 },
    'Khulna': { lng: 89.5672, lat: 22.8456 },
    'Rajshahi': { lng: 88.6087, lat: 24.3745 },
    'Sylhet': { lng: 91.8831, lat: 24.8949 },
  };
  return locations[locationName] || null;
};

export default function AllJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [userLocation, setUserLocation] = useState({ lng: null, lat: null });
  const [locationTried, setLocationTried] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [locationUsed, setLocationUsed] = useState(false); // Track if location was used for filtering
  const [searchRadius, setSearchRadius] = useState(10); // Default radius in km

  useEffect(() => {
    // Try to get user's real-time location on mount (only once)
    if (!locationTried && !manualMode) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lng: position.coords.longitude,
              lat: position.coords.latitude
            });
            setLocationTried(true);
            setLocationUsed(true);
          },
          () => {
            // Permission denied or error
            setLocationTried(true);
            setLocationUsed(false);
          }
        );
      } else {
        setLocationTried(true);
        setLocationUsed(false);
      }
    } else {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, status, currentPage, userLocation, locationTried, manualMode]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let data;
      if ((userLocation.lng !== null && userLocation.lat !== null) || manualMode) { // Use location if available or manual mode is on
        data = await getJobs(searchTerm, status, currentPage, 10, userLocation.lng, userLocation.lat, searchRadius);
        setLocationUsed(true);
      } else {
        data = await getJobs(searchTerm, status, currentPage);
        setLocationUsed(false);
      }
      setJobs(data.jobs);
      setTotalPages(data.pages);
      setTotalJobs(data.total);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message || 'Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchJobs();
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1); // Reset to first page on status change
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    fetchJobs(); // Refetch to update status
  };

  // Handle manual location selection
  const handleManualLocationChange = (e) => {
    setManualLocation(e.target.value);
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation) return;
    const coords = await geocodeLocation(manualLocation);
    if (coords) {
      setUserLocation(coords);
      setManualMode(true);
      setLocationTried(true);
      setLocationUsed(true);
    } else {
      setError('Could not find coordinates for the selected location.');
    }
  };

  const handleManualModeOff = () => {
    setManualMode(false);
    setManualLocation('');
    setUserLocation({ lng: null, lat: null });
    setLocationTried(false);
    setLocationUsed(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Manual Location Selection UI */}
        <div className="mb-6">
          <form onSubmit={handleManualLocationSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <label htmlFor="manual-location" className="font-medium text-gray-700">Select City/Location:</label>
            <select
              id="manual-location"
              value={manualLocation}
              onChange={handleManualLocationChange}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select --</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Khulna">Khulna</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Sylhet">Sylhet</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Search in City
            </button>
            {manualMode && (
              <button
                type="button"
                onClick={handleManualModeOff}
                className="ml-2 px-3 py-1 border border-gray-400 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Use My Location
              </button>
            )}
          </form>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <label htmlFor="search-radius" className="font-medium text-gray-700">Search Radius (km):</label>
            <select
              id="search-radius"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value, 10))}
              className="w-full sm:w-20 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Jobs ({totalJobs})</h2>
          {user?.role === 'job_giver' && (
            <Link
              to="/jobs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Post New Job
            </Link>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs by title or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            {locationUsed ? (
              <>
                <h3 className="text-lg font-medium text-gray-900">No jobs found in your location</h3>
                <p className="mt-2 text-gray-500">Please select another city or location above.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <li key={job._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            <Link to={`/jobs/${job._id}`} className="hover:text-blue-600">
                              {job.title}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {job.location?.area || 'N/A'} • {job.pay?.display || 'N/A'} • {job.duration || 'N/A'}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              job.status === 'open' ? 'bg-green-100 text-green-800' :
                              job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {user?.role === 'Hustler' && job.status === 'open' && (
                            <button
                              onClick={() => handleApply(job)}
                              disabled={job.userHasApplied}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {job.userHasApplied ? (
                                <>
                                  <span className="text-green-500 mr-1">&#10003;</span> Applied
                                </>
                              ) : (
                                'Apply Now'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {job.skills && job.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
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