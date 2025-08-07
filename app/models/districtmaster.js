const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const district_master = sequelize.define('districtmaster', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    districtid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    fk_provinceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    districtname: {
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
    }
}, {
    tableName: 'districtmaster',
    timestamps: false
});



// district_master.sync()
//     .then(() => {
//         console.log('Districtmaster table has been created or updated successfully.');
//     })
//     .catch((error) => {
//         console.error('Error creating or updating Districtmaster table:', error);
//     });
module.exports = district_master;