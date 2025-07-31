const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const ImmunizationRecord = sequelize.define("immunization_records", {
    nhfr_id: { type: DataTypes.STRING },
    hmis_id: { type: DataTypes.STRING },
    time_period: { type: DataTypes.STRING },
    mr_12_23m: { type: DataTypes.INTEGER },
    mr_9_11m: { type: DataTypes.INTEGER },
    bcg: { type: DataTypes.INTEGER },
    je: { type: DataTypes.INTEGER },
    td2: { type: DataTypes.INTEGER },
    dpt1: { type: DataTypes.INTEGER },
    dpt2: { type: DataTypes.INTEGER },
    dpt3: { type: DataTypes.INTEGER },
    fipv1: { type: DataTypes.INTEGER },
    fipv2: { type: DataTypes.INTEGER },
    opv1: { type: DataTypes.INTEGER },
    opv2: { type: DataTypes.INTEGER },
    opv3: { type: DataTypes.INTEGER },
    pcv1: { type: DataTypes.INTEGER },
    pcv2: { type: DataTypes.INTEGER },
    pcv3: { type: DataTypes.INTEGER },
    rota1: { type: DataTypes.INTEGER },
    rota2: { type: DataTypes.INTEGER },
    fully_immunized: { type: DataTypes.INTEGER },
    td1: { type: DataTypes.INTEGER },
    tcv: { type: DataTypes.INTEGER },
    hf_id: { type: DataTypes.STRING },
    province_id: { type: DataTypes.STRING },
    province_name: { type: DataTypes.STRING },
    district_id: { type: DataTypes.STRING },
    district_name: { type: DataTypes.STRING },
    municipality_id: { type: DataTypes.STRING },
    municipality_name: { type: DataTypes.STRING },
    ward_id: { type: DataTypes.STRING },
    ward_name: { type: DataTypes.STRING },
    health_facility: { type: DataTypes.STRING },
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.DATEONLY,allowNull:true }
}, {
    tableName: 'immunization_records',
    timestamps: false
});

ImmunizationRecord.sync({ alter: true })
    .then(() => {
        console.log("Immunization Records table synced successfully."); // Table created or altered successfully
    })
    .catch((error) => {
        console.error("Error syncing Immunization Records table:", error); // Handle any errors during the sync
    });
module.exports = ImmunizationRecord;