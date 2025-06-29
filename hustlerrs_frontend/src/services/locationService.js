// hustlerrs_frontend/src/services/locationService.js

import api from './api'; // Assuming you have an api service configured

const locationService = {
  getLocations: async () => {
    try {
      const response = await api.get('utils/locations');; // adjust if needed
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  validateLocation: async (division, district, upazila) => {
    try {
      const response = await api.post('/api/location/validate', {
        division,
        district,
        upazila,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating location:', error);
      throw error;
    }
  },
};

export default locationService;