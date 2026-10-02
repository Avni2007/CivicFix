const express = require('express');
const router = express.Router();
const {
  getAllMunicipalities,
  getMunicipalityByState,
  getVerifiedStaff
} = require('../controllers/municipalityController');

// Query official government-verified staff accounts across India
router.get('/staff', getVerifiedStaff);

// Query all 36 Indian State & UT Municipal Local Bodies
router.get('/', getAllMunicipalities);

// Get specific municipality by state name or code
router.get('/:identifier', getMunicipalityByState);

module.exports = router;
