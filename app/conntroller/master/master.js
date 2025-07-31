const Helper = require("../../helper/helper");
const district_master = require("../../models/districtmaster");
const palika_master = require("../../models/pailikamaster");
const province_master = require("../../models/provincemaster");
const WardMaster = require("../../models/wardmaster");



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
        const data = await Promise.all(district.map((r) => {
            return {
                districtid: r.districtid,
                fk_provinceid: r.fk_provinceid,
                district_name: r.districtname,
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
        const data = await Promise.all(district.map((r) => {
            return {
                districtid: r.fk_districtid,
                fk_provinceid: r.fk_provinceid,
                palika_name: r.palikaname.trim(" "),
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


exports.wards = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await WardMaster.findAndCountAll({
            where: { isdeleted: 0 },
            order: [['wardname', 'ASC']],
            limit,
            offset
        });

        if (!rows || rows.length === 0) {
            return Helper.response(false, "No ward found", {}, res, 404);
        }

        const data = rows.map((r) => ({
            districtid: r.fk_districtid,
            fk_provinceid: r.fk_provinceid,
            fk_palikaid: r.fk_palikaid,
            ward_name: r.wardname.trim(),
            value: r.id,
            label: r.wardname.trim()
        }));

        return Helper.response(true, "Ward fetched successfully", {
            data,
            pagination: {
                totalRecords: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                perPage: limit
            }
        }, res, 200);

    } catch (error) {
        console.error("Error fetching wards:", error);
        return Helper.response(false, "Error fetching Ward", {}, res, 500);
    }
};
