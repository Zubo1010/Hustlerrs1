const express = require('express');
const router = express.Router();
const axios = require('axios');
const utilsController = require('../controllers/utilsController');


router.get('/locations', utilsController.getLocations);

module.exports = router;
