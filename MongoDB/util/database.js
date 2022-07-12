const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'nodejs_udemy',
    'root',
    'mysqlpasswrd',
    {
        dialect: 'mysql',
        host: 'localhost'
    }
);

module.exports = sequelize;
