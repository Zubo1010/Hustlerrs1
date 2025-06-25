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

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getJobs(searchTerm, filterStatus, currentPage, jobsPerPage);
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
  }, [searchTerm, filterStatus, currentPage, jobsPerPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (loading) {
    return <div className="text-center py-8">Loading available jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Available Jobs</h1>
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
          <option value="pending_review">Pending Review</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <JobCard key={job._id} job={job} isGiverView={false} onApplicationSuccess={fetchJobs} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">No jobs available at the moment.</p>
        )}
      </div>

      <Pagination
        jobsPerPage={jobsPerPage}
        totalJobs={totalJobs}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
}
