
const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {saveBillingDetail,
    getBillingDetail,
    saveTransaction,
    getInvoicesByCleaner,
    getInvoicesByClient,
    getClientByCleaner,
    testPromise
} = require('../controllers/billingController');



//router.get('/api/users/:id', verifyToken,getUserById);

/**
 *  CRUD
 */
router.post('/api/billing/:idjob',verifyToken,saveBillingDetail);
router.get('/api/billing/:idjob',verifyToken,getBillingDetail);
router.post('/api/billing/transaction/:idjob',verifyToken,saveTransaction);
router.get('/api/billing/invoices/cleaner',verifyToken,getInvoicesByCleaner);
router.get('/api/billing/invoices/client',verifyToken,getInvoicesByClient);
router.get('/api/billing/active/clients',verifyToken, getClientByCleaner);
router.get('/api/test/promise',testPromise)


module.exports = router;