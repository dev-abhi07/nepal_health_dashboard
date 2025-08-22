const { Op } = require("sequelize");
const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const facility = require("../../models/facility");
const facilitytypemaster = require("../../models/facilitytypemaster");
const province_master = require("../../models/provincemaster");
const district_master = require("../../models/districtmaster");
const palika_master = require("../../models/pailikamaster");
const WardMaster = require("../../models/wardmaster");


// exports.facilityReport = async (req, res) => {
//     try {
//       let { facility_id, province_id, district_id, authority_level } = req.body;
  
//       // Ensure facility_id is always an array if provided
//       if (facility_id && !Array.isArray(facility_id)) {
//         facility_id = [facility_id];
//       }
  
//       // Base where condition
//       const wherecondition = {
//         where: {
//           isdeleted: 0
//         }
//       };
  
//       if (facility_id) {
//         wherecondition.where.fk_facilitytype = { [Op.in]: facility_id };
//       }
//       if (province_id) {
//         wherecondition.where.fk_provinceid = province_id;
//       }
//       if (district_id) {
//         wherecondition.where.fk_districtid = district_id;
//       }
//     //   if (palika_id) {
//     //     wherecondition.where.fk_palikaid = palika_id;
//     //   }
//     //   if (ward_id) {
//     //     wherecondition.where.fk_wardid = ward_id;
//     //   }
//       if (authority_level) {
//         wherecondition.where.authoritylevel = authority_level;
//       }
  
//       // Query facilities
//       const facilitydata = await facility.findAll(wherecondition);
  
//       // Map & fetch related data
//       const data = await Promise.all(
//         facilitydata.map(async (r) => {
//           const facilitytypedt = await facilitytypemaster.findOne({
//             where: { id: r?.fk_facilitytype, isdeleted: 0 }
//           });
  
//           const province = await province_master.findOne({
//             where: { provinceid: r?.fk_provinceid, isdeleted: 0 }
//           });
  
//           const district = await district_master.findOne({
//             where: { districtid: r?.fk_districtid, isdeleted: 0 }
//           });
  
//           const palika = await palika_master.findOne({
//             where: { palikaid: r?.fk_palikaid, isdeleted: 0, fk_provinceid:r?.fk_provinceid,fk_districtid:r?.fk_districtid}
//           });
  
//           const ward = await WardMaster.findOne({
//             where: { wardid: r?.fk_wardid, isdeleted: 0 }
//           });
  
//           const [result] = await sequelize.query(
//             "SELECT facilitycode FROM facilitycodemaster WHERE id = :id",
//             {
//               replacements: { id: r?.fk_facilitycode },
//               type: sequelize.QueryTypes.SELECT
//             }
//           );
  
//           return {
//             facilityname: r.facilityname,
//             facilitytype: facilitytypedt?.facilitytype,
//             province: province?.province,
//             districtname: district?.districtname,
//             palikaname: palika?.palikaname,
//             wardname: `ward ${ward?.wardname}`,
//             facilitycode: result?.facilitycode || null,
//             lat: r?.latitude,
//             long: r?.longitude,
//             authority_level: r?.authoritylevel
//           };
//         })
//       );
  
//       return Helper.response(true, "Facility fetched successfully", { data }, res, 200);
//     } catch (error) {
//       console.error("Error fetching facility:", error);
//       return Helper.response(false, "Error fetching facility", {}, res, 500);
//     }
//   };
  

exports.facilityReport = async (req, res) => {
  try {
    let {
      facility_id,
      province_id,
      district_id,
      authority_level,
      page = 1,
      limit = 20
    } = req.body;
 
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    const offset = (page - 1) * limit;
 
    // Normalize facility_id as array
    if (facility_id && !Array.isArray(facility_id)) {
      facility_id = [facility_id];
    }
 
    // Base condition (default to fetch all non-deleted)
    const where = { isdeleted: 0 };
 
    // Apply filters **only if provided and meaningful**
    if (facility_id && facility_id.length > 0) {
      where.fk_facilitytype = { [Op.in]: facility_id };
    }
 
    if (province_id !== null && province_id !== undefined) {
      where.fk_provinceid = province_id;
    }
 
    if (district_id !== null && district_id !== undefined) {
      where.fk_districtid = district_id;
    }
 
    if (authority_level !== null && authority_level !== undefined) {
      where.authoritylevel = authority_level;
    }
 
    // Paginated result
    const { rows: facilitydata, count: totalRecords } = await facility.findAndCountAll({
      where,
      offset,
      limit,
      order: [['id', 'DESC']]
    });
 
    // Enrich response
    const data = await Promise.all(
      facilitydata.map(async (r) => {
        const facilitytypedt = await facilitytypemaster.findOne({
          where: { id: r?.fk_facilitytype, isdeleted: 0 }
        });
 
        const province = await province_master.findOne({
          where: { provinceid: r?.fk_provinceid, isdeleted: 0 }
        });
 
        const district = await district_master.findOne({
          where: { districtid: r?.fk_districtid, isdeleted: 0 }
        });
 
        const palika = await palika_master.findOne({
          where: {
            palikaid: r?.fk_palikaid,
            isdeleted: 0,
            fk_provinceid: r?.fk_provinceid,
            fk_districtid: r?.fk_districtid
          }
        });
 
        const ward = await WardMaster.findOne({
          where: { wardid: r?.fk_wardid, isdeleted: 0 }
        });
 
        const [result] = await sequelize.query(
          "SELECT facilitycode FROM facilitycodemaster WHERE id = :id",
          {
            replacements: { id: r?.fk_facilitycode },
            type: sequelize.QueryTypes.SELECT
          }
        );
 
        return {
          facilityname: r.facilityname,
          facilitytype: facilitytypedt?.facilitytype,
          province: province?.province,
          districtname: district?.districtname,
          palikaname: palika?.palikaname,
          wardname: ward?.wardname ? `ward ${ward?.wardname}` : null,
          facility_code: result?.facilitycode || null,
          lat: r?.latitude,
          long: r?.longitude,
          authority_level: r?.authoritylevel,
          color_code: facilitytypedt.color_code
        };
      })
    );
 
    const totalPages = Math.ceil(totalRecords / limit);
 
    return Helper.response(true, "Facility fetched successfully", {
      data,
      pagination: {
        totalRecords,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    }, res, 200);
  } catch (error) {
    console.error("Error fetching facility:", error);
    return Helper.response(false, "Error fetching facility", {}, res, 500);
 
  }
 
}
 
  