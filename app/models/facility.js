const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const facility = sequelize.define('facility', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fk_facilitycode: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    facilityname: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    fk_facilitytype: {
        type: DataTypes.INTEGER,
        allowNull: false,
       
    },
    fk_provinceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
       
    },
    fk_districtid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    fk_palikaid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    fk_wardid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      
    },
    operationalstatus: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    authoritylevel: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    authority: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    Ownership: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    Internetfacility: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    sanctioned_facility_bed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    functional_facility_bed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    estd_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Last_renew_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    date_of_validation: {
        type: DataTypes.DATE,
        allowNull: true
    },
    services: {
        type: DataTypes.STRING(800),
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    latitude: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    longitude: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    createddate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isdeleted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'facility',
    timestamps: false
});

facility.sync()
    .then(() => {
        console.log("Facility table synced successfully.");
    })
    .catch((error) => {
        console.error("Error syncing Facility table:", error);
    });
module.exports = facility;