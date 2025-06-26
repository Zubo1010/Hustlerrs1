import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Set up marker icon
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

const HustlerRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
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

  const [markerPosition, setMarkerPosition] = useState([23.8103, 90.4125]); // Default to Dhaka coordinates
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      });
    }
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await axios.get('http://localhost:5000/api/utils/reverse-geocode', {
        params: {
          lat,
          lon,
        }
      }); // <-- Removed the extra curly brace
      const displayAddress = res.data.display_name;
      setFormData(prev => ({
        ...prev,
        address: displayAddress,
        latitude: lat,
        longitude: lon
      }));
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };
  const geocodeAddress = async () => {
    if (!formData.address) return;
  
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: formData.address,
          format: 'json',
          addressdetails: 1,
          limit: 1
        },
        headers: {
          'User-Agent': 'HustlerrsApp/1.0 (youremail@domain.com)' // replace with your email or app name
        }
      });
  
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        }));
        // No need to set mapCenter here, the MapContainer re-renders with markerPosition
        setMarkerPosition([parseFloat(result.lat), parseFloat(result.lon)]);
      } else {
        console.warn('No results found for the address');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };
  

  const LocationMarker = () => {
    useMapEvents({
      dragend(e) {
        const latlng = e.target.getCenter();
        setMarkerPosition([latlng.lat, latlng.lng]);
        reverseGeocode(latlng.lat, latlng.lng);
      },
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        reverseGeocode(lat, lng);
      }
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
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
      data.append(key, formData[key]);
    }
    // Ensure latitude and longitude are not sent as the string "null"
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
        name: '', age: '', address: '', latitude: null, longitude: null,
        email: '', phone: '', nidOrBirthCertificate: null,
        studentId: null, profilePicture: null,
        password: '', confirmPassword: ''
      });
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
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} onBlur={geocodeAddress} required className="input" />
          </div>
          <div className="sm:col-span-2 h-64">
            <MapContainer center={markerPosition} zoom={13} scrollWheelZoom={true} className="h-full rounded-md">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
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
        <button type="submit" className="mt-6 w-full py-2 px-4 rounded bg-indigo-600 text-white hover:bg-indigo-700">Register</button>
      </form>
    </div>
  );
};

export default HustlerRegisterForm;
