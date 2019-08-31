


const express = require('express')
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const {getAllUsers,getUserById,createUser,updateCurrentUser,getCurrentUser,sendEmail} = require('../controllers/userController');


router.get('/api/users/:id', verifyToken,getUserById);
router.get('/api/users', verifyToken,getAllUsers);
router.post('/api/users/',createUser);
router.put('/api/current/user/',verifyToken,updateCurrentUser);
router.get('/api/current/user/',verifyToken,getCurrentUser);
router.get('/api/user/resetpassword/send/:email',sendEmail);







router.post('/api/jobstest',(req,res)=>{
    //console.log(req.body.password1);


    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        let bodyParsed = parse(body);

        console.log(bodyParsed.password1,
            parse(body)
        );



        res.end('ok');
    });
    //  res.end();

});


module.exports = router;