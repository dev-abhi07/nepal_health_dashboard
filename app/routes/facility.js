const express = require('express');
const { getProvincesFacilityCounts, totalpopulation,facilityDetails,facilityAuthorityDD } = require('../conntroller/dashboard/facility');
const router = express.Router();

router.post('/get-provinces-facility',getProvincesFacilityCounts)
router.post('/total-population',totalpopulation)
router.post('/get-facility-list',facilityDetails)
router.post('/facility-authority-dd',facilityAuthorityDD)
module.exports = router