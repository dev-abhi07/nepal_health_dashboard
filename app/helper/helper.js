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
        provincemaster pm ON f."fk_provinceid" = pm."id"
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




module.exports = Helper;


