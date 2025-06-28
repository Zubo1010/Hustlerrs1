const fs = require('fs').promises; // Use the promise-based fs module
const path = require('path');
/**
 * Controller to handle fetching location data from a JSON file.
 * This controller reads the locations from a predefined JSON file
 * and returns it as a response.
 */


const getLocations = async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../config/location_db.json'); // Adjust path accordingly
    const data = await fs.readFile(dataPath, 'utf-8');
    const locations = JSON.parse(data);

    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    res.status(500).json({ error: 'Failed to load location data.' });
  }
};

module.exports = { getLocations };
