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

Helper.getProvincesFacilityCounts = async (province_id) => {
    try {
        const query =
            `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image,
        b.color_code
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_provinceid = :province_id and a.isdeleted = 0
    GROUP BY b.facilitytype, b.id, b.image,b.color_code
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { province_id },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getProvincesFacilityCountsAuthorityLevel = async (province_id, authority_level) => {
    try {
        const query =
            `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image,
        b.color_code
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_provinceid = :province_id and a.isdeleted = 0 and a.authoritylevel = :authority_level
    GROUP BY b.facilitytype, b.id, b.image,b.color_code
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { province_id, authority_level },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility counts:", err);
        return [];
    }
}



Helper.getDistrictFacilityCounts = async (district_id) => {
    try {
        const query =
            `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image,
        b.color_code
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_districtid = :district_id and a.isdeleted = 0
    GROUP BY b.facilitytype, b.id, b.image,b.color_code
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { district_id },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getDistrictFacilityCountsAuthorityLevel = async (district_id, authority_level) => {
    try {
        const query =
            `
        SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image,
        b.color_code
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_districtid = :district_id and a.isdeleted = 0 and a.authoritylevel = :authority_level
    GROUP BY b.facilitytype, b.id, b.image,b.color_code
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { district_id, authority_level },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getPalikaFacilityCounts = async (palika_id) => {
    try {

        const query =
            `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image,
        b.color_code
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_palikaid = :palika_id and a.isdeleted = 0 
    GROUP BY b.facilitytype, b.id, b.image,b.color_code
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { palika_id: palika_id },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getPalikaFacilityCountsAuthorityLevel = async (palika_id, authority_level) => {
    try {

        const query =
            `
         SELECT 
        b.id,
        b.facilitytype AS facility_type,
        b.id AS value,
        b.facilitytype AS label,
        COUNT(a.fk_facilitytype) AS count,
        b.image AS facility_image,
        b.color_code
    FROM facility AS a
    JOIN facilitytypemaster AS b 
        ON a.fk_facilitytype = b.id
    WHERE a.fk_palikaid = :palika_id and a.isdeleted = 0 and a.authoritylevel = :authority_level
    GROUP BY b.facilitytype, b.id, b.image,b.color_code
    ORDER BY b.facilitytype ASC;
        `

        const result = await db.query(query, {
            replacements: { palika_id: palika_id, authority_level: authority_level },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility counts:", err);
        return [];
    }
}

Helper.getFacilityProvince = async (facility_type_id, province_id) => {
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
            replacements: { facility_type_id, province_id },
            type: db.QueryTypes.SELECT
        });
        return result;


    } catch (err) {
        console.error("Error fetching facility count:", err);
        return [];
    }
};



Helper.getHealthWorkerCategory = async () => {
    try {
        const query = `
      SELECT 
    hwc.id AS cat_id,
    hwc.name AS title,
    COUNT(hwd.id) AS count,
    hwc.icon as icon
FROM health_worker_data hwd
JOIN location_district ld 
    ON hwd.employee_district_id = ld.id
JOIN districtmaster dm 
    ON ld.code = dm.districtid::text
JOIN health_worker_category hwc 
    ON hwc.id = hwd.category_id
GROUP BY hwc.id, hwc.name,icon
ORDER BY hwc.id;

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

Helper.getHealthWorkerCategoryProvince = async (province_id, category_id) => {
    try {
        const query = `
      SELECT 
    b.name AS title,
    b.icon,
    COUNT(a.category_id) AS count
FROM "health_worker_data" AS a
JOIN "health_worker_category" AS b 
    ON a.category_id = b.id
JOIN districtmaster AS c 
    ON a.employee_district_id = c.id and b.id = :category_id
WHERE c.fk_provinceid = :province_id
GROUP BY b.name, b.icon;
    `;

        const result = await db.query(query, {
            replacements: { province_id, category_id },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (error) {
        console.error("Error fetching health worker category:", error);
        return [];
    }
}

Helper.getHealthWorkerCategoryDistrict = async (district_id, category_id) => {
    try {
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
WHERE c.districtid = :district_id and b.id = :category_id
GROUP BY b.name, b.icon;
    `;

        const result = await db.query(query, {
            replacements: { district_id, category_id },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (error) {
        console.error("Error fetching health worker category:", error);
        return [];
    }
}

Helper.getHealthWorkerCategoryPalika = async (palika_id, category_id) => {
    try {
        const query = `
      SELECT 
    b.name AS title,
    b.icon,
    COUNT(a.category_id) AS count
FROM "health_worker_data" AS a
JOIN "health_worker_category" AS b 
    ON a.category_id = b.id
JOIN palikamaster AS c 
    ON a.employee_municipality_id = c.palikaid  
WHERE c.palikaid = :palika_id and b.id = :category_id
GROUP BY b.name, b.icon;
    `;

        const result = await db.query(query, {
            replacements: { palika_id, category_id },
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

Helper.getFacilityTypeProvince = async (province_id) => {
    try {
        const query = `
        select b.id,b.facilitytype as facility_type,b.id as value,b.facilitytype as label,count(a.fk_facilitytype),b.image as facility_image from facility as a join facilitytypemaster as b on a.fk_facilitytype = b.id where a.fk_provinceid = :province_id
group by b.facilitytype,b.id,b.image
        `

        const result = await db.query(query, {
            replacements: { province_id },
            type: db.QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.error("Error fetching facility type province:", err);
        return [];
    }
}

Helper.getProvienceTableData = async (province_id) => {
    try {
        const query = `
        SELECT 

  districtmaster.districtid,

  districtmaster.districtname,

  COUNT(facility.id) AS total_facilities,

  facility.fk_facilitytype,

  facilitytypemaster.facilitytype

FROM facility

INNER JOIN districtmaster 

  ON facility.fk_districtid = districtmaster.districtid

INNER JOIN provincemaster on  provincemaster.provinceid = facility.fk_provinceid

INNER JOIN facilitytypemaster ON facilitytypemaster.id = facility.fk_facilitytype

WHERE provincemaster.provinceid = :province_id and facility.isdeleted = 0

GROUP BY districtmaster.districtid, districtmaster.districtname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY districtmaster.districtname;
        `

        const result = await db.query(query, {
            replacements: { province_id },
            type: db.QueryTypes.SELECT
        });
        return result;



    } catch (err) {
        console.error("Error fetching province table data:", err);
        return [];
    }
}

Helper.getProvienceTableDataAuthorityLevel = async (province_id, authority_level) => {
    try {
        const query = `
        SELECT 

  districtmaster.districtid,

  districtmaster.districtname,

  COUNT(facility.id) AS total_facilities,

  facility.fk_facilitytype,

  facilitytypemaster.facilitytype

FROM facility

INNER JOIN districtmaster 

  ON facility.fk_districtid = districtmaster.districtid

INNER JOIN provincemaster on  provincemaster.provinceid = facility.fk_provinceid

INNER JOIN facilitytypemaster ON facilitytypemaster.id = facility.fk_facilitytype

WHERE provincemaster.provinceid = :province_id and facility.isdeleted = 0 and facility.authoritylevel = :authority_level

GROUP BY districtmaster.districtid, districtmaster.districtname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY districtmaster.districtname;
        `

        const result = await db.query(query, {
            replacements: { province_id, authority_level },
            type: db.QueryTypes.SELECT
        });
        return result;



    } catch (err) {
        console.error("Error fetching province table data:", err);
        return [];
    }
}

Helper.getDistrictTableData = async (district_id) => {
    try {
        const query = `
      SELECT 

  palikamaster.palikaid,

  palikamaster.palikaname,

  COUNT(facility.id) AS total_facilities,

  facility.fk_facilitytype,

  facilitytypemaster.facilitytype

FROM facility

INNER JOIN palikamaster 

  ON facility.fk_palikaid = palikamaster.palikaid



INNER JOIN districtmaster 

  ON facility.fk_districtid = districtmaster.districtid

INNER JOIN provincemaster on  provincemaster.provinceid = facility.fk_provinceid

INNER JOIN facilitytypemaster ON facilitytypemaster.id = facility.fk_facilitytype

WHERE districtmaster.districtid = :district_id and facility.isdeleted = 0

GROUP BY  palikamaster.palikaid, palikamaster.palikaname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY  palikamaster.palikaname;
        `

        const result = await db.query(query, {
            replacements: { district_id },
            type: db.QueryTypes.SELECT
        });
        return result;



    } catch (err) {
        console.error("Error fetching district table data:", err);
        return [];
    }
}

Helper.getDistrictTableDataAuthorityLevel = async (district_id, authority_level) => {
    try {
        const query = `
      SELECT 

  palikamaster.palikaid,

  palikamaster.palikaname,

  COUNT(facility.id) AS total_facilities,

  facility.fk_facilitytype,

  facilitytypemaster.facilitytype

FROM facility

INNER JOIN palikamaster 

  ON facility.fk_palikaid = palikamaster.palikaid



INNER JOIN districtmaster 

  ON facility.fk_districtid = districtmaster.districtid

INNER JOIN provincemaster on  provincemaster.provinceid = facility.fk_provinceid

INNER JOIN facilitytypemaster ON facilitytypemaster.id = facility.fk_facilitytype

WHERE districtmaster.districtid = :district_id and facility.isdeleted = 0 and facility.authoritylevel = :authority_level

GROUP BY  palikamaster.palikaid, palikamaster.palikaname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY  palikamaster.palikaname;
        `

        const result = await db.query(query, {
            replacements: { district_id, authority_level },
            type: db.QueryTypes.SELECT
        });
        return result;



    } catch (err) {
        console.error("Error fetching district table data:", err);
        return [];
    }
}

Helper.getPalikaTableData = async (palika_id) => {
    try {
        const query = `
           SELECT 

 wardmaster.wardid,

 wardmaster.wardname,

  COUNT(facility.id) AS total_facilities,

  facility.fk_facilitytype,

  facilitytypemaster.facilitytype

FROM facility

INNER JOIN wardmaster 

  ON facility.fk_wardid = wardmaster.wardid




INNER JOIN palikamaster 

  ON facility.fk_palikaid = palikamaster.palikaid



INNER JOIN districtmaster 

  ON facility.fk_districtid = districtmaster.districtid

INNER JOIN provincemaster on  provincemaster.provinceid = facility.fk_provinceid

INNER JOIN facilitytypemaster ON facilitytypemaster.id = facility.fk_facilitytype

WHERE facility.fk_palikaid = :palika_id and facility.isdeleted = 0

GROUP BY  wardmaster.wardid,wardmaster.wardname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY wardmaster.wardname;
        `

        const result = await db.query(query, {
            replacements: { palika_id },
            type: db.QueryTypes.SELECT
        });
        return result;



    } catch (err) {
        console.error("Error fetching palika table data:", err);
        return [];
    }
}

Helper.getPalikaTableDataAuthorityLevel = async (palika_id, authority_level) => {
    try {
        const query = `
           SELECT 

 wardmaster.wardid,

 wardmaster.wardname,

  COUNT(facility.id) AS total_facilities,

  facility.fk_facilitytype,

  facilitytypemaster.facilitytype

FROM facility

INNER JOIN wardmaster 

  ON facility.fk_wardid = wardmaster.wardid




INNER JOIN palikamaster 

  ON facility.fk_palikaid = palikamaster.palikaid



INNER JOIN districtmaster 

  ON facility.fk_districtid = districtmaster.districtid

INNER JOIN provincemaster on  provincemaster.provinceid = facility.fk_provinceid

INNER JOIN facilitytypemaster ON facilitytypemaster.id = facility.fk_facilitytype

WHERE facility.fk_palikaid = :palika_id and facility.isdeleted = 0 and facility.authoritylevel = :authority_level

GROUP BY  wardmaster.wardid,wardmaster.wardname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY wardmaster.wardname;
        `

        const result = await db.query(query, {
            replacements: { palika_id, authority_level },
            type: db.QueryTypes.SELECT
        });
        return result;



    } catch (err) {
        console.error("Error fetching palika table data:", err);
        return [];
    }
}




module.exports = Helper;


