import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../../components/job/JobCard';
import SearchBar from '../../components/job/SearchBar';
import Pagination from '../../components/job/Pagination';
import { getJobs } from '../../services/jobService';

export default function HustlerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);
  const [locationParams, setLocationParams] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getJobs(
        searchTerm, 
        filterStatus, 
        currentPage, 
        jobsPerPage,
        locationParams?.lng,
        locationParams?.lat,
        locationParams?.radius
      );
      if (response && response.jobs) {
        setJobs(response.jobs);
        setTotalJobs(response.total);
      } else {
        setJobs([]);
        setTotalJobs(0);
        console.warn('Unexpected API response structure:', response);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, currentPage, jobsPerPage, locationParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (newSearchTerm, location = null) => {
    setSearchTerm(newSearchTerm);
    setLocationParams(location);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="text-center py-8">Loading available jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Jobs</h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={handleStatusFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {locationParams && (
              <span className="text-sm text-gray-600">
                Within {locationParams.radius}km of your location
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <JobCard 
              key={job._id} 
              job={job} 
              isGiverView={false} 
              onApplicationSuccess={fetchJobs} 
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No jobs available at the moment.</p>
            <p className="text-sm mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {totalJobs > jobsPerPage && (
        <div className="mt-6">
          <Pagination
            jobsPerPage={jobsPerPage}
            totalJobs={totalJobs}
            paginate={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}
