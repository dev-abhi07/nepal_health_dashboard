const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const province_master = require("../../models/provincemaster");


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
