const Helper = require("../../helper/helper.js");
const { Op } = require("sequelize");
const menu = require("../../models/menu.js");
const RolePermission = require("../../models/role_permission");
const subMenu = require("../../models/submenu.js");

exports.menuList = async (req, res) => {
  let login_user_data = req.user;
  try {
    // Fetch permissions for the user
    let id;
    if (req.body.id) {
      id = req.body.id;
    } else {
      id = login_user_data.id;
    }

    const permissionData = await RolePermission.findAll({
      where: { userId: id },
      attributes: [
        "menu_id",
        "role_id",
        "submenu_id",
        "isView",
        "isCreate",
        "isUpdate",
      ],
      raw: true,
    });

    const permissionsMap = {};
    permissionData.forEach((permission) => {
      const key = `${permission.menu_id}_${permission.submenu_id || ""}`;
      permissionsMap[key] = {
        isView: permission.isView,
        isCreate: permission.isCreate,
        isUpdate: permission.isUpdate,
      };
    });

    // Fetch menu and submenu details
    let menuList = await menu.findAll({
      attributes: ["id", "menu_name"],
      raw: true,
      where: {
        icon_class: {
          [Op.ne]: "dashboard", // Exclude where icon_class is 'dashboard'
        },
      },
    });
    let dashboarddata;
    if (req.body.role?.Fk_Usertype == "admin") {
      dashboarddata = await menu.findAll({
        attributes: ["id", "menu_name"],
        raw: true,
        where: {
          menu_name: "dashboard",
        },
      });
      menuList = [...menuList, ...dashboarddata];
    } else if (req.body.role?.Fk_Usertype == "province") {
      dashboarddata = await menu.findAll({
        attributes: ["id", "menu_name"],
        raw: true,
        where: {
          menu_name: "Province Dashboard",
        },
      });
      menuList = [...menuList, ...dashboarddata];
    } else if (req.body.role?.Fk_Usertype == "facility") {
      dashboarddata = await menu.findAll({
        attributes: ["id", "menu_name"],
        raw: true,
        where: {
          menu_name: "Facility Dashboard",
        },
      });
      menuList = [...menuList, ...dashboarddata];
    } else if (req.body.role?.Fk_Usertype == "district") {
      dashboarddata = await menu.findAll({
        attributes: ["id", "menu_name"],
        raw: true,
        where: {
          menu_name: "Palika Dashboard",
        },
      });
      menuList = [...menuList, ...dashboarddata];
    } else if (req.body.role?.Fk_Usertype == "municipality") {
      dashboarddata = await menu.findAll({
        attributes: ["id", "menu_name"],
        raw: true,
        where: {
          menu_name: "Municipality Dashboard",
        },
      });
      menuList = [...menuList, ...dashboarddata];
    }

    const submenus = await subMenu.findAll({
      where: { menu_id: menuList.map((menu) => menu.id) },
      attributes: ["id", "menu_id", "sub_menu"],
      raw: true,
    });

    // Merge menu, submenu, and permissions
    let data = [];

    menuList.forEach((menu) => {
      const filteredSubmenus = submenus.filter((sub) => sub.menu_id == menu.id);

      if (filteredSubmenus.length > 0) {
        filteredSubmenus.forEach((sub) => {
          const key = `${sub.menu_id}_${sub.id}`;
          const permissions = permissionsMap[key] || {
            isView: false,
            isCreate: false,
            isUpdate: false,
          };

          data.push({
            menu_id: menu.id,
            menu_name: menu.menu_name,
            submenu_id: sub.id,
            sub_menu: sub.sub_menu,
            ...permissions,
          });
        });
      } else {
        // If menu has no submenus, include it explicitly
        const key = `${menu.id}_`;
        const permissions = permissionsMap[key] || {
          isView: false,
          isCreate: false,
          isUpdate: false,
        };

        data.push({
          menu_id: menu.id,
          menu_name: menu.menu_name,
          submenu_id: "",
          sub_menu: "",
          ...permissions,
        });
      }
    });

    return Helper.response(
      "success",
      "Menu list found successfully",
      data,
      res,
      200
    );
  } catch (err) {
    return Helper.response("failed", err?.message, {}, res, 200);
  }
};

exports.rolePermission = async (req, res) => {
  try {
    const reqData = req.body.data;
    const { employee_id, role_id } = req.body;

    if (!reqData || reqData.length === 0) {
      return Helper.response("failed", "No data provided", {}, res, 400);
    }

    const rolePermissions = reqData.map((element) => ({
      menu_id: element?.menu_id,
      submenu_id: element?.submenu_id || null,
      isView: element.isView || false,
      isCreate: element.isCreate || false,
      isUpdate: element.isUpdate || false,
      userId: employee_id,
      role_id: role_id,
      permission_id: 1,
    }));

    // Bulk insert the role permissions
    await RolePermission.bulkCreate(rolePermissions, {
      updateOnDuplicate: ["isView", "isCreate", "isUpdate"], // Update values if entry exists
    });

    return Helper.response(
      "success",
      "Records Updated Successfully",
      {},
      res,
      200
    );
  } catch (err) {
    console.error("Error:", err);
    return Helper.response("failed", err?.message, {}, res, 500);
  }
};

exports.sidebar = async (req, res) => {
  try {
    if (!req.userPermissions) {
      return Helper.response("failed", "Sidebar not found", [], res, 200);
    }

    return Helper.response(
      "success",
      "sidebar",
      { sidebar: req.permissions },
      res,
      200
    );
  } catch (err) {
    console.error("Sidebar Error:", err);
    return Helper.response("failed", err.message, [], res, 200);
  }
};

exports.getUserPermissions = async (userId) => {
  try {
    const permissionData = await RolePermission.findAll({
      where: { userId: userId },
      attributes: ["menu_id", "submenu_id", "isView", "isCreate", "isUpdate"],
      raw: true,
    });

    const permissionsMap = {};
    permissionData.forEach((permission) => {
      const key = `${permission.menu_id}_${permission.submenu_id || ""}`;
      permissionsMap[key] = {
        isView: permission.isView,
        isCreate: permission.isCreate,
        isUpdate: permission.isUpdate,
      };
    });

    const menuList = await menu.findAll({
      attributes: ["id", "menu_name", "page_url", "icon_class"],
      raw: true,
    });



    const submenus = await subMenu.findAll({
      where: { menu_id: menuList.map((menu) => menu.id) },
      attributes: ["id", "menu_id", "sub_menu", "page_url"],
      raw: true,
    });

    let data = [];

    menuList.forEach((menu) => {
      const filteredSubmenus = submenus.filter(
        (sub) => sub.menu_id === menu.id
      );

      if (filteredSubmenus.length > 0) {
        filteredSubmenus.forEach((sub) => {
          const key = `${sub.menu_id}_${sub.id}`;
          const permissions = permissionsMap[key] || {
            isView: false,
            isCreate: false,
            isUpdate: false,
          };

          data.push({
            menu_id: menu.id,
            icon: menu.icon_class,
            page_url: menu.page_url,
            menu_name: menu.menu_name,
            submenu_id: sub.id,
            sub_menu: sub.sub_menu,
            link: sub.page_url,
            ...permissions,
          });
        });
      } else {
        const key = `${menu.id}_`;
        const permissions = permissionsMap[key] || {
          isView: false,
          isCreate: false,
          isUpdate: false,
        };

        data.push({
          menu_id: menu.id,
          icon: menu.icon_class,
          page_url: menu.page_url,
          menu_name: menu.menu_name,
          submenu_id: "",
          sub_menu: "",
          link: "",
          ...permissions,
        });
      }
    });

    return data;
  } catch (error) {
    console.log(error, "errroorrrrrr");
    console.error("Error fetching permissions:", error);
    return { error: "Internal server error" };
  }
};

exports.sidebardata = async (req, res) => {
  try {
    let data = req.userPermissions;

    return Helper.response("success", "Sidebar Data", data, res, 200);
  } catch (error) {
    return Helper.response("failed", error.message, { error }, res, 200);
  }
};
