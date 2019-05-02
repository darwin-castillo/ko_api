const Pool = require('pg').Pool
const pool = new Pool({
    user: 'vrchzfftnlewzg',
    host: 'ec2-184-73-210-189.compute-1.amazonaws.com',
    database: 'd74rfbuj0t08v4',
    password: 'b5381e6cefc63ad539e4a807215694139cb22d08621384151b1db87af3d59e5d',
    port: 5432,
});

module.exports = pool;