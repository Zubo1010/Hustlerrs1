const axios = require('axios');
const path = require('path');
const fs = require('fs');


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