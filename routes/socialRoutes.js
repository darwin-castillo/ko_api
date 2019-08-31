

const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {socialAuth,socialVerify} = require('../controllers/socialController');

router.post('/api/social/auth',socialAuth);
router.get('/api/social/verify',socialVerify);

module.exports = router;