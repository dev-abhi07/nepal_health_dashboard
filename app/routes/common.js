const express = require('express');
const { dashboard,vaccinewarehouseList,vaccinewarehousebyId, dashboardMap, importRecord, vaccineDropChart, ImmunizationRecord, populationChart, DashboardTableData,  health_worker_category, getfacilityByProvince, getDistricts, getVaccineProgramDD, getPalika, getWard, health_workerdata_by_cat, wareHouseDataDD, vaccineWarehouseChart } = require('../conntroller/dashboard/dashboard');
const { provinces, district, palikaList, wards, districtDD ,palikaListDD, wardDD, AlldistrictDD, facilitytype,facilityDD, roledd} = require('../conntroller/master/master');
const { facilityDetails } = require('../conntroller/dashboard/facility');
const { verifyUser,injectScope, filterUserMenus } = require('../middleware/auth');
const { menuList, rolePermission, sidebardata } = require('../conntroller/permission/permission');
const router = express.Router();



router.post('/dashboard',verifyUser,injectScope,dashboard)
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
router.post('/get-facility-type-dd',facilitytype)
router.post('/facility-dd',facilityDD)
router.post('/role-dd',roledd)
router.post('/warehouse-list',vaccinewarehouseList)
router.post('/warehouse-by-id',vaccinewarehousebyId)
router.post('/warehouse-data-dd',wareHouseDataDD)


router.post('/import',importRecord)
router.post('/vaccine-drop-chart', vaccineDropChart);
router.post('/immunization-record',ImmunizationRecord)
router.post('/vaccine-warehouse-chart',vaccineWarehouseChart)
router.post('/population-chart',populationChart)
router.post('/dashboard-table-data',DashboardTableData)
router.post('/get-districts-map',getDistricts)
router.post('/get-vaccine-program-dd',getVaccineProgramDD)

router.post('/get-palika-map',getPalika)
router.post('/get-ward-map',getWard)
router.post('/get-ils',facilityDetails)


//HR DATA
router.post('/health-worker-data',health_worker_category)
router.post('/health-worker-by-cat',health_workerdata_by_cat)

//user
router.post("/permission",verifyUser,menuList)
router.post('/role-permission',rolePermission)
router.post('/sidebar',verifyUser,injectScope,filterUserMenus,sidebardata)





module.exports = router