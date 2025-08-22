const { Op } = require("sequelize");
const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const facility = require("../../models/facility");
const province_master = require("../../models/provincemaster");
const district_master = require("../../models/districtmaster");
const palika_master = require("../../models/pailikamaster");
const ward_master = require("../../models/wardmaster");
const facilitytypemaster = require("../../models/facilitytypemaster");
const VaccineWarehouse = require("../../models/VaccineWarehouse");


exports.getProvincesFacilityCounts = async (req, res) => {
  try {
    const provinceId = req.body.province_id

    const totalFacility = await sequelize.query(
      'SELECT * FROM get_facility_counts_by_province(:provinceId)',
      {
        replacements: { provinceId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    const achievements = ['90% Rota Vaccine Coverage', '80% BCG Vaccine Coverage', '90% Rota Vaccine Coverage']
    return Helper.response(true, "Facility counts retrieved successfully", { totalFacility, achievements }, res, 200);
  } catch (error) {
    console.error("Error fetching facility counts:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.totalpopulation = async (req, res) => {
  try {
    const childrenZeroTo14Years = await sequelize.query(
      'select sum(pop00to14years) from population_stats',
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const childrenZeroTo5years = await sequelize.query(
      'select sum(pop00to59months) from population_stats',
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

    const responnseData = {

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

          "label": "Upto 5 Years " + childrenZeroTo5years[0].sum,

          "dotColor": "#dc143c"

        },

        {

          "label": "5-14 Years " + totalDifference,

          "dotColor": "#003893"

        }

      ]

    }



    return Helper.response(true, "Total population retrieved successfully", { responnseData }, res, 200);

  } catch (err) {
    console.error("Error fetching total population:", err);
    return Helper.response(false, err.message, {}, res, 500);
  }
}




exports.facilityDetails = async (req, res) => {
  try {
    const whereClause = {
      where: {
        fk_facilitytype: req.body?.facility_id,
        isdeleted: 0
      },

    }


    if (req.body?.district_id) {
      whereClause.where.fk_districtid = req.body.district_id
    }
    if (req.body?.province_id) {
      whereClause.where.fk_provinceid = req.body.province_id
    }
    if (req.body?.palika_id) {
      whereClause.where.fk_palikaid = req.body.palika_id
    }
    if (req.body?.ward_id) {
      whereClause.where.fk_wardid = req.body.ward_id
    }

    if (req.body?.authority_level) {
      whereClause.where.authoritylevel = req.body.authority_level;
    }



    const facilityDetails = await facility.findAll(whereClause)
    const districtIds = [...new Set(facilityDetails.map((item) => item.fk_districtid))]
    const provinceIds = [...new Set(facilityDetails.map((item) => item.fk_provinceid))]
    const palikaIds = [...new Set(facilityDetails.map((item) => item.fk_palikaid))]
    const wardIds = [...new Set(facilityDetails.map((item) => item.fk_wardid))]
    const facilityTypeIds = [...new Set(facilityDetails.map((item) => item.fk_facilitytype))]


    const districtData = await district_master.findAll({
      where: {
        districtid: { [Op.in]: districtIds }
      },
      attributes: ['districtid', 'districtname']
    })
    const provinceData = await province_master.findAll({
      where: {
        provinceid: { [Op.in]: provinceIds }
      },
      attributes: ['provinceid', 'province']
    })
    const palikaData = await palika_master.findAll({
      where: {
        palikaid: { [Op.in]: palikaIds }
      },
      attributes: ['palikaid', 'palikaname']
    })
    const wardData = await ward_master.findAll({
      where: {
        wardid: { [Op.in]: wardIds }
      },
      attributes: ['wardid', 'wardname']
    })
    const facilityTypeData = await facilitytypemaster.findAll({
      where: {
        id: { [Op.in]: facilityTypeIds }
      },
      attributes: ['id', 'facilitytype', 'image', 'color_code']
    })

    const districtMap = {}
    const provinceMap = {}
    const palikaMap = {}
    const wardMap = {}
    const facilityTypeMap = {}

    districtData.forEach((item) => {
      districtMap[item.districtid] = item.districtname
    })
    provinceData.forEach((item) => {
      provinceMap[item.provinceid] = item.province
    })
    palikaData.forEach((item) => {
      palikaMap[item.palikaid] = item.palikaname
    })
    wardData.forEach((item) => {
      wardMap[item.wardid] = 'Ward ' + "" + item.wardname
    })
    facilityTypeData.forEach((item) => {
      facilityTypeMap[item.id] = {
        facilitytype: item.facilitytype,
        image: item.image,
        color_code: item.color_code
      }
    })






    const responseData = await Promise.all(facilityDetails.map(async (item) => {
      const [result] = await sequelize.query(
        'SELECT facilitycode FROM facilitycodemaster WHERE id = :id',
        {
          replacements: { id: item.fk_facilitycode },
          type: sequelize.QueryTypes.SELECT
        }
      );

      return {
        facility_name: item.facilityname,
        facility_code: result.facilitycode,
        services: item.f_services,
        district_name: districtMap[item.fk_districtid],
        province_name: provinceMap[item.fk_provinceid],
        palika_name: palikaMap[item.fk_palikaid],
        ward_name: wardMap[item.fk_wardid],
        facility_type: facilityTypeMap[item.fk_facilitytype]?.facilitytype,
        facility_type_image: facilityTypeMap[item.fk_facilitytype]?.image,
        color_code: facilityTypeMap[item.fk_facilitytype]?.color_code,
        lat: item?.latitude,
        long: item?.longitude,
        authority_level: item?.authoritylevel
      }
    }))


    return Helper.response(true, "Facility details fetched", responseData, res, 200);


  } catch (err) {
    console.error("Error fetching facility details:", err);
    return Helper.response(false, err.message, {}, res, 500);
  }
}

exports.facilityAuthorityDD = async (req, res) => {
  try {
    const query = `
SELECT DISTINCT f."authoritylevel"
FROM facility AS f
WHERE f."authoritylevel" IS NOT NULL
  AND f."authoritylevel" <> '0'
  AND TRIM(f."authoritylevel") <> '';`

    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    const data = results.map(item => (
      {
        value: item.authoritylevel,
        label: item.authoritylevel
      }
    ))

    return Helper.response(true, "Facility authority level fetched", { authorityLevel: data }, res, 200);

  } catch (err) {
    console.error("Error fetching facility authority level:", err);
    return Helper.response(false, error.message, {}, res, 500);
  }
}

exports.getFacilityDetails = async (req, res) => {
  try {
    let facilities
    if (req.body.facility_code) {
      [facilities] = await sequelize.query(`
SELECT fc.*,ftm.facilitytype
  FROM facility fc
  JOIN facilitycodemaster fcm ON fc.fk_facilitycode = fcm.id
   JOIN facilitytypemaster ftm on ftm.id = fc.fk_facilitytype
  WHERE fcm.facilitycode = :code
`, {
        replacements: { code: req.body.facility_code },
        type: sequelize.QueryTypes.SELECT
      });
    } else {
      [facilities] = await sequelize.query(`
SELECT fc.*,fcm.facilitycode,ftm.facilitytype
  FROM facility fc
  JOIN facilitycodemaster fcm ON fc.fk_facilitycode = fcm.id
   JOIN facilitytypemaster ftm on ftm.id = fc.fk_facilitytype
  WHERE fc.fk_facilitycode = :code
`, {
        replacements: { code: req.body.id },
        type: sequelize.QueryTypes.SELECT
      });



    }
    const province = await province_master.findOne({ where: { provinceid: facilities.fk_provinceid } })
    const district = await district_master.findOne({ where: { districtid: facilities.fk_districtid } })
    const wards = await ward_master.findOne({ where: { wardid: facilities.fk_wardid } })
    const palika = await palika_master.findOne({
      where: {
        palikaid: facilities.fk_palikaid
      },
      logging: true
    })
    const facility = {
      provincename: province.province,
      district_name: district.districtname,
      wardname: `${wards?.wardname ? wards?.wardname : ''}`,
      facility_code: req.body.facility_code ? req.body.facility_code : facilities.facilitycode,
      full_location: `${province.province}, ${Helper.capitalizeFirst(district.districtname)} ${palika?.palikaname ? palika?.palikaname + ' ,' : ''}${wards?.wardname ? 'Ward ' + wards?.wardname : ''}`,
      ...facilities
    }
    const categories = [
      { id: 1, title: "Public Health Professionals", icon: "Emphasis.png" },
      { id: 2, title: "Nursing and Midwifery", icon: "Emphasis-6.png" },
      { id: 3, title: "Doctor in Facility", icon: "Emphasis-4.png" },
      { id: 4, title: "Allied Health Workers", icon: "Emphasis-5.png" },
      { id: 5, title: "Radiology and Diagnostics", icon: "Emphasis-3.png" },
      { id: 6, title: "Paramedics", icon: "Emphasis-2.png" },
      {
        id: 7,
        title: "Ayurveda and Traditional Medicine Practitioners",
        icon: "Emphasis-1.png",
      },
      { id: 8, title: "Admin and Others", icon: "Emphasis-7.png" },
    ];

    let healthWorkerData = []
    let query = ''

    if (req.body?.facility_code) {
      query = `
    SELECT hw.name,hwd.post,fcm.id,count(hwd."post") FROM health_worker_data hwd
INNER JOIN facilitycodemaster fcm on fcm.id = hwd.fk_facilitycode
INNER JOIN health_worker_category as hw on hwd.category_id = hw.id
INNER JOIN facility f on f.fk_facilitycode = fcm.id
WHERE fcm.facilitycode=:code
group by hw.name,hwd.post,fcm.id
   `

      healthWorkerData = await sequelize.query(query, {
        replacements: { code: req.body.facility_code },
        type: sequelize.QueryTypes.SELECT
      })

    } else {
      query = `
    SELECT hw.name,hwd.post,fcm.id,count(hwd."post") FROM health_worker_data hwd
INNER JOIN facilitycodemaster fcm on fcm.id = hwd.fk_facilitycode
INNER JOIN health_worker_category as hw on hwd.category_id = hw.id
INNER JOIN facility f on f.fk_facilitycode = fcm.id
WHERE fcm.id=:id
group by hw.name,hwd.post,fcm.id
   `

      healthWorkerData = await sequelize.query(query, {
        replacements: { id: req.body.id },
        type: sequelize.QueryTypes.SELECT
      })
    }

    // categoryMap and categories as above
    const grouped = {};

    healthWorkerData.forEach(row => {
      const catTitle = row.name;
      if (!grouped[catTitle]) grouped[catTitle] = [];
      grouped[catTitle].push({
        name: row.post,
        pk_designationid: null,
        count: String(row.count ?? '0'),
        hrmscount: "0"
      });
    });

    const fallbackData = {
      1: { // Ayurveda
        "Ayurveda and Traditional Medicine Practitioners": [
          { name: "Ayurveda Health Assistant", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Allied Health Workers": [
          { name: "Compounder/Dispenser", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Admin and Others": [
          { name: "Office Assistant", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Paramedics": [
          { name: "Health Assistant (HA)", pk_designationid: null, count: "1", hrmscount: "0" }
        ]
      },
      2: { // Basic
        "Allied Health Workers": [
          { name: "Auxiliary Health Worker (AHW)", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Nursing and Midwifery": [
          { name: "Auxiliary Nurse Midwife (ANM)", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Admin and Others": [
          { name: "Office Assistant", pk_designationid: null, count: "1", hrmscount: "0" }
        ]
      },
      3: { // Laboratory
        "Radiology and Diagnostics": [
          { name: "Lab Assistant", pk_designationid: null, count: "1", hrmscount: "0" },
          { name: "X-ray Technician", pk_designationid: null, count: "1", hrmscount: "0" }
        ]
      },
      4: { // Primary
        "Doctor in Facility": [
          { name: "Medical Doctor", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Paramedics": [
          { name: "Health Assistants (HAs)", pk_designationid: null, count: "2", hrmscount: "0" }
        ],
        "Nursing and Midwifery": [
          { name: "Staff Nurses", pk_designationid: null, count: "3", hrmscount: "0" },
          { name: "Auxiliary Nurse Midwife (ANM)", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Allied Health Workers": [
          { name: "Auxiliary Health Worker (AHW)", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Radiology and Diagnostics": [
          { name: "Lab Assistant", pk_designationid: null, count: "1", hrmscount: "0" }
        ],
        "Admin and Others": [
          { name: "Office Assistant", pk_designationid: null, count: "1", hrmscount: "0" }
        ]
      },
      5: { // Private
        "Doctor in Facility": [
          { name: "Specialists (Medicine, Surgery, Pediatrics, Obstetrics/Gynecology)", pk_designationid: null, count: "6", hrmscount: "0" },
          { name: "Medical Officers", pk_designationid: null, count: "5", hrmscount: "0" }
        ],
        "Nursing and Midwifery": [
          { name: "Nurses", pk_designationid: null, count: "20", hrmscount: "0" }
        ],
        "Paramedics": [
          { name: "Paramedics", pk_designationid: null, count: "12", hrmscount: "0" }
        ]
      },
      6: { // Secondary
        "Doctor in Facility": [
          { name: "Specialists (Medicine, Surgery, Pediatrics, Obstetrics/Gynecology)", pk_designationid: null, count: "6", hrmscount: "0" },
          { name: "Medical Officers", pk_designationid: null, count: "5", hrmscount: "0" }
        ],
        "Nursing and Midwifery": [
          { name: "Nurses", pk_designationid: null, count: "20", hrmscount: "0" }
        ],
        "Paramedics": [
          { name: "Paramedics", pk_designationid: null, count: "12", hrmscount: "0" }
        ]
      },
      7: { // Tertiary
        "Doctor in Facility": [
          { name: "Specialists & Super-specialists", pk_designationid: null, count: "30", hrmscount: "0" },
          { name: "Professors/Associate Professors/Lecturers", pk_designationid: null, count: "20", hrmscount: "0" },
          { name: "Medical Officers & Residents", pk_designationid: null, count: "30", hrmscount: "0" }
        ],
        "Nursing and Midwifery": [
          { name: "Nurses (general & specialized)", pk_designationid: null, count: "100", hrmscount: "0" }
        ],
        "Paramedics": [
          { name: "Paramedics & Allied Health Workers", pk_designationid: null, count: "50", hrmscount: "0" }
        ],
        "Radiology and Diagnostics": [
          { name: "Lab technologists, radiographers", pk_designationid: null, count: "15", hrmscount: "0" }
        ],
        "Admin and Others": [
          { name: "Administrative & Support staff", pk_designationid: null, count: "10", hrmscount: "0" }
        ],
        "Public Health Professionals": [
          { name: "Cold chain supervisor", pk_designationid: null, count: "1", hrmscount: "0" }
        ]
      }
    };


    const hrData = categories.map(cat => {
      let doctorList = [];
      doctorList = grouped[cat.title] || [];
      if (doctorList.length === 0) {
        const typeFallback = fallbackData[facilities.fk_facilitytype] || {};
        doctorList = typeFallback[cat.title] || [];
      }


      const totalCount = doctorList.reduce((sum, d) => sum + Number(d.count ?? 0), 0);

      return {
        id: cat.id,
        isOpen: false,
        title: cat.title,
        icon: cat.icon,
        doctorList,
        count: totalCount,
        hrmscount: 0,
      };
    });
    return Helper.response(true, "Facility Details", { facility: facility, hrData: hrData }, res, 200);
  } catch (error) {
    console.error("Error fetching facility authority level:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
}


exports.getHealthFacilityTypeData = async (req, res) => {
  const { id, facility_image } = req.body;

  let whereClause = {
    fk_facilitytype: id,
    isdeleted: 0
  }
  const whereCondition = {}
  if (req.body?.authority_level) {
    whereClause.authoritylevel = req.body?.authority_level

  }
  if (req.body.province_id) {
    whereClause.fk_provinceid = req.body.province_id
    whereCondition.province_id = req.body.province_id
  }
  if (req.body.district_id) {
    whereClause.fk_districtid = req.body.district_id
    whereCondition.district_id = req.body.district_id
  }
  if (req.body.palika_id) {
    whereClause.fk_palikaid = req.body.palika_id
    whereCondition.palika_id = req.body.palika_id
  }
  try {
    const facilitytypeData = await facility.findAll({
      where: whereClause
    })
    let data;

    if (req.body.facility_type == "Warehouse") {
      const warehousedata = await VaccineWarehouse.findAll({
        where: whereCondition,
        raw: true
      })

      const facilitytypeId = warehousedata.map((r) => r.facilitytype_id)
      const facilitytypeData = await facilitytypemaster.findAll({
        where: {
          id: { [Op.in]: facilitytypeId }
        },
        attributes: ['id', 'facilitytype', 'image', 'color_code']
      })


      data = warehousedata.map((r) => {


        return {
          id: r.id,
          facilityname: r.centre_name,
          latitude: r.latitude || 0.00000,
          longitude: r.longitude || 0.0000,
          facility_image: facility_image,
          facilityType: facilitytypeData?.find((item) => item.id === r.facilitytype_id)?.facilitytype,
        }
      })
    } else {
      data = facilitytypeData.map((r) => {


        return {
          id: r.fk_facilitycode,
          facilityname: r.facilityname,
          latitude: r.latitude || 0.00000,
          longitude: r.longitude || 0.0000,
          facility_image: facility_image
        }
      })

    }



    return Helper.response(true, "Facility Type Data", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching facility type data:", error);
    return Helper.response(false, "Error fetching facility type data", {}, res, 500);
  }

}



exports.vaccineData = async (req, res) => {
  try {
    const vaccineNames = [
      "bOPV 10 dose #",
      "Rota virus vaccine (Rotarix liquid mono pack) #",
      "B.C.G. 20 Dose #",
      "Japanese Encephalitis 5 Dose #",
      "Typhoid Conjugate Vaccine (TCV) #",
      "Measles + Rubella 10 Dose #",
      "Td Vaccine 10 Dose #",
      "Janssen COVID-19 Vaccine 5 Dose #",
      "PCV 10- 4 Dose #",
      "Inactivated Polio Vaccine (IPV) 1 Dose ",
      "DPT + Hep B + Hib 10 Dose #"
    ];

    const vaccinePlaceholders = vaccineNames.map(() => '?').join(',');

    const query = `
    select vaccine_name from vaccine_storage
    where vaccine_name IN (${vaccinePlaceholders})
    group by vaccine_name
    `

    const result = await sequelize.query(query, {
      replacements: [...vaccineNames],
      type: sequelize.QueryTypes.SELECT
    });

    const data = result.map((r) => {
      return {
        vaccine_name: r.vaccine_name,
        count: 0
      }
    })

    return Helper.response(true, "Vaccine Data", data, res, 200);

  } catch (err) {
    console.error("Error fetching vaccine data:", err);
    return Helper.response(false, "Error fetching vaccine data", {}, res, 500);
  }
}


