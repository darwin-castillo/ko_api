const Sequelize = require('sequelize');
const Pool = require('pg').Pool
const environment = 2;  // 1 -> Production   // 2-> Dev  // 3-> Local
const pg_user = environment===2?'vrchzfftnlewzg':'postgres';
const pg_host =  environment===2?'ec2-184-73-210-189.compute-1.amazonaws.com':'localhost';
const pg_db = environment===2?'d74rfbuj0t08v4':'kleanops';
const pg_pass = environment===2?'b5381e6cefc63ad539e4a807215694139cb22d08621384151b1db87af3d59e5d':'1234';
const paypal = require('paypal-rest-sdk');


// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Abv-W4EiJgwaDn5q5C0iFUmryX1zdnOP8hT_NWu-oo2b5QUI9uOyAdjg9m_E26sKO6VYOuMvSzz9k5FSE', // please provide your client id here
    'client_secret': 'ECkwGvNc7LJYRXOW4MuW2Tiws3pykAMO3jLnU_BmCsdm-hi_y0xTb_34mFwi4fiG7aaO9Eq1pNsZz-yc' // provide your client secret here
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

