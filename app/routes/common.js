const express = require('express');
const { dashboard, dashboardMap, importRecord, vaccineDropChart, ImmunizationRecord, populationChart, DashboardTableData } = require('../conntroller/dashboard/dashboard');
const { provinces, district, palikaList, wards } = require('../conntroller/master/master');
const router = express.Router();


router.post('/dashboard',dashboard)
router.post('/dashboard-map',dashboardMap)



router.post('/provinces',provinces)
router.post('/district',district)
router.post('/palika',palikaList)
router.post('/wards',wards)

router.post('/import',importRecord)
router.post('/vaccine-drop-chart', vaccineDropChart);
router.post('/immunization-record',ImmunizationRecord)
router.post('/population-chart',populationChart)
router.post('/dashboard-table-data',DashboardTableData)


module.exports = router