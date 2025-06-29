import React, { useState } from 'react';
import axios from 'axios';
import LocationSelector from '../../common/LocationSelector'

const HustlerRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: {
      division: '',
      district: '',
      upazila: '',
      address: ''
    },
    latitude: null,
    longitude: null,
    nidOrBirthCertificate: null,
    studentId: null,
    profilePicture: null,
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotification('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      if (key === 'location') {
        const { division, district, upazila, address } = formData.location;
        data.append('division', division);
        data.append('district', district);
        data.append('upazila', upazila);
        data.append('address', address);
      } else {
        data.append(key, formData[key]);
      }
    }

    if (formData.latitude === null) data.set('latitude', '');
    if (formData.longitude === null) data.set('longitude', '');

    try {
      const res = await axios.post('http://localhost:5000/api/hustler-applications/apply', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNotification('Thanks for registering! Your application will be reviewed within 24 hours.');
      setFormData({
        name: '',
        age: '',
        location: {
          division: '',
          district: '',
          upazila: '',
          address: ''
        },
        latitude: null,
        longitude: null,
        nidOrBirthCertificate: null,
        studentId: null,
        profilePicture: null,
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });

      // Clear file inputs manually
      document.getElementById('nidOrBirthCertificate').value = '';
      document.getElementById('studentId').value = '';
      document.getElementById('profilePicture').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Hustler Registration</h2>
      {notification && <div className="mb-4 text-center text-green-500">{notification}</div>}
      {error && <div className="mb-4 text-center text-red-500">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} required className="input" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Select Your Area</label>
            <LocationSelector
              value={formData.location}
              onChange={(newLocation) =>
                setFormData(prev => ({
                  ...prev,
                  location: newLocation
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">NID or Birth Certificate</label>
            <input type="file" name="nidOrBirthCertificate" id="nidOrBirthCertificate" onChange={handleFileChange} required className="input-file" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Student ID Card</label>
            <input type="file" name="studentId" id="studentId" onChange={handleFileChange} required className="input-file" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input type="file" name="profilePicture" id="profilePicture" onChange={handleFileChange} required className="input-file" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="input" />
          </div>
        </div>

        <button type="submit" className="mt-6 w-full py-2 px-4 rounded bg-indigo-600 text-white hover:bg-indigo-700">
          Register
        </button>
      </form>
    </div>
  );
};

export default HustlerRegisterForm;
