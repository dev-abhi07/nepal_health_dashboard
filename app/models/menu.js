const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


const menu = sequelize.define("menu", {
    id: {
        type: DataTypes.INTEGER,
        defaultValue: DataTypes.INTEGER,
        primaryKey: true,
    },
    menu_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
    },
    icon_class: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    page_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER, 
        allowNull: true,
    },
});
menu.sync({ alter: true })
    .then(() => {
        console.log('Palikamaster table has been created or updated successfully.');
    })
    .catch((error) => {
        console.error('Error creating or updating Palikamaster table:', error);
    }); 

module.exports = menu;