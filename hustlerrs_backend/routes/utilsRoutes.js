const express = require('express');
const router = express.Router();
const axios = require('axios');
const utilsController = require('../controllers/utilsController');

router.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'HustlerrsApp/1.0 (your@email.com)'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Reverse Geocoding Error:', error.message);
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

router.get('/locations', utilsController.getLocations);

module.exports = router;
