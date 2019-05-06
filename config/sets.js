const environment = 2;// 1 -> Production   // 2-> Dev  // 3-> Local
const pg_user = environment===2?'vrchzfftnlewzg':'postgres';
const pg_host =  environment===2?'ec2-184-73-210-189.compute-1.amazonaws.com':'localhost';
const pg_db = environment===2?'d74rfbuj0t08v4':'kleanops';
const pg_pass = environment===2?'b5381e6cefc63ad539e4a807215694139cb22d08621384151b1db87af3d59e5d':'1234';

const pool_dev = {
    user: 'vrchzfftnlewzg',
    host: 'ec2-184-73-210-189.compute-1.amazonaws.com',
    database: 'd74rfbuj0t08v4',
    password: 'b5381e6cefc63ad539e4a807215694139cb22d08621384151b1db87af3d59e5d',
    port: 5432,
};
const pool_local = {
    user: 'postgres',
    host: 'localhost',
    database: 'kleanops',
    password: '1234',
    port: 5432,
};
/**
 * SEED of JWT
 * @type {string}
 */
const JWT_SEED = 'KlopsAPi_1_dev';

/**
 * Caducity of JWT Aprox 2 years
 * @type {number}
 */
const JWT_CADUCITY =  '365d';


module.exports = environment;
module.exports = pg_user;
module.exports = pg_db;
module.exports = pg_host;
module.exports = pg_pass;
module.exports = {JWT_CADUCITY,JWT_SEED};

