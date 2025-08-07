const express = require('express');
const { getProvincesFacilityCounts, totalpopulation } = require('../conntroller/dashboard/facility');
const router = express.Router();

router.post('/get-provinces-facility',getProvincesFacilityCounts)
router.post('/total-population',totalpopulation)
module.exports = router