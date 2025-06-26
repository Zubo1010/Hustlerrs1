import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import JobCard from '../../components/job/JobCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon issue
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});

function AllJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchRadius, setSearchRadius] = useState(20); // Default 20km radius
  const [center, setCenter] = useState([23.8103, 90.4125]); // Default to Dhaka
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Try to get user's location from profile or geolocation
    if (user?.coordinates?.length === 2) {
      setUserLocation([user.coordinates[1], user.coordinates[0]]); // Convert from [lng, lat] to [lat, lng]
      setCenter([user.coordinates[1], user.coordinates[0]]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setCenter([latitude, longitude]);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [userLocation, searchRadius]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      let url = 'http://localhost:5000/api/jobs';
      
      // Add location-based filtering if user location is available
      if (userLocation) {
        const [lat, lng] = userLocation;
        url += `?lat=${lat}&lng=${lng}&radius=${searchRadius}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setJobs(response.data.jobs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setUserLocation([lat, lng]);
        setCenter([lat, lng]);
      }
    });

    return userLocation ? (
      <>
        <Marker position={userLocation} />
        <Circle
          center={userLocation}
          radius={searchRadius * 1000} // Convert km to meters
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        />
      </>
    ) : null;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Available Jobs</h1>
        
        {/* Location and Radius Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {searchRadius} km radius
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[300px] rounded-lg overflow-hidden">
            <MapContainer 
              center={center} 
              zoom={11} 
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
          </div>
        </div>

        {/* Job List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length > 0 ? (
            jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No jobs found in your area. Try increasing the search radius.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllJobs; 