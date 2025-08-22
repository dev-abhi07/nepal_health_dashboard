const sequelize = require("../connection/connection");
const { DataTypes } = require('sequelize');
const Role = require('./role'); // <-- Import role model here

const admin_login = sequelize.define("adminlogin", {
  Pk_AdminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  LoginId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique:true
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
    type: DataTypes.ENUM("admin", "province", "district", "municipality", "facility","country","ward"),
    allowNull: true
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
  reason:{
    type:DataTypes.TEXT,
    allowNull:true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
}, {
  tableName: 'adminlogin',
  timestamps: false
});

// ⛓️ Direct association defined here
admin_login.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

module.exports = admin_login;
