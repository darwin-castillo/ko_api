const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');


router.get('/api/users', (req, res) => {
    console.log('GET USERS');
    res.send({message: "API OK!"});

});

router.get('/api/users/all', (req, res) => {
    console.log('GET USERS');


    pool.query('SELECT * FROM public.klop_users', (error, results) => {
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
    if (user.name !== null && user.email !== null) {
        let query = 'INSERT INTO public.klop_users(dni,name,surname,email,phone,address,city,' +
            'postcode,image,comment,description,password) ' +
            ' VALUES('
            + "'"+(user.dni ? "N/A" : user.dni) + "'"+','
            + "'"+user.name +"'"+ ','
            + "'"+(user.surname ? "N/A" : user.surname) + "'"+','
            + "'"+(user.email) + "'"+','
            + "'"+(user.phone === null ? "N/A" : user.phone) +"'"+ ','
            +"'"+ (user.address === null ? "N/A" : user.address) +"'"+ ','
            + "'"+(user.city === null ? "N/A" : user.city) + "'"+','
            + "'"+(user.postcode === null ? "N/A" : user.postcode) +"'"+ ','
            + "'"+(user.image === null ? "N/A" : user.image) + "'"+','
            + "'"+(user.comment === null ? "N/A" : user.comment) +"'"+ ','
            + "'"+(user.description === null ? "N/A" : user.description) +"'"+ ','
            + "'"+(user.password === null ? "N/A" : user.password) +"'"
            + ')';
        console.log(query);
        pool.query(query, (error, results) => {
                if (error) {
                    throw error
                }
                let list = results.rows;
                let obj = {};
                obj.list = list;
                obj.count = list.length;
                res.status(200).json({status: 201, message: "Usuario guardado con exito"});
            }
        )
        ;
    }
    else {
        console.log("ERROR POST DATA");
        res.status(500).json({status: 500, message: "Los campos id, name y email son obligatorios"});


    }
});


module.exports = router;