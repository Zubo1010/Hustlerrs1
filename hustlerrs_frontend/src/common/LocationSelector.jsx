import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { validateLocation } from '../services/locationService';

const LocationSelector = ({ value, onChange, readOnlyAddress = true }) => {
  const [locations, setLocations] = useState([]);
  const [division, setDivision] = useState(value?.division || '');
  const [district, setDistrict] = useState(value?.district || '');
  const [upazila, setUpazila] = useState(value?.upazila || '');
  const [address, setAddress] = useState(value?.address || '');


  useEffect(() => {
    axios.get('/api/utils/locations')
      .then(res => setLocations(res.data.divisions || []))
      .catch(() => setLocations([]));
  }, []);

  const handleDivisionChange = (e) => {
    setDivision(e.target.value);
    setDistrict('');
    setUpazila('');
  };
  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
 setUpazila('');
    // No validation here yet, will validate after upazila is selected
 onChange && onChange({ division, district: e.target.value, upazila: '', address });
  };

  const handleUpazilaChange = async (e) => {
    setUpazila(e.target.value);
    const selectedUpazila = e.target.value;

    if (division && district && selectedUpazila) {
      try {
        const isValid = await validateLocation(division, district, selectedUpazila);
 if (!isValid) {
          alert('Invalid location selected. Please choose from the available options.'); // Or a more user-friendly toast/modal
          return; // Prevent updating the state if validation fails
 }
      } catch (error) {
        console.error('Location validation failed:', error);
      }
    }

    // Only call onChange if validation passes or if no upazila is selected yet
    onChange && onChange({ division, district, upazila: selectedUpazila, address });
 };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    // Call onChange whenever address changes, preserving current selections
    onChange && onChange({ division, district, upazila, address: e.target.value });
  };

  const divisionObj = locations.find(d => d.division_name === division);
  const districts = divisionObj ? divisionObj.districts : [];
  const districtObj = districts.find(d => d.district_name === district);
  const upazilas = districtObj ? districtObj.upazilas : [];

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Division</label>
        <select value={division} onChange={handleDivisionChange} className="input" required>
          <option value="">Select Division</option>
          {locations.map(div => (
            <option key={div.division_name} value={div.division_name}>{div.division_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">District</label>
        <select value={district} onChange={handleDistrictChange} className="input" required disabled={!division}>
          <option value="">Select District</option>
          {districts.map(dist => (
            <option key={dist.district_name} value={dist.district_name}>{dist.district_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Upazila</label>
        <select value={upazila} onChange={handleUpazilaChange} className="input" required disabled={!district}>
          <option value="">Select Upazila</option>
          {upazilas.map(upz => (
            <option key={upz} value={upz}>{upz}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input type="text" value={address} onChange={handleAddressChange} className="input" required />
      </div>
    </div>
  );
};

export default LocationSelector; 