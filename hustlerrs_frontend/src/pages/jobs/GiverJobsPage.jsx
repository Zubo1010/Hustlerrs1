import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../../components/job/JobCard';
import SearchBar from '../../components/job/SearchBar';
import Pagination from '../../components/job/Pagination';
import { getMyJobs } from '../../services/jobService';

const API_URL = 'http://localhost:5000/api/jobs';

export default function GiverJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const response = await getMyJobs(searchTerm, filterStatus, currentPage, jobsPerPage);
        
        // Check if response has the expected structure
        if (response && Array.isArray(response.jobs)) {
          setJobs(response.jobs);
          setTotalJobs(response.total || response.jobs.length);
          setTotalPages(response.pages || Math.ceil(response.jobs.length / jobsPerPage));
        } else {
          console.warn('Unexpected API response structure:', response);
          setJobs([]);
          setTotalJobs(0);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Error fetching my jobs:', err);
        setError('Failed to load your jobs. Please try again later.');
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [searchTerm, filterStatus, currentPage, jobsPerPage]);

  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="text-center py-8">Loading your jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Posted Jobs</h1>
        <Link 
          to="/post-job"
          className="btn btn-primary px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Post a New Job
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <SearchBar onSearch={handleSearch} />
        <select
          className="input input-bordered"
          value={filterStatus}
          onChange={handleStatusFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="active">Active - Open for Bids</option>
          <option value="bidding_closed">Bidding Closed</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="pending_review">Pending Review</option>
          <option value="expired">Expired</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <JobCard key={job._id} job={job} isGiverView={true} />
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">You haven't posted any jobs yet.</p>
        )}
      </div>

      {totalPages > 1 && (
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
