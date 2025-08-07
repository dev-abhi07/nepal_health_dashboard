const Helper = require("../../helper/helper");
const district_master = require("../../models/districtmaster");
const facility = require("../../models/facility");
const facilitytypemaster = require("../../models/facilitytypemaster");
const palika_master = require("../../models/pailikamaster");
const province_master = require("../../models/provincemaster");
const vaccine_hmis = require("../../models/vaccine_hmis");
const WardMaster = require("../../models/wardmaster");


const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const { type } = require("os");
const ImmunizationRecord = require("../../models/immunizationRecord");
const moment = require('moment');
const { Op, fn, col } = require("sequelize");
const health_worker_category = require("../../models/healthWorker");
const VaccineProgram = require("../../models/vaccineProgram");
const sequelize = require("../../connection/connection");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        var date = new Date();
        cb(
            null,
            date.getDate() +
            `-` +
            date.getMonth() +
            `_` +
            date.getHours() +
            `_` +
            date.getMinutes() +
            `_` +
            date.getMilliseconds() +
            `_` +
            file.originalname
        );
    },
});

const upload = multer({ storage });

exports.dashboard = async (req, res) => {
    try {
      let province_masters = 0;
      let totalDistricts = 0;
      let totalPalikas = 0;
      let totalWards = 0;
      let totalFacility = 0;
      let facilityTypes = [];
      let childrenZeroTo14Years = 0;
      let childrenZeroTo5years = 0;
      let totalDifference = 0;
      let populationData = {};
      let demography = [];
      let achievements = [];
       if(req.body && req.body.province_id){
           totalDistricts = await district_master.count({
            where: {
                isdeleted: 0,
                fk_provinceid: req.body.province_id
            }
          })

          totalPalikas = await palika_master.count({
            where: {
                isdeleted: 0,
                fk_provinceid: req.body.province_id
            }
        })

        totalWards = await WardMaster.count({
            where: {
                isdeleted: 0,
                fk_provinceid: req.body.province_id
            }
        })

        demography = [{ title: 'Provinces', total_count: 1 }, {
          title: 'Districts',
          total_count: totalDistricts
      },
      {
          title: 'Palikas',
          total_count: totalPalikas
      },
      {
          title: 'Wards',
          total_count: totalWards
      }
      ]

      totalFacility = await Helper.getProvincesFacilityCounts(req.body.province_id)

      achievements = [
        "90% Rota Vaccine Coverage",
        "95% Measles Vaccine Coverage",
        "80% BCG Vaccine Coverage",
        "98% Polio Vaccine Coverage",
      ];
      childrenZeroTo14Years = await sequelize.query(
        'select sum(pop00to14years) from population_stats where province_id = :province_id',
        {
            type: sequelize.QueryTypes.SELECT,
            replacements: { province_id: req.body.province_id }
        }
    );

    childrenZeroTo5years = await sequelize.query(
        'select sum(pop00to59months) from population_stats where province_id = :province_id',
        {
            type: sequelize.QueryTypes.SELECT,
            replacements: { province_id: req.body.province_id }
        }
    );

    totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

    populationData = {

        "title": "Total Children",
      
        "totalCount":childrenZeroTo14Years[0].sum,
      
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
      
            "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),
      
            "dotColor": "#dc143c"
      
          },
      
          {
      
            "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),
      
            "dotColor": "#003893"
      
          }
      
        ]
      
      }

      return Helper.response(true, "Welcome to the province Dashboard", { demography: demography,achievements: achievements,populationData,totalFacility }, res, 200);

       }else if(req.body && req.body.district_id){
       

      //get Total Palikas
      totalPalikas = await palika_master.count({
          where: {
              isdeleted: 0,
              fk_districtid: req.body.district_id
          }
      })

      //get Total Wards 
      totalWards = await WardMaster.count({
          where: {
              isdeleted: 0,
              fk_districtid: req.body.district_id
          }
      })

      demography = [{ title: 'Provinces', total_count:1 }, {
          title: 'Districts',
          total_count: 1
      },
      {
          title: 'Palikas',
          total_count: totalPalikas
      },
      {
          title: 'Wards',
          total_count: totalWards
      }
      ]

      facilityTypes = await facilitytypemaster.findAll({
          where: {
              isdeleted: 0
          },
          order: [['facilitytype', 'ASC']]
      });


     totalFacility = await Helper.getDistrictFacilityCounts(req.body.district_id)
      if (!facilityTypes || facilityTypes.length === 0) {
          return Helper.response(false, "No facility types found", {}, res, 404);
      }

      achievements = [
    "90% Rota Vaccine Coverage",
    "95% Measles Vaccine Coverage",
    "80% BCG Vaccine Coverage",
    "98% Polio Vaccine Coverage",
  ];

  childrenZeroTo14Years = await sequelize.query(
      'select sum(pop00to14years) from population_stats where district_id = :district_id',
      {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: req.body.district_id }
      }
  );

  childrenZeroTo5years = await sequelize.query(
      'select sum(pop00to59months) from population_stats where district_id = :district_id',
      {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: req.body.district_id }
      }
  );

  totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

  populationData = {

      "title": "Total Children",
    
      "totalCount":childrenZeroTo14Years[0].sum,
    
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
    
          "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),
    
          "dotColor": "#dc143c"
    
        },
    
        {
    
          "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),
    
          "dotColor": "#003893"
    
        }
    
      ]
    
    }
    
   

      return Helper.response(true, "Welcome to the Dashboard", { demography: demography, totalFacility, achievements: achievements,populationData}, res, 200);
     
       }else if(req.body && req.body.palika_id){
        totalFacility = await Helper.getPalikaFacilityCounts(req.body.palika_id)
        if (!facilityTypes || facilityTypes.length === 0) {
            return Helper.response(false, "No facility types found", {}, res, 404);
        }
        return Helper.response(true, "Welcome to the Dashboard", {totalFacility}, res, 200);

       }
       
       else{
        province_masters = await province_master.count({
          where: {
              isdeleted: 0
          }
      })


      //get Total Districts
      totalDistricts = await district_master.count({
          where: {
              isdeleted: 0
          }
      })

      //get Total Palikas
      totalPalikas = await palika_master.count({
          where: {
              isdeleted: 0
          }
      })

      //get Total Wards 
      totalWards = await WardMaster.count({
          where: {
              isdeleted: 0
          }
      })

      demography = [{ title: 'Provinces', total_count: province_masters }, {
          title: 'Districts',
          total_count: totalDistricts
      },
      {
          title: 'Palikas',
          total_count: totalPalikas
      },
      {
          title: 'Wards',
          total_count: totalWards
      }
      ]

      facilityTypes = await facilitytypemaster.findAll({
          where: {
              isdeleted: 0
          },
          order: [['facilitytype', 'ASC']]
      });


     totalFacility = await Promise.all(facilityTypes.map(async (r) => {

          const facilityTypeCount = await facility.count({
              where: {
                  fk_facilitytype: r.id,
                  isdeleted: 0
              }
          })
          return {
              value: r.id,
              label: r.facilitytype,
              facility_type: r.facilitytype,
              id: r.id,
              count: facilityTypeCount,
              facility_image: `icons/${r.image ? r.image : null}`
          }
      }))
      if (!facilityTypes || facilityTypes.length === 0) {
          return Helper.response(false, "No facility types found", {}, res, 404);
      }

      achievements = [
    "90% Rota Vaccine Coverage",
    "95% Measles Vaccine Coverage",
    "80% BCG Vaccine Coverage",
    "98% Polio Vaccine Coverage",
  ];

  childrenZeroTo14Years = await sequelize.query(
      'select sum(pop00to14years) from population_stats',
      {
          type: sequelize.QueryTypes.SELECT
      }
  );

  childrenZeroTo5years = await sequelize.query(
      'select sum(pop00to59months) from population_stats',
      {
          type: sequelize.QueryTypes.SELECT
      }
  );

  totalDifference = childrenZeroTo14Years[0].sum - childrenZeroTo5years[0].sum;

  populationData = {

      "title": "Total Children",
    
      "totalCount":childrenZeroTo14Years[0].sum,
    
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
    
          "label": "Upto 5 Years " + Number(childrenZeroTo5years[0].sum).toLocaleString('en-IN'),
    
          "dotColor": "#dc143c"
    
        },
    
        {
    
          "label": "5-14 Years " + Number(totalDifference).toLocaleString('en-IN'),
    
          "dotColor": "#003893"
    
        }
    
      ]
    
    }
    
   

      return Helper.response(true, "Welcome to the Dashboard", { demography: demography, totalFacility, achievements: achievements,populationData }, res, 200);
       }

        
    } catch (error) {
        console.error("Error in dashboard:", error);
        return Helper.response(false, "Error fetching dashboard data", {}, res, 500);
    }
}

exports.dashboardMap = async (req, res) => {
    try {
        const mapPath = process.env.PROVINCE_MAP;
        fs.readFile(mapPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading map file:', err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                const cleanData = data.trim();
                const parsed = JSON.parse(cleanData);
                return Helper.response(true, "Welcome to the Dashboard", { geography: parsed }, res, 200);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
            }
        });
    } catch (error) {
        console.error("Error in dashboardMap:", error);
        return Helper.response(false, "Error fetching map data", {}, res, 500);
    }
}


exports.importRecord = async (req, res) => {
    const year = 2024
    upload.single("uploaded_file")(req, res, async (err) => {
        if (err) {
            return Helper.response("Failed", "Error uploading file", err, res, 500);
        }
        const file = xlsx.readFile(req.file.destination + req.file.filename);
        const sheets = file.Sheets[file.SheetNames[0]];
        let data = [];
        const rows = xlsx.utils.sheet_to_json(sheets);
        for (const row of rows) {
            await vaccine_hmis.create({
                year,
                orgunitlevel1: row['orgunitlevel1'],
                orgunitlevel2: row['orgunitlevel2'],
                orgunitlevel3: row['orgunitlevel3'],
                orgunitlevel4: row['orgunitlevel4'],
                orgunitlevel5: row['orgunitlevel5'],
                orgunitlevel6: row['orgunitlevel6'],
                organisationunitid: row['organisationunitid'],
                nhfrId: row['NHFR ID'],
                organisationunitname: row['organisationunitname'],
                organisationunitcode: row['organisationunitcode'],
                organisationunitdescription: row['organisationunitdescription'],
                periodid: row['periodid'],
                periodname: row['periodname'],
                periodcode: row['periodcode'],
                perioddescription: row['perioddescription'],
                dropout_dpt1_vs_3: parseFloat(row['6.20 - DPT-HepB-Hib dropuout rate (DPT-HepB-Hib 1 vs 3)']),
                dropout_dpt1_vs_mr2: parseFloat(row['6.21 - DPT-HepB-Hib1 vs MR2 dropout rate']),
                dropout_pcv1_vs_3: parseFloat(row['6.22 - PCV dropout rate (PCV1 vs PCV3)']),
                dropout_mr: parseFloat(row['6.23 - Measles/Rubella droupout rate']),
                wastage_bcg: parseFloat(row['6.25 a - Vaccine wastage rate (BCG)']),
                wastage_dpt_hepb_hib: parseFloat(row['6.25 b - Vaccine wastage rate (DPT/HepB/Hib)']),
                wastage_fipv: parseFloat(row['6.25 c - Vaccine wastage rate (FIPV)']),
                wastage_je: parseFloat(row['6.25 d - Vaccine wastage rate (JE)']),
                wastage_mr: parseFloat(row['6.25 e - Vaccine wastage rate (MR)']),
                wastage_opv: parseFloat(row['6.25 f - Vaccine wastage rate (OPV)']),
                wastage_rota: parseFloat(row['6.25 g - Vaccine wastage rate (Rota)']),
                wastage_tcv: parseFloat(row['6.25 h - Vaccine wastage rate (TCV)']),
                wastage_td: parseFloat(row['6.25 i - Vaccine wastage rate (TD)']),
                wastage_pcv: parseFloat(row['6.25 j - Vaccine wastage rate (PCV)']),
                pct_sessions_conducted: parseFloat(row['6.26 - % of planned immunization sessions conducted']),
                pct_clinics_conducted: parseFloat(row['6.27 - %Â of planned immunization clinics conductedÂ ']),
                pct_serious_aefi: parseFloat(row['6.30 - % of serious AEFI among reported AEFI cases']),
            });
        }

        return res.status(200).json({ message: '✅ Data imported successfully!' });
    });
}

// exports.vaccineDropChart = async (req, res) => {
//     const year = 2024;
//     const month = 'July';

//     const data = await vaccine_hmis.findAll({
//         attributes: [
//             'periodname',
//             'dropout_dpt1_vs_3',
//             'dropout_dpt1_vs_mr2',
//             'dropout_pcv1_vs_3'
//         ],
//         where: { year },
//         order: [['periodname', 'ASC']]
//     });



//     const categories = data.map(d => d.periodname)
//     const dose1 = data.map(d => d.dropout_dpt1_vs_3);
//     const dose2 = data.map(d => d.dropout_dpt1_vs_mr2);
//     const dose3 = data.map(d => d.dropout_pcv1_vs_3);


//     const lineChart = {
//         chart: {
//             type: 'line',
//             height: 330,
//         },
//         title: {
//             text: "",
//             align: "left",
//             style: {
//                 fontWeight: "700",
//                 fontSize: "16.8px",
//                 color: "#364a36",
//             },
//         },
//         credits: {
//             text: 'Powered By ' +
//                 '<a href="https://quaeretech.com"' +
//                 'target="_blank">Quaere Etechnologies</a>'
//         },
//         accessibility: {
//             point: {
//                 valueDescriptionFormat: "{xDescription}{separator}{value} million(s)",
//             },
//         },

//         xAxis: {
//             categories: ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"],
//         },

//         yAxis: {
//             type: "logarithmic",
//             title: {
//                 text: "Number of Vaccination",
//             },
//         },
//         credits: false,
//         tooltip: {
//             headerFormat: "<b>{series.name}</b><br />",
//             pointFormat: "{point.y} vaccinations",
//         },

//         series: [
//             {
//                 name: "DPT-HepB-Hib Dose 1",
//                 data: data.map(item => parseInt(item.dropout_dpt1_vs_3 || 0)),
//                 color: "var(--highcharts-color-1, #0fac81)",
//             },
//             {
//                 name: "DPT-HepB-Hib Dose 2",
//                 data: data.map(item => parseInt(item.dropout_dpt1_vs_mr2 || 0)),
//                 color: "var(--highcharts-color-1, #003893)",
//             },
//             {
//                 name: "DPT-HepB-Hib Dose 3",
//                 data: data.map(item => parseInt(item.dropout_pcv1_vs_3 || 0)),
//                 color: "var(--highcharts-color-1, #dc143c)",
//             },
//         ],
//     };

//     return Helper.response(true, "Welcome to the Dashboard", { lineChart }, res, 200);
// }

exports.vaccineDropChart = async (req, res) => {
    const year = 2024;

    try {
        const data = await vaccine_hmis.findAll({
            attributes: [
                'month',
                'wastage_bcg',
                'wastage_dpt_hepb_hib',
                'wastage_fipv',
                'wastage_je',
                'wastage_mr',
                'wastage_opv',
                'wastage_rota',
                'wastage_tcv',
                'wastage_td',
                'wastage_pcv',
            ],
            where: { year },
            order: [['month', 'ASC']]
        });


        const monthOrder = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July'
        ];


        const monthMap = {};
        data.forEach(row => {
            monthMap[row.month] = row;
        });


        const safe = (val) => {
            const num = parseFloat(val);
            return isNaN(num) || num < 0 ? 0 : num;
        };

        const series = [
            { name: "BCG", group: "Traditional", data: monthOrder.map(m => safe(monthMap[m]?.wastage_bcg)), color: "#003893",visible:true },
            { name: "DPT-HepB-Hib", group: "Combination", data: monthOrder.map(m => safe(monthMap[m]?.wastage_dpt_hepb_hib)), color: "#0fac81",visible:false },
            { name: "fIPV", group: "Combination", data: monthOrder.map(m => safe(monthMap[m]?.wastage_fipv)), color: "#dc143c",visible:false },
            { name: "JE", group: "Traditional", data: monthOrder.map(m => safe(monthMap[m]?.wastage_je)), color: "#ffa500",visible:false },
            { name: "MR", group: "Traditional", data: monthOrder.map(m => safe(monthMap[m]?.wastage_mr)), color: "#8a2be2",visible:false },
            { name: "OPV", group: "Traditional", data: monthOrder.map(m => safe(monthMap[m]?.wastage_opv)), color: "#3cb371",visible:false },
            { name: "Rota", group: "Combination", data: monthOrder.map(m => safe(monthMap[m]?.wastage_rota)), color: "#4169e1",visible:false },
            { name: "TCV", group: "New", data: monthOrder.map(m => safe(monthMap[m]?.wastage_tcv)), color: "#ff69b4",visible:false },
            { name: "TD", group: "New", data: monthOrder.map(m => safe(monthMap[m]?.wastage_td)), color: "#b22222",visible:false },
            { name: "PCV", group: "New", data: monthOrder.map(m => safe(monthMap[m]?.wastage_pcv)), color: "#20b2aa",visible:false },
        ];

        const lineChart = {
            chart: {
                type: 'line',
                height: 432,
            },
            title: {
                text: "Month-wise Vaccine Wastage Report",
                align: "left",
                style: {
                    fontWeight: "700",
                    fontSize: "16.8px",
                    color: "#364a36",
                },
            },
            credits: {
                enabled: false
            },
            accessibility: {
                point: {
                    valueDescriptionFormat: "{xDescription}{separator}{value} %",
                },
            },
            xAxis: {
                categories: monthOrder,
            },
            yAxis: {
                title: {
                    text: "Wastage %",
                },
            },
            tooltip: {
                shared: true,
                valueSuffix: '%'
            },
            series
        };

        return Helper.response(true, "Month-wise Vaccine Wastage Chart", { lineChart }, res, 200);

    } catch (error) {
        console.error("Error generating chart:", error);
        return Helper.response(false, "Chart generation failed", {}, res, 500);
    }
};




// exports.ImmunizationRecord = async (req, res) => {
//   try {
//     const {vaccine} = req.body;

//     // Define configuration for all programs
//     const programConfig = {
//       bcg: {
//         columns: ['bcg'],
//         label: 'BCG',
//         type: 'trend'
//       },
//       opv: {
//         opened: 'opv3',
//         used: 'opv1',
//         label: 'OPV',
//         type: 'wastage'
//       },
//       pcv: {
//         opened: 'pcv3',
//         used: 'pcv1',
//         label: 'PCV',
//         type: 'wastage'
//       },
//       rota: {
//         opened: 'rota2',
//         used: 'rota1',
//         label: 'Rota',
//         type: 'wastage'
//       },
//       'dpt-hepb-hib': {
//         opened: 'dpt3',
//         used: 'dpt1',
//         label: 'DPT-HepB-Hib',
//         type: 'wastage'
//       },
//       fipv: {
//         opened: 'fipv1',
//         used: 'fipv3',
//         label: 'FIPV',
//         type: 'wastage'
//       },
//       je: {
//         opened: 'je1',
//         used: 'je2',
//         label: 'JE',
//         type: 'wastage'
//       },
//       td: {
//         opened: 'td1',
//         used: 'td2',
//         label: 'TD',
//         type: 'wastage'
//       },
//       tcv: {
//         opened: 'tcv1',
//         used: 'tcv2',
//         label: 'TCV',
//         type: 'wastage'
//       },
//       hpv: {
//         opened: 'hpv1',
//         used: 'hpv2',
//         label: 'HPV',
//         type: 'wastage'
//       },
//       'measles/rubella': {
//         columns: ['mr_9_11m', 'mr_12_23m'],
//         label: 'Measles/Rubella',
//         type: 'trend'
//       },
//     };

//     // Use default if no program_name
//     const selectedProgram = vaccine ? vaccine.toLowerCase() : 'measles/rubella';
//     const config = programConfig[selectedProgram];

//     if (!config) {
//       return Helper.response(false, `Unsupported program: ${vaccine}`, {}, res, 400);
//     }

//     // Select required columns
//     const attributes = ['date'];
//     if (config.type === 'wastage') {
//       attributes.push(config.opened);
//       if (config.used !== config.opened) {
//         attributes.push(config.used);
//       }
//     } else if (config.type === 'trend') {
//       attributes.push(...config.columns);
//     }

//     // Query database: Jan 1, 2024 to Dec 31, 2024
//     const records = await ImmunizationRecord.findAll({
//       attributes,
//       where: {
//         date: {
//           [Op.gte]: new Date(2024, 0, 1),
//           [Op.lte]: new Date(2024, 11, 31)
//         }
//       },
//       raw: true
//     });

//     const monthlyData = {};
//     const monthOrder = [
//       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//       'Jul'
//     ];

//     // Initialize monthly buckets
//     monthOrder.forEach(month => {
//       monthlyData[month] = {};
//     });

//     // Aggregate data
//     records.forEach(record => {
//       const month = moment(record.date).format('MMM');

//       if (config.type === 'wastage') {
//         const opened = Number(record[config.opened]) || 0;
//         const used = Number(record[config.used]) || 0;

//         if (!monthlyData[month].opened) monthlyData[month].opened = 0;
//         if (!monthlyData[month].used) monthlyData[month].used = 0;

//         monthlyData[month].opened += opened;
//         monthlyData[month].used += used;
//       } else if (config.type === 'trend') {
//         config.columns.forEach(col => {
//           if (!monthlyData[month][col]) monthlyData[month][col] = 0;
//           monthlyData[month][col] += Number(record[col]) || 0;
//         });
//       }
//     });

//     // Build chart
//     let immunization_record;

//     if (config.type === 'wastage') {
//     //   const wastageData = monthOrder.map(month => {
//     //     const { opened, used } = monthlyData[month];
//     //     if (opened <= 0) return 0;
//     //     return parseFloat((((opened - used) / opened) * 100).toFixed(2));
//     //   });

//     const wastageData = monthOrder.map(month => {
//                     const {opened,used} = monthlyData[month] || {};
//                     const rate = opened > 0 ? ((opened - used) / opened) * 100 : 0;
//                     console.log(`Month: ${month}, DPT1: ${opened}, DPT3: ${used}, Rate: ${rate}`);
//                     return parseFloat(rate.toFixed(2));
//                 });

    

//       const acceptableLimits = {
//         Jan: 34, Feb: 40, Mar: 42, Apr: 25, May: 41,
//         Jun: 50, Jul: 90, Aug: 90, Sep: 80, Oct: 50,
//         Nov: 20, Dec: 10
//       };
//       const acceptableData = monthOrder.map(m => acceptableLimits[m] || 0);

//       immunization_record = {
//         chart: { zooming: { type: 'xy' }, height: 235 },
//         title: { text: '', align: 'left' },
//         subtitle: { text: `${config.label} Wastage Rate (%)`, align: 'left' },
//         credits: { enabled: false },
//         xAxis: [{ categories: monthOrder, crosshair: true }],
//         yAxis: [
//           { labels: { format: '{value}%' }, title: { text: 'Wastage Rate (%)' }, lineWidth: 2 },
//           { title: { text: 'Acceptable (%)' }, labels: { format: '{value}%' }, opposite: true, lineWidth: 2 }
//         ],
//         tooltip: {
//           shared: true,
//           formatter() {
//             return this.points
//               ? this.points.map(p => `${p.series.name}: <b>${p.y}%</b>`).join('<br/>')
//               : '';
//           }
//         },
//         legend: { align: 'left', verticalAlign: 'top' },
//         series: [
//           { name: 'Wastage(%)', type: 'column', yAxis: 1,data:wastageData, color: '#213dad' },
//           { name: 'Acceptable', type: 'spline',  data:acceptableData, color: '#dc143c' }
//         ]
//       };
//     } else {
//       const series = config.columns.map(col => ({
//         name: col.replace('_', ' ').toUpperCase(),
//         type: 'column',
//         data: monthOrder.map(month => monthlyData[month][col] || 0)
//       }));

//       immunization_record = {
//         chart: { zooming: { type: 'xy' }, height: 235 },
//         title: { text: '', align: 'left' },
//         subtitle: { text: `${config.label} Coverage Trend`, align: 'left' },
//         credits: { enabled: false },
//         xAxis: [{ categories: monthOrder, crosshair: true }],
//         yAxis: { title: { text: 'Doses Administered' }, labels: { format: '{value}' } },
//         tooltip: { shared: true },
//         legend: { align: 'left', verticalAlign: 'top' },
//         series
//       };
//     }

//     return Helper.response(true, '', { immunization_record }, res, 200);

//   } catch (error) {
//     console.error("Immunization chart error:", error);
//     return Helper.response(false, 'Server Error', {}, res, 500);
//   }
// };




exports.ImmunizationRecord = async (req, res) => {
  try {
    const { vaccine } = req.body;

    // Unified config: only `columns` and `label`
    const programConfig = {
      bcg: {
        columns: ['bcg'],
        label: 'BCG'
      },
      opv: {
        columns: ['opv1', 'opv2', 'opv3'],
        label: 'OPV'
      },
      pcv: {
        columns: ['pcv1', 'pcv2', 'pcv3'],
        label: 'PCV'
      },
      rota: {
        columns: ['rota1', 'rota2'],
        label: 'Rota'
      },
      'dpt-hepb-hib': {
        columns: ['dpt1', 'dpt2', 'dpt3'],
        label: 'DPT-HepB-Hib'
      },
      fipv: {
        columns: ['fipv1', 'fipv2'],
        label: 'FIPV'
      },
      je: {
        columns: ['je'],
        label: 'JE'
      },
      td: {
        columns: ['td1','td2'],
        label: 'TD'
      },
      tcv: {
        columns: ['tcv'],
        label: 'TCV'
      },
      hpv: {
        columns: ['hpv1', 'hpv2'],
        label: 'HPV'
      },
      'measles/rubella': {
        columns: ['mr_9_11m', 'mr_12_23m'],
        label: 'Measles/Rubella'
      },
      'fully immunized': {
        columns: ['fully_immunized'],
        label: 'Fully Immunized'
      }
      
    };

    // Use default if no vaccine
    const selectedProgram = vaccine ? vaccine.toLowerCase() : 'measles/rubella';
    const config = programConfig[selectedProgram];

    if (!config) {
      return Helper.response(false, `Unsupported program: ${vaccine}`, {}, res, 400);
    }

    // Select only required columns
    const attributes = ['date', ...config.columns];

    let records = []

    // Query data for full year 2024
   if(req.body && req.body.province_id){
    records = await ImmunizationRecord.findAll({
      attributes,
      where: {
        province_id:String(req.body.province_id),
        date: {
          [Op.gte]: new Date(2024, 0, 1),
          [Op.lte]: new Date(2024, 11, 31)
        }
      },
      raw: true
    });
   }else if( req.body && req.body.district_id){
    records = await ImmunizationRecord.findAll({
      attributes,
      where: {
        district_id:req.body.district_id,
        date: {
          [Op.gte]: new Date(2024, 0, 1),
          [Op.lte]: new Date(2024, 11, 31)
        }
      },
      raw: true
    });
   }else{
    records = await ImmunizationRecord.findAll({
      attributes,
      where: {
        date: {
          [Op.gte]: new Date(2024, 0, 1),
          [Op.lte]: new Date(2024, 11, 31)
        }
      },
      raw: true
    });
   }

    const monthlyData = {};
    const monthOrder = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul'
    ];

    // Initialize monthly data
    monthOrder.forEach(month => {
      monthlyData[month] = {};
      config.columns.forEach(col => {
        monthlyData[month][col] = 0;
      });
    });

    // Aggregate values
    records.forEach(record => {
      const month = moment(record.date).format('MMM');
      config.columns.forEach(col => {
        monthlyData[month][col] += Number(record[col]) || 0;
      });
    });

    const COLORS = ['#213dad', '#dc143c', '#0fac81'];

    // Create series for each dose
    const series = config.columns.map(col => ({
      name: col.toUpperCase().replace('_', ' '), // e.g., dpt1 → DPT1
      type: 'column',
      data: monthOrder.map(month => monthlyData[month][col] || 0),
      color: COLORS[config.columns.indexOf(col)]
    }));

    // Build final chart
    const immunization_record = {
      chart: { zooming: { type: 'xy' }, height: 235 },
      title: { text: '', align: 'left' },
      subtitle: { text: `${config.label} Coverage Trend`, align: 'left' },
      credits: { enabled: false },
      xAxis: [{ categories: monthOrder, crosshair: true }],
      yAxis: {
        title: { text: 'Doses Administered' },
        labels: { format: '{value}' }
      },
      tooltip: {
        shared: true,
        formatter() {
          return this.points
            ? this.points.map(p => `${p.series.name}: <b>${p.y}</b>`).join('<br/>')
            : '';
        }
      },
      legend: { align: 'left', verticalAlign: 'top' },
      series
    };

    return Helper.response(true, '', { immunization_record }, res, 200);

  } catch (error) {
    console.error("Immunization chart error:", error);
    return Helper.response(false, 'Server Error', {}, res, 500);
  }
};








//   try {
//     const { program_name } = req.body;

//     if (!program_name) {
//       return Helper.response(false, 'program_name is required', {}, res, 400);
//     }

//     // Simplified config: only columns and label
//     const programConfig = {
//       bcg: {
//         columns: ['bcg'],
//         label: 'BCG'
//       },
//       dpt: {
//         columns: ['dpt1', 'dpt2', 'dpt3'],
//         label: 'DPT'
//       },
//       opv: {
//         columns: ['opv1', 'opv3'],
//         label: 'OPV'
//       },
//       penta: {
//         columns: ['penta1', 'penta3'],
//         label: 'Penta'
//       },
//       measles_rubella: {
//         columns: ['mr_9_11m', 'mr_12m'],
//         label: 'Measles Rubella'
//       }
//     };

//     const config = programConfig[program_name.toLowerCase()];
//     if (!config) {
//       return Helper.response(false, `Unsupported program: ${program_name}`, {}, res, 400);
//     }

//     // Fetch required columns
//     const attributes = ['date', ...config.columns];

//     const records = await ImmunizationRecord.findAll({
//       attributes,
//       where: {
//         date: {
//           [Op.gte]: new Date(2024, 0, 1), // Jan 1, 2024
//           [Op.lte]: new Date(new Date().getFullYear(), 11, 31) // Dec 31, current year
//         }
//       },
//       raw: true
//     });

//     const monthlyData = {};
//     const monthOrder = [
//       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//     ];

//     // Initialize
//     monthOrder.forEach(month => {
//       monthlyData[month] = {};
//       config.columns.forEach(col => {
//         monthlyData[month][col] = 0;
//       });
//     });

//     // Aggregate
//     records.forEach(record => {
//       const month = moment(record.date).format('MMM');
//       config.columns.forEach(col => {
//         monthlyData[month][col] += Number(record[col]) || 0;
//       });
//     });

//     // Generate series
//     const series = config.columns.map(col => ({
//       name: col.toUpperCase().replace('_', ' '), // e.g., mr_9_11m → MR 9 11M
//       type: 'column',
//       data: monthOrder.map(month => monthlyData[month][col] || 0)
//     }));

//     const immunization_record = {
//       chart: { zooming: { type: 'xy' }, height: 230 },
//       title: { text: `${config.label} Coverage Trend`, align: 'left' },
//       credits: { enabled: false },
//       xAxis: { categories: monthOrder, crosshair: true },
//       yAxis: {
//         title: { text: 'Doses Administered' },
//         labels: { format: '{value}' }
//       },
//       tooltip: {
//         shared: true,
//         formatter() {
//           return this.points
//             ? this.points.map(p => `${p.series.name}: <b>${p.y}</b>`).join('<br/>')
//             : '';
//         }
//       },
//       legend: { align: 'left', verticalAlign: 'top' },
//       series
//     };

//     return Helper.response(true, '', { records, immunization_record }, res, 200);

//   } catch (error) {
//     console.error("Immunization chart error:", error);
//     return Helper.response(false, 'Server Error', {}, res, 500);
//   }
// };





// exports.ImmunizationRecord = async (req, res) => {
//     try {
//         let records
        
        
//         records = await ImmunizationRecord.findAll({
//             attributes: ['date', 'dpt1', 'dpt3'],
//             where: {
//                 date: {
//                     [Op.gte]: new Date(2024, 0, 1),
//                     [Op.lte]: new Date(new Date().getFullYear(), 0, 1)
//                 }
//             },
//             raw: true
//         });


    

       
        

//         const monthlyData = {};

//         records.forEach(record => {
//             const month = moment(record.date).format('MMM');

//             if (!monthlyData[month]) {
//                 monthlyData[month] = { dpt1: 0, dpt3: 0 };
//             }


//             monthlyData[month].dpt1 += record.dpt1 || 0;
//             monthlyData[month].dpt3 += record.dpt3 || 0;
//         });



//         const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//         const acceptableLimits = {
//             Jan: 34, Feb: 40, Mar: 42, Apr: 25, May: 41,
//             Jun: 50, Jul: 90, Aug: 90, Sep: 80, Oct: 50,
//             Nov: 20, Dec: 10
//         };

//         const wastageData = monthOrder.map(month => {
//             const { dpt1 = 0, dpt3 = 0 } = monthlyData[month] || {};
//             const rate = dpt1 > 0 ? ((dpt3 - dpt1) / dpt1) * 100 : 0;
//             console.log(`Month: ${month}, DPT1: ${dpt1}, DPT3: ${dpt3}, Rate: ${rate}`);
//             return parseFloat(rate.toFixed(2));
//         });


//         const acceptableData = monthOrder.map(month => acceptableLimits[month] || 0);

//         const immunization_record = {
//             chart: {
//                 zooming: { type: 'xy' },
//                 height: 230
//             },
//             title: { text: '', align: 'left' },
//             credits: {
//                enabled: false
//             },
//             xAxis: [{
//                 categories: monthOrder,
//                 crosshair: true
//             }],
//             yAxis: [{
//                 labels: { format: '{value}' },
//                 title: { text: 'Wastage Rate' },
//                 lineColor: '',
//                 lineWidth: 2
//             }, {
//                 title: { text: 'Acceptable Limit' },
//                 labels: { format: '{value}' },
//                 lineColor: '',
//                 lineWidth: 2,
//                 opposite: true
//             }],
//             tooltip: { shared: true },
//             legend: {
//                 align: 'left',
//                 verticalAlign: 'top'
//             },
//             series: [{
//                 name: 'Wastage(%)',
//                 type: 'column',
//                 yAxis: 1,
//                 data: wastageData,
//                 color: '#213dad'
//             }, {
//                 name: 'Acceptable',
//                 type: 'spline',
//                 data: acceptableData,
//                 color: '#dc143c'
//             }]
//         };

//         return Helper.response(true, '', { immunization_record }, res, 200);
//     } catch (error) {
//         console.error("Wastage chart error:", error);
//         return Helper.response(false, 'Server Error', {}, res, 500);
//     }
// };

exports.ImmunizationRecordByProgramName = async(req,res)=>{
    try{
        const {program_name} = req.body;
        switch(program_name){
            case 'bcg':
                const query = `select SUM(bcg) AS total_bcg from immunization_records `
                
        }
        

    }catch(err){
        console.error("Error fetching immunization record by program name:", err);
        return Helper.response(false, "Error fetching immunization record by program name", {}, res, 500);
    }
}



exports.populationChart = async (req, res) => {
    try{
      let data = []
      let childrenBelow5 = 0;
      let WomanOfChildbearingAge = 0;
      let adolescentGirls = 0;
      if(req.body && req.body.province_id){
        childrenBelow5 = await sequelize.query(
          'select sum(pop00to59months) from population_stats where province_id = :province_id',
          {
              type: sequelize.QueryTypes.SELECT,
              replacements: { province_id: req.body.province_id }
          }
      );

      WomanOfChildbearingAge  = await sequelize.query(
        'select sum(wra15to49years) from population_stats where province_id = :province_id',
        {
            type: sequelize.QueryTypes.SELECT,
            replacements: { province_id: req.body.province_id }
        }
    );

    adolescentGirls  = await sequelize.query(
      'select sum(pop10to19years) from population_stats where province_id = :province_id',
      {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id }
      }
  );
      }else{
        childrenBelow5 = await sequelize.query(
          'select sum(pop00to59months) from population_stats',
          {
              type: sequelize.QueryTypes.SELECT
          }
      );
      WomanOfChildbearingAge  = await sequelize.query(
        'select sum(wra15to49years) from population_stats',
        {
            type: sequelize.QueryTypes.SELECT
        }
    );

    adolescentGirls  = await sequelize.query(
      'select sum(pop10to19years) from population_stats',
      {
          type: sequelize.QueryTypes.SELECT
      }
  );
      }
      
     
  
    

    
  
      data = [
        { name: 'Children Below 5', y: parseFloat(childrenBelow5[0].sum), color: '#0fac81'},
        { name: 'Adolescent Girls', y: parseFloat(adolescentGirls[0].sum), color: '#dc143c' },
        { name: 'Woman of Child <br>Bearing Age', y: parseFloat(WomanOfChildbearingAge[0].sum), color: '#213dad' }
    ]
      const population_chart = {
        chart: {
            type: 'pie',
            height: 220
        },
        title: {
            text: 'Population Data',
            align: 'left',
            verticalAlign: 'top',
            y: 10
        },
        subtitle: {
            text: '',
            align: 'right',
            verticalAlign: 'top',
            y: 10,
            style: {
                fontSize: '14px',
                fontWeight: 'bold'
            }
        },
        credits: { enabled: false },
        plotOptions: {
            pie: {
                innerSize: '50%',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'left',
            verticalAlign: 'middle',
            layout: 'vertical',
            margin:0,
            padding:0
        },
        series: [{
            name: '',
            colorByPoint: true,
            data: data
        }]
    }
    return Helper.response(true, 'Population chart data', { population_chart }, res, 200);


    }catch(err){
        console.error("Error fetching population chart:", err);
        return Helper.response(false, "Error fetching population chart", {}, res, 500);
    }

}

// exports.DashboardTableData = async (req, res) => {
//     try {

//         const provinces = await province_master.findAll({
//             where: { isdeleted: 0 },
//             order: [['createddate', 'ASC']]
//         });

//         if (!provinces || provinces.length === 0) {
//             return Helper.response(false, "No provinces found", {}, res, 404);
//         }


//         const facilityTypes = await facilitytypemaster.findAll({
//             where: { isdeleted: 0 },
//             order: [['facilitytype', 'ASC']]
//         });

//         if (!facilityTypes || facilityTypes.length === 0) {
//             return Helper.response(false, "No facility types found", {}, res, 404);
//         }


//         const tableData = [
//             {
//                 Name: "Koshi",
//                 BHSC: 378,
//                 BH: 265,
//                 ATM: 184,
//                 SH: 220,
//                 SEH: 143,
//                 PC: 125,
//                 DH: 172,
//                 DC: 136,
//                 HSI: 104,
//                 RD: 109,
//                 RC: 91,
//                 Total: 1982,
//             },
//             {
//                 Name: "Madhesh",
//                 BHSC: 402,
//                 BH: 289,
//                 ATM: 176,
//                 SH: 194,
//                 SEH: 167,
//                 PC: 138,
//                 DH: 145,
//                 DC: 119,
//                 HSI: 132,
//                 RD: 98,
//                 RC: 76,
//                 Total: 1995,
//             },
//             {
//                 Name: "Bagmati",
//                 BHSC: 313,
//                 BH: 305,
//                 ATM: 172,
//                 SH: 206,
//                 SEH: 159,
//                 PC: 127,
//                 DH: 153,
//                 DC: 141,
//                 HSI: 87,
//                 RD: 113,
//                 RC: 92,
//                 Total: 1929,
//             },
//             {
//                 Name: "Gandaki",
//                 BHSC: 356,
//                 BH: 318,
//                 ATM: 168,
//                 SH: 189,
//                 SEH: 154,
//                 PC: 146,
//                 DH: 122,
//                 DC: 134,
//                 HSI: 121,
//                 RD: 103,
//                 RC: 83,
//                 Total: 1994,
//             },
//             {
//                 Name: "Lumbini",
//                 BHSC: 394,
//                 BH: 221,
//                 ATM: 195,
//                 SH: 208,
//                 SEH: 147,
//                 PC: 137,
//                 DH: 129,
//                 DC: 110,
//                 HSI: 91,
//                 RD: 122,
//                 RC: 79,
//                 Total: 1893,
//             },
//             {
//                 Name: "Karnali",
//                 BHSC: 347,
//                 BH: 277,
//                 ATM: 193,
//                 SH: 214,
//                 SEH: 149,
//                 PC: 113,
//                 DH: 158,
//                 DC: 106,
//                 HSI: 128,
//                 RD: 116,
//                 RC: 84,
//                 Total: 2015,
//             },
//             {
//                 Name: "Sudurpaschim",
//                 BHSC: 336,
//                 BH: 298,
//                 ATM: 165,
//                 SH: 197,
//                 SEH: 171,
//                 PC: 132,
//                 DH: 168,
//                 DC: 129,
//                 HSI: 106,
//                 RD: 120,
//                 RC: 96,
//                 Total: 2018,
//             },
//         ]
//         const tableHead = [
//             { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
//             { name: "BHSC", key: "BHSC", sortable: false, wrap: true, color: "#0984e3" },
//             { name: "BH", key: "BH", sortable: false, wrap: true, color: "#fd79a8" },
//             { name: "ATM", key: "ATM", sortable: false, wrap: true, color: "#e17055" },
//             { name: "SH", key: "SH", sortable: false, wrap: true, color: "#fab1a0" },
//             { name: "SEH", key: "SEH", sortable: false, wrap: true, color: "#ffeaa7" },
//             { name: "PC", key: "PC", sortable: false, wrap: true, color: "#74b9ff" },
//             { name: "DH", key: "DH", sortable: false, wrap: true, color: "#a29bfe" },
//             { name: "DC", key: "DC", sortable: false, wrap: true, color: "#55efc4" },
//             { name: "HSI", key: "HSI", sortable: false, wrap: true, color: "#d63031" },
//             { name: "RD", key: "RD", sortable: false, wrap: true, color: "#e84393" },
//             { name: "RC", key: "RC", sortable: false, wrap: true, color: "#2d3436" },
//             { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
//         ];

//         return Helper.response(
//             true,
//             "Provinces and facility data retrieved successfully",
//             {
//                 tableData,
//                 tableColumns: tableHead
//             },
//             res,
//             200
//         );

//     }
//     catch (error) {
//         console.error("Population chart error:", error);
//         return Helper.response(false, error?.message, {}, res, 500);

//     }

// }

// exports.DashboardTableData = async (req, res) => {
//     try {
//         let provinces = []
//         let facilityTypes = []
//         let tableData = []
//         let tableHead = []
//         let typeCounts = {}
//         let facilityTypeKeys = []
//         let typeIdToName = {}
//         let row = {}

//         switch(req.body){
//             case req.body.province_id:
//                 console.log('<<<<province_id>>>>',req.body.province_id)
//                 return
//                 provinces = await district_master.findAll({
//                     where: {
//                         fk_provinceid: req.body.province_id,
//                         isdeleted: 0
//                     },
//                     order: [['createddate', 'ASC']]
//                 });
//                 if (!provinces || provinces.length === 0) {
//                     return Helper.response(false, "No provinces found", {}, res, 404);
//                 }
        
//                 facilityTypes = await facilitytypemaster.findAll({
//                     where: { isdeleted: 0 },
//                     order: [['facilitytype', 'ASC']]
//                 });
//                 typeIdToName = {};
//                 facilityTypes.forEach(ft => {
//                     typeIdToName[ft.id] = ft.facilitytype;
//                 });
        
//                 facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);
//                 tableHead = [
//                     { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
//                     ...facilityTypes.map(ft => ({
//                         name: ft.facilitytype,
//                         key: ft.facilitytype,
//                         sortable: false,
//                         wrap: true,
//                         color: ft.color_code || null
//                     })),
//                     { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
//                 ];
//                 tableData = await Promise.all(provinces.map(async (province) => {
//                     const facilities = await facility.findAll({
//                         where: {
//                             fk_districtid: province.districtid,
//                             isdeleted: 0
//                         },
//                         attributes: ['fk_facilitytype']
//                     });
        
//                     typeCounts = {};
//                     facilities.forEach(f => {
//                         const typeName = typeIdToName[f.fk_facilitytype];
//                         if (typeName) {
//                             typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
//                         }
//                     });
        
//                     row = {
//                         Name: province.district,
//                         Total: facilities.length
//                     };
        
//                     facilityTypeKeys.forEach(key => {
//                         row[key] = typeCounts[key] || 0;
//                     });
        
//                     return row;
//                 }));
        
//                 return Helper.response(
//                     true,
//                     "Provinces and facility data retrieved successfully",
//                     {
//                         tableData,
//                         tableColumns: tableHead
//                     },
//                     res,
//                     200
//                 );
        
        

//             default:
//                 provinces = await province_master.findAll({
//                     where: { isdeleted: 0 },
//                     order: [['createddate', 'ASC']]
//                 });
        
        
        
//                 if (!provinces || provinces.length === 0) {
//                     return Helper.response(false, "No provinces found", {}, res, 404);
//                 }
        
//                 facilityTypes = await facilitytypemaster.findAll({
//                     where: { isdeleted: 0 },
//                     order: [['facilitytype', 'ASC']]
//                 });
        
//                 if (!facilityTypes || facilityTypes.length === 0) {
//                     return Helper.response(false, "No facility types found", {}, res, 404);
//                 }
        
        
//                 typeIdToName = {};
//                 facilityTypes.forEach(ft => {
//                     typeIdToName[ft.id] = ft.facilitytype;
//                 });
        
//                 facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);
        
        
//                 tableHead = [
//                     { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
//                     ...facilityTypes.map(ft => ({
//                         name: ft.facilitytype,
//                         key: ft.facilitytype,
//                         sortable: false,
//                         wrap: true,
//                         color: ft.color_code || null
//                     })),
//                     { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
//                 ];
        
        
//                 tableData = await Promise.all(provinces.map(async (province) => {
//                     const facilities = await facility.findAll({
//                         where: {
//                             fk_provinceid: province.provinceid,
//                             isdeleted: 0
//                         },
//                         attributes: ['fk_facilitytype']
//                     });
        
//                     typeCounts = {};
//                     facilities.forEach(f => {
//                         const typeName = typeIdToName[f.fk_facilitytype];
//                         if (typeName) {
//                             typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
//                         }
//                     });
        
//                     row = {
//                         Name: province.province,
//                         Total: facilities.length
//                     };
        
//                     facilityTypeKeys.forEach(key => {
//                         row[key] = typeCounts[key] || 0;
//                     });
        
//                     return row;
//                 }));
        
//                 return Helper.response(
//                     true,
//                     "Provinces and facility data retrieved successfully",
//                     {
//                         tableData,
//                         tableColumns: tableHead
//                     },
//                     res,
//                     200
//                 );
        

                
//         }

       
//     } catch (error) {
//         console.error("DashboardTableData error:", error);
//         return Helper.response(false, error?.message, {}, res, 500);
//     }
// }

exports.DashboardTableData = async (req, res) => {
  try {
    let provinces = [];
    let facilityTypes = [];
    let tableData = [];
    let tableHead = [];
    let typeCounts = {};
    let facilityTypeKeys = [];
    let typeIdToName = {};
    let row = {};

    if (req.body && req.body.province_id) {
      const facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']],
        raw: true
      });
   
      const facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);
      
   
      // Build table header
      const tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" }
      ];

      const query = ` SELECT 

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

WHERE provincemaster.provinceid = ${req.body.province_id} and facility.isdeleted = 0

GROUP BY districtmaster.districtid, districtmaster.districtname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY districtmaster.districtname;
`
   
      // Call PostgreSQL function instead of writing SQL here
      const rawData = await sequelize.query(
        query,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { province_id: req.body.province_id },
          // No need for raw: true — it's default
        }
      );
     
   
      // Convert query results into your table format
      const districtMap = {};
   
      rawData.forEach(row => {
        if (!districtMap[row.districtid]) {
          districtMap[row.districtid] = {
            Name: row.districtname,
            Total: 0
          };
          facilityTypeKeys.forEach(key => {
            districtMap[row.districtid][key] = 0;
          });
        }
   
        districtMap[row.districtid][row.facilitytype] = parseInt(row.total_facilities, 10);
        districtMap[row.districtid].Total += parseInt(row.total_facilities, 10);
      });
   
      const tableData = Object.values(districtMap);
   
      return Helper.response(
        true,
        "District facility data retrieved successfully",
        { tableData, tableColumns: tableHead },
        res,
        200
      );


      // provinces = await district_master.findAll({
      //   where: {
      //     fk_provinceid: req.body.province_id,
      //     isdeleted: 0
      //   },
      //   raw:true,
      //   order: [['createddate', 'ASC']]
      // });
    
     

      // if (!provinces || provinces.length === 0) {
      //   return Helper.response(false, "No provinces found", {}, res, 404);
      // }

      // facilityTypes = await facilitytypemaster.findAll({
      //   where: { isdeleted: 0 },
      //   order: [['facilitytype', 'ASC']]
      // });

      // typeIdToName = {};
      // facilityTypes.forEach(ft => {
      //   typeIdToName[ft.id] = ft.facilitytype;
      // });

      // facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);

      // tableHead = [
      //   { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
      //   ...facilityTypes.map(ft => ({
      //     name: ft.facilitytype,
      //     key: ft.facilitytype,
      //     sortable: false,
      //     wrap: true,
      //     color: ft.color_code || null
      //   })),
      //   { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
      // ];

      // tableData = await Promise.all(provinces.map(async (province) => {
      //   const facilities = await facility.findAll({
      //     where: {
      //       fk_districtid: province.districtid,
      //       isdeleted: 0
      //     },
      //     attributes: ['fk_facilitytype']
      //   });

      //   typeCounts = {};
      //   facilities.forEach(f => {
      //     const typeName = typeIdToName[f.fk_facilitytype];
      //     if (typeName) {
      //       typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
      //     }
      //   });

      //   row = {
      //     Name: province.districtname,
      //     Total: facilities.length,
      //   };
      //   facilityTypeKeys.forEach(key => {
      //     row[key] = typeCounts[key] || 0;
      //   });

      //   return row;
      // }));

      // return Helper.response(
      //   true,
      //   "Provinces and facility data retrieved successfully",
      //   {
      //     tableData,
      //     tableColumns: tableHead
      //   },
      //   res,
      //   200
      // );

    }else if(req.body.district_id){
      const facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']],
        raw: true
      });

      const facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);
      const tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" }
      ];

      const query = `
      
SELECT 

  palikamaster.id,

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

WHERE districtmaster.districtid = ${req.body.district_id} and facility.isdeleted = 0

GROUP BY  palikamaster.id, palikamaster.palikaname,facility.fk_facilitytype,facilitytypemaster.facilitytype

ORDER BY  palikamaster.palikaname;

      
      
      `
      const rawData = await sequelize.query(
        query,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { district_id: req.body.district_id },
          // No need for raw: true — it's default
        }

      );

      const palikaMap = {};

      rawData.forEach(row => {
        if (!palikaMap[row.id]) {
          palikaMap[row.id] = {
            Name: row.palikaname,
            Total: 0
          };
          facilityTypeKeys.forEach(key => {
            palikaMap[row.id][key] = 0;
          });
        }

        palikaMap[row.id][row.facilitytype] = parseInt(row.total_facilities, 10);
        palikaMap[row.id].Total += parseInt(row.total_facilities, 10);
      });

      const tableData = Object.values(palikaMap);

      return Helper.response(
        true,
        "Palika facility data retrieved successfully",
        { tableData, tableColumns: tableHead },
        res,
        200
      );



        
    }else if(req.body.palika_id){
        
    }
    
    else {
      // No province_id provided in body

      provinces = await province_master.findAll({
        where: { isdeleted: 0 },
        order: [['createddate', 'ASC']],
      });

      if (!provinces || provinces.length === 0) {
        return Helper.response(false, "No provinces found", {}, res, 404);
      }

      facilityTypes = await facilitytypemaster.findAll({
        where: { isdeleted: 0 },
        order: [['facilitytype', 'ASC']]
      });

      if (!facilityTypes || facilityTypes.length === 0) {
        return Helper.response(false, "No facility types found", {}, res, 404);
      }

      typeIdToName = {};
      facilityTypes.forEach(ft => {
        typeIdToName[ft.id] = ft.facilitytype;
      });

      facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);

      tableHead = [
        { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
        ...facilityTypes.map(ft => ({
          name: ft.facilitytype,
          key: ft.facilitytype,
          sortable: false,
          wrap: true,
          color: ft.color_code || null
        })),
        { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
      ];

      tableData = await Promise.all(provinces.map(async (province) => {
        const facilities = await facility.findAll({
          where: {
            fk_provinceid: province.provinceid,
            isdeleted: 0
          },
          attributes: ['fk_facilitytype']
        });

        typeCounts = {};
        facilities.forEach(f => {
          const typeName = typeIdToName[f.fk_facilitytype];
          if (typeName) {
            typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
          }
        });

        row = {
          Name: province.province,
          Total: facilities.length,
        };

        facilityTypeKeys.forEach(key => {
          row[key] = typeCounts[key] || 0;
        });

        return row;
      }));

      return Helper.response(
        true,
        "Provinces and facility data retrieved successfully",
        {
          tableData,
          tableColumns: tableHead
        },
        res,
        200
      );
    }
  } catch (error) {
    console.error("DashboardTableData error:", error);
    return Helper.response(false, error?.message || "Internal Server Error", {}, res, 500);
  }
};

// exports.DashboardTableData = async (req, res) => {
//   try {
//     let provinces = [];
//     let facilityTypes = [];
//     let tableData = [];
//     let tableHead = [];
//     let typeCounts = {};
//     let facilityTypeKeys = [];
//     let typeIdToName = {};
//     let row = {};

//     if (req.body && req.body.province_id) {


//       provinces = await district_master.findAll({
//         where: {
//           fk_provinceid: req.body.province_id,
//           isdeleted: 0
//         },
//         raw:true,
//         order: [['createddate', 'ASC']]
//       });
     

//       if (!provinces || provinces.length === 0) {
//         return Helper.response(false, "No provinces found", {}, res, 404);
//       }

//       facilityTypes = await facilitytypemaster.findAll({
//         where: { isdeleted: 0 },
//         order: [['facilitytype', 'ASC']]
//       });

//       typeIdToName = {};
//       facilityTypes.forEach(ft => {
//         typeIdToName[ft.id] = ft.facilitytype;
//       });

//       facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);

//       tableHead = [
//         { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
//         ...facilityTypes.map(ft => ({
//           name: ft.facilitytype,
//           key: ft.facilitytype,
//           sortable: false,
//           wrap: true,
//           color: ft.color_code || null
//         })),
//         { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
//       ];

//       tableData = await Promise.all(provinces.map(async (province) => {
//         const facilities = await facility.findAll({
//           where: {
//             fk_districtid: province.districtid,
//             isdeleted: 0
//           },
//           attributes: ['fk_facilitytype']
//         });

//         typeCounts = {};
//         facilities.forEach(f => {
//           const typeName = typeIdToName[f.fk_facilitytype];
//           if (typeName) {
//             typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
//           }
//         });

//         row = {
//           Name: province.districtname,
//           Total: facilities.length,
//         };
//         facilityTypeKeys.forEach(key => {
//           row[key] = typeCounts[key] || 0;
//         });

//         return row;
//       }));

//       return Helper.response(
//         true,
//         "Provinces and facility data retrieved successfully",
//         {
//           tableData,
//           tableColumns: tableHead
//         },
//         res,
//         200
//       );

//     } else {
//       // No province_id provided in body

//       provinces = await province_master.findAll({
//         where: { isdeleted: 0 },
//         order: [['createddate', 'ASC']],
//       });

//       if (!provinces || provinces.length === 0) {
//         return Helper.response(false, "No provinces found", {}, res, 404);
//       }

//       facilityTypes = await facilitytypemaster.findAll({
//         where: { isdeleted: 0 },
//         order: [['facilitytype', 'ASC']]
//       });

//       if (!facilityTypes || facilityTypes.length === 0) {
//         return Helper.response(false, "No facility types found", {}, res, 404);
//       }

//       typeIdToName = {};
//       facilityTypes.forEach(ft => {
//         typeIdToName[ft.id] = ft.facilitytype;
//       });

//       facilityTypeKeys = facilityTypes.map(ft => ft.facilitytype);

//       tableHead = [
//         { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
//         ...facilityTypes.map(ft => ({
//           name: ft.facilitytype,
//           key: ft.facilitytype,
//           sortable: false,
//           wrap: true,
//           color: ft.color_code || null
//         })),
//         { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
//       ];

//       tableData = await Promise.all(provinces.map(async (province) => {
//         const facilities = await facility.findAll({
//           where: {
//             fk_provinceid: province.provinceid,
//             isdeleted: 0
//           },
//           attributes: ['fk_facilitytype']
//         });

//         typeCounts = {};
//         facilities.forEach(f => {
//           const typeName = typeIdToName[f.fk_facilitytype];
//           if (typeName) {
//             typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
//           }
//         });

//         row = {
//           Name: province.province,
//           Total: facilities.length,
//         };

//         facilityTypeKeys.forEach(key => {
//           row[key] = typeCounts[key] || 0;
//         });

//         return row;
//       }));

//       return Helper.response(
//         true,
//         "Provinces and facility data retrieved successfully",
//         {
//           tableData,
//           tableColumns: tableHead
//         },
//         res,
//         200
//       );
//     }
//   } catch (error) {
//     console.error("DashboardTableData error:", error);
//     return Helper.response(false, error?.message || "Internal Server Error", {}, res, 500);
//   }
// };


  


exports.getHealthFacilityTypeData = async (req, res) => {
    const { id, facility_image } = req.body;

    let whereClause = {
        fk_facilitytype: id,
        isdeleted: 0
    }
    if(req.body.province_id){
        whereClause.fk_provinceid = req.body.province_id
    }
    
    try {
        const facilitytypeData = await facility.findAll({
            where: whereClause,
        })


        const data = facilitytypeData.map((r) => {
            return {
                id: r.id,
                facilityname: r.facilityname,
                latitude: r.latitude || 0.00000,
                longitude: r.longitude || 0.0000,
                facility_image: facility_image
            }
        })
        return Helper.response(true, "Facility Type Data", { data }, res, 200);
    } catch (error) {
        console.error("Error fetching facility type data:", error);
        return Helper.response(false, "Error fetching facility type data", {}, res, 500);
    }
}

exports.health_worker_category = async (req, res) => {
    try {
        let data = []
        if(req.body.province_id){
            data = await Helper.getHealthWorkerCategoryProvince(req.body.province_id)
        }else if(req.body.district_id){
            data = await Helper.getHealthWorkerCategoryDistrict(req.body.district_id)
        }else{
            data = await Helper.getHealthWorkerCategory()
        }
        
    
        
    
       if(data.length === 0){
        return Helper.response(false, "No data found", {}, res, 200);
       }
         return Helper.response(true, "HR Data",{data}, res, 200);
     } catch (error) {
         console.error("Error fetching facility type data:", error);
         return Helper.response(false, "Error fetching facility type data", {}, res, 500);
     }
}


exports.getfacilityByProvince = async (req, res) => {
    try {
        const {id,province_id} = req.body;
        let facilityData = [];
        if(id){
            facilityData = await Helper.getFacility(id);
        }
        if(province_id){
            facilityData = await Helper.getFacilityProvince(id,province_id);
        }


        if (!facilityData || facilityData.length === 0) {
            return Helper.response(false, "No facility data found for the given province", {}, res,200);
        }

        return Helper.response(true, "Facility data by province", { facilityData }, res, 200);
    } catch (err) {
        console.error("Error fetching facility by province:", err);
        return Helper.response(false, "Error fetching facility by province", {}, res, 500);
    }
};


exports.getDistricts = async (req, res) => {
    try {
        const {province_id} = req.body;
        const filePath = path.join(__dirname, '..', '..', '..', 'geograhy', 'nepal-districts-geo.json');
        const data = await Helper.readFile(filePath);
        const realGeojson = data.data ? data.data : data;
        const geograhy = {
            type: realGeojson.type,
            features: realGeojson.features.filter(f =>
                f.properties && f.properties.PROVINCE === province_id
            ),
        };
        return Helper.response(true, "Districts data",geograhy, res, 200);

    } catch (err) {
        console.error("Error fetching district by province:", err);
        return Helper.response(false, "Error fetching district by province", {}, res, 500);
    }
}

exports.getPalika = async (req, res) => {
  try {
      const {district_id} = req.body;
      const filePath = path.join(__dirname, '..', '..', '..', 'geograhy', 'nepal-palika-geo.json');
      const data = await Helper.readFile(filePath);
      const realGeojson = data.data ? data.data : data;

      const geograhy = {
          type: realGeojson.type,
          features: realGeojson.features.filter(f =>
              f.properties && f.properties.dID === parseInt(district_id)
          ),
      };
      return Helper.response(true, "Districts data",geograhy, res, 200);

  } catch (err) {
      console.error("Error fetching district by province:", err);
      return Helper.response(false, "Error fetching district by province", {}, res, 500);
  }
}

exports.getWard = async (req, res) => {
  try {
      const {palika_id} = req.body;
      const filePath = path.join(__dirname, '..', '..', '..', 'geograhy', 'nepal-palika-geo.json');
      const data = await Helper.readFile(filePath);
      const realGeojson = data.data ? data.data : data;
     
      const geograhy = {
          type: realGeojson.type,
          features: realGeojson.features.filter(f =>
              f.properties && f.properties.aID == palika_id
          ),
      };
      return Helper.response(true, "Palika data",geograhy, res, 200);

  } catch (err) {
      console.error("Error fetching district by province:", err);
      return Helper.response(false, "Error fetching district by province", {}, res, 500);
  }
}







// exports.getVaccineProgramDD = async (req, res) => {
// try{
//     const vaccineProgramData = await VaccineProgram.findAll({
//     })

//     if (!vaccineProgramData || vaccineProgramData.length === 0) {
//         return Helper.response(false, "No vaccine program data found", {}, res,200);
//     }



//     const data = vaccineProgramData.map((r) => {
//         return {
//            value: r.name.toLowerCase(),
//            label: r.name,
//         }
//     })

//     return Helper.response(true, "Vaccine program data",data, res, 200);

// }catch(err){
//     console.error("Error fetching vaccine program:", err);
//     return Helper.response(false, "Error fetching vaccine program", {}, res, 500);
// }

// }

exports.getVaccineProgramDD = async (req, res) => {
  try {
    const vaccineProgramData = await VaccineProgram.findAll({
        where:{
            is_active:true
        }
    });

    if (!vaccineProgramData || vaccineProgramData.length === 0) {
      return Helper.response(false, "No vaccine program data found", [], res, 200);
    }

    // Map program name to actual DB columns
    const programColumnMap = {
      bcg: { columns: ['bcg'], type: 'trend', label: 'BCG' },
      opv: { opened: 'opv1', used: 'opv3', type: 'wastage', label: 'OPV' },
      pcv: { opened: 'pcv1', used: 'pcv3', type: 'wastage', label: 'PCV' },
      rota: { opened: 'rota1', used: 'rota3', type: 'wastage', label: 'Rota' },
      'dpt-hepb-hib': { opened: 'dpt1', used: 'dpt3', type: 'wastage', label: 'DPT-HepB-Hib' },
      fipv: { opened: 'fipv1', used: 'fipv3', type: 'wastage', label: 'FIPV' },
      je: { opened: 'je1', used: 'je2', type: 'wastage', label: 'JE' },
      td: { opened: 'td1', used: 'td2', type: 'wastage', label: 'TD' },
      tcv: { opened: 'tcv1', used: 'tcv2', type: 'wastage', label: 'TCV' },
      hpv: { opened: 'hpv1', used: 'hpv2', type: 'wastage', label: 'HPV' },
      'measles/rubella': { columns: ['mr_9_11m', 'mr_12_23m'], type: 'trend', label: 'Measles/Rubella' },
      'fully immunized': { columns: ['fully_immunized'], type: 'trend', label: 'Fully Immunized' }
    };

    const data = vaccineProgramData.map(r => {
      const value = r.name.toLowerCase();
      const config = programColumnMap[value];

      return {
        value,
        label: r.name,
        ...config
      };
    });

    return Helper.response(true, "Vaccine program data", data, res, 200);

  } catch (err) {
    console.error("Error fetching vaccine program:", err);
    return Helper.response(false, "Server Error", {}, res, 500);
  }
};
