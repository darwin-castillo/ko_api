const Sequelize = require('sequelize');
const sequelize = require('../config/config');
const User = sequelize.define('klop_users', {
    id: {type: Sequelize.SMALLINT, primaryKey: true},
    name: Sequelize.STRING,
    surname: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
}, {
        timestamps: false,
    });



module.exports = User;
