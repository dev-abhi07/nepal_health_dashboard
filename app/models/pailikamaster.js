const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const palika_master = sequelize.define('palikamaster', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    fk_provinceid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    fk_districtid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    palikaname: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    created_by: {
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
    },
    palikaid: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'palikamaster',
    timestamps: false
});

// palika_master.sync({ alter: true })
//     .then(() => {
//         console.log('Palikamaster table has been created or updated successfully.');
//     })
//     .catch((error) => {
//         console.error('Error creating or updating Palikamaster table:', error);
//     }); 

module.exports = palika_master;