const fs = require('fs');
const path = require('path');

const locationDataPath = path.join(__dirname, '../config/location_db.json');
let locationData = null;

try {
  const data = fs.readFileSync(locationDataPath, 'utf8');
  locationData = JSON.parse(data);
} catch (error) {
  console.error('Error loading location_db.json:', error);
  // Depending on how critical this data is, you might want to exit the process or handle it differently
  // process.exit(1);
}

/**
 * Checks if the provided division, district, and upazila are valid based on the loaded location data.
 * @param {string} division - The division name.
 * @param {string} district - The district name.
 * @param {string} upazila - The upazila name.
 * @returns {boolean} - True if the location is valid, false otherwise.
 */
const isValidLocation = (division, district, upazila) => {
  if (!locationData) {
    console.error('Location data not loaded.');
    return false;
  }

  const foundDivision = locationData.divisions.find(
    (div) => div.division_name === division
  );

  if (!foundDivision) {
    return false;
  }

  const foundDistrict = foundDivision.districts.find(
    (dist) => dist.district_name === district
  );

  if (!foundDistrict) {
    return false;
  }

  const foundUpazila = foundDistrict.upazilas.find(
    (upz) => upz === upazila
  );

  return !!foundUpazila;
};

module.exports = {
  locationData,
  isValidLocation,
};