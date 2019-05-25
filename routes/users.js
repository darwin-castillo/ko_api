const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
const bcrypt = require("bcrypt");
const {verifyToken} = require('../middlewares/auth');


router.get('/api/users', (req, res) => {
    console.log('GET USERS');
    res.send({message: "API OK!"});

});

router.get('/api/users/all', verifyToken, (req, res) => {
    console.log('GET USERS');
    let query = 'SELECT  ' +
        'u.id,u.name,u.surname,u.email,' +
        'u.phone,u.address,u.city,u.postcode,' +
        'u.image,u.verified,u.payment,u.active,' +
        'u.date_created,u.date_updated,u.comment,r.title as role,' +
        'u.description FROM public.klop_users u, public.klop_role r WHERE r.id = u.id_role_fk';
console.log(query);

    pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({status: 500, message: error});
        }
        else {
            let list = results.rows;
            let obj = {};
            obj.list = list;
            obj.count = list.length;
            res.status(200).json(obj);
        }
    })
});




router.post('/api/users/',(req, res) => {
    console.log('POST USERS api/users');
    console.log('body ', req.body);
    let user = {
        dni: null,
        name: null,
        surname: null,
        email: null,
        phone: null,
        address: null,
        city: null,
        postcode: null,
        image: null,
        comment: null,
        description: null,
        password: null,

    }
    user = req.body;

    /*
        id bigserial not null,
            dni character varying(40),
            name character varying(40) NOT NULL,
            surname character varying(40),
            email character varying(40) NOT NULL,
            phone character varying(40) DEFAULT 'N/A',
            address character varying(40) DEFAULT 'N/A',
            city character varying(40) DEFAULT 'N/A',
            postcode character varying(40) DEFAULT 'N/A',
            image character varying(40),
            verified boolean DEFAULT FALSE,
            payment bigint DEFAULT -1,
            deleted boolean DEFAULT FALSE,
            active boolean DEFAULT TRUE,
            date_created character varying(40) DEFAULT now(),
            date_updated character varying(40) DEFAULT now(),
            comment character varying(40),
            description character varying(40),
            password character varying(40) NOT NULL,
            */

    let less = [];
    if (typeof user.name !== 'undefined' && typeof user.email !== 'undefined' && typeof user.password !== 'undefined' && typeof user.role !== 'undefined') {

        bcrypt.hash(user.password, 4, (err, hash) => {

            let query = 'INSERT INTO public.klop_users(dni,name,surname,email,phone,address,city,' +
                'postcode,image,comment,description,id_role_fk,password) ' +
                ' VALUES('
                + "'" + (typeof user.dni === 'undefined' ? "N/A" : user.dni) + "'" + ','
                + "'" + user.name + "'" + ','
                + "'" + (typeof user.surname === 'undefined' ? "N/A" : user.surname) + "'" + ','
                + "'" + (user.email) + "'" + ','
                + "'" + (typeof user.phone === 'undefined' ? "N/A" : user.phone) + "'" + ','
                + "'" + (typeof user.address === 'undefined' ? "N/A" : user.address) + "'" + ','
                + "'" + (typeof user.city === 'undefined' ? "N/A" : user.city) + "'" + ','
                + "'" + (typeof user.postcode === 'undefined' ? "N/A" : user.postcode) + "'" + ','
                + "'" + (typeof user.image === 'undefined' ? "N/A" : user.image) + "'" + ','
                + "'" + (typeof user.comment === 'undefined' ? "N/A" : user.comment) + "'" + ','
                + "'" + (typeof user.description === 'undefined' ? "N/A" : user.description) + "'" + ','
                + "" + user.role + ','
                + "'" + hash + "'"
                + ')';


            console.log(query);
            pool.query(query, (error, results) => {
                //   let other ="WITH encrypted_data AS (SELECT crypt('"+user.password+"',gen_salt('md5')) as hashed_value) UPDATE klop.users SET password = (SELECT hashed_value FROM encrypted_data);"

                if (error) {
                    //  throw error
                    console.log(error);
                    if (error.code === '23505') {
                       res.status(500).json({
                            status: 500,
                            message: "The email " + user.email + " is already registered, try again with a different one"
                        })
                        return;
                    }
                    else if (error.code === '23503') {
                       res.status(500).json({
                            status: 500,
                            message: "this role not exist"
                        })
                        return;
                    }
                    else{
                        res.status(500).json({status: 500, message: error})
                        return;
                    }


                }
                else {
                    let list = results.rows;
                    let obj = {};
                    obj.list = list;
                    obj.count = list.length;
                    res.status(201).json({status: 201, message: "Successfully registered user!"});
                }
            });

        });


    }
    else {
        console.log("ERROR POST DATA");
        if (typeof user.name === 'undefined') {

            less.push('name');
            //res.status(500).json({status: 500, message: "El "});
        }
        if (typeof user.email === 'undefined') {
            less.push('email');
        }
        if (typeof user.password === 'undefined') {

            less.push('password');
            //res.status(500).json({status: 500, message: "El "});
        }
        if (typeof user.role === 'undefined') {

            less.push('role');
            //res.status(500).json({status: 500, message: "El "});
        }

        res.status(500).json({
            status: 500,
            message: (less.length > 1 ? "Los siguientes campos son obligatorios: " : "El siguiente campos es obligatorio: ") + less.join(',') + " "
        });

    }

});

router.put('/api/users/',verifyToken,(req, res) => {
    console.log('PUT current user api/users');
  res.status(200).json({
      message:'endpoint en proceso'
  });

});


module.exports = router;