const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const health_worker_category = sequelize.define('health_worker_category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    emoji: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(50),
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
    icon:{
        type:DataTypes.STRING(100),
        allowNull:true
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
    tableName: 'health_worker_category', // Replace with actual table name
    underscored: true,
    timestamps: false, // Set true if using Sequelize's automatic timestamps
});

health_worker_category.sync()
    .then(() => {
        console.log("health_worker_category table synced successfully."); // Table created or altered successfully
    })
    .catch((error) => {
        console.error("Error syncing FacilityType table:", error); // Handle any errors during the sync
    });

module.exports = health_worker_category