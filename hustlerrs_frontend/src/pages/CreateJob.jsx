import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [rateType, setRateType] = useState('fixed');
  const [duration, setDuration] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [markerPosition, setMarkerPosition] = useState([23.8103, 90.4125]); // Default: Dhaka
  const [lat, setLat] = useState(23.8103);
  const [lng, setLng] = useState(90.4125);
  const [addressWarning, setAddressWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition([latitude, longitude]);
        setLat(latitude);
        setLng(longitude);
        reverseGeocode(latitude, longitude);
      });
    }
  }, []);

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await axios.get('http://localhost:5000/api/utils/reverse-geocode', {
        params: { lat, lon }
      });
      setAddress(res.data.address || '');
      setLat(lat);
      setLng(lon);
      setAddressWarning('');
    } catch {
      setAddressWarning('Could not fetch address for this location.');
    }
  };

  const geocodeAddress = async () => {
    if (!address) return;
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1
        },
        headers: {
          'User-Agent': 'HustlerrsApp/1.0 (your@email.com)'
        }
      });
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        setMarkerPosition([parseFloat(result.lat), parseFloat(result.lon)]);
        setLat(parseFloat(result.lat));
        setLng(parseFloat(result.lon));
        setAddressWarning('');
      } else {
        setAddressWarning('Address not found. Please pin your location on the map.');
      }
    } catch {
      setAddressWarning('Error finding address. Please pin your location on the map.');
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setLat(lat);
        setLng(lng);
        reverseGeocode(lat, lng);
      }
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

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
        location: {
          area,
          address,
          latitude: lat,
          longitude: lng
        },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Job created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating job:', error);
      if (error.response && error.response.status === 403) {
        alert('You are not authorized to post jobs.');
        navigate('/');
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
            <span className="label-text">Area</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Dhanmondi, Gulshan, etc."
            className="input input-bordered w-full"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Job Address</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onBlur={geocodeAddress}
            placeholder="Type address or pin on map"
            required
          />
          {addressWarning && <div className="text-red-500 text-sm">{addressWarning}</div>}
        </div>
        <div className="h-64 my-4">
          <MapContainer center={markerPosition} zoom={13} scrollWheelZoom={true} className="h-full rounded-md">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
          <div className="text-xs text-gray-500 mt-2">
            Drag or click on the map to set the job location.
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Create Job
        </button>
      </form>
    </div>
  );
} 