const pool = require('../config/config').pool;
const sequelize = require('../config/config').sequelize;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SEED = require("../config/sets").JWT_SEED;
const {verifyToken} = require('../middlewares/auth');
const generator = require('generate-password');

module.exports = {

    /**
     * Search all Users
     * @param req
     * @param res
     */

    getAllUsers: (req, res) => {
        console.log('GET ALL USERS');
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
    },


    /**
     * Search User by id
     * @param req
     * @param res
     */
    getUserById: (req, res) => {
        console.log('GET USER ID ');

        let query = 'SELECT  ' +
            'u.id,u.name,u.surname,u.email,' +
            'u.phone,u.address,u.city,u.postcode,' +
            'u.image,u.verified,u.payment,u.active,' +
            'u.date_created,u.date_updated,u.comment,r.title as role,' +
            'u.description FROM public.klop_users u, public.klop_role r WHERE r.id = u.id_role_fk AND u.id=' + req.params.id;
        console.log(query);

        pool.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({status: 500, message: error});
            }
            else {
                let list = results.rows;
                let obj = list[0];


                res.status(200).json(obj);
            }
        })
    },


    /**
     * Search User by id
     * @param req
     * @param res
     */
    getCurrentUser: (req, res) => {
        console.log('GET current user api/users');
        /* res.status(200).json({
             message:'endpoint en proceso'
         });
         */
        let token = req.get('Authorization');


        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {
                    let idUser = decoded.id;

                    let query = 'SELECT  ' +
                        'u.id,u.name,u.surname,u.email,' +
                        'u.phone,u.address,u.city,u.postcode,' +
                        'u.image,u.verified,u.payment,u.active,' +
                        'u.date_created,u.date_updated,u.comment,r.title as role,' +
                        'u.description FROM public.klop_users u, public.klop_role r WHERE r.id = u.id_role_fk AND u.id=' + idUser;
                    console.log(query);

                    pool.query(query, (error, results) => {
                        if (error) {
                            return res.status(500).json({status: 500, message: error});
                        }
                        else {
                            let list = results.rows;
                            let obj = list[0];
                            res.status(200).json(obj);
                        }
                    })

                }
            }
        });

    },

    /**
     * Create a new User
     * @param req
     * @param res
     */
    createUser: (req, res) => {
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
                        else {
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

    },

    /**
     * Update current user (Need Token)
     * @param req
     * @param res
     */

    updateCurrentUser: (req, res) => {
        console.log('PUT current user api/users');
        /* res.status(200).json({
             message:'endpoint en proceso'
         });
         */
        let token = req.get('Authorization');


        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {
                    let body = req.body;
                    let query = "UPDATE klop_users SET  ";
                    let fields = [];
                    let somevalue = false;

                    if (body.name) {
                        fields.push("name='" + body.name + "'");
                        somevalue = true;
                    }


                    if (body.surname) {
                        fields.push("surname='" + body.surname + "'");
                        somevalue = true;
                        sendToCleaner = true;
                    }

                    if (body.email) {
                        fields.push("email='" + body.email + "'");
                        somevalue = true;
                    }
                    if (body.phone) {
                        fields.push("phone='" + body.phone + "'");
                        somevalue = true;
                    }

                    if (body.address) {
                        fields.push("address='" + body.address + "'");
                        somevalue = true;
                    }

                    if (body.city) {
                        fields.push("city='" + body.city + "'");
                        somevalue = true;
                    }

                    if (body.postcode) {
                        fields.push("postcode='" + body.postcode + "'");
                        somevalue = true;
                    }

                    if (body.image) {
                        fields.push("image='" + body.image + "'");
                        somevalue = true;
                    }

                    if (body.comment) {
                        fields.push("comment='" + body.comment + "'");
                        somevalue = true;
                    }

                    if (body.description) {
                        fields.push("description='" + body.description + "'");
                        somevalue = true;
                    }


                    if (body.password) {
                        bcrypt.hash(body.password, 4, (err, hash) => {
                            fields.push("password='" + hash + "'");
                            somevalue = true;


                            fields.push(' date_updated=now()');

                            query = query + fields.join(',') + " WHERE id=" + decoded.id
                            console.log("PUT JOB ", query);

                            if (somevalue) {
                                pool.query(query, (error, results) => {
                                    console.log(results);
                                    if (error) {
                                        console.log("error ", error);
                                        res.status(500).json({
                                            status: 500,
                                            message: error
                                        });
                                    }
                                    else {
                                        res.status(200).json({status: 200, message: "user is updated!"});


                                    }
                                });
                            }
                            else {
                                res.status(400).json({
                                    status: 400,
                                    message: ' Not valid update'
                                })
                            }



                        });

                    } else {

                        fields.push(' date_updated=now()');

                        query = query + fields.join(',') + " WHERE id=" + decoded.id
                        console.log("PUT JOB ", query);

                        if (somevalue) {
                            pool.query(query, (error, results) => {
                                console.log(results);
                                if (error) {
                                    console.log("error ", error);
                                    res.status(500).json({
                                        status: 500,
                                        message: error
                                    });
                                }
                                else {
                                    res.status(200).json({status: 200, message: "user is updated!"});


                                }
                            });
                        }
                        else {
                            res.status(400).json({
                                status: 400,
                                message: ' Not valid update'
                            })
                        }

                    }

                }
                else {
                    res.status(500).json({error: 500, message: "this token not contains id, login again to get"})
                }
            }
        });


    },


    sendEmail: (req, res) => {
        console.log("send password");
        let fs = require('fs');


        let nodemailer = require('nodemailer');

        let query = 'SELECT  ' +
            '  id,name,surname,email ' +
            '          FROM public.klop_users  WHERE email=\'' + req.params.email + '\'';
        fs.readFile('./html/index.html', function (err, html_file) {
            if (err) {
                throw err;
            }
            //  res.writeHeader(200, {"Content-Type": "text/html"});
            //   res.write(html);
            // res.end();


            pool.query(query, (error, results) => {
                    if (error) {
                        return res.status(500).json({status: 500, message: error});
                    }

                    else {


                        let password = generator.generate({
                            length: 10,
                            numbers: true
                        });

                        if (results.rows.length > 0) {

                            let name = results.rows[0].name;
                            let id = results.rows[0].id;
                            let mailOptions = {
                                from: 'darwin.c5@gmail.com',
                                to: '' + req.params.email,
                                subject: 'Reset Password KleanOps ',//+ results.rows[0].name,
                                // text: 'That was easy!'
                                html: '<h1>Hello ' + name + ' </h1><p>kleanops system informs you, Now this is your new password:  </p><strong>' + password + '</strong>',
                            };


                            let transporter = nodemailer.createTransport({
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: true,
                                auth: {
                                    user: 'kleanops.notifications@gmail.com', // Your email id
                                    pass: 'Ko123456.' // Your password
                                },
                                tls: {
                                    // do not fail on invalid certs
                                    rejectUnauthorized: false
                                }
                            });

                            transporter.sendMail(mailOptions, function (errors, info) {
                                if (errors) {
                                    console.log(errors);
                                } else {
                                    console.log('Email sent [' + name + ']: ' + info.response);
                                    //  res.status(200).json({status: 200, message: "email send!"});

                                    bcrypt.hash(password, 4, (errhash, hash) => {
                                        console.log("hash password ", hash);

                                        let update = 'UPDATE klop_users    SET password=\'' + hash + '\'  WHERE id=' + id;
                                        pool.query(update
                                            , (error2, results2) => {
                                                console.log(update);
                                                if (error2) {
                                                    res.status(500).json({status: 500, message: "Error", error: error2});
                                                }
                                                else {
                                                    res.status(200).json({status: 200, message: "email send!"});
                                                }

                                            });
                                    });

                                }
                            });


                            /*
                                            fs.readFile('./html/index.html', function (err, html) {
                                                if (err) {
                                                    throw err;
                                                }
                                                res.writeHeader(200, {"Content-Type": "text/html"});
                                                res.write(html);
                                                res.end();
                                            });

                            */

                        }
                        else {
                            res.status(404).json({status: 404, message: "user not found"});
                        }
                    }


                }
            );
        });


    },


}