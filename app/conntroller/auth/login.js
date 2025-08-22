const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const AdminUser = require("../../models/AdminUser");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const role = require("../../models/role");
const role_permission = require("../../models/role_permission");
const permission = require("../../models/permission");
const admin_login = require("../../models/AdminUser");
const facility = require("../../models/facility");
const province_master = require("../../models/provincemaster");
const district_master = require("../../models/districtmaster");
const WardMaster = require("../../models/wardmaster");
const Role = require("../../models/role");
const { Op, col } = require("sequelize");
const palika_master = require("../../models/pailikamaster");

// exports.login = async (req, res) => {

//     const { loginId, password } = req.body;
//     const hashedInput = CryptoJS.SHA256(password).toString();
//     console.log("Login ID:", hashedInput);

//     try {
//         const user = await admin_login.findOne({
//             where: {
//                 LoginId: loginId
//             }
//         })

//           if (!user) {
//             return Helper.response(false, "User not exists!", [], res, 401);
//         }

//         if (user.Password != hashedInput) {
//             return Helper.response(false, "Invalid login credentials", [], res, 401);
//         }

//         if (user && user.IsActive === 1) {
//             return Helper.response(true, "User is not active", [], res, 403);
//         }

//         const token = jwt.sign(
//             { user: user.Pk_AdminUserId },
//             process.env.SECRET_KEY,
//             { expiresIn: '8h' }
//         );

//         await user.update({ token });

//         const baseUrl = process.env.BASE_URL;

//         return Helper.response(true, 'You have Logged In Successfully!', { baseUrl, user }, res, 200)
//     } catch (error) {
//         return Helper.response(0, 'Something went wrong', error, res, 500);
//     }

// }

exports.login = async (req, res) => {
  const { loginId, password } = req.body;
  //   const hashedInput = CryptoJS.SHA256(password).toString();
  //   const hashedInput= CryptoJS.AES(password)
 
  try {
    const user = await AdminUser.findOne({
      where: { LoginId: loginId },
      attributes: [
        "Pk_AdminId",
        "LoginId",
        "Password",
        "FirstName",
        "LastName",
        "Email",
        "Mobile",
        "Fk_Usertype",
        "IsActive",
        "ProvinceId",
        "DistrictId",
        "PalikaId",
        "WardId",
        "FacilityId",
        "token",
        "role_id",
      ],
      include: {
        model: role,
        as: "role",
        include: {
          model: permission,
        },
      },
    });
 
    if (!user) {
      return Helper.response(false, "User does not exist!", [], res, 401);
    }
 
    if (Helper.decryptPassword(user.Password) !== password) {
      return Helper.response(false, "Invalid login credentials", [], res, 401);
    }
 
    if (user.IsActive === 1) {
      return Helper.response(true, "User is not active", [], res, 403);
    }
    const province = await province_master.findOne({
      where: {
        provinceid: user?.ProvinceId,
      },
    });
 
    const tokenPayload = {
      uid: user.Pk_AdminId,
      role: (user?.Fk_Usertype || "").toLowerCase(),
      role_id: user.role_id || null,
      permissions: user.role?.permissions?.map((p) => p.name) || [],
      scope: {
        provinceId: user.ProvinceId || 0,
        province_name: user.ProvinceId ? province.province : 0,
 
        palikaId: user.PalikaId || 0,
 
        wardId: user.WardId || 0,
        facilityId: user.FacilityId || 0,
      },
    };
 
    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });
 
    await user.update({ token });
 
    const district = await district_master.findOne({
      where: {
        districtid: user.DistrictId,
      },
    });
    const palika = await palika_master.findOne({
      where: {
        palikaid: user.PalikaId,
      },
    });
       const [result] = await sequelize.query(
            `SELECT facilitycode FROM facilitycodemaster WHERE id = ${user?.FacilityId} `,
            {
              replacements: { id: user?.FacilityId },
              type: sequelize.QueryTypes.SELECT
            }
          );
 
    const baseUrl = process.env.BASE_URL;
 
    const safeUser = {
      Pk_AdminId: user.Pk_AdminId,
      LoginId: user.LoginId,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      Mobile: user.Mobile,
      Fk_Usertype: user.Fk_Usertype,
      IsActive: user.IsActive,
      ProvinceId: user.ProvinceId,
      DistrictId: user.DistrictId,
      PalikaId: user.PalikaId,
      WardId: user.WardId,
      FacilityId: user.FacilityId,
      role: user.role?.name || null,
      permissions: user.role?.permissions?.map((p) => p.name) || [],
      token,
      province_name: user.ProvinceId ? province.province : 0,
      district_name: user.DistrictId ? district?.districtname : 0,
      palika_name: user.PalikaId ? palika?.palikaname : 0,
        facilitycode: result?.facilitycode || null,
    };
 
    return Helper.response(
      true,
      "You have Logged In Successfully!",
      { baseUrl, user: safeUser },
      res,
      200
    );
  } catch (error) {
    console.error("Login error:", error);
    return Helper.response(0, "Something went wrong", error, res, 500);
  }
};
 
exports.createUser = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      mobile,
      role,
      province_id,
      district_id,
      municipality_id,
      ward_id,
      login_id,
      facility_id,
      Fk_Usertype,
    } = req.body;
    // ||!province_id||!district_id||!municipality_id||!ward_id||
    if (!first_name || !last_name || !email || !mobile || !role || !login_id) {
      return Helper.response(
        false,
        "Please fill all the fields",
        null,
        res,
        400
      );
    }
 
    const user = await admin_login.findOne({
      where: {
        [Op.or]: [{ Email: email }, { LoginId: login_id }],
      },
    });
 
    // const user = await admin_login.findOne({ where: { Email: email } });
    if (user) {
      return Helper.response(false, "Email already exists", null, res, 400);
    }
    const hashedPassword = Helper.encryptPassword("123456");
    const newAdmin = await admin_login.create({
      FirstName: first_name,
      MiddleName: middle_name,
      LastName: last_name,
      Email: email,
      Mobile: mobile,
      LoginId: login_id,
      role_id: role,
      Password: hashedPassword,
      ProvinceId: province_id,
      DistrictId: district_id,
      PalikaId: municipality_id,
      WardId: ward_id,
      FacilityId: facility_id,
      Fk_Usertype: Fk_Usertype,
    });
 
    Helper.response(true, "User created successfully", {}, res, 201);
  } catch (error) {
    console.log(error.message, "error:");
    Helper.response(false, error?.message, null, res, 500);
  }
};
 
exports.UserList = async (req, res) => {
  try {
    const users = await admin_login.findAll({
      raw: true,
      order: [["Pk_AdminId", "desc"]],
    });
    const data = await Promise.all(
      users.map(async (user) => {
        // console.log(user,"userdata");
 
        const facilitydt = await facility.findOne({
          where: {
            id: user?.FacilityId,
          },
          attributes: [
            [col("id"), "value"],
            [col("facilityname"), "label"],
          ],
        });
        const provincedata = await province_master.findOne({
          where: {
            provinceid: user?.ProvinceId,
          },
          attributes: [
            [col("provinceid"), "value"],
            [col("province"), "label"],
          ],
        });
        const district = await district_master.findOne({
          where: {
            districtid: user?.DistrictId,
          },
          attributes: [
            [col("districtid"), "value"],
            [col("districtname"), "label"],
          ],
        });
        const ward = await WardMaster.findOne({
          where: {
            wardid: user?.WardId,
          },
          attributes: [
            [col("wardid"), "value"],
            [col("wardname"), "label"],
          ],
        });
        const palika = await palika_master.findOne({
          where: {
            palikaid: user?.PalikaId,
          },
          attributes: [
            "palikaid",
            [col("id"), "value"],
            [col("palikaname"), "label"],
          ],
        });
        const role = await Role.findOne({
          where: {
            id: user?.role_id,
          },
          attributes: ["id", [col("id"), "value"], [col("name"), "label"], [col("nickname"), "Fk_Usertype"]],
        });
 
        const user1 = {
          id: user?.Pk_AdminId,
          LastName: user?.LastName,
          FirstName: user?.FirstName,
          email: user?.Email,
          phone: user?.Mobile,
          facility: facilitydt,
          province: provincedata,
          district: district,
          palika: palika,
          ward: ward,
          role: role,
          LoginId: user?.LoginId,
          status: user && user.IsActive == 0 ? true : false,
          reason: user?.reason,
          Fk_Usertype: user?.Fk_Usertype,
        };
        return user1;
      })
    );
    if (data.length == 0) {
      return Helper.response(false, "No data Found", null, res, 500);
    }
 
    return Helper.response(true, "Users list", data, res, 200);
  } catch (error) {
    return Helper.response(false, error?.message, null, res, 500);
  }
};
exports.updateUser = async (req, res) => {
  try {
    const {
      id,
      first_name,
      middle_name,
      last_name,
      email,
      mobile,
      role,
      province_id,
      district_id,
      municipality_id,
      ward_id,
      login_id,
      facility_id,
      Fk_Usertype,
    } = req.body;
 
    const user = await admin_login.findOne({
      where: {
        Email: email,
        Pk_AdminId: { [Op.notIn]: [id] },
      },
    });
 
    if (user) {
      return Helper.response(false, "Email already exists", null, res, 400);
    }
 
    const updateAdmin = await admin_login.update(
      {
        FirstName: first_name,
        MiddleName: middle_name,
        LastName: last_name,
        Email: email,
        Mobile: mobile,
        LoginId: login_id,
        role_id: role,
        ProvinceId: province_id,
        DistrictId: district_id,
        PalikaId: municipality_id,
        WardId: ward_id,
        FacilityId: facility_id,
        Fk_Usertype: Fk_Usertype,
      },
      {
        where: {
          Pk_AdminId: id,
        },
      }
    );
    if (updateAdmin) {
      return Helper.response(
        true,
        "Admin updated successfully",
        updateAdmin,
        res,
        200
      );
    } else {
      return Helper.response(false, "Failed to update admin", null, res, 400);
    }
  } catch (error) {
    console.log(error.message, "error:");
    Helper.response(false, error?.message, null, res, 500);
  }
};
 
exports.updateUserStatus = async (req, res) => {
  try {
    let { id, status, reason } = req.body;
    console.log(status);
 
    if (status == false) {
      status = 1;
    } else {
      status = 0;
    }
    const updateStatus = await admin_login.update(
      {
        IsActive: status,
        reason: reason,
      },
      {
        where: {
          Pk_AdminId: id,
        },
      }
    );
    if (updateStatus) {
      return Helper.response(
        true,
        "User status updated successfully",
        updateStatus,
        res,
        200
      );
    } else {
      return Helper.response(
        false,
        "Failed to update user status",
        null,
        res,
        400
      );
    }
  } catch (error) {
    console.log(error.message, "error:");
    Helper.response(false, error?.message, null, res, 500);
  }
};
 
 
