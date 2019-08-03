


const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {getAllUsers,getUserById,createUser,updateCurrentUser,getCurrentUser} = require('../controllers/userController');


router.get('/api/users/:id', verifyToken,getUserById);
router.get('/api/users', verifyToken,getAllUsers);
router.post('/api/users/',createUser);
router.put('/api/current/user/',verifyToken,updateCurrentUser);
router.get('/api/current/user/',verifyToken,getCurrentUser);


module.exports = router;