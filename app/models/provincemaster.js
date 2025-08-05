const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const province_master = sequelize.define('provincemaster', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    provinceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    province: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    latitude:{
        type: DataTypes.STRING(50),
        allowNull: true
    },
    longitude:{
        type: DataTypes.STRING(50),
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
    }
}, {
    tableName: 'provincemaster',
    timestamps: false
});

// province_master.sync({ alter: true })
//     .then(() => {
//         console.log('Provincemaster table has been created or updated successfully.');
//     })
//     .catch((error) => {
//         console.error('Error creating or updating Provincemaster table:', error);
//     }); 

module.exports = province_master;
