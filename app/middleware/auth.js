const jwt = require('jsonwebtoken');
const Helper = require('../helper/helper');
const { getUserPermissions } = require('../conntroller/permission/permission');

const verifyUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return Helper.response(false, 'Unauthorized Access!', {}, res, 401);        
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return Helper.response(false, 'Forbidden', err, res, 500);        
    }
};

const injectScope = (req, res, next) =>{
  const user = req.user;

  if (!user || !user.role || !user.scope) {
    return Helper.response(false, 'Unauthorized or invalid token', {}, res, 401);           
  }
  const { role, scope } = user;
 


  switch (role) {
    case 'province':
      req.body.province_id = scope.provinceId;
      break;
    case 'district':
      req.body.district_id = scope.districtId;
      break;
    case 'municipality':
      req.body.palika_id = scope.palikaId;
      break;
    case 'ward':
      req.body.ward_id = scope.wardId;
      break;
    case 'facility':
      req.body.facility_id = scope.facilityId;
      break;
    case 'admin':
    default:
      break;
  }

  next();
};

const filterUserMenus = async (req, res, next) => {
  try {
    const data = [
      {
        icon: "dashboard",
        text: "Dashboard",
        link: "/dashboard",
      },
      {
        icon: "dashboard",
        text: "Province Dashboard",
        link: "/district",
      },
      {
        icon: "dashboard",
        text: "Palika Dashboard",
        link: "/palika",
      },
      {
        icon: "dashboard",
        text: "Facility Dashboard",
        link: "/facility",
      },
      {
        icon: "dashboard",
        text: "Municipality Dashboard",
        link: "/ward",
      },
 
      {
        icon: "setting",
        text: "Master",
        active: false,
        subMenu: [
          {
            text: "Province",
            link: "/master/province",
          },
          {
            text: "District",
            link: "/master/district",
          },
          {
            text: "Municipality",
            link: "/master/municipality",
          },
          {
            text: "Ward",
            link: "/master/ward",
          },
          // {
          //   text: "Role",
          //   link: "/master/role",
          // },
        ],
      },
      {
        icon: "map",
        text: "Geography",
        active: false,
        subMenu: [
          {
            text: "Province",
            link: "/geography/province",
          },
        ],
      },
      {
        icon: "account-setting-alt",
        text: "Manage User",
        link: "/user-management",
      },
      {
        icon: "template-fill",
        text: "Warehouse",
        link: "/warehouse",
      },
      {
        icon: "report",
        text: "Report",
        active: false,
        subMenu: [
          {
            text: "Facility Report",
            link: "/reports/facility",
          },
        ],
      },
    ];
   
 
    const userId = req.user.uid;
   
 
    const permissionsData = await getUserPermissions(userId);

 
    if (permissionsData.error) {
      return res.status(404).json({ error: permissionsData.error });
    }
 
    const menu = [];
 
    const menuMap = new Map();
 
    permissionsData.forEach((item) => {
      if (item.isView) {
        const {
          menu_id,
          icon,
          menu_name,
          submenu_id,
          sub_menu,
          link,
          page_url,
        } = item;
 
        if (!submenu_id) {
 
          if (!menuMap.has(menu_id)) {
            menuMap.set(menu_id, {
              icon: icon,
              text: menu_name,
              page_url: page_url,
              link: page_url,
              active: false,
            });
          }
        } else {
          if (!menuMap.has(menu_id)) {
            menuMap.set(menu_id, {
              icon: icon,
              text: menu_name,
              page_url: page_url,
              link: page_url,
              active: false,
              subMenu: [],
            });
          }
          // Add the submenu item to the parent's subMenu array
          menuMap.get(menu_id).subMenu.push({
            text: sub_menu,
            link: link,
          });
        }
      }
    });
 
    menu.push(...menuMap.values());


      req.userPermissions = menu;
    

  
 
    
    next();
  } catch (error) {
    console.error("Error in middleware:", error);
    return res.status(200).json({ error: "Internal server error" });
  }
};
 
 


module.exports = {
    verifyUser,
    injectScope,
    filterUserMenus
}
