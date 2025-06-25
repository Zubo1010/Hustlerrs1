const axios = require('axios');

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