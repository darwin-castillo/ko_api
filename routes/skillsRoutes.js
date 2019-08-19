
const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {createSelfSkills,getSelfSkills,getSkills,deleteSelfSkill} = require('../controllers/skillsController');


//router.get('/api/users/:id', verifyToken,getUserById);

/**
 *  CRUD
 */
router.post('/api/self/skills/',verifyToken,createSelfSkills);
router.get('/api/self/skills',verifyToken,getSelfSkills);
router.get('/api/skills',verifyToken,getSkills);
//router.get('/api/location/:id',verifyToken,getLocationById)
//router.get('/api/locations/user/:id', verifyToken,getLocationByUser);
//router.put('/api/location/:id',verifyToken,updateLocation);
 router.delete('/api/skills/:idskill',verifyToken,deleteSelfSkill);



module.exports = router;