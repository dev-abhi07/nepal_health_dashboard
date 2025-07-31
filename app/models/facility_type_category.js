const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const facility_type = sequelize.define('facility_type_category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'facility_type_category', // or your actual table name
  timestamps: false          // since created_at and updated_at are handled manually
});

// facility_type.sync()
//   .then(() => {
//     console.log('Facility Type Category table has been created or updated successfully.');
//   })
//   .catch((error) => {
//     console.error('Error creating or updating Facility Type Category table:', error);
//   });
module.exports = facility_type;
