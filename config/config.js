const Sequelize = require('sequelize');
const environment = 2;  // 1 -> Production   // 2-> Dev  // 3-> Local
const pg_user = environment===2?'vrchzfftnlewzg':'postgres';
const pg_host =  environment===2?'ec2-184-73-210-189.compute-1.amazonaws.com':'localhost';
const pg_db = environment===2?'d74rfbuj0t08v4':'kleanops';
const pg_pass = environment===2?'b5381e6cefc63ad539e4a807215694139cb22d08621384151b1db87af3d59e5d':'1234';

const sequelize = new Sequelize(pg_db, pg_user, pg_pass, {
    host: pg_host,
    dialect: 'postgres',
});

sequelize.authenticate()
    .then(() => {
        console.log('Conectado con Seq')
    })
    .catch(err => {
        console.log('No se conecto Seq')
    })

module.exports = sequelize;