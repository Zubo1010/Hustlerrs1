const axios = require('axios');
const NodeCache = require('node-cache');

// Cache geocoding results for 30 days
const geocodeCache = new NodeCache({ stdTTL: 2592000 });

// Rate limiting setup - 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second in milliseconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get coordinates for an address using OpenStreetMap's Nominatim
 * @param {Object} location Location object with division, district, upazila, area, and address
 * @returns {Promise<{lat: number, lon: number} | null>}
 */
const getCoordinates = async (location) => {
    try {
        // Create a complete address string
        const addressString = `${location.address}, ${location.area}, ${location.upazila}, ${location.district}, ${location.division}, Bangladesh`;
        
        // Check cache first
        const cacheKey = addressString.toLowerCase().trim();
        const cachedResult = geocodeCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // Implement rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
        }

        // Make the request to Nominatim
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: addressString,
                format: 'json',
                limit: 1,
                countrycodes: 'bd'
            },
            headers: {
                'User-Agent': 'Hustlerrs Job Platform (development)'
            }
        });

        lastRequestTime = Date.now();

        if (response.data && response.data.length > 0) {
            const result = {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon)
            };
            
            // Cache the result
            geocodeCache.set(cacheKey, result);
            
            return result;
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};

/**
 * Calculate distance between two points using the Haversine formula
 * @param {number} lat1 Latitude of first point
 * @param {number} lon1 Longitude of first point
 * @param {number} lat2 Latitude of second point
 * @param {number} lon2 Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const toRad = (value) => {
    return value * Math.PI / 180;
};

/**
 * Format distance for display
 * @param {number} distance Distance in kilometers
 * @returns {string} Formatted distance string
 */
const formatDistance = (distance) => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m away`;
    }
    return `${distance.toFixed(1)} km away`;
};

module.exports = {
    getCoordinates,
    calculateDistance,
    formatDistance
}; 