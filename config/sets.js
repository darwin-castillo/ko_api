
/**
 * SEED of JWT
 * @type {string}
 */
const JWT_SEED = process.env.JWT_SEED;

/**
 * Caducity of JWT Aprox 1 year
 * @type {number}
 */
const JWT_CADUCITY =  '365d';


module.exports = {JWT_CADUCITY,JWT_SEED};

