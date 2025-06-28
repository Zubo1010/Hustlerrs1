// hustlerrs_frontend/src/services/locationService.js

import api from './api'; // Assuming you have an api service configured

const locationService = {
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