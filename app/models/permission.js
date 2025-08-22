const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const Role = require("./role");


const Permission = sequelize.define('permission', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255), allowNull: true },
}, {
    tableName: 'permissions',
    timestamps: false
});


module.exports = Permission;