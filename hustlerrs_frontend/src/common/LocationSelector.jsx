import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    // Auto-fill address when all are selected
    if (division && district && upazila) {
      const addr = `${upazila}, ${district}, ${division}`;
      setAddress(addr);
      onChange && onChange({ division, district, upazila, address: addr });
    }
  }, [division, district, upazila]);

  const handleDivisionChange = (e) => {
    setDivision(e.target.value);
    setDistrict('');
    setUpazila('');
  };
  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setUpazila('');
  };
  const handleUpazilaChange = (e) => {
    setUpazila(e.target.value);
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
        <input type="text" value={address} readOnly={readOnlyAddress} className="input bg-gray-100" required />
      </div>
    </div>
  );
};

export default LocationSelector; 