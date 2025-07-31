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
const { Op } = require("sequelize");

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

    //get Total Provinces
    const province_masters = await province_master.count({
        where: {
            isdeleted: 0
        }
    })


    //get Total Districts
    const totalDistricts = await district_master.count({
        where: {
            isdeleted: 0
        }
    })

    //get Total Palikas
    const totalPalikas = await palika_master.count({
        where: {
            isdeleted: 0
        }
    })

    //get Total Wards 
    const totalWards = await WardMaster.count({
        where: {
            isdeleted: 0
        }
    })

    const demography = [{ title: 'Provinces', total_count: province_masters }, {
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

    const facilityTypes = await facilitytypemaster.findAll({
        where: {
            isdeleted: 0
        },
        order: [['facilitytype', 'ASC']]
    });


    const totalFacility = await Promise.all(facilityTypes.map(async (r) => {

        const facilityTypeCount = await facility.count({
            where: {
                fk_facilitytype: r.id,
            }
        })
        console.log(r.facilitytype);
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

    return Helper.response(true, "Welcome to the Dashboard", { demography: demography, totalFacility }, res, 200);
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

exports.vaccineDropChart = async (req, res) => {
    const year = 2024;
    const month = 'July';

    const data = await vaccine_hmis.findAll({
        attributes: [
            'periodname',
            'dropout_dpt1_vs_3',
            'dropout_dpt1_vs_mr2',
            'dropout_pcv1_vs_3'
        ],
        where: { year },
        order: [['periodname', 'ASC']]
    });



    const categories = data.map(d => d.periodname)
    const dose1 = data.map(d => d.dropout_dpt1_vs_3);
    const dose2 = data.map(d => d.dropout_dpt1_vs_mr2);
    const dose3 = data.map(d => d.dropout_pcv1_vs_3);


    const lineChart = {
        chart: {
            type: 'line',
            height: 330,
        },
        title: {
            text: "",
            align: "left",
            style: {
                fontWeight: "700",
                fontSize: "16.8px",
                color: "#364a36",
            },
        },
        credits: {
            text: 'Powered By ' +
                '<a href="https://quaeretech.com"' +
                'target="_blank">Quaere Etechnologies</a>'
        },
        accessibility: {
            point: {
                valueDescriptionFormat: "{xDescription}{separator}{value} million(s)",
            },
        },

        xAxis: {
            categories: ["JAN", "FEB", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"],
        },

        yAxis: {
            type: "logarithmic",
            title: {
                text: "Number of Vaccination",
            },
        },
        credits: false,
        tooltip: {
            headerFormat: "<b>{series.name}</b><br />",
            pointFormat: "{point.y} vaccinations",
        },

        series: [
            {
                name: "DPT-HepB-Hib Dose 1",
                data: data.map(item => parseInt(item.dropout_dpt1_vs_3 || 0)),
                color: "var(--highcharts-color-1, #0fac81)",
            },
            {
                name: "DPT-HepB-Hib Dose 2",
                data: data.map(item => parseInt(item.dropout_dpt1_vs_mr2 || 0)),
                color: "var(--highcharts-color-1, #003893)",
            },
            {
                name: "DPT-HepB-Hib Dose 3",
                data: data.map(item => parseInt(item.dropout_pcv1_vs_3 || 0)),
                color: "var(--highcharts-color-1, #dc143c)",
            },
        ],
    };

    return Helper.response(true, "Welcome to the Dashboard", { lineChart }, res, 200);
}



exports.ImmunizationRecord = async (req, res) => {
    try {
        const records = await ImmunizationRecord.findAll({
            attributes: ['date', 'dpt1', 'dpt3'],
            where: {
                date: {
                    [Op.gte]: new Date(2024, 0, 1),
                    [Op.lte]: new Date(new Date().getFullYear(), 0, 1)
                }
            },
            raw: true
        });

        const monthlyData = {};

        records.forEach(record => {
            const month = moment(record.date).format('MMM');

            if (!monthlyData[month]) {
                monthlyData[month] = { dpt1: 0, dpt3: 0 };
            }

            monthlyData[month].dpt1 += record.dpt1 || 0;
            monthlyData[month].dpt3 += record.dpt3 || 0;
        });

        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const acceptableLimits = {
            Jan: 34, Feb: 40, Mar: 42, Apr: 25, May: 41,
            Jun: 50, Jul: 90, Aug: 90, Sep: 80, Oct: 50,
            Nov: 20, Dec: 10
        };

        const wastageData = monthOrder.map(month => {
            const { dpt1 = 0, dpt3 = 0 } = monthlyData[month] || {};
            const rate = dpt1 > 0 ? ((dpt3 - dpt1) / dpt1) * 100 : 0;
            console.log(`Month: ${month}, DPT1: ${dpt1}, DPT3: ${dpt3}, Rate: ${rate}`);
            return parseFloat(rate.toFixed(2));
        });


        const acceptableData = monthOrder.map(month => acceptableLimits[month] || 0);

        const immunization_record = {
            chart: {
                zooming: { type: 'xy' },
                height: 236
            },
            title: { text: '', align: 'center' },
            credits: {
                text: 'Powered By <a href="https://quaeretech.com" target="_blank">Quaere Etechnologies</a>'
            },
            xAxis: [{
                categories: monthOrder,
                crosshair: true
            }],
            yAxis: [{
                labels: { format: '{value}' },
                title: { text: 'Wastage Rate' },
                lineColor: '',
                lineWidth: 2
            }, {
                title: { text: 'Acceptable Limit' },
                labels: { format: '{value}' },
                lineColor: '',
                lineWidth: 2,
                opposite: true
            }],
            tooltip: { shared: true },
            legend: {
                align: 'left',
                verticalAlign: 'top'
            },
            series: [{
                name: 'Wastage(%)',
                type: 'column',
                yAxis: 1,
                data: wastageData,
                color: '#213dad'
            }, {
                name: 'Acceptable',
                type: 'spline',
                data: acceptableData,
                color: '#dc143c'
            }]
        };

        return Helper.response(true, '', { immunization_record }, res, 200);
    } catch (error) {
        console.error("Wastage chart error:", error);
        return Helper.response(false, 'Server Error', {}, res, 500);
    }
};

exports.populationChart = async (req, res) => {
    const population_chart = {
        chart: {
            type: 'pie',
            height:196
        },
        title: {
            text: '',
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
            layout: 'vertical'
        },
        series: [{
            name: 'Population',
            colorByPoint: true,
            data: [
                { name: 'Children Below 5', y: 55, color: '#0fac81' },
                { name: 'Adolescent Girls', y: 25, color: '#dc143c' },
                { name: 'Woman of Child Bearing Age', y: 20, color: '#213dad' }
            ]
        }]
    }

    return Helper.response(true, '', { population_chart }, res, 200);

}

exports.DashboardTableData = async (req, res) => {
try {
  
  const provinces = await province_master.findAll({
    where: { isdeleted: 0 },
    order: [['createddate', 'ASC']]
  });

  if (!provinces || provinces.length === 0) {
    return Helper.response(false, "No provinces found", {}, res, 404);
  }


  const facilityTypes = await facilitytypemaster.findAll({
    where: { isdeleted: 0 },
    order: [['facilitytype', 'ASC']]
  });

  if (!facilityTypes || facilityTypes.length === 0) {
    return Helper.response(false, "No facility types found", {}, res, 404);
  }

//   const tableData = await Promise.all(provinces.map(async (province) => {
//     const row = {
//       id: province.provinceid,
//       Name: province.province,
//       Total: 0
//     };

//     await Promise.all(facilityTypes.map(async (type) => {
//       const count = await facility.count({
//         where: {
//           fk_provinceid: province.provinceid,
//           fk_facilitytype: type.id,
//           isdeleted: 0
//         }
//       });

//       row[type.shortname || type.facilitytype] = count; 
//       row.Total += count;
//     }));

//     return row;
//   }));
const  tableData= [
    {
      Name: "Koshi",
      BHSC: 378,
      BH: 265,
      ATM: 184,
      SH: 220,
      SEH: 143,
      PC: 125,
      DH: 172,
      DC: 136,
      HSI: 104,
      RD: 109,
      RC: 91,
      Total: 1982,
    },
    {
      Name: "Madhesh",
      BHSC: 402,
      BH: 289,
      ATM: 176,
      SH: 194,
      SEH: 167,
      PC: 138,
      DH: 145,
      DC: 119,
      HSI: 132,
      RD: 98,
      RC: 76,
      Total: 1995,
    },
    {
      Name: "Bagmati",
      BHSC: 313,
      BH: 305,
      ATM: 172,
      SH: 206,
      SEH: 159,
      PC: 127,
      DH: 153,
      DC: 141,
      HSI: 87,
      RD: 113,
      RC: 92,
      Total: 1929,
    },
    {
      Name: "Gandaki",
      BHSC: 356,
      BH: 318,
      ATM: 168,
      SH: 189,
      SEH: 154,
      PC: 146,
      DH: 122,
      DC: 134,
      HSI: 121,
      RD: 103,
      RC: 83,
      Total: 1994,
    },
    {
      Name: "Lumbini",
      BHSC: 394,
      BH: 221,
      ATM: 195,
      SH: 208,
      SEH: 147,
      PC: 137,
      DH: 129,
      DC: 110,
      HSI: 91,
      RD: 122,
      RC: 79,
      Total: 1893,
    },
    {
      Name: "Karnali",
      BHSC: 347,
      BH: 277,
      ATM: 193,
      SH: 214,
      SEH: 149,
      PC: 113,
      DH: 158,
      DC: 106,
      HSI: 128,
      RD: 116,
      RC: 84,
      Total: 2015,
    },
    {
      Name: "Sudurpaschim",
      BHSC: 336,
      BH: 298,
      ATM: 165,
      SH: 197,
      SEH: 171,
      PC: 132,
      DH: 168,
      DC: 129,
      HSI: 106,
      RD: 120,
      RC: 96,
      Total: 2018,
    },
  ]
const tableHead = [
  { name: "Name", key: "Name", sortable: true, wrap: true, color: null },
  { name: "BHSC", key: "BHSC", sortable: false, wrap: true, color: "#0984e3" },
  { name: "BH", key: "BH", sortable: false, wrap: true, color: "#fd79a8" },
  { name: "ATM", key: "ATM", sortable:false, wrap: true, color: "#e17055" },
  { name: "SH", key: "SH", sortable: false, wrap: true, color: "#fab1a0" },
  { name: "SEH", key: "SEH", sortable:false, wrap: true, color: "#ffeaa7" },
  { name: "PC", key: "PC", sortable:false, wrap: true, color: "#74b9ff" },
  { name: "DH", key: "DH", sortable:false, wrap: true, color: "#a29bfe" },
  { name: "DC", key: "DC", sortable:false, wrap: true, color: "#55efc4" },
  { name: "HSI", key: "HSI", sortable:false, wrap: true, color: "#d63031" },
  { name: "RD", key: "RD", sortable:false, wrap: true, color: "#e84393" },
  { name: "RC", key: "RC", sortable:false, wrap: true, color: "#2d3436" },
  { name: "Total", key: "Total", sortable: true, wrap: true, color: "#636e72" },
];

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
catch (error) {
    console.error("Population chart error:", error);
    return Helper.response(false, error?.message, {}, res, 500);
    
  }

}
