const sequelize = require("../connection/connection");
const { DataTypes } = require('sequelize');

const admin_login = sequelize.define("adminlogin", {
    Pk_AdminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    LoginId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Password: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    FirstName: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    LastName: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    Mobile: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    Email: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    Fk_Usertype: {
        type: DataTypes.ENUM("admin", "province", "district", "municipality", "facility"),
        allowNull: true,
    },
    AndroidId: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    DeviceId: {
        type: DataTypes.STRING(600),
        allowNull: true
    },
    DeviceType: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    IsActive: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ProvinceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    DistrictId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    PalikaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    WardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    FacilityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    CreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    CreatedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'adminlogin',
    timestamps: false
});


admin_login.sync().then(() => {
     console.log('AdminUser table synced successfully');
 }).catch((error) => {
     console.error('Error syncing AdminUser table:', error);
 })

module.exports = admin_login;