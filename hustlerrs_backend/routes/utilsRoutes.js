const express = require('express');
const router = express.Router();
const { reverseGeocode } = require('../controllers/utilsController');

router.get('/reverse-geocode', reverseGeocode);

module.exports = router;