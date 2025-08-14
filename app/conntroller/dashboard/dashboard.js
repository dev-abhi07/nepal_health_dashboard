const Helper = require("../../helper/helper");
const district_master = require("../../models/districtmaster");
const facility = require("../../models/facility");
const facilitytypemaster = require("../../models/facilitytypemaster");
const palika_master = require("../../models/pailikamaster");
const province_master = require("../../models/provincemaster");
const vaccine_hmis = require("../../models/vaccine_hmis");
const WardMaster = require("../../models/wardmaster");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const ImmunizationRecord = require("../../models/immunizationRecord");
const moment = require('moment');
const { Op, fn, col, } = require("sequelize");
const health_worker_category = require("../../models/healthWorker");
const VaccineProgram = require("../../models/vaccineProgram");
const sequelize = require("../../connection/connection");
const Sequelize = require("sequelize");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    var date = new Date();
    cb(
      null,
      date.getDate() +
      `-` +
      date.getMonth() +
      `_` +
      date.getHours() +
      `_` +
      date.getMinutes() +
      `_` +
      date.getMilliseconds() +
      `_` +
      file.originalname
    );
  },
});

const upload = multer({ storage });

exports.dashboard = async (req, res) => {
  try {
    let province_masters = 0;
    let totalDistricts = 0;
    let totalPalikas = 0;
    let totalWards = 0;
    let totalFacility = 0;
    let facilityTypes = [];
    let childrenZeroTo14Years = 0;
    let childrenZeroTo5years = 0;
    let totalDifference = 0;
    let populationData = {};
    let demography = [];
    let achievements = [];
    if (req.body && req.body.province_id) {
      totalDistricts = await district_master.count({
        where: {
          isdeleted: 0,
          fk_provinceid: req.body.province_id
        }
      })

      totalPalikas = await palika_master.count({
        where: {
          isdeleted: 0,
          fk_provinceid: req.body.province_id
        }
      })

      totalWards = await WardMaster.count({
        where: {
          isdeleted: 0,
          fk_provinceid: req.body.province_id
        }
      })

      demography = [{ title: 'Provinces', total_count: 1 }, {
        title: 'Districts',
        total_count: totalDistricts
      },
      {
        title: 'Palikas',
        total_count: totalPalikas
      },
      {
        title: 'Wards',
        total_count: totalWards
      }
      ]

      if (req.body?.authority_level) {
        totalFacility = await Helper.getProvincesFacilityCountsAuthorityLevel(req.body.province_id, req.body.authority_level)

      } else {
        totalFacility = await Helper.getProvincesFacilityCounts(req.body.province_id)
      }

      achievements = [
        "90% Rota Vaccine Coverage",
        "95% Measles Vaccine Coverage",
        "80% BCG Vaccine Coverage",
        "98% Polio Vaccine Coverage",
      ];
      childrenZeroTo14Years = await sequelize.query(
        'select sum(pop00to14years) from population_stats where province_id = :province_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id }
        }
      );

      childrenZeroTo5years = await sequelize.query(
        'select sum(pop00to59months) from population_stats where province_id = :province_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id }
        }
      );

      totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

      populationData = {

        "title": "Total Children",

        "totalCount": childrenZeroTo14Years[0].sum,

        "progressBars": [

          {

            "label": "Upto 5 Years",

            "value": childrenZeroTo5years[0].sum,

            "color": "#dc143c",

            "class": "first"

          },

          {

            "label": "5-14 Years",

            "value": totalDifference,

            "color": "#003893",

            "class": "second"

          }

        ],

        "legends": [

          {

            "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),

            "dotColor": "#dc143c"

          },

          {

            "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),

            "dotColor": "#003893"

          }

        ]

      }

      return Helper.response(true, "Welcome to the province Dashboard", { demography: demography, achievements: achievements, populationData, totalFacility }, res, 200);

    } else if (req.body && req.body.district_id) {


      //get Total Palikas
      totalPalikas = await palika_master.count({
        where: {
          isdeleted: 0,
          fk_districtid: req.body.district_id
        }
      })

      //get Total Wards 
      totalWards = await WardMaster.count({
        where: {
          isdeleted: 0,
          fk_districtid: req.body.district_id
        }
      })

      demography = [{ title: 'Provinces', total_count: 1 }, {
        title: 'Districts',
        total_count: 1
      },
      {
        title: 'Palikas',
        total_count: totalPalikas
      },
      {
        title: 'Wards',
        total_count: totalWards
      }
      ]

      facilityTypes = await facilitytypemaster.findAll({
        where: {
          isdeleted: 0
        },
        order: [['facilitytype', 'ASC']]
      });


      if (req.body?.authority_level) {
        totalFacility = await Helper.getDistrictFacilityCountsAuthorityLevel(req.body.district_id, req.body.authority_level)
      } else {
        totalFacility = await Helper.getDistrictFacilityCounts(req.body.district_id)
      }
      if (!facilityTypes || facilityTypes.length === 0) {
        return Helper.response(false, "No facility types found", {}, res, 404);
      }

      achievements = [
        "90% Rota Vaccine Coverage",
        "95% Measles Vaccine Coverage",
        "80% BCG Vaccine Coverage",
        "98% Polio Vaccine Coverage",
      ];

      childrenZeroTo14Years = await sequelize.query(
        'select sum(pop00to14years) from population_stats where district_id = :district_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: req.body.district_id }
        }
      );

      childrenZeroTo5years = await sequelize.query(
        'select sum(pop00to59months) from population_stats where district_id = :district_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: req.body.district_id }
        }
      );

      totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

      populationData = {

        "title": "Total Children",

        "totalCount": childrenZeroTo14Years[0].sum,

        "progressBars": [

          {

            "label": "Upto 5 Years",

            "value": childrenZeroTo5years[0].sum,

            "color": "#dc143c",

            "class": "first"

          },

          {

            "label": "5-14 Years",

            "value": totalDifference,

            "color": "#003893",

            "class": "second"

          }

        ],

        "legends": [

          {

            "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),

            "dotColor": "#dc143c"

          },

          {

            "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),

            "dotColor": "#003893"

          }

        ]

      }



      return Helper.response(true, "Welcome to the Dashboard", { demography: demography, totalFacility, achievements: achievements, populationData }, res, 200);

    } else if (req.body && req.body.palika_id) {

      totalWards = await WardMaster.count({
        where: {
          isdeleted: 0,
          fk_palikaid: req.body.palika_id
        }
      })

      demography = [{ title: 'Provinces', total_count: 1 }, {
        title: 'Districts',
        total_count: 1
      },
      {
        title: 'Palikas',
        total_count: 1
      },
      {
        title: 'Wards',
        total_count: totalWards
      }
      ]

      if (req.body?.authority_level) {
        totalFacility = await Helper.getPalikaFacilityCountsAuthorityLevel(parseInt(req.body.palika_id), req.body.authority_level)
      } else {
        totalFacility = await Helper.getPalikaFacilityCounts(parseInt(req.body.palika_id))
      }

      achievements = [
        "90% Rota Vaccine Coverage",
        "95% Measles Vaccine Coverage",
        "80% BCG Vaccine Coverage",
        "98% Polio Vaccine Coverage",
      ];

      childrenZeroTo14Years = await sequelize.query(
        'select sum(pop00to14years) from population_stats where municipality_id = :municipality_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { municipality_id: parseInt(req.body.palika_id) }
        }
      );

      childrenZeroTo5years = await sequelize.query(
        'select sum(pop00to59months) from population_stats where municipality_id = :municipality_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { municipality_id: parseInt(req.body.palika_id) }
        }
      );

      totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

      populationData = {

        "title": "Total Children",

        "totalCount": childrenZeroTo14Years[0].sum,

        "progressBars": [

          {

            "label": "Upto 5 Years",

            "value": childrenZeroTo5years[0].sum,

            "color": "#dc143c",

            "class": "first"

          },

          {

            "label": "5-14 Years",

            "value": totalDifference,

            "color": "#003893",

            "class": "second"

          }

        ],

        "legends": [

          {

            "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),

            "dotColor": "#dc143c"

          },

          {

            "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),

            "dotColor": "#003893"

          }

        ]

      }


      return Helper.response(true, "Welcome to the Dashboard", { demography: demography, achievements: achievements, populationData, totalFacility }, res, 200);

    }

    else {
      province_masters = await province_master.count({
        where: {
          isdeleted: 0
        }
      })


      //get Total Districts
      totalDistricts = await district_master.count({
        where: {
          isdeleted: 0
        }
      })

      //get Total Palikas
      totalPalikas = await palika_master.count({
        where: {
          isdeleted: 0
        }
      })

      //get Total Wards 
      totalWards = await WardMaster.count({
        where: {
          isdeleted: 0
        }
      })

      demography = [{ title: 'Provinces', total_count: province_masters }, {
        title: 'Districts',
        total_count: totalDistricts
      },
      {
        title: 'Palikas',
        total_count: totalPalikas
      },
      {
        title: 'Wards',
        total_count: totalWards
      }
      ]

      facilityTypes = await facilitytypemaster.findAll({
        where: {
          isdeleted: 0
        },
        order: [['facilitytype', 'ASC']]
      });


      totalFacility = await Promise.all(facilityTypes.map(async (r) => {
        let facilityTypeCount = 0;

        if (req.body?.authority_level) {
          facilityTypeCount = await facility.count({
            where: {
              fk_facilitytype: r.id,
              isdeleted: 0,
              authoritylevel: req.body?.authority_level

            }
          })


        } else {
          facilityTypeCount = await facility.count({
            where: {
              fk_facilitytype: r.id,
              isdeleted: 0,

            }
          })
        }
        return {
          value: r.id,
          label: r.facilitytype,
          facility_type: r.facilitytype,
          id: r.id,
          count: facilityTypeCount,
          facility_image: `icons/${r.image ? r.image : null}`,
          color_code: r.color_code
        }
      }))
      if (!facilityTypes || facilityTypes.length === 0) {
        return Helper.response(false, "No facility types found", {}, res, 404);
      }

      achievements = [
        "90% Rota Vaccine Coverage",
        "95% Measles Vaccine Coverage",
        "80% BCG Vaccine Coverage",
        "98% Polio Vaccine Coverage",
      ];

      childrenZeroTo14Years = await sequelize.query(
        'select sum(pop00to14years) from population_stats',
        {
          type: sequelize.QueryTypes.SELECT
        }
      );

      childrenZeroTo5years = await sequelize.query(
        'select sum(pop00to59months) from population_stats',
        {
          type: sequelize.QueryTypes.SELECT
        }
      );

      totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

      populationData = {

        "title": "Total Children",

        "totalCount": childrenZeroTo14Years[0].sum,

        "progressBars": [

          {

            "label": "Upto 5 Years",

            "value": childrenZeroTo5years[0].sum,

            "color": "#dc143c",

            "class": "first"

          },

          {

            "label": "5-14 Years",

            "value": totalDifference,

            "color": "#003893",

            "class": "second"

          }

        ],

        "legends": [

          {

            "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),

            "dotColor": "#dc143c"

          },

          {

            "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),

            "dotColor": "#003893"

          }

        ]

      }



      return Helper.response(true, "Welcome to the Dashboard", { demography: demography, totalFacility, achievements: achievements, populationData }, res, 200);
    }


  } catch (error) {
    console.error("Error in dashboard:", error);
    return Helper.response(false, "Error fetching dashboard data", {}, res, 500);
  }
}



exports.dashboardMap = async (req, res) => {
  try {
    const mapPath = process.env.PROVINCE_MAP;
    fs.readFile(mapPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading map file:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        const cleanData = data.trim();
        const parsed = JSON.parse(cleanData);
        return Helper.response(true, "Welcome to the Dashboard", { geography: parsed }, res, 200);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
      }
    });
  } catch (error) {
    console.error("Error in dashboardMap:", error);
    return Helper.response(false, "Error fetching map data", {}, res, 500);
  }
}


exports.importRecord = async (req, res) => {
  const year = 2024
  upload.single("uploaded_file")(req, res, async (err) => {
    if (err) {
      return Helper.response("Failed", "Error uploading file", err, res, 500);
    }
    const file = xlsx.readFile(req.file.destination + req.file.filename);
    const sheets = file.Sheets[file.SheetNames[0]];
    let data = [];
    const rows = xlsx.utils.sheet_to_json(sheets);
    for (const row of rows) {
      await vaccine_hmis.create({
        year,
        orgunitlevel1: row['orgunitlevel1'],
        orgunitlevel2: row['orgunitlevel2'],
        orgunitlevel3: row['orgunitlevel3'],
        orgunitlevel4: row['orgunitlevel4'],
        orgunitlevel5: row['orgunitlevel5'],
        orgunitlevel6: row['orgunitlevel6'],
        organisationunitid: row['organisationunitid'],
        nhfrId: row['NHFR ID'],
        organisationunitname: row['organisationunitname'],
        organisationunitcode: row['organisationunitcode'],
        organisationunitdescription: row['organisationunitdescription'],
        periodid: row['periodid'],
        periodname: row['periodname'],
        periodcode: row['periodcode'],
        perioddescription: row['perioddescription'],
        dropout_dpt1_vs_3: parseFloat(row['6.20 - DPT-HepB-Hib dropuout rate (DPT-HepB-Hib 1 vs 3)']),
        dropout_dpt1_vs_mr2: parseFloat(row['6.21 - DPT-HepB-Hib1 vs MR2 dropout rate']),
        dropout_pcv1_vs_3: parseFloat(row['6.22 - PCV dropout rate (PCV1 vs PCV3)']),
        dropout_mr: parseFloat(row['6.23 - Measles/Rubella droupout rate']),
        wastage_bcg: parseFloat(row['6.25 a - Vaccine wastage rate (BCG)']),
        wastage_dpt_hepb_hib: parseFloat(row['6.25 b - Vaccine wastage rate (DPT/HepB/Hib)']),
        wastage_fipv: parseFloat(row['6.25 c - Vaccine wastage rate (FIPV)']),
        wastage_je: parseFloat(row['6.25 d - Vaccine wastage rate (JE)']),
        wastage_mr: parseFloat(row['6.25 e - Vaccine wastage rate (MR)']),
        wastage_opv: parseFloat(row['6.25 f - Vaccine wastage rate (OPV)']),
        wastage_rota: parseFloat(row['6.25 g - Vaccine wastage rate (Rota)']),
        wastage_tcv: parseFloat(row['6.25 h - Vaccine wastage rate (TCV)']),
        wastage_td: parseFloat(row['6.25 i - Vaccine wastage rate (TD)']),
        wastage_pcv: parseFloat(row['6.25 j - Vaccine wastage rate (PCV)']),
        pct_sessions_conducted: parseFloat(row['6.26 - % of planned immunization sessions conducted']),
        pct_clinics_conducted: parseFloat(row['6.27 - %Â of planned immunization clinics conductedÂ ']),
        pct_serious_aefi: parseFloat(row['6.30 - % of serious AEFI among reported AEFI cases']),
      });
    }

    return res.status(200).json({ message: '✅ Data imported successfully!' });
  });
}



// exports.vaccineDropChart = async (req, res) => {
//   try {
//     // ---------- helpers ----------
//     const MONTHS = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     const monthIndex = (m) => MONTHS.findIndex(x => x.toLowerCase() === String(m || '').trim().toLowerCase()); // 0..11
//     const parseMonthYear = (str) => {
//       if (!str) return null;
//       const cleaned = String(str).trim().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ');
//       const m = cleaned.match(/^([A-Za-z]+)[-\s]+(\d{4})$/);
//       if (!m) return null;
//       const mi = monthIndex(m[1]);
//       const y = parseInt(m[2], 10);
//       if (mi < 0 || Number.isNaN(y)) return null;
//       return { monthIdx: mi, year: y };
//     };
//     const monthsBetween = (startIdx, endIdxInclusive) => {
//       if (startIdx > endIdxInclusive) return [];
//       return MONTHS.slice(startIdx, endIdxInclusive + 1);
//     };

//     // Normalize month labels from DB (handles "Feb", "FEB.", etc.)
//     const ALIASES = {
//       jan: 'January', january: 'January',
//       feb: 'February', february: 'February',
//       mar: 'March', march: 'March',
//       apr: 'April', april: 'April',
//       may: 'May',
//       jun: 'June', june: 'June',
//       jul: 'July', july: 'July',
//       aug: 'August', august: 'August',
//       sep: 'September', sept: 'September', september: 'September',
//       oct: 'October', october: 'October',
//       nov: 'November', november: 'November',
//       dec: 'December', december: 'December',
//     };
//     const normalizeMonth = (s) => {
//       if (!s) return null;
//       const key = String(s).toLowerCase().replace(/\./g, '').trim();
//       return ALIASES[key] || null;
//     };

//     const safe = (v) => {
//       const n = parseFloat(v);
//       return Number.isFinite(n) ? n : 0;
//     };

//     // Accept both "start_date" and "star_date"
//     const startStr = req.body?.start_date || req.body?.star_date || null;
//     const endStr = req.body?.end_date || null;

//     const startMY = parseMonthYear(startStr);
//     const endMY = parseMonthYear(endStr);

//     // Build date filter + x-axis order
//     let dateWhere = {};
//     let xCategories = [];

//     let isSingleYearRange = false;

//     if (startMY && endMY) {
//       // normalize order
//       let s = startMY, e = endMY;
//       const sSerial = s.year * 12 + s.monthIdx;
//       const eSerial = e.year * 12 + e.monthIdx;
//       if (sSerial > eSerial) { [s, e] = [e, s]; }

//       if (s.year === e.year) {
//         isSingleYearRange = true;
//         const monthsSet = monthsBetween(s.monthIdx, e.monthIdx);
//         dateWhere = {
//           [Op.and]: [
//             { year: s.year },
//             { month: { [Op.in]: monthsSet } }
//           ]
//         };
//         xCategories = monthsSet;
//       } else {
//         isSingleYearRange = false;
//         const ors = [];
//         ors.push({ [Op.and]: [{ year: s.year }, { month: { [Op.in]: monthsBetween(s.monthIdx, 11) } }] });
//         if (e.year - s.year > 1) {
//           ors.push({ year: { [Op.between]: [s.year + 1, e.year - 1] } });
//         }
//         ors.push({ [Op.and]: [{ year: e.year }, { month: { [Op.in]: monthsBetween(0, e.monthIdx) } }] });

//         dateWhere = { [Op.or]: ors };
//         xCategories = MONTHS; // show Jan..Dec for multi-year
//       }
//     } else {
//       // No/invalid payload – fall back to all months
//       dateWhere = {}; // no date filter
//       xCategories = MONTHS;
//       isSingleYearRange = false; // treat as multi-year agg if multiple years return
//     }

//     // Location filter (province/district/palika)
//     const locWhere = {};
//     if (req.body?.province_id) {
//       locWhere.orgunitlevel2 = { [Op.iLike]: `%${req.body.province_id}%` };
//     } else if (req.body?.district_id) {
//       locWhere.orgunitlevel3 = { [Op.iLike]: `%${req.body.district_id}%` };
//     } else if (req.body?.palika_id) {
//       locWhere.orgunitlevel4 = { [Op.iLike]: `%${req.body.palika_id}%` };
//     }

//     // Final where (merge date + location)
//     const where = Object.keys(locWhere).length || Object.keys(dateWhere).length
//       ? { [Op.and]: [locWhere, dateWhere] }
//       : {};

//     const attributes = [
//       'year', 'month',
//       'dropout_dpt1_vs_3', 'dropout_dpt1_vs_mr2', 'dropout_pcv1_vs_3', 'dropout_mr',
//       'wastage_bcg', 'wastage_dpt_hepb_hib', 'wastage_fipv', 'wastage_je', 'wastage_mr',
//       'wastage_opv', 'wastage_rota', 'wastage_tcv', 'wastage_td', 'wastage_pcv',
//       'pct_sessions_conducted', 'pct_clinics_conducted', 'pct_serious_aefi'
//     ];

//     // Order by year then calendar month
//     const monthOrderLiteral =
//       `array_position(ARRAY['January','February','March','April','May','June','July','August','September','October','November','December']::text[], "month"::text)`;

//     const data = await vaccine_hmis.findAll({
//       attributes,
//       where,
//       order: [
//         ['year', 'ASC'],
//         [Sequelize.literal(monthOrderLiteral), 'ASC']
//       ],
//       raw: true
//     });

//     // Normalize months & bucket
//     // If single-year: map (year, month)->row (last wins)
//     // If multi-year: aggregate by month across years (sum)
//     const byYearMonth = new Map(); // key: 'YYYY::Month'
//     const monthAgg = new Map();    // key: 'Month' -> { sums... }
//     for (const r of data) {
//       const m = normalizeMonth(r.month);
//       if (!m) continue;

//       if (isSingleYearRange) {
//         byYearMonth.set(`${r.year}::${m}`, r);
//       } else {
//         const acc = monthAgg.get(m) || {};
//         // sum only wastage fields you chart
//         acc.wastage_bcg = (acc.wastage_bcg || 0) + safe(r.wastage_bcg);
//         acc.wastage_dpt_hepb_hib = (acc.wastage_dpt_hepb_hib || 0) + safe(r.wastage_dpt_hepb_hib);
//         acc.wastage_fipv = (acc.wastage_fipv || 0) + safe(r.wastage_fipv);
//         acc.wastage_je = (acc.wastage_je || 0) + safe(r.wastage_je);
//         acc.wastage_mr = (acc.wastage_mr || 0) + safe(r.wastage_mr);
//         acc.wastage_opv = (acc.wastage_opv || 0) + safe(r.wastage_opv);
//         acc.wastage_rota = (acc.wastage_rota || 0) + safe(r.wastage_rota);
//         acc.wastage_tcv = (acc.wastage_tcv || 0) + safe(r.wastage_tcv);
//         acc.wastage_td = (acc.wastage_td || 0) + safe(r.wastage_td);
//         acc.wastage_pcv = (acc.wastage_pcv || 0) + safe(r.wastage_pcv);
//         monthAgg.set(m, acc);
//       }
//     }

//     // Column defs (unchanged)
//     const columnDefs = [
//       { name: 'BCG', key: 'wastage_bcg', group: 'Wastage', color: '#213dad', visible: true },
//       { name: 'DPT-HepB-Hib', key: 'wastage_dpt_hepb_hib', group: 'Wastage', color: '#0fac81', visible: false },
//       { name: 'fIPV', key: 'wastage_fipv', group: 'Wastage', color: '#f52d55', visible: false },
//       { name: 'JE', key: 'wastage_je', group: 'Wastage', color: '#f032e6', visible: false },
//       { name: 'MR', key: 'wastage_mr', group: 'Wastage', color: '#bcf60c', visible: false },
//       { name: 'OPV', key: 'wastage_opv', group: 'Wastage', color: '#fabebe', visible: false },
//       { name: 'Rota', key: 'wastage_rota', group: 'Wastage', color: '#008080', visible: false },
//       { name: 'TCV', key: 'wastage_tcv', group: 'Wastage', color: '#e6beff', visible: false },
//       { name: 'TD', key: 'wastage_td', group: 'Wastage', color: '#9a6324', visible: false },
//       { name: 'PCV', key: 'wastage_pcv', group: 'Wastage', color: '#fffac8', visible: false },
//     ];

//     // Build series data
//     const series = columnDefs.map(col => ({
//       name: col.name,
//       group: col.group,
//       color: col.color,
//       visible: col.visible,
//       data: xCategories.map(mName => {
//         const canon = normalizeMonth(mName);
//         if (!canon) return 0;

//         if (isSingleYearRange) {
//           // determine the single year in range (already enforced in dateWhere)
//           // find any row in byYearMonth for that year & month
//           // grab the first year present in byYearMonth key set (since there should be one year only)
//           // but safer: derive year from first data row if needed
//           const any = data.find(d => normalizeMonth(d.month) === canon);
//           const y = any ? any.year : null;
//           if (!y) return 0;
//           const row = byYearMonth.get(`${y}::${canon}`);
//           return safe(row?.[col.key]);
//         } else {
//           // multi-year -> use aggregated month across selected years
//           const agg = monthAgg.get(canon);
//           return safe(agg?.[col.key]);
//         }
//       })
//     }));

//     const lineChart = {
//       chart: { type: 'column', height: 445 },
//       title: {
//         text: "Monthly Vaccine Wastage Report",
//         align: "left",
//         style: { fontWeight: "700", fontSize: "16.8px", color: "#364a36" },
//       },
//       credits: { enabled: false },
//       accessibility: { point: { valueDescriptionFormat: "{xDescription}{separator}{value} %" } },
//       xAxis: { categories: xCategories, title: { text: 'Month' } },
//       yAxis: { title: { text: "%" }, allowDecimals: true, min: null },
//       tooltip: { shared: true, valueSuffix: '%' },
//       legend: { align: 'left', verticalAlign: 'top' },
//       series
//     };

//     return Helper.response(true, "Vaccine Dropout, Wastage & KPI Chart", { lineChart }, res, 200);

//   } catch (error) {
//     console.error("Error generating chart:", error);
//     return Helper.response(false, "Chart generation failed", {}, res, 500);
//   }
// };




// exports.ImmunizationRecord = async (req, res) => {
//   try {
//     const { vaccine, province_id, district_id, palika_id } = req.body;

//     const programConfig = {
//       bcg: { columns: ['bcg'], label: 'BCG' },
//       opv: { columns: ['opv1', 'opv2', 'opv3'], label: 'OPV' },
//       pcv: { columns: ['pcv1', 'pcv2', 'pcv3'], label: 'PCV' },
//       rota: { columns: ['rota1', 'rota2'], label: 'Rota' },
//       'dpt-hepb-hib': { columns: ['dpt1', 'dpt2', 'dpt3'], label: 'DPT-HepB-Hib' },
//       fipv: { columns: ['fipv1', 'fipv2'], label: 'FIPV' },
//       je: { columns: ['je'], label: 'JE' },
//       td: { columns: ['td1', 'td2'], label: 'TD' },
//       tcv: { columns: ['tcv'], label: 'TCV' },
//       hpv: { columns: ['hpv1', 'hpv2'], label: 'HPV' },
//       'measles/rubella': { columns: ['mr_9_11m', 'mr_12_23m'], label: 'Measles/Rubella' },
//       'fully immunized': { columns: ['fully_immunized'], label: 'Fully Immunized' }
//     };

//     const selectedProgram = String(vaccine || '').toLowerCase();
//     const config = programConfig[selectedProgram] || programConfig['measles/rubella'];

//     const COLORS = ['#213dad', '#dc143c', '#0fac81', '#f52d55', '#f032e6', '#bcf60c'];

//     // --- Month helpers ---
//     const MONTHS = [
//       'January','February','March','April','May','June',
//       'July','August','September','October','November','December'
//     ];
//     const monthIndex = (m) =>
//       MONTHS.findIndex(x => x.toLowerCase() === String(m||'').trim().toLowerCase()); // 0..11

//     // Accept "Month YYYY" or "Month-YYYY"
//     const parseMonthYear = (str) => {
//       if (!str) return null;
//       const cleaned = String(str).trim().replace(/\s+/g, ' ');
//       const match = cleaned.match(/^([A-Za-z]+)[-\s]+(\d{4})$/);
//       if (!match) return null;
//       const mi = monthIndex(match[1]);
//       const y = parseInt(match[2], 10);
//       if (mi < 0 || Number.isNaN(y)) return null;
//       return { monthIdx: mi, year: y };
//     };

//     // Always render labels like "Month YYYY" to match your DB
//     const labelOf = (year, monthIdx) => `${MONTHS[monthIdx]} ${year}`;

//     const buildPeriodLabels = (start, end) => {
//       const out = [];
//       const startSerial = start.year * 12 + start.monthIdx;
//       const endSerial = end.year * 12 + end.monthIdx;
//       for (let s = startSerial; s <= endSerial; s++) {
//         const y = Math.floor(s / 12);
//         const m = s % 12;
//         out.push(labelOf(y, m));
//       }
//       return out;
//     };

//     // accept both "start_date" and "star_date"
//     const startStr = req.body?.start_date || req.body?.star_date || null;
//     const endStr   = req.body?.end_date   || null;

//     const startMY = parseMonthYear(startStr);
//     const endMY   = parseMonthYear(endStr);

//     // Build intended x-axis labels
//     let periodLabels = null;
//     if (startMY && endMY) {
//       const sSerial = startMY.year * 12 + startMY.monthIdx;
//       const eSerial = endMY.year * 12 + endMY.monthIdx;
//       const s = sSerial <= eSerial ? startMY : endMY;
//       const e = sSerial <= eSerial ? endMY   : startMY;
//       periodLabels = buildPeriodLabels(s, e); // e.g., ["January 2025", ...]
//     }

//     // --- WHERE ---
//     const where = {};
//     if (province_id) where.province_id = String(province_id);
//     if (district_id) where.district_id = String(district_id);
//     if (palika_id) where.municipality_id = String(palika_id);
//     if (periodLabels && periodLabels.length) {
//       where.time_period = { [Op.in]: periodLabels };
//     }

//     // --- attributes & query ---
//     const sumAttributes = config.columns.map(col => [
//       Sequelize.fn('SUM', Sequelize.col(col)),
//       `sum_${col}`
//     ]);

//     const rows = await ImmunizationRecord.findAll({
//       attributes: [...sumAttributes, 'time_period'],
//       where,
//       group: ['time_period'],
//       raw: true
//     });

//     // Map DB -> quick lookup
//     const rowMap = new Map(rows.map(r => [String(r.time_period).trim(), r]));

//     // If user gave a range, use it exactly; else derive categories from DB and sort by month-year
//     const parseSerial = (label) => {
//       const my = parseMonthYear(label);
//       return my ? my.year * 12 + my.monthIdx : 0;
//     };
//     const categories = (periodLabels && periodLabels.length)
//       ? periodLabels
//       : rows.map(r => String(r.time_period).trim())
//             .filter((v, i, a) => a.indexOf(v) === i)
//             .sort((a, b) => parseSerial(a) - parseSerial(b));

//     const series = config.columns.map((col, idx) => ({
//       name: col.toUpperCase().replaceAll('_', ' '),
//       data: categories.map(label => {
//         const r = rowMap.get(label) || {};
//         const val = Number(r[`sum_${col}`]);
//         return Number.isFinite(val) ? val : 0;
//       }),
//       color: COLORS[idx % COLORS.length]
//     }));

//     const subtitleTxt = (categories.length > 0)
//       ? `${config.label} by Period (${categories[0]} → ${categories[categories.length - 1]})`
//       : `${config.label} by Period`;

//     const immunization_record = {
//       chart: { type: 'line', height: 235 },
//       title: { text: '', align: 'left' },
//       subtitle: { text: subtitleTxt, align: 'left' },
//       credits: { enabled: false },
//       xAxis: [{ categories, crosshair: true }],
//       yAxis: { title: { text: 'Doses Administered' }, labels: { format: '{value}' } },
//       tooltip: {
//         shared: true,
//         formatter() {
//           return this.points
//             ? this.points.map(p => `${p.series.name}: <b>${p.y}</b>`).join('<br/>')
//             : '';
//         }
//       },
//       legend: { align: 'left', verticalAlign: 'top' },
//       series
//     };

//     return Helper.response(true, '', { immunization_record }, res, 200);
//   } catch (error) {
//     console.error("Immunization chart error:", error);
//     return Helper.response(false, 'Server Error', {}, res, 500);
//   }
// };


// exports.ImmunizationRecord = async (req, res) => {
//   try {
//     const { vaccine, province_id, district_id, palika_id } = req.body;

//     const programConfig = {
//       bcg: { columns: ['bcg'], label: 'BCG' },
//       opv: { columns: ['opv1', 'opv2', 'opv3'], label: 'OPV' },
//       pcv: { columns: ['pcv1', 'pcv2', 'pcv3'], label: 'PCV' },
//       rota: { columns: ['rota1', 'rota2'], label: 'Rota' },
//       'dpt-hepb-hib': { columns: ['dpt1', 'dpt2', 'dpt3'], label: 'DPT-HepB-Hib' },
//       fipv: { columns: ['fipv1', 'fipv2'], label: 'FIPV' },
//       je: { columns: ['je'], label: 'JE' },
//       td: { columns: ['td1', 'td2'], label: 'TD' },
//       tcv: { columns: ['tcv'], label: 'TCV' },
//       hpv: { columns: ['hpv1', 'hpv2'], label: 'HPV' },
//       'measles/rubella': { columns: ['mr_9_11m', 'mr_12_23m'], label: 'Measles/Rubella' },
//       'fully immunized': { columns: ['fully_immunized'], label: 'Fully Immunized' }
//     };

//     const selectedProgram = (vaccine || '').toLowerCase();
//     const config = programConfig[selectedProgram] || programConfig['measles/rubella'];

//     const COLORS = ['#213dad', '#dc143c', '#0fac81'];

//     const sumAttributes = config.columns.map(col => [
//       Sequelize.fn('SUM', Sequelize.col(col)),
//       `sum_${col}`
//     ]);

//     const where = {};
//     if (province_id) where.province_id = String(province_id);
//     if (district_id) where.district_id = String(district_id);
//     if (palika_id) where.municipality_id = String(palika_id);

//     const records = await ImmunizationRecord.findAll({
//       attributes: [...sumAttributes, 'time_period'],
//       where,
//       group: ['time_period'],
//       order: [[Sequelize.col('time_period'), 'ASC']],
//       raw: true
//     });

//     const categories = records.map(r => r.time_period);

//     const series = config.columns.map((col, index) => ({
//       name: col.toUpperCase().replace('_', ' '),
//       data: records.map(r => Number(r[`sum_${col}`]) || 0),
//       color: COLORS[index % COLORS.length]
//     }));

//     const immunization_record = {
//       chart: { type: 'line', height: 235 },
//       title: { text: '', align: 'left' },
//       subtitle: { text: `${config.label} by Period`, align: 'left' },

//       credits: { enabled: false },
//       xAxis: [{ categories, crosshair: true }],
//       yAxis: {
//         title: { text: 'Doses Administered' },
//         labels: { format: '{value}' }
//       },
//       tooltip: {
//         shared: true,
//         formatter() {
//           return this.points
//             ? this.points.map(p => `${p.series.name}: <b>${p.y}</b>`).join('<br/>')
//             : '';
//         }
//       },
//       legend: { align: 'left', verticalAlign: 'top' },
//       series
//     };

//     return Helper.response(true, '', { immunization_record }, res, 200);

//   } catch (error) {
//     console.error("Immunization chart error:", error);
//     return Helper.response(false, 'Server Error', {}, res, 500);
//   }
// };



// ensure both are imported at top of your file:


exports.vaccineDropChart = async (req, res) => {
  try {
    // ---------- helpers ----------
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const M_ABBR = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
    const monthIndex = (m) => MONTHS.findIndex(x => x.toLowerCase() === String(m || '').trim().toLowerCase()); // 0..11
    const pad2 = (n) => String(n).padStart(2, '0');
    const labelOf = (y, mIdx) => `${MONTHS[mIdx]} ${y}`;

   
    // "Month YYYY" / "Mon YYYY" or with hyphen
    const parseMonthYear = (str) => {
      if (!str) return null;
      const cleaned = String(str)
        .replace(/[\u00A0\u2000-\u200B]/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const m = cleaned.match(/^([A-Za-z\.]+)\s+(\d{4})$/);
      if (!m) return null;
      let token = m[1].toLowerCase().replace(/\./g, '');
      let mi = MONTHS.findIndex(x => x.toLowerCase() === token);
      if (mi < 0 && token in M_ABBR) mi = M_ABBR[token];
      const y = parseInt(m[2], 10);
      if (mi < 0 || Number.isNaN(y)) return null;
      return { monthIdx: mi, year: y };
    };

    const buildRange = (S, E) => {
      const out = [];
      const sSer = S.year * 12 + S.monthIdx;
      const eSer = E.year * 12 + E.monthIdx;
      for (let ser = sSer; ser <= eSer; ser++) {
        const y = Math.floor(ser / 12), m = ser % 12;
        out.push({ key: `${y}-${pad2(m + 1)}`, label: labelOf(y, m), year: y, monthIdx: m });
      }
      return out;
    };

    const normalizeMonth = (s) => {
      if (!s) return null;
      const k = String(s).toLowerCase().replace(/\./g, '').trim();
      if (k in M_ABBR) return MONTHS[M_ABBR[k]];
      const i = monthIndex(k);
      return i >= 0 ? MONTHS[i] : null;
    };

    const safe = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    // ---------- payload ----------
    const startStr = req.body?.start_date || req.body?.star_date || null;
    const endStr = req.body?.end_date || null;
    const sMY = parseMonthYear(startStr);
    const eMY = parseMonthYear(endStr);
    if (!sMY || !eMY) {
      return Helper.response(false, "Invalid or missing start/end date", {}, res, 400);
    }
    const sSer = sMY.year * 12 + sMY.monthIdx;
    const eSer = eMY.year * 12 + eMY.monthIdx;
    const [S, E] = sSer <= eSer ? [sMY, eMY] : [eMY, sMY];

    const range = buildRange(S, E); // [{key:'2024-01',label:'January 2024'}, ... '2025-02']

    // ---------- where: date + location ----------
    // single-year vs multi-year month filtering
    let dateWhere;
    if (S.year === E.year) {
      dateWhere = {
        [Op.and]: [
          { year: S.year },
          { month: { [Op.in]: MONTHS.slice(S.monthIdx, E.monthIdx + 1) } }
        ]
      };
    } else {
      const parts = [
        { [Op.and]: [{ year: S.year }, { month: { [Op.in]: MONTHS.slice(S.monthIdx) } }] },
        { [Op.and]: [{ year: E.year }, { month: { [Op.in]: MONTHS.slice(0, E.monthIdx + 1) } }] }
      ];
      if (E.year - S.year > 1) {
        parts.splice(1, 0, { year: { [Op.between]: [S.year + 1, E.year - 1] } });
      }
      dateWhere = { [Op.or]: parts };
    }

    const locWhere = {};
    if (req.body?.province_id) {
      locWhere.province_id = `${req.body.province_id}`;
    } else if (req.body?.district_id) {
      locWhere.district_id = `${req.body.district_id}`;
    } else if (req.body?.palika_id) {
      locWhere.palika_id = `${req.body.palika_id}`;
    }

    const where = { [Op.and]: [dateWhere, locWhere] };

    // ---------- query ----------
    const attributes = [
      'year', 'month',
      'wastage_bcg', 'wastage_dpt_hepb_hib', 'wastage_fipv', 'wastage_je', 'wastage_mr',
      'wastage_opv', 'wastage_rota', 'wastage_tcv', 'wastage_td', 'wastage_pcv'
    ];

    const monthOrderLiteral =
      `array_position(ARRAY['January','February','March','April','May','June','July','August','September','October','November','December']::text[], "month"::text)`;

    const rows = await vaccine_hmis.findAll({
      attributes,
      where,
      order: [['year', 'ASC'], [Sequelize.literal(monthOrderLiteral), 'ASC']],
      raw: true
    });

    // ---------- bucket by month-year & AVG (since these are percentages) ----------
    const metrics = [
      'wastage_bcg', 'wastage_dpt_hepb_hib', 'wastage_fipv', 'wastage_je', 'wastage_mr',
      'wastage_opv', 'wastage_rota', 'wastage_tcv', 'wastage_td', 'wastage_pcv'
    ];

    const bucket = new Map(); // key 'YYYY-MM' -> {sum: {...}, cnt: n}
    for (const r of rows) {
      const mName = normalizeMonth(r.month);
      if (!mName) continue;
      const key = `${r.year}-${pad2(MONTHS.indexOf(mName) + 1)}`;
      const acc = bucket.get(key) || { sum: {}, cnt: 0 };
      metrics.forEach(k => { acc.sum[k] = (acc.sum[k] || 0) + safe(r[k]); });
      acc.cnt += 1;
      bucket.set(key, acc);
    }

    // Round to N decimals (default 2)
    const avgFor = (key, metric, decimals = 2) => {
      const b = bucket.get(key);
      if (!b || !b.cnt) return 0;

      const val = b.sum[metric] / b.cnt;
      if (!Number.isFinite(val)) return 0;

      const factor = 10 ** decimals;
      return Math.round((val + Number.EPSILON) * factor) / factor;
    };


    const categories = range.map(r => r.label);     // "January 2024" ... "February 2025"
    const keySeq = range.map(r => r.key);       // "2024-01" ... "2025-02"

    const columnDefs = [
      { name: 'BCG', key: 'wastage_bcg', color: '#213dad', visible: true },
      { name: 'DPT HepB Hib', key: 'wastage_dpt_hepb_hib', color: '#0fac81', visible: false },
      { name: 'fIPV', key: 'wastage_fipv', color: '#f52d55', visible: false },
      { name: 'JE', key: 'wastage_je', color: '#f032e6', visible: false },
      { name: 'MR', key: 'wastage_mr', color: '#89a33bff', visible: false },
      { name: 'OPV', key: 'wastage_opv', color: '#f06a6aff', visible: false },
      { name: 'Rota', key: 'wastage_rota', color: '#008080', visible: false },
      { name: 'TCV', key: 'wastage_tcv', color: '#af9dbbff', visible: false },
      { name: 'TD', key: 'wastage_td', color: '#9a6324', visible: false },
      { name: 'PCV', key: 'wastage_pcv', color: '#3f3c18ff', visible: false },
    ];

    const series = columnDefs.map(col => ({
      name: col.name,
      color: col.color,
      visible: col.visible,
      data: keySeq.map(k => avgFor(k, col.key,0))
    }));

    // console.log(series, "ffffffff")

    const lineChart = {
      chart: { type: 'column', height: 445 },
      title: {
        text: "Monthly Vaccine Wastage Report",
        align: "left",
        style: { fontWeight: "700", fontSize: "16.8px", color: "#364a36" },
      },
      credits: { enabled: false },
      accessibility: { point: { valueDescriptionFormat: "{xDescription}{separator}{value} %" } },
      xAxis: { categories },
      yAxis: { title: { text: "%" }, allowDecimals: false, min: null },
      tooltip: { shared: true, valueSuffix: '%' },
      legend: { align: 'left', verticalAlign: 'top' },
      series
    };

    return Helper.response(true, "Vaccine Dropout, Wastage & KPI Chart", { lineChart }, res, 200);

  } catch (error) {
    console.error("Error generating chart:", error);
    return Helper.response(false, "Chart generation failed", {}, res, 500);
  }
};

exports.ImmunizationRecord = async (req, res) => {
  try {
    const { vaccine, province_id, district_id, palika_id } = req.body;

    // ---- Program config ----
    const programConfig = {
      bcg: { columns: ['bcg'], label: 'BCG' },
      opv: { columns: ['opv1', 'opv2', 'opv3'], label: 'OPV' },
      pcv: { columns: ['pcv1', 'pcv2', 'pcv3'], label: 'PCV' },
      rota: { columns: ['rota1', 'rota2'], label: 'Rota' },
      'dpt-hepb-hib': { columns: ['dpt1', 'dpt2', 'dpt3'], label: 'DPT-HepB-Hib' },
      fipv: { columns: ['fipv1', 'fipv2'], label: 'FIPV' },
      je: { columns: ['je'], label: 'JE' },
      td: { columns: ['td1', 'td2'], label: 'TD' },
      tcv: { columns: ['tcv'], label: 'TCV' },
      hpv: { columns: ['hpv1', 'hpv2'], label: 'HPV' },
      'measles/rubella': { columns: ['mr_9_11m', 'mr_12_23m'], label: 'Measles/Rubella' },
      'fully immunized': { columns: ['fully_immunized'], label: 'Fully Immunized' }
    };

    const selectedProgram = String(vaccine || '').toLowerCase();
    const config = programConfig[selectedProgram] || programConfig['measles/rubella'];

    const COLORS = ['#213dad', '#dc143c', '#0fac81', '#f52d55', '#f032e6', '#bcf60c'];

    // ---- Month helpers ----
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const M_ABBR = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };

    const pad2 = (n) => String(n).padStart(2, '0');
    const labelOf = (year, mIdx) => `${MONTHS[mIdx]} ${year}`;

    // Accept "Month YYYY", "Mon YYYY", or with hyphen "Month-YYYY"/"Mon-YYYY"
    const parseMonthYear = (str) => {
      if (!str) return null;
      const cleaned = String(str)
        .replace(/[\u00A0\u2000-\u200B]/g, ' ') // NBSP & thin spaces -> space
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const m = cleaned.match(/^([A-Za-z\.]+)\s+(\d{4})$/);
      if (!m) return null;
      let token = m[1].toLowerCase().replace(/\./g, '');
      let mi = MONTHS.findIndex(x => x.toLowerCase() === token);
      if (mi < 0 && token in M_ABBR) mi = M_ABBR[token];
      const y = parseInt(m[2], 10);
      if (mi < 0 || Number.isNaN(y)) return null;
      return { monthIdx: mi, year: y };
    };

    const canonicalKeyFromLabel = (label) => {
      const my = parseMonthYear(label);
      return my ? `${my.year}-${pad2(my.monthIdx + 1)}` : null;
    };

    const buildRange = (start, end) => {
      const out = [];
      const sSer = start.year * 12 + start.monthIdx;
      const eSer = end.year * 12 + end.monthIdx;
      for (let ser = sSer; ser <= eSer; ser++) {
        const y = Math.floor(ser / 12), m = ser % 12;
        out.push({ key: `${y}-${pad2(m + 1)}`, label: labelOf(y, m) });
      }
      return out;
    };

    // ---- payload (handles star_date typo) ----
    const startStr = req.body?.start_date || req.body?.star_date || null;
    const endStr = req.body?.end_date || null;

    const sMY = parseMonthYear(startStr);
    const eMY = parseMonthYear(endStr);

    let range = null;
    if (sMY && eMY) {
      const sSer = sMY.year * 12 + sMY.monthIdx;
      const eSer = eMY.year * 12 + eMY.monthIdx;
      const [S, E] = sSer <= eSer ? [sMY, eMY] : [eMY, sMY];
      range = buildRange(S, E); // [{key:'2024-02', label:'February 2024'}, ...]
    }

    // ---- WHERE: location + years (robust; avoids exact IN label) ----
    const whereAnd = [];
    if (province_id) whereAnd.push({ province_id: String(province_id) });
    if (district_id) whereAnd.push({ district_id: String(district_id) });
    if (palika_id) whereAnd.push({ municipality_id: String(palika_id) });

    if (range && range.length) {
      const years = Array.from(new Set(range.map(r => +r.key.slice(0, 4))));
      // Match both "Month YYYY" and "Month-YYYY"
      const yearLikes = years.flatMap(y => ([
        { time_period: { [Op.iLike]: `% ${y}` } },
        { time_period: { [Op.iLike]: `%-${y}` } }
      ]));
      whereAnd.push({ [Op.or]: yearLikes });
    }

    const where = whereAnd.length ? { [Op.and]: whereAnd } : {};

    // ---- Query & aggregate ----
    const sumAttributes = config.columns.map(col => [
      Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col(col)), 0),
      `sum_${col}`
    ]);

    const rows = await ImmunizationRecord.findAll({
      attributes: [...sumAttributes, 'time_period'],
      where,
      group: ['time_period'],
      raw: true
    });

    // ---- Bucket by canonical key (YYYY-MM), SUM across label variants ----
    const bucket = new Map();
    for (const r of rows) {
      const key = canonicalKeyFromLabel(r.time_period);
      if (!key) continue;
      const acc = bucket.get(key) || {};
      for (const col of config.columns) {
        const k = `sum_${col}`;
        acc[k] = (acc[k] || 0) + (Number(r[k]) || 0);
      }
      bucket.set(key, acc);
    }

    // ---- Build categories (labels) & series data (zero-fill) ----
    const categories = range
      ? range.map(x => x.label)                           // exact requested labels
      : Array.from(bucket.keys()).sort().map(k => {       // fallback from DB
        const y = +k.slice(0, 4), m = +k.slice(5, 7) - 1;
        return labelOf(y, m);
      });

    const keySeq = range
      ? range.map(x => x.key)
      : Array.from(bucket.keys()).sort();

    const series = config.columns.map((col, idx) => ({
      name: col.toUpperCase().replace(/_/g, ' '),
      data: keySeq.map(k => {
        const rec = bucket.get(k);
        return rec ? Number(rec[`sum_${col}`]) || 0 : 0; // zero-fill missing months
      }),
      color: COLORS[idx % COLORS.length]
    }));

    const subtitleTxt = categories.length
      ? `${config.label} by Period (${categories[0]} → ${categories[categories.length - 1]})`
      : `${config.label} by Period`;

    const immunization_record = {
      chart: { type: 'line', height: 235 },
      title: { text: '', align: 'left' },
      subtitle: { text: subtitleTxt, align: 'left' },
      credits: { enabled: false },
      xAxis: [{ categories, crosshair: true }],
      yAxis: { title: { text: 'Doses Administered' }, labels: { format: '{value}' } },
      tooltip: {
        shared: true,
        formatter() {
          return this.points
            ? this.points.map(p => `${p.series.name}: <b>${p.y}</b>`).join('<br/>')
            : '';
        }
      },
      legend: { align: 'left', verticalAlign: 'top' },
      series
    };

    return Helper.response(true, '', { immunization_record }, res, 200);
  } catch (error) {
    console.error("Immunization chart error:", error);
    return Helper.response(false, 'Server Error', {}, res, 500);
  }
};
exports.ImmunizationRecordByProgramName = async (req, res) => {
  try {
    const { program_name } = req.body;
    switch (program_name) {
      case 'bcg':
        const query = `select SUM(bcg) AS total_bcg from immunization_records `

    }


  } catch (err) {
    console.error("Error fetching immunization record by program name:", err);
    return Helper.response(false, "Error fetching immunization record by program name", {}, res, 500);
  }
}



exports.populationChart = async (req, res) => {
  try {
    let data = []
    let childrenBelow5 = 0;
    let WomanOfChildbearingAge = 0;
    let adolescentGirls = 0;
    if (req.body && req.body.province_id) {
      childrenBelow5 = await sequelize.query(
        'select sum(pop00to59months) from population_stats where province_id = :province_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id }
        }
      );

      WomanOfChildbearingAge = await sequelize.query(
        'select sum(wra15to49years) from population_stats where province_id = :province_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id }
        }
      );

      adolescentGirls = await sequelize.query(
        'select sum(pop10to19years) from population_stats where province_id = :province_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id }
        }
      );
    } else if (req.body && req.body.district_id) {
      childrenBelow5 = await sequelize.query(
        'select sum(pop00to59months) from population_stats where district_id = :district_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: parseInt(req.body.district_id) }
        }
      );
      WomanOfChildbearingAge = await sequelize.query(
        'select sum(wra15to49years) from population_stats where district_id = :district_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: parseInt(req.body.district_id) }
        }
      );

      adolescentGirls = await sequelize.query(
        'select sum(pop10to19years) from population_stats where district_id = :district_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: parseInt(req.body.district_id) }
        }
      );
    }

    else if (req.body && req.body.palika_id) {
      childrenBelow5 = await sequelize.query(
        'select sum(pop00to59months) from population_stats where municipality_id = :municipality_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { municipality_id: parseInt(req.body.palika_id) }
        }
      );
      WomanOfChildbearingAge = await sequelize.query(
        'select sum(wra15to49years) from population_stats where municipality_id = :municipality_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { municipality_id: parseInt(req.body.palika_id) }
        }
      );

      adolescentGirls = await sequelize.query(
        'select sum(pop10to19years) from population_stats where municipality_id = :municipality_id',
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { municipality_id: parseInt(req.body.palika_id) }
        }
      );
    }

    else {
      childrenBelow5 = await sequelize.query(
        'select sum(pop00to59months) from population_stats',
        {
          type: sequelize.QueryTypes.SELECT
        }
      );
      WomanOfChildbearingAge = await sequelize.query(
        'select sum(wra15to49years) from population_stats',
        {
          type: sequelize.QueryTypes.SELECT
        }
      );

      adolescentGirls = await sequelize.query(
        'select sum(pop10to19years) from population_stats',
        {
          type: sequelize.QueryTypes.SELECT
        }
      );
    }

    data = [
      { name: 'Children Below 5', y: parseFloat(childrenBelow5[0].sum), color: '#0fac81' },
      { name: 'Adolescent Girls', y: parseFloat(adolescentGirls[0].sum), color: '#dc143c' },
      { name: 'Woman of Child <br>Bearing Age', y: parseFloat(WomanOfChildbearingAge[0].sum), color: '#213dad' }
    ]
    const population_chart = {
      chart: {
        type: 'pie',
        height: 220
      },
      title: {
        text: 'Population Data',
        align: 'left',
        verticalAlign: 'top',
        y: 10
      },
      subtitle: {
        text: '',
        align: 'right',
        verticalAlign: 'top',
        y: 10,
        style: {
          fontSize: '14px',
          fontWeight: 'bold'
        }
      },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: '50%',
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      },
      legend: {
        align: 'left',
        verticalAlign: 'middle',
        layout: 'vertical',
        margin: 0,
        padding: 0
      },
      series: [{
        name: '',
        colorByPoint: true,
        data: data
      }]
    }
    return Helper.response(true, 'Population chart data', { population_chart }, res, 200);


  } catch (err) {
    console.error("Error fetching population chart:", err);
    return Helper.response(false, "Error fetching population chart", {}, res, 500);
  }

}


exports.DashboardTableData = async (req, res) => {
  try {
    let provinces = [];
    let facilityTypes = [];
    let tableData = [];
    let tableHead = [];
    let typeCounts = {};
    let facilityTypeKeys = [];
    let typeIdToName = {};
    let row = {};
    let rawData = [];

    if (req.body && req.body.province_id) {
      const facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']],
        raw: true
      });

      const facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);


      // Build table header
      const tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          id: ft.id,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" }
      ];

      if (req.body?.authority_level) {
        rawData = await Helper.getProvienceTableDataAuthorityLevel(req.body.province_id, req.body.authority_level);
      } else {
        rawData = await Helper.getProvienceTableData(req.body.province_id);
      }

      // Convert query results into your table format
      const districtMap = {};

      rawData.forEach(row => {
        if (!districtMap[row.districtid]) {
          districtMap[row.districtid] = {
            Name: row.districtname,
            Total: 0
          };
          facilityTypeKeys.forEach(key => {
            districtMap[row.districtid][key] = 0;
          });
        }

        districtMap[row.districtid][row.facilitytype] = parseInt(row.total_facilities, 10);
        districtMap[row.districtid].Total += parseInt(row.total_facilities, 10);
        districtMap[row.districtid].districtid = row.districtid;
      });

      const tableData = Object.values(districtMap);

      return Helper.response(
        true,
        "District facility data retrieved successfully",
        { tableData, tableColumns: tableHead },
        res,
        200
      );


    } else if (req.body?.district_id) {
      const facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']],
        raw: true
      });




      const facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);
      const tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          id: ft.id,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" }
      ];


      if (req.body?.authority_level) {
        rawData = await Helper.getDistrictTableDataAuthorityLevel(req.body.district_id, req.body.authority_level);
      } else {
        rawData = await Helper.getDistrictTableData(req.body.district_id);
      }

      const palikaMap = {};

      rawData.forEach(row => {
        if (!palikaMap[row.palikaid]) {
          palikaMap[row.palikaid] = {
            Name: row.palikaname,
            palikaid: row.palikaid,
            Total: 0
          };
          facilityTypeKeys.forEach(key => {
            palikaMap[row.palikaid][key] = 0;
          });
        }

        palikaMap[row.palikaid][row.facilitytype] = parseInt(row.total_facilities, 10);
        palikaMap[row.palikaid].Total += parseInt(row.total_facilities, 10);
        palikaMap[row.palikaid].palikaid = row.palikaid;
      });

      const tableData = Object.values(palikaMap);

      return Helper.response(
        true,
        "Palika facility data retrieved successfully",
        { tableData, tableColumns: tableHead },
        res,
        200
      );




    } else if (req.body?.palika_id) {
      
      const facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']],
        raw: true
      });
      const facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);
      const tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          id: ft.id,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" }
      ];


      if (req.body?.authority_level) {
        rawData = await Helper.getPalikaTableDataAuthorityLevel(req.body.palika_id, req.body.authority_level);
      } else {
        rawData = await Helper.getPalikaTableData(req.body.palika_id);
      }

      const wardMap = {};

   
      rawData.forEach(row => {

        if (!wardMap[row.id]) {
          wardMap[row.id] = {
            Name: 'Ward' + ' ' + row.wardname,
            wardid: row.wardid,
            Total: 0
          };
          facilityTypeKeys.forEach(key => {
            wardMap[row.id][key] = 0;
          });
        }

        wardMap[row.id][row.facilitytype] = parseInt(row.total_facilities, 10);
        wardMap[row.id].Total += parseInt(row.total_facilities, 10);
        wardMap[row.id].wardid = row.wardid;
      });

      const tableData = Object.values(wardMap);

      return Helper.response(
        true,
        "Ward facility data retrieved successfully",
        { tableData, tableColumns: tableHead },
        res,
        200
      );

    }

    else {
      // No province_id provided in body

      provinces = await province_master.findAll({
        where: { isdeleted: 0 },
        order: [['createddate', 'ASC']],
      });

      if (!provinces || provinces.length === 0) {
        return Helper.response(false, "No provinces found", {}, res, 404);
      }

      facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']]
      });

      if (!facilityTypes || facilityTypes.length === 0) {
        return Helper.response(false, "No facility types found", {}, res, 404);
      }

      typeIdToName = {};
      facilityTypes.forEach(ft => {
        typeIdToName[ft.id] = ft.facilitytype;
      });

      facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);

      tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          id: ft.id,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
      ];

      let facilities = [];

      tableData = await Promise.all(provinces.map(async (province) => {
        if (req.body?.authority_level) {
          facilities = await facility.findAll({
            where: {
              fk_provinceid: province.provinceid,
              isdeleted: 0,
              authoritylevel: req.body?.authority_level
            },
            attributes: ['fk_facilitytype']
          });

        } else {
          facilities = await facility.findAll({
            where: {
              fk_provinceid: province.provinceid,
              isdeleted: 0,
            },
            attributes: ['fk_facilitytype']
          });
        }

        typeCounts = {};
        facilities.forEach(f => {
          const typeName = typeIdToName[f.fk_facilitytype];
          if (typeName) {
            typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
          }
        });

        row = {
          Name: province.province,
          provinceid: province.provinceid,
          Total: facilities.length,
        };

        facilityTypeKeys.forEach(key => {
          row[key] = typeCounts[key] || 0;
        });

        return row;
      }));

      return Helper.response(
        true,
        "Provinces and facility data retrieved successfully",
        {
          tableData,
          tableColumns: tableHead
        },
        res,
        200
      );
    }
  } catch (error) {
    console.error("DashboardTableData error:", error);
    return Helper.response(false, error?.message || "Internal Server Error", {}, res, 500);
  }
};







exports.health_worker_category = async (req, res) => {
  try {
    const categories = [
      { id: 1, title: "Public Health Professionals", icon: "Emphasis.png" },
      { id: 2, title: "Nursing and Midwifery", icon: "Emphasis-6.png" },
      { id: 3, title: "Doctor in Facility", icon: "Emphasis-4.png" },
      { id: 4, title: "Allied Health Workers", icon: "Emphasis-5.png" },
      { id: 5, title: "Radiology and Diagnostics", icon: "Emphasis-3.png" },
      { id: 6, title: "Paramedics", icon: "Emphasis-2.png" },
      { id: 7, title: "Ayurveda and Traditional Medicine Practitioners", icon: "Emphasis-1.png" },
      { id: 8, title: "Admin and Others", icon: "Emphasis-7.png" },
    ];

    let data = [];

    if (req.body.province_id) {
      const result = await Promise.all(
        categories.map(cat => Helper.getHealthWorkerCategoryProvince(req.body.province_id, cat.id))
      );
      data = categories.map((cat, idx) => ({
        title: cat.title,
        icon: cat.icon,
        count: result[idx][0]?.count ?? 0,
        province_id: req.body.province_id,
        cat_id: cat.id
      }));
    } else if (req.body.district_id) {
      const result = await Promise.all(
        categories.map(cat => Helper.getHealthWorkerCategoryDistrict(req.body.district_id, cat.id))
      );
      data = categories.map((cat, idx) => ({
        title: cat.title,
        icon: cat.icon,
        count: result[idx][0]?.count ?? 0,
        district_id: req.body.district_id,
        cat_id: cat.id
      }));
    } else if (req.body.palika_id) {
      const result = await Promise.all(
        categories.map(cat => Helper.getHealthWorkerCategoryPalika(req.body.palika_id, cat.id))
      );
      data = categories.map((cat, idx) => ({
        title: cat.title,
        icon: cat.icon,
        count: result[idx][0]?.count ?? 0,
        palika_id: req.body.palika_id,
        cat_id: cat.id
      }));
    } else {
      data = await Helper.getHealthWorkerCategory()
    }

    // Send the response at the END
    if (data.length === 0) {
      return Helper.response(false, "No data found", { data }, res, 200);
    }
    return Helper.response(true, "HR Data", { data }, res, 200);

  } catch (error) {
    console.error("Error fetching facility type data:", error);
    return Helper.response(false, "Error fetching facility type data", {}, res, 500);
  }
};



exports.getfacilityByProvince = async (req, res) => {
  try {
    const { id, province_id } = req.body;
    let facilityData = [];
    if (id) {
      facilityData = await Helper.getFacility(id);
    }
    if (province_id) {
      facilityData = await Helper.getFacilityProvince(id, province_id);
    }


    if (!facilityData || facilityData.length === 0) {
      return Helper.response(false, "No facility data found for the given province", {}, res, 200);
    }

    return Helper.response(true, "Facility data by province", { facilityData }, res, 200);
  } catch (err) {
    console.error("Error fetching facility by province:", err);
    return Helper.response(false, "Error fetching facility by province", {}, res, 500);
  }
};


exports.getDistricts = async (req, res) => {
  try {
    const { province_id } = req.body;
    const filePath = path.join(__dirname, '..', '..', '..', 'geograhy', 'nepal-districts-geo.json');
    const data = await Helper.readFile(filePath);
    const realGeojson = data.data ? data.data : data;
    const geograhy = {
      type: realGeojson.type,
      features: realGeojson.features.filter(f =>
        f.properties && f.properties.PROVINCE === province_id
      ),
    };
    return Helper.response(true, "Districts data", geograhy, res, 200);

  } catch (err) {
    console.error("Error fetching district by province:", err);
    return Helper.response(false, "Error fetching district by province", {}, res, 500);
  }
}

exports.getPalika = async (req, res) => {
  try {
    const { district_id } = req.body;
    const filePath = path.join(__dirname, '..', '..', '..', 'geograhy', 'nepal-palika-geo.json');
    const data = await Helper.readFile(filePath);
    const realGeojson = data.data ? data.data : data;

    const geograhy = {
      type: realGeojson.type,
      features: realGeojson.features.filter(f =>
        f.properties && f.properties.dID === parseInt(district_id)
      ),
    };
    return Helper.response(true, "Districts data", geograhy, res, 200);

  } catch (err) {
    console.error("Error fetching district by province:", err);
    return Helper.response(false, "Error fetching district by province", {}, res, 500);
  }
}

exports.getWard = async (req, res) => {
  try {
    const { palika_id } = req.body;
    const filePath = path.join(__dirname, '..', '..', '..', 'geograhy', 'nepal-palika-geo.json');
    const data = await Helper.readFile(filePath);
    const realGeojson = data.data ? data.data : data;

    const geograhy = {
      type: realGeojson.type,
      features: realGeojson.features.filter(f =>
        f.properties && f.properties.aID == palika_id
      ),
    };
    return Helper.response(true, "Palika data", geograhy, res, 200);

  } catch (err) {
    console.error("Error fetching district by province:", err);
    return Helper.response(false, "Error fetching district by province", {}, res, 500);
  }
}


exports.getVaccineProgramDD = async (req, res) => {
  try {
    const vaccineProgramData = await VaccineProgram.findAll({
      where: {
        is_active: true
      }
    });

    if (!vaccineProgramData || vaccineProgramData.length === 0) {
      return Helper.response(false, "No vaccine program data found", [], res, 200);
    }

    // Map program name to actual DB columns
    const programColumnMap = {
      bcg: { columns: ['bcg'], type: 'trend', label: 'BCG' },
      opv: { opened: 'opv1', used: 'opv3', type: 'wastage', label: 'OPV' },
      pcv: { opened: 'pcv1', used: 'pcv3', type: 'wastage', label: 'PCV' },
      rota: { opened: 'rota1', used: 'rota3', type: 'wastage', label: 'Rota' },
      'dpt-hepb-hib': { opened: 'dpt1', used: 'dpt3', type: 'wastage', label: 'DPT-HepB-Hib' },
      fipv: { opened: 'fipv1', used: 'fipv3', type: 'wastage', label: 'FIPV' },
      je: { opened: 'je1', used: 'je2', type: 'wastage', label: 'JE' },
      td: { opened: 'td1', used: 'td2', type: 'wastage', label: 'TD' },
      tcv: { opened: 'tcv1', used: 'tcv2', type: 'wastage', label: 'TCV' },
      hpv: { opened: 'hpv1', used: 'hpv2', type: 'wastage', label: 'HPV' },
      'measles/rubella': { columns: ['mr_9_11m', 'mr_12_23m'], type: 'trend', label: 'Measles/Rubella' },
      'fully immunized': { columns: ['fully_immunized'], type: 'trend', label: 'Fully Immunized' }
    };

    const data = vaccineProgramData.map(r => {
      const value = r.name.toLowerCase();
      const config = programColumnMap[value];

      return {
        value,
        label: r.name,
        ...config
      };
    });

    return Helper.response(true, "Vaccine program data", data, res, 200);

  } catch (err) {
    console.error("Error fetching vaccine program:", err);
    return Helper.response(false, "Server Error", {}, res, 500);
  }
};

exports.health_workerdata_by_cat = async (req, res) => {
  try {

    let data;
    let emp_worker_data
    if (req.body.province_id && req.body.cat_id) {
      emp_worker_data = await sequelize.query(`
  SELECT hwd.name as emp_name,hwd.gender,hwd.group,hwd.post,hwd.qualification,hwc.name,dm.districtname FROM districtmaster dm
JOIN location_district ld on ld.code = dm.districtid::text 
JOIN health_worker_data hwd on hwd.employee_district_id = ld.id
JOIN health_worker_category hwc on hwd.category_id = hwc.id
JOIN provincemaster pm on pm.provinceid = dm.fk_provinceid
WHERE dm.fk_provinceid = :province_id and hwc.id = :cat

`, {
        replacements: { province_id: req.body.province_id, cat: req.body.cat_id },
        type: sequelize.QueryTypes.SELECT
      });
    }
    else if (req.body.district_id && req.body.cat_id) {
      emp_worker_data = await sequelize.query(`SELECT hwd.name as emp_name,hwd.gender,hwd.group,hwd.post,hwd.qualification,hwc.name,dm.districtname FROM districtmaster dm
JOIN location_district ld on ld.code = dm.districtid::text 
JOIN health_worker_data hwd on hwd.employee_district_id = ld.id
JOIN health_worker_category hwc on hwd.category_id = hwc.id
JOIN provincemaster pm on pm.provinceid = dm.fk_provinceid
WHERE dm.districtid =:district_id and hwc.id = :cat`, {
        replacements: { district_id: req.body.district_id, cat: req.body.cat_id },
        type: sequelize.QueryTypes.SELECT
      })
    } else if (req.body.palika_id && req.body.cat_id) {
      emp_worker_data = await sequelize.query(`SELECT hwd.name as emp_name,hwd.gender,hwd.group,hwd.post,hwd.qualification,hwc.name,dm.districtname FROM districtmaster dm
JOIN location_district ld on ld.code = dm.districtid::text 
JOIN health_worker_data hwd on hwd.employee_district_id = ld.id
JOIN health_worker_category hwc on hwd.category_id = hwc.id
JOIN provincemaster pm on pm.provinceid = dm.fk_provinceid
JOIN location_municipality lm on lm.id = hwd.employee_municipality_id
JOIN palikamaster pms on lm.code = pms.palikaid::text
WHERE hwc.id = :cat and pms.palikaid = :palika_id`, {
        replacements: { palika_id: req.body.palika_id, cat: req.body.cat_id },
        type: sequelize.QueryTypes.SELECT
      })
    }
    else {
      emp_worker_data = await sequelize.query(`
  SELECT hwd.name as emp_name,hwd.gender,hwd.group,hwd.post,hwd.qualification,hwc.name,dm.districtname FROM health_worker_data hwd
JOIN location_district ld on hwd.employee_district_id =  ld.id
JOIN districtmaster dm on ld.code = dm.districtid::text
JOIN health_worker_category hwc on hwc.id = hwd.category_id
where hwd.category_id = :cat
`, {
        replacements: { cat: req.body.cat_id },
        type: sequelize.QueryTypes.SELECT
      });
    }
    data = emp_worker_data.map((r) => {
      return {
        emp_name: 'xxxxxxxx',
        gender: r.gender,
        group: r.group,
        post: r.post,
        qualification: r.qualification,
        name: r.name,
        district_name: r.districtname
      }
    });
    return Helper.response(true, "Health worker data", data, res, 200);
  } catch (error) {
    console.error("Error fetching vaccine program:", error);
    return Helper.response(false, "Server Error", {}, res, 500);
  }
}
