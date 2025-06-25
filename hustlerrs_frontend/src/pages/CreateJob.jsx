import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [rateType, setRateType] = useState('fixed');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('Remote');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/jobs', {
        title,
        description,
        budget: parseFloat(budget),
        rateType,
        duration,
        location,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Job created successfully!');
      navigate('/'); // Redirect to dashboard or job list
    } catch (error) {
      console.error('Error creating job:', error);
      if (error.response && error.response.status === 403) {
        alert('You are not authorized to post jobs.');
        navigate('/'); // Redirect to dashboard
      } else {
        alert('Failed to create job.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Job Title</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Build a MERN stack application"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            placeholder="Provide a detailed description of the job"
            className="textarea textarea-bordered w-full"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Budget</span>
          </label>
          <input
            type="number"
            placeholder="e.g., 500 (for fixed) or hourly rate"
            className="input input-bordered w-full"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Rate Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={rateType}
            onChange={(e) => setRateType(e.target.value)}
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Duration</span>
          </label>
          <input
            type="text"
            placeholder="e.g., 3 days, 2 weeks, 1 month"
            className="input input-bordered w-full"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Location</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Remote, New York, etc."
            className="input input-bordered w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Create Job
        </button>
      </form>
    </div>
  );
} 