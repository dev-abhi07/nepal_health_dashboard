const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const vaccine_hmis = sequelize.define('vaccine_hmis', {
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orgunitlevel1: DataTypes.STRING,
    orgunitlevel2: DataTypes.STRING,
    orgunitlevel3: DataTypes.STRING,
    orgunitlevel4: DataTypes.STRING,
    orgunitlevel5: DataTypes.STRING,
    orgunitlevel6: DataTypes.STRING,
    organisationunitid: DataTypes.STRING,
    nhfrId: DataTypes.STRING,
    organisationunitname: DataTypes.TEXT,
    organisationunitcode: DataTypes.STRING,
    organisationunitdescription: DataTypes.TEXT,
    periodid: DataTypes.STRING,
    periodname: DataTypes.STRING,
    periodcode: DataTypes.STRING,
    perioddescription: DataTypes.TEXT,

    dropout_dpt1_vs_3: DataTypes.FLOAT,
    dropout_dpt1_vs_mr2: DataTypes.FLOAT,
    dropout_pcv1_vs_3: DataTypes.FLOAT,
    dropout_mr: DataTypes.FLOAT,

    wastage_bcg: DataTypes.FLOAT,
    wastage_dpt_hepb_hib: DataTypes.FLOAT,
    wastage_fipv: DataTypes.FLOAT,
    wastage_je: DataTypes.FLOAT,
    wastage_mr: DataTypes.FLOAT,
    wastage_opv: DataTypes.FLOAT,
    wastage_rota: DataTypes.FLOAT,
    wastage_tcv: DataTypes.FLOAT,
    wastage_td: DataTypes.FLOAT,
    wastage_pcv: DataTypes.FLOAT,

    pct_sessions_conducted: DataTypes.FLOAT,
    pct_clinics_conducted: DataTypes.FLOAT,
    pct_serious_aefi: DataTypes.FLOAT,
    month: DataTypes.STRING(50),
}, {
    tableName: 'vaccine_hmis', // use your actual table name
    timestamps: false
});

// vaccine_hmis.sync({ alter: true })
//     .then(() => {
//         console.log("Vaccine HMIS table synced successfully."); // Table created or altered successfully
//     })
//     .catch((error) => {
//         console.error("Error syncing Vaccine HMIS table:", error); // Handle any errors during the sync
//     });
module.exports = vaccine_hmis;


