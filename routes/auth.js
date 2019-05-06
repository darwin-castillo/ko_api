let jwt = require('jsonwebtoken');
let bodyParser = require('body-parser');
const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
//app.use(bodyParser.urlencoded({extended: false}))
//app.use(bodyParser.json({limit:'10mb'}))

router.post('/api/login', (req, res) => {
    let username = req.body.user
    let password = req.body.password;
    let user = {};

    pool.query("SELECT name,surname,email,address,image,verified"
        + " FROM klop_users WHERE email='" + username + "' AND password='" + password + "';", (error, results) => {
        if (error) {
            console.log("error ", error);
            res.status(500).send({status: 500, message: "Error de servidor: " + error});
            // throw error
            return

        }

        let obj = results.rows;
        console.log(results.rows);

        if (obj.length > 0)
            user = obj[0];
        else {
            res.status(401).send({error: 'usuario o contraseña inválidos'});
            return;

        }


        let tokenData = {
            username: username
            // ANY DATA
        };

        let token = jwt.sign(tokenData, 'Secret Password', {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });


        let obj_resp = {};
        obj_resp.user = user;
        obj_resp.token = token;

        res.status(200).json(obj_resp);

    });


    /* if( !(username === 'test' && password === '1234')){
       res.status(401).send({
         error: 'usuario o contraseña inválidos'
       })
       return
     }*/


});

router.get('/secure', (req, res) => {
    let token = req.headers['Authorization'];
    if (!token) {
        res.status(401).send({
            error: "Es necesario el token de autenticación"
        })
        return
    }

    token = token.replace('Bearer ', '')
    console.log("Token: ", token)

    jwt.verify(token, 'Secret Password', function (err, user) {
        if (err) {
            res.status(401).send({
                error: 'Token inválido'
            })
        } else {
            res.send({
                message: 'Awwwww yeah!!!!'
            })
        }
    })
})

module.exports = router;
