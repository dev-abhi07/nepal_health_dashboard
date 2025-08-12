const { Op } = require("sequelize");
const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const facility = require("../../models/facility");
const province_master = require("../../models/provincemaster");
const district_master = require("../../models/districtmaster");
const palika_master = require("../../models/pailikamaster");
const ward_master = require("../../models/wardmaster");
const facilitytypemaster = require("../../models/facilitytypemaster");


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
        const achievements = ['90% Rota Vaccine Coverage','80% BCG Vaccine Coverage','90% Rota Vaccine Coverage']
        return Helper.response(true, "Facility counts retrieved successfully", {totalFacility,achievements}, res, 200);
    } catch (error) {
        console.error("Error fetching facility counts:", error);
        return Helper.response(false, error.message, {}, res, 500);
    }
};

exports.totalpopulation = async(req,res)=>{
    try{
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
          
           

       return Helper.response(true, "Total population retrieved successfully", {responnseData}, res, 200);

    }catch(err){
        console.error("Error fetching total population:", err);
        return Helper.response(false, err.message, {}, res, 500);
    }
}

// exports.facilityDetails = async (req, res) => {
//   try {
//     const { facility_type, palikaid } = req.body;
    
   
//     const whereClause = `
//   WHERE f.fk_facilitytype = ${facility_type}
//     AND f.fk_palikaid = ${palikaid}
// `;

// const query = `
//   SELECT 
//   fa.facilitytype,
//   fa.image,
//   fa.color_code,
//   pa.palikaname,
//   d.districtname,
//   p.province,
//   f.facilityname,
//   f.fk_facilitycode
// FROM facility AS f
// JOIN facilitytypemaster AS fa ON fa.id = f.fk_facilitytype
// JOIN provincemaster AS p ON p.provinceid = f.fk_provinceid
// JOIN districtmaster AS d ON d.districtid = f.fk_districtid
// JOIN palikamaster AS pa ON pa.palikaid = f.fk_palikaid
// JOIN wardmaster AS w ON w.wardid = f.fk_wardid
// ${whereClause}
// `;

// console.log('query',query)

// const results = await sequelize.query(query, {
//   type: sequelize.QueryTypes.SELECT
// });

// console.log('results',results)

// return Helper.response(true, "Facility details fetched", results, res, 200);

// //     let whereClause = 'WHERE f.fk_facilitytype = :facility_type';
// //     let replacements = { facility_type: parseInt(facility_type) };

// //     if (province_id) {
// //       whereClause += ' AND f.fk_provinceid = :province_id';
// //       replacements.province_id = province_id;
// //     }

// //     if (district_id) {
// //       whereClause += ' AND f.fk_districtid = :district_id';
// //       replacements.district_id = district_id;
// //     }

// //     if (palika_id) {
// //       whereClause += ' AND f.fk_palikaid = :palika_id';
// //       replacements.palika_id = palika_id;
// //     }
    

// //     // Log the query with actual replacements
// //     const rawQuery = `
      
// //   SELECT 
// //   fa.facilitytype as facility_type,
// //   fa.image,
// //   f.services as services,
// //   fa.color_code,
// //   pa.palikaname as palika_name,
// //   d.districtname as district_name,
// //   p.province as province_name,

// //   f.facilityname as facility_name,
// //   f.fk_facilitycode as facility_code
// // FROM facility AS f
// // JOIN facilitytypemaster AS fa ON fa.id = f.fk_facilitytype
// // JOIN provincemaster AS p ON p.provinceid = f.fk_provinceid
// // JOIN districtmaster AS d ON d.districtid = f.fk_districtid
// // JOIN palikamaster AS pa ON pa.palikaid = f.fk_palikaid
// // JOIN wardmaster AS w ON w.wardid = f.fk_wardid
// // ${whereClause}
// //     `;

// //     console.log("WHERE clause:", whereClause);
// //     console.log("Replacements:", replacements);

// //     const data = await sequelize.query(rawQuery, {
// //       replacements,
// //       type: sequelize.QueryTypes.SELECT,
// //     });

// //     return Helper.response(true, "Facility details fetched", data, res, 200);
//   } catch (err) {
//     console.error("Error fetching facility details:", err);
//     return Helper.response(false, err.message, {}, res, 500);
//   }
// };



exports.facilityDetails = async (req, res) => {
  try{
    const whereClause = {
      where:{
        fk_facilitytype: req.body?.facility_id,
        isdeleted: 0 
      },
      
    }
    if(req.body?.district_id){
      whereClause.where.fk_districtid = req.body.district_id
    }
    if(req.body?.province_id){
      whereClause.where.fk_provinceid = req.body.province_id
    }
    if(req.body?.palika_id){
      whereClause.where.fk_palikaid = req.body.palika_id
    }
    if(req.body?.ward_id){
      whereClause.where.fk_wardid = req.body.ward_id
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
      attributes: ['id', 'facilitytype','image','color_code']
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

  


  

    const responseData = facilityDetails.map((item) => {
      return {
        facility_name: item.facilityname,
        facility_code: item.fk_facilitycode,
        services: item.services,
        district_name: districtMap[item.fk_districtid],
        province_name: provinceMap[item.fk_provinceid],
        palika_name: palikaMap[item.fk_palikaid],
        ward_name: wardMap[item.fk_wardid],
        facility_type: facilityTypeMap[item.fk_facilitytype]?.facilitytype,
        facility_type_image: facilityTypeMap[item.fk_facilitytype]?.image,
        color_code: facilityTypeMap[item.fk_facilitytype]?.color_code,
      }
    })


    return Helper.response(true, "Facility details fetched", responseData, res, 200);
  
      
  }catch(err){
    console.error("Error fetching facility details:", err);
    return Helper.response(false, err.message, {}, res, 500);
  }
}

exports.facilityAuthorityDD = async (req, res) => {
  try{
    const query = `
SELECT DISTINCT f."authoritylevel"
FROM facility AS f
WHERE f."authoritylevel" IS NOT NULL
  AND f."authoritylevel" <> '0'
  AND TRIM(f."authoritylevel") <> '';`

const results = await sequelize.query(query, {
  type: sequelize.QueryTypes.SELECT
});

const data  = results.map(item=>(
  {
    value: item.authoritylevel,
    label: item.authoritylevel
  }
))

return Helper.response(true, "Facility authority level fetched",{authorityLevel:data}, res, 200);

  }catch(err){
    console.error("Error fetching facility authority level:", err);
    return Helper.response(false, err.message, {}, res, 500);
  }
}
  

