const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const location_province = sequelize.define('location_province', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    country_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    created_by_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    deleted_by_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    updated_by_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    }
  }, {
    tableName: 'location_province', // or the actual table name
    timestamps: false, // manually handle created_at, updated_at
    paranoid: false     // if you're not using soft delete
  });

  // location_province.sync()
  //   .then(() => {
  //       console.log('Location Provinces table has been created or updated successfully.');
  //   })
  //   .catch((error) => {
  //       console.error('Error creating or updating Location Provinces table:', error);
  //   });

  module.exports = location_province;