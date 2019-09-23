
const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {saveBillingDetail,getBillingDetail} = require('../controllers/billingController');


//router.get('/api/users/:id', verifyToken,getUserById);

/**
 *  CRUD
 */
router.post('/api/billing/:idjob',verifyToken,saveBillingDetail);
router.get('/api/billing/:idjob',verifyToken,getBillingDetail);



module.exports = router;