import api from './api'; // Assuming you have an api service configured

// Cache for geocoding results
const geocodeCache = new Map();

const locationService = {
  getLocations: async () => {
    try {
      const response = await api.get('/utils/locations'); // Fixed: removed extra semicolon and added leading slash
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  validateLocation: async (division, district, upazila) => {
    try {
      const response = await api.post('/location/validate', {
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
  geocodeAddress: async (address) => {
    // Check cache first
    if (geocodeCache.has(address)) {
      return geocodeCache.get(address);
    }

    try {
      // Use OpenStreetMap's Nominatim API
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'Hustlerrs Job Platform'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Location not found');
      }

      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };

      // Cache the result
      geocodeCache.set(address, result);

      // Add a delay to respect Nominatim's usage policy (1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      return result;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }
};

export default locationService;