
const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {show,validEmail,timing} = require('../html/index');


//router.get('/api/users/:id', verifyToken,getUserById);

/**
 *  CRUD
 */
router.get('/api/index/',show);
router.get('/api/validate/user/reg/:id',validEmail)
router.get('/api/timing',timing);




module.exports = router;