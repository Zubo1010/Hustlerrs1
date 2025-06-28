import React, { useEffect, useState } from 'react';
import locationService from '../services/locationService';

const LocationSelector = ({ value, onChange, readOnlyAddress = false }) => {
  const [locations, setLocations] = useState([]);
  const [division, setDivision] = useState(value?.division || '');
  const [district, setDistrict] = useState(value?.district || '');
  const [upazila, setUpazila] = useState(value?.upazila || '');
  const [address, setAddress] = useState(value?.address || '');

  useEffect(() => {
    // Fetch all divisions, districts, upazilas
    locationService.getLocations()
      .then(res => setLocations(res.divisions || []))
      .catch(err => {
        console.error('Failed to fetch locations:', err);
        setLocations([]);
      });
  }, []);

  const handleDivisionChange = (e) => {
    const newDivision = e.target.value;
    setDivision(newDivision);
    setDistrict('');
    setUpazila('');
    triggerOnChange({ division: newDivision, district: '', upazila: '', address });
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setDistrict(newDistrict);
    setUpazila('');
    triggerOnChange({ division, district: newDistrict, upazila: '', address });
  };

  const handleUpazilaChange = async (e) => {
    const selectedUpazila = e.target.value;
    setUpazila(selectedUpazila);
  
    if (division && district && selectedUpazila) {
      try {
        const isValid = await locationService.validateLocation(division, district, selectedUpazila);
        if (!isValid) {
          alert('Invalid location selected. Please choose from the available options.');
          // Optionally reset upazila if invalid
          setUpazila('');
          return;
        }
      } catch (error) {
        console.error('Location validation failed:', error);
        // Optionally show user-friendly message or ignore
      }
    }
  
    onChange && onChange({ division, district, upazila: selectedUpazila, address });
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    triggerOnChange({ division, district, upazila, address: newAddress });
  };

  // Helper to call onChange prop with updated location
  const triggerOnChange = (newLocation) => {
    onChange && onChange(newLocation);
  };

  // Find current division, districts and upazilas for dropdown options
  const divisionObj = locations.find(d => d.division_name === division);
  const districts = divisionObj ? divisionObj.districts : [];
  const districtObj = districts.find(d => d.district_name === district);
  const upazilas = districtObj ? districtObj.upazilas : [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Division</label>
        <select
          value={division}
          onChange={handleDivisionChange}
          className="input"
          required
        >
          <option value="">Select Division</option>
          {locations.map(div => (
            <option key={div.division_name} value={div.division_name}>
              {div.division_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">District</label>
        <select
          value={district}
          onChange={handleDistrictChange}
          className="input"
          required
          disabled={!division}
        >
          <option value="">Select District</option>
          {districts.map(dist => (
            <option key={dist.district_name} value={dist.district_name}>
              {dist.district_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Upazila</label>
        <select
          value={upazila}
          onChange={handleUpazilaChange}
          className="input"
          required
          disabled={!district}
        >
          <option value="">Select Upazila</option>
          {upazilas.map(upz => (
            <option key={upz} value={upz}>
              {upz}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          className="input"
          required
          readOnly={readOnlyAddress}
          placeholder={readOnlyAddress ? 'Address is read-only' : 'Enter your address'}
        />
      </div>
    </div>
  );
};

export default LocationSelector;
