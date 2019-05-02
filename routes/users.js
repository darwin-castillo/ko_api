const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');


router.get('/api/users', (req, res) => {
    console.log('GET USERS');
    res.send({message:"API OK!"});
});

router.get('/api/users/all', (req, res) => {
    console.log('GET USERS');
    pool.query('SELECT * FROM klo_us ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        res.status(200).json(results.rows)
    })
});







module.exports = router;