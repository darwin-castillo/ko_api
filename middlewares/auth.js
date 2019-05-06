const jwt = require('jsonwebtoken');
const JWT_SEED = require("../config/sets").JWT_SEED;

/**
 * Verify Token
 */
const verifyToken = (req,res,next) => {

    let token = req.get('Authorization');

    jwt.verify(token,JWT_SEED,(err,decoded)=>{

        if(err){
            return res.status(401).json({
                status:401,
                message:'Token invalido',
                details:err,
            });
        }
        else
            next();
    });


}

module.exports = {
    verifyToken
}