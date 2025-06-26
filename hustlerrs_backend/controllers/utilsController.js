const axios = require('axios');
const path = require('path');
const fs = require('fs');

exports.reverseGeocode = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat,
                lon,
                format: 'json'
            },
            headers: {
                'User-Agent': 'HustlerrsApp/1.0 (your-email@example.com)' // Replace with your actual email or app name
            }
        });

        res.json({ address: nominatimResponse.data.display_name });
    } catch (error) {
        console.error('Error in reverseGeocode controller:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLocations = (req, res) => {
    const locationFilePath = path.join(__dirname, '../config/location_db.json');
    fs.readFile(locationFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading location_db.json:', err);
            return res.status(500).json({ message: 'Failed to load location data' });
        }
        try {
            const locations = JSON.parse(data);
            res.json(locations);
        } catch (parseErr) {
            console.error('Error parsing location_db.json:', parseErr);
            res.status(500).json({ message: 'Failed to parse location data' });
        }
    });
};