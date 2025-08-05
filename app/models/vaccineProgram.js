const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");


const VaccineProgram = sequelize.define('vaccine_program', {
     id: {
           type:DataTypes.BIGINT,
           allowNull: false,
           primaryKey: true,
           autoIncrement: true
       },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    code:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    },
},{
    tableName: 'vaccine_program',
    timestamps:false,
    paranoid: false


})

VaccineProgram.sync()
    .then(() => {
        console.log('Vaccine Program table has been created or updated successfully.');
    })
    .catch((error) => {
        console.error('Error creating or updating Vaccine Program table:', error);
    });

module.exports = VaccineProgram
