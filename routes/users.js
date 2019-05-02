const express = require('express')
const router = express.Router();


router.get('/api/users', (req, res) => {
    console.log('GET USERS');
    res.send({message:"API OK!"});
});



module.exports = router;