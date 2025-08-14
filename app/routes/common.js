const express = require('express');
const { dashboard, dashboardMap, importRecord, vaccineDropChart, ImmunizationRecord, populationChart, DashboardTableData,  health_worker_category, getfacilityByProvince, getDistricts, getVaccineProgramDD, getPalika, getWard, health_workerdata_by_cat } = require('../conntroller/dashboard/dashboard');
const { provinces, district, palikaList, wards, districtDD ,palikaListDD, wardDD, AlldistrictDD} = require('../conntroller/master/master');
const { facilityDetails } = require('../conntroller/dashboard/facility');
const router = express.Router();


router.post('/dashboard',dashboard)
router.post('/dashboard-map',dashboardMap)
router.post('/get-facility-count-by-province',getfacilityByProvince)
router.post('/provinces',provinces)
router.post('/district',district)
router.post('/palika',palikaList)
router.post('/wards',wards)
router.post('/district-dd',districtDD)
router.post('/palika-dd',palikaListDD)
router.post('/ward-dd',wardDD)
router.post('/all-district-dd',AlldistrictDD)


router.post('/import',importRecord)
router.post('/vaccine-drop-chart', vaccineDropChart);
router.post('/immunization-record',ImmunizationRecord)
router.post('/population-chart',populationChart)
router.post('/dashboard-table-data',DashboardTableData)
router.post('/get-districts-map',getDistricts)
router.post('/get-vaccine-program-dd',getVaccineProgramDD)

router.post('/get-palika-map',getPalika)
router.post('/get-ward-map',getWard)
router.post('/get-facility-details',facilityDetails)


//HR DATA
router.post('/health-worker-data',health_worker_category)
router.post('/health-worker-by-cat',health_workerdata_by_cat)


module.exports = router