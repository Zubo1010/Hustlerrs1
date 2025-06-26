const fs = require('fs');
const path = require('path');

const locationFilePath = path.join(__dirname, '../config/location_db.json');

let locationData = null;

const loadLocationData = () => {
  try {
    const data = fs.readFileSync(locationFilePath, 'utf8');
    locationData = JSON.parse(data);
    console.log('Location data loaded successfully.');
  } catch (error) {
    console.error('Error loading location data:', error);
    // Depending on how critical this data is, you might want to exit the process
    // process.exit(1);
  }
};

// Load data when the module is first required
loadLocationData();

const getLocationData = () => {
  if (!locationData) {
    // Attempt to load data again if it wasn't loaded initially
    loadLocationData();
    if (!locationData) {
      // If still no data, throw an error or return null, depending on desired behavior
      throw new Error('Location data is not available.');
    }
  }
  return locationData;
};

module.exports = {
  getLocationData,
};