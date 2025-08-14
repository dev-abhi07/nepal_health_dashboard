const Helper = require("../../helper/helper");
const district_master = require("../../models/districtmaster");
const palika_master = require("../../models/pailikamaster");
const province_master = require("../../models/provincemaster");
const WardMaster = require("../../models/wardmaster");
const { Op, Sequelize } = require('sequelize')


exports.provinces = async (req, res) => {
  try {
    const provinces = await province_master.findAll({
      where: {
        isdeleted: 0
      },
      order: [['province', 'ASC']]
    });
    if (!provinces || provinces.length === 0) {
      return Helper.response(false, "No provinces found", {}, res, 404);
    }
    const data = await Promise.all(provinces.map((r) => {
      return {
        provinceid: r.provinceid,
        province: r.province,
        value: r.provinceid,
        label: r.province

      }
    }))
    return Helper.response(true, "Provinces fetched successfully", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return Helper.response(false, "Error fetching provinces", {}, res, 500);
  }
}

exports.district = async (req, res) => {
  try {
    const district = await district_master.findAll({
      where: {
        isdeleted: 0
      },
      order: [['districtname', 'ASC']]
    });
    if (!district || district.length === 0) {
      return Helper.response(false, "No provinces found", {}, res, 404);
    }
    const data = await Promise.all(district.map(async (r) => {
      const province = await province_master.findOne({ where: { provinceid: r.fk_provinceid } })
      console.log(province, "f")
      return {
        districtid: r.districtid,
        fk_provinceid: r.fk_provinceid,
        district_name: r.districtname,
        province_name: province.province,
        value: r.districtid,
        label: r.districtname

      }
    }))
    return Helper.response(true, "District fetched successfully", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching District:", error);
    return Helper.response(false, "Error fetching District", {}, res, 500);
  }
}

exports.palikaList = async (req, res) => {
  try {
    const district = await palika_master.findAll({
      where: {
        isdeleted: 0
      },
      order: [['palikaname', 'ASC']]
    });
    if (!district || district.length === 0) {
      return Helper.response(false, "No palika found", {}, res, 404);
    }
    const data = await Promise.all(district.map(async (r) => {

      const province = await province_master.findOne({ where: { provinceid: r.fk_provinceid } })
      const district = await district_master.findOne({ where: { districtid: r.fk_districtid } })
      return {
        districtid: r.fk_districtid,
        fk_provinceid: r.fk_provinceid,
        palika_name: r.palikaname.trim(" "),
        province_name: province?.province,
        district_name: district.districtname,
        value: r.id,
        label: r.palikaname.trim(" ")

      }
    }))
    return Helper.response(true, "Palika fetched successfully", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching Palika:", error);
    return Helper.response(false, "Error fetching Palika", {}, res, 500);
  }
}


// exports.wards = async (req, res) => {
//     try {
//         const page = parseInt(req.body.page) || 1;
//         const limit = parseInt(req.body.limit) || 50;
//         const offset = (page - 1) * limit;

//         const { count, rows } = await WardMaster.findAndCountAll({
//             where: { isdeleted: 0 },
//             order: [['wardname', 'ASC']],
//             limit,
//             offset
//         });

//         if (!rows || rows.length === 0) {
//             return Helper.response(false, "No ward found", {}, res, 404);
//         }

//         const data = await Promise.all(rows.map(async (r) => {
//             console.log(r)
//             const province = await province_master.findOne({ where: { provinceid: r.fk_provinceid } })
//             const district = await district_master.findOne({ where: { districtid: r.fk_districtid } })
//             const palika = await palika_master.findOne({ where: { palikaid: r.fk_palikaid } })
//             return {
//                 districtid: r.fk_districtid,
//                 fk_provinceid: r.fk_provinceid,
//                 province_name: province?.province,
//                 district_name: district.districtname,
//                 palika_name: palika?.palikaname,
//                 fk_palikaid: r.fk_palikaid,
//                 ward_name: `Ward ${r.wardname.trim()}`,
//                 value: r.id,
//                 label: r.wardname.trim()
//             }
//         }))
//         // const data = await Promise.all(rows.map(async(r) => ({
//         // districtid: r.fk_districtid,
//         // fk_provinceid: r.fk_provinceid,
//         // fk_palikaid: r.fk_palikaid,
//         // ward_name: `Ward ${r.wardname.trim()}`,
//         // value: r.id,
//         // label: r.wardname.trim()
//         // })));

//         return Helper.response(true, "Ward fetched successfully", {
//             data,
//             pagination: {
//                 totalRecords: count,
//                 totalPages: Math.ceil(count / limit),
//                 currentPage: page,
//                 perPage: limit
//             }
//         }, res, 200);

//     } catch (error) {
//         console.error("Error fetching wards:", error);
//         return Helper.response(false, "Error fetching Ward", {}, res, 500);
//     }
// };

exports.wards = async (req, res) => {
  try {

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 50;
    const offset = (page - 1) * limit;
    let { searchValue } = req.body;
    if (typeof searchValue == 'string') {
      searchValue = searchValue.trim();
    }

    let wardIds = [];
    let palikaIds = [];
    let districtIds = [];
    let provinceIds = [];


    if (searchValue) {
      if (!isNaN(searchValue)) {

        const wardResult = await WardMaster.findAll({
          where: {
            isdeleted: 0,
            id: searchValue,

          },
          attributes: ['id'],
        });
        console.log(wardResult, "wardResultsss");

        wardIds = wardResult.map((r) => r.id);
      }

      else {
        const wardResult = await WardMaster.findAll({
          where: {
            isdeleted: 0,
            wardname: { [Op.like]: `%${searchValue}%` },
          },
          attributes: ['id'],
        });
        wardIds = wardResult.map((r) => r.id);
      }

      const palikaResult = await palika_master.findAll({
        where: {
          palikaname: { [Op.like]: `%${searchValue}%` },
        },
        attributes: ['palikaid'],
      });
      palikaIds = palikaResult.map((r) => r.palikaid);

      const districtResult = await district_master.findAll({
        where: {
          districtname: { [Op.like]: `%${searchValue}%` },
        },
        attributes: ['districtid'],
      });
      districtIds = districtResult.map((r) => r.districtid);

      const provinceResult = await province_master.findAll({
        where: {
          province: { [Op.like]: `%${searchValue}%` },
        },
        attributes: ['provinceid'],
      });
      provinceIds = provinceResult.map((r) => r.provinceid);

      var { count, rows } = await WardMaster.findAndCountAll({
        where: {
          isdeleted: 0,
          [Op.or]: [
            { id: { [Op.in]: wardIds } },
            { fk_palikaid: { [Op.in]: palikaIds } },
            { fk_districtid: { [Op.in]: districtIds } },
            { fk_provinceid: { [Op.in]: provinceIds } },
          ],
        },
        order: [['wardname', 'ASC']],
        limit,
        offset,
      });

    }
    else {
      var { count, rows } = await WardMaster.findAndCountAll({
        where: { isdeleted: 0 },
        order: [['wardname', 'ASC']],
        limit,
        offset
      });

      if (!rows || rows.length === 0) {
        return Helper.response(false, "No ward found", {}, res, 404);
      }
      console.log(count, rows, "count112,rows121")

    }


    if (!rows || rows.length === 0) {
      return Helper.response(false, "No ward found", {}, res, 404);
    }



    const data = await Promise.all(rows.map(async (r) => {
      const province = await province_master.findOne({ where: { provinceid: r.fk_provinceid } });
      const district = await district_master.findOne({ where: { districtid: r.fk_districtid } });
      const palika = await palika_master.findOne({ where: { palikaid: r.fk_palikaid } });

      return {
        districtid: r.fk_districtid,
        fk_provinceid: r.fk_provinceid,
        province_name: province?.province,
        district_name: district?.districtname,
        palika_name: palika?.palikaname,
        fk_palikaid: r.fk_palikaid,
        ward_name: `Ward ${r.wardname.trim()}`,
        value: r.id,
        label: r.wardname.trim(),
      };
    }));

    return Helper.response(true, "Ward fetched successfully", {
      data,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        perPage: limit,
      },
    }, res, 200);
  } catch (error) {
    console.error(error);
    return Helper.response(false, "An error occurred", {}, res, 500);
  }

};


exports.districtDD = async (req, res) => {
  try {

    const { province_id } = req.body
    if (!province_id) {
      return Helper.response(false, "Province Id Is Required", {}, res, 404);
    }

    const district = await district_master.findAll({
      where: {
        isdeleted: 0,
        fk_provinceid: province_id
      },
      order: [['districtname', 'ASC']]
    });
    if (!district || district.length === 0) {
      return Helper.response(false, "No provinces found", {}, res, 404);
    }
    const data = await Promise.all(district.map(async (r) => {
      const province = await province_master.findOne({ where: { provinceid: r.fk_provinceid } })
      console.log(province, "f")
      return {
        districtid: r.districtid,
        fk_provinceid: r.fk_provinceid,
        district_name: r.districtname,
        province_name: province.province,
        value: r.districtid,
        label: r.districtname

      }
    }))
    return Helper.response(true, "District fetched successfully", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching District:", error);
    return Helper.response(false, "Error fetching District", {}, res, 500);
  }
}

exports.palikaListDD = async (req, res) => {
  try {
    const { province_id, district_id } = req.body
    if (!province_id || !district_id) {
      return Helper.response(false, "Province Id , District Id is Required !", {}, res, 404);
    }
    const district = await palika_master.findAll({
      where: {
        isdeleted: 0,
        fk_provinceid: province_id,
        fk_districtid: district_id
      },
      order: [['palikaname', 'ASC']]
    });
    if (!district || district.length === 0) {
      return Helper.response(false, "No palika found", {}, res, 404);
    }
    const data = await Promise.all(district.map(async (r) => {

      const province = await province_master.findOne({ where: { provinceid: r.fk_provinceid } })
      const district = await district_master.findOne({ where: { districtid: r.fk_districtid } })
      return {
        districtid: r.fk_districtid,
        fk_provinceid: r.fk_provinceid,
        palika_name: r.palikaname.trim(" "),
        province_name: province?.province,
        district_name: district.districtname,
        value: r.id,
        label: r.palikaname.trim(" "),
        palikaid: r?.palikaid

      }
    }))
    return Helper.response(true, "Palika fetched successfully", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching Palika:", error);
    return Helper.response(false, "Error fetching Palika", {}, res, 500);
  }
}
exports.wardDD = async (req, res) => {
  try {

    const { province_id, district_id, palika_id } = req.body
    if (!province_id || !district_id || !palika_id) {
      return Helper.response(false, "Province Id , District Id , palika Id is Required !", {}, res, 404);
    }

    const { count, rows } = await WardMaster.findAndCountAll({
      where: {
        isdeleted: 0,
        fk_provinceid: province_id,
        fk_districtid: district_id,
        fk_palikaid: palika_id
      },
      order: [['wardname', 'ASC']],
    });

    if (!rows || rows.length == 0) {
      return Helper.response(false, "No ward found", {}, res, 404);
    }

    const data = await Promise.all(rows.map(async (r) => {

      return {
        value: r.id,
        label: `Ward ${r.wardname.trim()}`
      }
    }))

    return Helper.response(true, "Ward fetched successfully", {
      data,
    }, res, 200);

  } catch (error) {
    console.error("Error fetching wards:", error);
    return Helper.response(false, "Error fetching Ward", {}, res, 500);
  }
};

exports.AlldistrictDD = async (req, res) => {
  try {
    
    const district = await district_master.findAll({
      where: {
        isdeleted: 0,
      },
      order: [['districtname', 'ASC']]
    });
    if (!district || district.length === 0) {
      return Helper.response(false, "No provinces found", {}, res, 404);
    }
    const data = await Promise.all(district.map(async (r) => {
      return {
        districtid: r.districtid,
        value: r.districtid,
        label: r.districtname
      }
    }))
    return Helper.response(true, "District fetched successfully", { data }, res, 200);
  } catch (error) {
    console.error("Error fetching District:", error);
    return Helper.response(false, "Error fetching District", {}, res, 500);
  }
}