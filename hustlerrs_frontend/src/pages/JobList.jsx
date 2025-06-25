// src/pages/JobList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        setJobs(res.data.jobs || res.data); // support both formats
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Jobs</h1>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job._id} className="border p-4 rounded-md shadow-md">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.description}</p>
              <p><strong>Budget:</strong> {job.budget} BDT</p>
              <p><strong>Type:</strong> {job.paymentType}</p>
              <p><strong>Hourly Rate:</strong> {job.hourlyRate}</p>
              <p><strong>Duration:</strong> {job.duration}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobList;
