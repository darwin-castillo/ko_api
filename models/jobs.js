const Sequelize = require('sequelize');
const sequelize = require('../config/config');
const Jobs = sequelize.define('klop_jobs', {
    id: {type: Sequelize.SMALLINT, primaryKey: true},
   title: Sequelize.STRING,
   description: Sequelize.STRING,
   date_created: Sequelize.STRING,
   date_updated: Sequelize.STRING,
   user_id_autor: Sequelize.STRING,
   user_id_cleaner: Sequelize.STRING
    
}, {
        timestamps: false,
    });



module.exports = Jobs;
