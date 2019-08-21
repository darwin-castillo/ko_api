
const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {show} = require('../html/index');


//router.get('/api/users/:id', verifyToken,getUserById);

/**
 *  CRUD
 */
router.get('/api/index/',show);




module.exports = router;