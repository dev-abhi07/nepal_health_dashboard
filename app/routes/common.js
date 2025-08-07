const express = require('express');
const { dashboard, dashboardMap, importRecord, vaccineDropChart, ImmunizationRecord, populationChart, DashboardTableData, getHealthFacilityTypeData, health_worker_category, getfacilityByProvince, getDistricts, getVaccineProgramDD, getPalika, getWard } = require('../conntroller/dashboard/dashboard');
const { provinces, district, palikaList, wards } = require('../conntroller/master/master');
const router = express.Router();


router.post('/dashboard',dashboard)
router.post('/dashboard-map',dashboardMap)
router.post('/get-facility-count-by-province',getfacilityByProvince)




router.post('/provinces',provinces)
router.post('/district',district)
router.post('/palika',palikaList)
router.post('/wards',wards)

router.post('/import',importRecord)
router.post('/vaccine-drop-chart', vaccineDropChart);
router.post('/immunization-record',ImmunizationRecord)
router.post('/population-chart',populationChart)
router.post('/dashboard-table-data',DashboardTableData)
router.post('/get-facility-type-data',getHealthFacilityTypeData)
router.post('/get-districts-map',getDistricts)
router.post('/get-vaccine-program-dd',getVaccineProgramDD)

router.post('/get-palika-map',getPalika)
router.post('/get-ward-map',getWard)


//HR DATA
router.post('/health-worker-data',health_worker_category)


module.exports = router