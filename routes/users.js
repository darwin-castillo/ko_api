const express = require('express')
const router = express.Router();


router.get('/', (req, res) => {
    console.log('GET USERS');
    res.send({message:"API OK!"});
});



module.exports = router;