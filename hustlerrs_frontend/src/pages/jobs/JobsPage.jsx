import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../../components/job/JobCard';
import SearchBar from '../../components/job/SearchBar';
import Pagination from '../../components/job/Pagination';
import { getJobs } from '../../services/jobService';
import { useAuth } from '../../contexts/AuthContext';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getJobs(searchTerm, filterStatus, currentPage, jobsPerPage);
      
      if (response && Array.isArray(response.jobs)) {
        setJobs(response.jobs);
        setTotalJobs(response.total || response.jobs.length);
      } else {
        console.warn('Unexpected API response structure:', response);
        setJobs([]);
        setTotalJobs(0);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, currentPage, jobsPerPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Available Jobs</h1>
        {user?.role === 'job_giver' && (
          <Link
            to="/post-job"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Post a New Job
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <SearchBar onSearch={handleSearch} />
        <select
          className="input input-bordered"
          value={filterStatus}
          onChange={handleStatusFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="bidding_closed">Bidding Closed</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <JobCard 
              key={job._id} 
              job={job} 
              isGiverView={user?.role === 'job_giver' && job.createdBy === user._id}
              onApplicationSuccess={fetchJobs}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">No jobs found.</p>
        )}
      </div>

      {totalJobs > jobsPerPage && (
        <Pagination
          jobsPerPage={jobsPerPage}
          totalJobs={totalJobs}
          paginate={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
} 