import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon issue
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

function PostJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: '',
    payType: 'fixed',
    payAmount: '',
    area: '',
    address: '',
    latitude: null,
    longitude: null,
    skills: [],
    startDate: '',
    endDate: '',
  });

  const [markerPosition, setMarkerPosition] = useState([23.8103, 90.4125]); // Default to Dhaka
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to get user's location
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
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json'
        },
        headers: {
          'User-Agent': 'HustlerrsApp/1.0'
        }
      });
      
      setFormData(prev => ({
        ...prev,
        address: response.data.display_name,
        area: response.data.address.city || response.data.address.town || response.data.address.suburb || '',
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
          limit: 1
        },
        headers: {
          'User-Agent': 'HustlerrsApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        }));
        setMarkerPosition([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        reverseGeocode(lat, lng);
      }
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If address is changed, try to geocode it
    if (name === 'address') {
      geocodeAddress();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/jobs', {
        ...formData,
        location: {
          area: formData.area,
          address: formData.address,
          coordinates: [formData.longitude, formData.latitude] // GeoJSON format: [lng, lat]
        }
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      window.location.href = `/jobs/${response.data.job._id}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Job Type</label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Job Type</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Delivery">Delivery</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Handyman">Handyman</option>
            <option value="Events">Events</option>
            <option value="Moving">Moving</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Pay Type</label>
            <select
              name="payType"
              value={formData.payType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Pay Amount (৳)</label>
            <input
              type="number"
              name="payAmount"
              value={formData.payAmount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={geocodeAddress}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="h-[400px] relative">
          <MapContainer 
            center={markerPosition} 
            zoom={13} 
            className="h-full w-full rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}

export default PostJobPage; 