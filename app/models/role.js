const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");
const Permission = require("./permission");

const Role = sequelize.define('role', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  nickname: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'roles',
  timestamps: false
});

Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  timestamps: false 
});

module.exports = Role;
