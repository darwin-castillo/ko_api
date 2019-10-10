const Sequelize = require('sequelize');
const Pool = require('pg').Pool
const environment = 3 ;  // 1 -> Production   // 2-> Dev  // 3-> Local
const pg_user = environment===2?process.env.DB_USER:'postgres';
const pg_host =  environment===2?process.env.DB_HOST:'localhost';
const pg_db = environment===2?process.env.DB_NAME:'kleanops';
const pg_pass = environment===2?process.env.DB_PASS:'1234';
const paypal = require('paypal-rest-sdk');


// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID , // please provide your client id here
    'client_secret': process.env.PAYPAL_CLIENT_PASS // provide your client secret here
});

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




const pool = new Pool({
    user: pg_user,
    host: pg_host,
    database: pg_db,
    password: pg_pass,
    port: 5432,
});


module.exports = {pool,sequelize};

