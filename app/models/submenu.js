const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

const subMenu = sequelize.define("subMenu", {
    id: {
        type: DataTypes.INTEGER,
        defaultValue: DataTypes.INTEGER,
        primaryKey: true,
    },

    sub_menu: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,

    },
    page_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    menu_id: {
        type: DataTypes.INTEGER,

    },
    sub_submenu_id: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,

    },
    created_by: {
        type: DataTypes.INTEGER, 
        allowNull: false,
    },
},
);

subMenu.sync()
    .then(() => {
        console.log('Palikamaster table has been created or updated successfully.');
    })
    .catch((error) => {
        console.error('Error creating or updating Palikamaster table:', error);
    }); 

module.exports = subMenu;