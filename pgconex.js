const Pool = require('pg').Pool
const environment = 3;  // 1 -> Production   // 2-> Dev  // 3-> Local
const pg_user = environment===2?'vrchzfftnlewzg':'postgres';
const pg_host =  environment===2?'ec2-184-73-210-189.compute-1.amazonaws.com':'localhost';
const pg_db = environment===2?'d74rfbuj0t08v4':'kleanops';
const pg_pass = environment===2?'b5381e6cefc63ad539e4a807215694139cb22d08621384151b1db87af3d59e5d':'1234';
const pool = new Pool({
    user: pg_user,
    host: pg_host,
    database: pg_db,
    password: pg_pass,
    port: 5432,
});


module.exports = pool;