const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
 
const VaccineWarehouse = sequelize.define('vaccine_warehouse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  centre_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  palika_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  facilitytype_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  description:{
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'vaccine_warehouse',
  timestamps: false
});
 
 
// VaccineWarehouse.sync()
//     .then(() => {
//         console.log('VaccineWarehouse table has been created or updated successfully.');
//     })
//     .catch((error) => {
//         console.error('Error creating or updating VaccineWarehouse table:', error);
//     });
module.exports = VaccineWarehouse;