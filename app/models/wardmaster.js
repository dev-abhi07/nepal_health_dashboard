const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


const WardMaster = sequelize.define('wardmaster', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fk_provinceid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    fk_districtid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    fk_palikaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    wardname: {
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
      defaultValue: DataTypes.NOW
    },
    isdeleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    wardid: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'wardmaster',
    timestamps: false
  });

WardMaster.sync({ alter: true })
  .then(() => {
    console.log('WardMaster table has been created or updated successfully.');
  })
  .catch((error) => {
    console.error('Error creating or updating WardMaster table:', error);
  }
);
module.exports = WardMaster;