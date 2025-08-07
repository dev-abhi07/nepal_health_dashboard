const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const db = require('../connection/connection');

const Helper = {};

Helper.response = (status, message, data = [], res, statusCode) => {
    return res.status(statusCode).json({
        status,
        message,
        data,
    });
};

Helper.formatToIST = (
    datetime = new Date(),
    format = "YYYY-MM-DD HH:mm:ss"
) => {
    return moment(datetime).tz("Asia/Kolkata").format(format);
};

Helper.getFacility = async (facility_type_id) => {
    try {
const query = `
    SELECT 
        f."fk_provinceid" AS id,
        pm."latitude" AS latitude,
        pm."longitude" AS longitude,
        COUNT(*) AS count
    FROM 
        facility f
    JOIN 
        provincemaster pm ON f."fk_provinceid" = pm."provinceid"
    WHERE 
        f."fk_facilitytype" = :facility_type_id
        AND f."isdeleted" = 0
    GROUP BY 
        f."fk_provinceid", 
        pm."latitude", 
        pm."longitude"
    ORDER BY 
        count DESC;
`;

const result = await db.query(query, {
  replacements: { facility_type_id },
  type: db.QueryTypes.SELECT
});
return result;


    } catch (err) {
        console.error("Error fetching facility count:", err);
        return [];
    }
};

Helper.getProvincesFacilityCounts = async(province_id)=>{
    try{
        const query = 
        `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_provinceid = :province_id and a.isdeleted = 0
    GROUP BY b.facilitytype, b.id, b.image
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { province_id },
            type: db.QueryTypes.SELECT
          });
          return result;    
    }catch(err){
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getDistrictFacilityCounts = async(district_id)=>{
    try{
        const query = 
        `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_districtid = :district_id and a.isdeleted = 0
    GROUP BY b.facilitytype, b.id, b.image
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { district_id },
            type: db.QueryTypes.SELECT
          });
          return result;    
    }catch(err){
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getPalikaFacilityCounts = async(palika_id)=>{
    try{
       
        const query = 
        `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_palikaid = :palika_id and a.isdeleted = 0
    GROUP BY b.facilitytype, b.id, b.image
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: {palika_id},
            type: db.QueryTypes.SELECT
          });
          return result;    
    }catch(err){
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getFacilityProvince = async (facility_type_id,province_id) => {
    try {
const query = `
    SELECT 
        f."fk_provinceid" AS id,
        pm."latitude" AS latitude,
        pm."longitude" AS longitude,
        COUNT(*) AS count
    FROM 
        facility f
    JOIN 
        provincemaster pm ON f."fk_provinceid" = pm."provinceid"
    WHERE 
        f."fk_facilitytype" = :facility_type_id AND pm."provinceid" = :province_id
        AND f."isdeleted" = 0
    GROUP BY 
        f."fk_provinceid", 
        pm."latitude", 
        pm."longitude"
    ORDER BY 
        count DESC;
`;

const result = await db.query(query, {
  replacements: { facility_type_id,province_id },
  type: db.QueryTypes.SELECT
});
return result;


    } catch (err) {
        console.error("Error fetching facility count:", err);
        return [];
    }
};



Helper.getHealthWorkerCategory = async()=>{
    try {
        const query = `
      select b.name as title,b.icon,count(a.category_id) from "health_worker_data" as a join "health_worker_category" as b on  a.category_id = b.id group by b.name,b.icon
    `;
        
        const result = await db.query(query, {
            type: db.QueryTypes.SELECT
          });
          return result;
    } catch (error) {
        console.error("Error fetching health worker category:", error);
        return [];
    }
}

Helper.getHealthWorkerCategoryProvince = async(province_id)=>{
    try{
        const query = `
      SELECT 
    b.name AS title,
    b.icon,
    COUNT(a.category_id) AS count
FROM "health_worker_data" AS a
JOIN "health_worker_category" AS b 
    ON a.category_id = b.id
JOIN districtmaster AS c 
    ON a.employee_district_id = c.id 
WHERE c.fk_provinceid = :province_id
GROUP BY b.name, b.icon;
    `;
        
        const result = await db.query(query, {
            replacements: { province_id },
            type: db.QueryTypes.SELECT
          });
          return result;
    } catch (error) {
        console.error("Error fetching health worker category:", error);
        return [];
    }
}

Helper.getHealthWorkerCategoryDistrict = async(district_id)=>{
    try{
        const query = `
      SELECT 
    b.name AS title,
    b.icon,
    COUNT(a.category_id) AS count
FROM "health_worker_data" AS a
JOIN "health_worker_category" AS b 
    ON a.category_id = b.id
JOIN districtmaster AS c 
    ON a.employee_district_id = c.id 
WHERE c.districtid = :district_id
GROUP BY b.name, b.icon;
    `;
        
        const result = await db.query(query, {
            replacements: { district_id },
            type: db.QueryTypes.SELECT
          });
          return result;
    } catch (error) {
        console.error("Error fetching health worker category:", error);
        return [];
    }
}

Helper.readFile = async (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
};

Helper.getFacilityTypeProvince = async(province_id)=>{
    try{
        const query = `
        select b.id,b.facilitytype as facility_type,b.id as value,b.facilitytype as label,count(a.fk_facilitytype),b.image as facility_image from facility as a join facilitytypemaster as b on a.fk_facilitytype = b.id where a.fk_provinceid = :province_id
group by b.facilitytype,b.id,b.image
        `

        const result = await db.query(query, {
            replacements: { province_id },
            type: db.QueryTypes.SELECT
          });
          return result;
    }catch(err){
        console.error("Error fetching facility type province:", err);
        return [];
    }
}




module.exports = Helper;


