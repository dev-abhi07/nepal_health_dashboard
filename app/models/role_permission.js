const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const RolePermission = sequelize.define('role_permission', {
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    permission_id: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    menu_id: { type: DataTypes.INTEGER, allowNull: true },
    submenu_id: { type: DataTypes.INTEGER, allowNull: true },
    isView: { type: DataTypes.BOOLEAN, allowNull: true },
    isCreate: { type: DataTypes.BOOLEAN, allowNull: true },
    isUpdate: { type: DataTypes.BOOLEAN, allowNull: true }
}, {
    tableName: 'role_permissions',
    timestamps: false
});


module.exports = RolePermission;