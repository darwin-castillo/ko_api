
const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {createSelfLocation,getSelfLocations} = require('../controllers/locationController');


//router.get('/api/users/:id', verifyToken,getUserById);

/**
 *  CRUD
 */
router.post('/api/location/',verifyToken,createSelfLocation);
router.get('/api/self/locations',verifyToken,getSelfLocations);
//router.get('/api/location/:id',verifyToken,getLocationById)
//router.get('/api/locations/user/:id', verifyToken,getLocationByUser);
//router.put('/api/location/:id',verifyToken,updateLocation);
//router.delete('api/location/:id',verifyToken,deleteLocation);



module.exports = router;