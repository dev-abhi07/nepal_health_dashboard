const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const facilitytypemaster = sequelize.define("facilitytypemaster", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    facilitytype: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    image:{
        type: DataTypes.STRING(250),
        allowNull: true
    },
    createdby: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createddate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
    },
    isdeleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    color_code:{
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: "facilitytypemaster", // use your actual table name
    timestamps: false
});

// facilitytypemaster.sync({ alter: true })
//     .then(() => {
//         console.log("FacilityType table synced successfully."); // Table created or altered successfully
//     })
//     .catch((error) => {
//         console.error("Error syncing FacilityType table:", error); // Handle any errors during the sync
//     });

module.exports = facilitytypemaster;