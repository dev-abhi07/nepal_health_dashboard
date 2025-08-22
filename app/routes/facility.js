const express = require('express');
const { getProvincesFacilityCounts, totalpopulation,facilityDetails,facilityAuthorityDD, getFacilityDetails,getHealthFacilityTypeData, vaccineData } = require('../conntroller/dashboard/facility');
const { facilityReport } = require('../conntroller/dashboard/reports');
const router = express.Router();

router.post('/get-provinces-facility',getProvincesFacilityCounts)
router.post('/total-population',totalpopulation)
router.post('/get-facility-list',facilityDetails)
router.post('/facility-authority-dd',facilityAuthorityDD)
router.post('/get-facility-details-by-code',getFacilityDetails)
router.post('/get-facility-type-data',getHealthFacilityTypeData)
router.post('/get-facility-report',facilityReport)
router.post('/get-vaccine-data',vaccineData)
module.exports = router