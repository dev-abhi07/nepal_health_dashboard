const { DataTypes } = require("sequelize");
const sequelize = require("../connection/connection");

// models/PopulationStats.js

const PopulationStats = sequelize.define('populationStats', {
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    province_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    district_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    municipality_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    table_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },   
    population: DataTypes.INTEGER,
    exp_live_births: DataTypes.INTEGER,
    pop00to11months: DataTypes.INTEGER,
    pop02to11months: DataTypes.INTEGER,
    pop00to23months: DataTypes.INTEGER,
    pop00to35months: DataTypes.INTEGER,
    pop00to59months: DataTypes.INTEGER,
    pop06to23months: DataTypes.INTEGER,
    pop12to23months: DataTypes.INTEGER,
    pop12to59months: DataTypes.INTEGER,
    pop06to59months: DataTypes.INTEGER,
    pop00to14years: DataTypes.INTEGER,
    female_pop10to19years: DataTypes.INTEGER,
    male_pop10to19years: DataTypes.INTEGER,
    pop10to19years: DataTypes.INTEGER,
    female_pop15to44years: DataTypes.INTEGER,
    wra15to49years: DataTypes.INTEGER,
    mwra15to49years: DataTypes.INTEGER,
    expected_pregnancy: DataTypes.INTEGER,
    pop60plusyears: DataTypes.INTEGER,
    pop5to11years: DataTypes.INTEGER,
    pop12to18years: DataTypes.INTEGER,
    pop15months_to15years: DataTypes.INTEGER,
    pop24to59months: DataTypes.INTEGER,
    pop15to23months: DataTypes.INTEGER,
    female_pop9to13years: DataTypes.INTEGER,
    pop06to11months: DataTypes.INTEGER,
    pop06to08months: DataTypes.INTEGER,  
    doc: DataTypes.INTEGER,
    female_pop30plusyears: DataTypes.INTEGER,
    female_pop30to49years: DataTypes.INTEGER,
    female_pop50plusyears: DataTypes.INTEGER,
    female_pop20to70years: DataTypes.INTEGER,
    female_pop20to39years: DataTypes.INTEGER,
    female_pop40to70years: DataTypes.INTEGER,
    pop60to69years: DataTypes.INTEGER,
    pop70to84years: DataTypes.INTEGER,
    pop84plusyears: DataTypes.INTEGER,
    pop30to69years: DataTypes.INTEGER,
    pop70plusyears: DataTypes.INTEGER,
    pop30to69years_70plusyears: DataTypes.INTEGER,
    pop0to14_15to49_50plusyears: DataTypes.INTEGER
}, {
    tableName: 'population_stats',
    timestamps: false
});

// PopulationStats.sync({alter:true})
//     .then(() => {
//         console.log('PopulationStats table has been created or updated successfully.');
//     })
//     .catch((error) => {
//         console.error('Error creating or updating PopulationStats table:', error);
//     });

module.exports = PopulationStats

