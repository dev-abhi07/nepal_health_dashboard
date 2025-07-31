const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


const location_district = sequelize.define('location_district', {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    created_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    deleted_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    province_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    updated_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    tableName: 'location_district', // use your actual table name
    timestamps: false,      // because created_at, updated_at are custom
    paranoid: false         // set to true if using deleted_at as soft delete
});

location_district.sync()
    .then(() => {
        console.log('Location District table has been created or updated successfully.');
    })
    .catch((error) => {
        console.error('Error creating or updating Location District table:', error);
    });
module.exports = location_district;
