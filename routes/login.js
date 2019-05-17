let jwt = require('jsonwebtoken');
let bodyParser = require('body-parser');
const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
const bcrypt = require("bcrypt");
const JWT_SEED = require("../config/sets").JWT_SEED;
const JWT_CADUCITY = require("../config/sets").JWT_CADUCITY;
const User = require('../models/users');
//app.use(bodyParser.urlencoded({extended: false}))
//app.use(bodyParser.json({limit:'10mb'}))

router.post('/api/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let user = {};


    pool.query("SELECT id,name,surname,email,address,image,verified,password,id_role_fk as role"
        + " FROM klop_users WHERE email='" + username + "'", (error, results) => {
        if (error) {
            console.log("error ", error);
            res.status(500).send({status: 500, message: "Error de servidor: " + error});
            // throw error
            return

        }

        let obj = results.rows;
        console.log(results.rows);


        if (obj.length > 0) {
            user = obj[0];
            bcrypt.compare(password, user.password, (err, pass_res) => {
                // res == true

                if (!pass_res) {

                    res.status(401).json({status:401,error: 'usuario o contraseña inválidos'});
                    return;
                }
                else {

                    let tokenData = {
                        id:user.id,
                        username: username,
                        email:user.email,


                        // ANY DATA
                    };



                    let token = jwt.sign(tokenData,JWT_SEED, {
                        expiresIn: JWT_CADUCITY
                    });

                    let obj_resp = {};
                    user.role = parseInt(user.role);
                    obj_resp.user = user;
                    obj_resp.token = token;
                    delete obj_resp.user.password;
                    obj_resp.status = 200;

                    res.status(200).json(obj_resp);

                }

            });
        }
        else {
            res.status(401).send({status:401,error: 'usuario o contraseña inválidos'});
            return;

        }

    });

});

router.post('/api/login2',(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    let user = {};

    User.findAll(
        {  attributes: ['id', 'name'],
            like: {
                name: 'Darwin'
            }
        }
)
.then(user => {
        console.log(user);
        res.status(200).json(user)
    })
        .catch(err => {
            console.log(err)
        })

})

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
