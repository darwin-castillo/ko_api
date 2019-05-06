const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
const bcrypt = require("bcrypt");


router.get('/api/users', (req, res) => {
    console.log('GET USERS');
    res.send({message: "API OK!"});

});

router.get('/api/users/all', (req, res) => {
    console.log('GET USERS');


    pool.query('SELECT  ' +
        'id,name,surname,' +
        'phone,address,city,postcode,' +
        'image,verified,payment,active,' +
        'date_created,date_updated,comment,' +
        'description FROM public.klop_users', (error, results) => {
        if (error) {
            throw error
        }
        let list = results.rows;
        let obj = {};
        obj.list = list;
        obj.count = list.length;
        res.status(200).json(obj)
    })
});


router.post('/api/users/', (req, res) => {
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


    if (typeof user.name !== 'undefined' && typeof user.email !== 'undefined' && typeof user.password !== 'undefined') {

        bcrypt.hash(user.password, 4, (err, hash) => {

            let query = 'INSERT INTO public.klop_users(dni,name,surname,email,phone,address,city,' +
                'postcode,image,comment,description,password) ' +
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
                + "'" + hash + "'"
                + ')';


            console.log(query);
            pool.query(query, (error, results) => {
                //   let other ="WITH encrypted_data AS (SELECT crypt('"+user.password+"',gen_salt('md5')) as hashed_value) UPDATE klop.users SET password = (SELECT hashed_value FROM encrypted_data);"

                if (error) {
                    //  throw error
                    if (error.code === '23505') {
                        res.status(500).json({
                            status: 500,
                            message: "El correo electrónico " + user.email + " ya se encuentra registado, intente nuevamente con otro distinto"
                        })
                    }
                    else
                        res.status(500).json({status: 500, message: error})

                }
                else {
                    let list = results.rows;
                    let obj = {};
                    obj.list = list;
                    obj.count = list.length;
                    res.status(200).json({status: 201, message: "Usuario guardado con exito"});
                }
            });

        });


    }
    else {
        console.log("ERROR POST DATA");
        res.status(500).json({status: 500, message: "Los campos nombre,email y password son obligatorios"});


    }
});


module.exports = router;