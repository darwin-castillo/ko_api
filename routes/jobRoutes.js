const express = require('express')
const router = express.Router();
const pool = require('../config/config').pool;
const bcrypt = require("bcrypt");
const {verifyToken} = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
const JWT_SEED = require("../config/sets").JWT_SEED;
const smtpPool = require('nodemailer-smtp-pool');
const axios = require('axios');
const {parse} = require('querystring');


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(smtpPool({
    service: 'gmail',
    auth: {
        user: 'darwin.c5@gmail.com',
        pass: 'jeda090301014'
    },
    maxConnections: 5,
    maxMessages: 10,
}));

const SELECT_JOBS = "SELECT    " +
    "jo.id, jo.title,jo.description,jo.date_created, jo.date_updated, jo.date_schedule, jo.date_deadline, " +
    " jo.id_status, st.title as status_title, us.name as autor, us.id as id_autor, du.email as email_cleaner, " +
    "du.name as cleaner, du.id as id_cleaner ,  COUNT(kp.id_job) as total_proposals,  " +
    "json_build_object('title',lc.title, 'city',lc.city,'country',country,'phone',lc.phone,'postcode',lc.postcode,'address',lc.address, 'coordinates',lc.coordinates) as location " +
    "FROM  public.klop_jobs as jo " +
    "LEFT OUTER JOIN public.klop_users as us on jo.users_id_autor = us.id " +
    "LEFT OUTER JOIN public.klop_users as du on jo.users_id_cleaner = du.id " +
    "LEFT OUTER JOIN public.klop_locations as lc on jo.id_location = lc.id " +
    "LEFT OUTER JOIN public.klop_proposal as kp on jo.id = kp.id_job " +
    "LEFT OUTER JOIN public.klop_job_status as st on jo.id_status = st.id ";


const ORDER_BY_JOBS = " ORDER BY jo.id desc";


router.get('/api/jobs', verifyToken, (req, res) => {
    console.log('GET JOBS');
    /*
        let whereUrl = JSON.parse(req.query.where);
        let whereSentence = "";
        whereUrl.forEach((value, index) => {
            let op = "=";
            if (value[1] === "lt") {
                op = "<";
            }
            else if (value[1] === "gt") {
                op = ">";
            }


            whereSentence = whereSentence + " " + value[0] + op + "'"+value[2]+"' ";
            whereSentence = whereSentence +( (value.length > 3) ? value[3] : "");
        });  */

    //console.log(whereSentence);

    // console.log("where first",whereSentence[0]);


    /*
        let query = 'SELECT'
        + ' klop_jobs.id,'
        + ' klop_jobs.title,'
        + 'klop_jobs.description,'
        + 'klop_jobs.date_created,'
        + 'klop_jobs.date_updated,'
        + 'klop_jobs.id_status,'
        + 'klop_job_status.title as status_title, '
        +' klop_jobs.date_schedule, '
        +' klop_jobs.date_deadline, '
        + 'klop_users.name as autor, '
        + 'klop_jobs.users_id_cleaner as id_cleaner '
        + ' FROM '
        + ' public.klop_jobs,'
        + ' public.klop_users, '
        + ' public.klop_job_status'
        + ' WHERE '
        + ' klop_jobs.users_id_autor = klop_users.id  AND klop_job_status.id = klop_jobs.id_status ORDER BY klop_jobs.id desc';

     */
    let select = "SELECT    " +
        "jo.id, jo.title,jo.description,jo.date_created, jo.date_updated, jo.date_schedule, jo.date_deadline, " +
        " jo.id_status, st.title as status_title, us.name as autor, us.id as id_autor, du.email as email_cleaner, " +
        "du.name as cleaner, du.id as id_cleaner,  COUNT(kp.id_job) as total_proposals , ct.title as job_category, lc.address, lc.coordinates, lc.latitude, lc.longitude, " +
        "json_build_object('address',lc.address,  'city',lc.city,'country',country,'phone',lc.phone,'postcode',lc.postcode,'coordinates',lc.coordinates) as location " +
        "FROM  public.klop_jobs as jo " +
        "LEFT OUTER JOIN public.klop_users as us on jo.users_id_autor = us.id " +
        "LEFT OUTER JOIN public.klop_users as du on jo.users_id_cleaner = du.id " +
        "LEFT OUTER JOIN public.klop_job_status as st on jo.id_status = st.id " +
        "LEFT OUTER JOIN public.klop_proposal as kp on jo.id = kp.id_job " +
        "LEFT OUTER JOIN public.klop_locations as lc on jo.id_location = lc.id " +
        "LEFT OUTER JOIN public.klop_category_job as ct on jo.id_category = ct.id ";

    if (req.query.cleaner) {
        select += ' WHERE jo.users_id_cleaner=' + req.query.cleaner;
    }

    select += " GROUP BY jo.id,st.id,us.id,du.id, ct.id, lc.id " +
        "ORDER BY jo.id desc";


    console.log(select);
    pool.query(select, (error, results) => {

        if (error) {
            console.log(error);
            return res.status(500).json({status: 500, message: error});
        }
        else {

            if (req.query.distance) {
                let origin = req.query.distance;
                console.log("calcule distance...origin[" + origin + "]");
                let list = results.rows;

                let destinations = "";
                for (let i = 0; i < list.length; i++) {
                    if (list[i].coordinates !== null && list[i].coordinates !== 'null') {
                        // list[i].distance=
                        destinations = destinations + (destinations.length > 0 ? "|" : "") + list[i].coordinates;
                    }
                    else {
                        destinations = destinations + (destinations.length > 0 ? "|" : "") + "0,0";
                    }

                }
                console.log("destinations: " + destinations);


                axios.get('https://maps.googleapis.com/maps/api/' +
                    'distancematrix/json?' +
                    'units=metric' +
                    '&origins=' + req.query.distance +
                    '&destinations=' + destinations +
                    '&key=AIzaSyAIiXVbt3z9zRyjpAW2-b7eB9JIgWP7PGI').then((respGoogle, reqGoogle) => {
                    //  console.log(respGoogle.data.rows[0].elements);

                    let arrayElements = respGoogle.data.rows[0].elements;
                    let originAddress = respGoogle.data.origin_addresses[0];


                    for (let i = 0; i < arrayElements.length; i++) {
                        if (typeof arrayElements[i].distance !== "undefined") {
                            list[i].distance = arrayElements[i].distance.text;
                        }
                        else {
                            list[i].distance = "-1";
                        }
                    }
                    let obj = {};
                    obj.origin_address = originAddress;
                    obj.list = list;
                    obj.count = list.length;
                    res.status(200).json(obj);


                });


            }


            else {

                let list = results.rows;
                let obj = {};
                obj.list = list;
                obj.count = list.length;
                res.status(200).json(obj);
            }


        }
    })


})
;


router.get('/api/self/jobs', verifyToken, (req, res) => {
    let token = req.get('Authorization');


    jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
            console.log("error  ", err);
            res.status(500).json({error: 500, message: err})
        }
        else {
            if (typeof decoded.id !== 'undefined') {
                let query = SELECT_JOBS
                    + ' WHERE '
                    + 'jo.users_id_autor = ' + decoded.id + " GROUP BY jo.id,st.id,us.id,du.id, lc.id " + ORDER_BY_JOBS;
                console.log(query);
                pool.query(/*'SELECT'
                    + ' klop_jobs.id,'
                    + ' klop_jobs.title,'
                    + 'klop_jobs.description,'
                    + 'klop_jobs.date_created,'
                    + 'klop_jobs.date_updated,'
                    + 'klop_users.name as autor'
                    + ' FROM '
                    + ' public.klop_jobs,'
                    + ' public.klop_users' */
                    query, (error, results) => {
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
            }
            else {
                res.status(401).json({
                    error: 401,
                    message: "Information is missing, please sign in again, and get it new token"
                });
            }
        }
    });


})


router.get('/api/jobs/:id', verifyToken, (req, res) => {
    console.log('GET JOBS BY id= ', req.params.id);

    let select = "SELECT    " +
        "jo.id, jo.title,jo.description,jo.date_created, jo.date_updated, jo.date_schedule, jo.date_deadline, " +
        "json_build_object('phone',us.phone,  'email',us.email) as contact ," +
        " jo.id_status, st.title as status_title, us.name as autor, us.id as id_autor, du.email as email_cleaner, " +
        "du.name as cleaner, du.id as id_cleaner,  COUNT(kp.id_job) as total_proposals , ct.title as job_category, ct.id as id_category, lc.address, lc.coordinates, " +
        "json_build_object('address',lc.address,  'city',lc.city,'country',country,'phone',lc.phone,'postcode',lc.postcode,'coordinates',lc.coordinates) as location " +

        "FROM  public.klop_jobs as jo " +
        "LEFT OUTER JOIN public.klop_users as us on jo.users_id_autor = us.id " +
        "LEFT OUTER JOIN public.klop_users as du on jo.users_id_cleaner = du.id " +
        "LEFT OUTER JOIN public.klop_job_status as st on jo.id_status = st.id " +
        "LEFT OUTER JOIN public.klop_proposal as kp on jo.id = kp.id_job " +
        "LEFT OUTER JOIN public.klop_locations as lc on jo.id_location = lc.id " +
        "LEFT OUTER JOIN public.klop_category_job as ct on jo.id_category = ct.id " +
        " WHERE jo.id=" + req.params.id;
    ;


    select += " GROUP BY jo.id,st.id,us.id,du.id, ct.id, lc.id " +
        "ORDER BY jo.id desc";


    console.log(select);
    pool.query(select, (error, results) => {

        if (error) {
            console.log(error);
            return res.status(500).json({status: 500, message: error});
        }
        else {


            let list = results.rows;
            let obj = list[0];
            res.status(200).json(obj);


        }
    })


});


router.post('/api/jobs', verifyToken, (req, res) => {
    console.log('POST JOBS');
    let job = req.body;
    let token = req.get('Authorization');
    jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
            res.status(500).json({error: 500, message: err})
        }
        else {
            if (typeof decoded.id !== 'undefined') {

                if (typeof job.title !== 'undefined' || typeof job.id_category !== 'undefined'
                ) {


                    let query = 'INSERT INTO public.klop_jobs(title,description,users_id_autor,date_deadline,date_schedule, id_status,id_category,id_location) ' +
                        ' VALUES('
                        + "'" + job.title + "',"
                        + "'" + (typeof job.description === 'undefined' ? "N/A" : job.description) + "',"
                        + "" + decoded.id + ","
                        + "'" + (typeof job.date_deadline === 'undefined' ? "N/A" : job.date_deadline) + "',"
                        + "'" + (typeof job.date_schedule === 'undefined' ? "N/A" : job.date_schedule) + "', 2,"
                        + "" + job.id_category + ","
                        + "'" + (typeof job.id_location === 'undefined' ? "N/A" : job.id_location) + "'"
                        + ")";
                    //  console.log(query);

                    pool.query(query, (error, results) => {
                        //   let other ="WITH encrypted_data AS (SELECT crypt('"+user.password+"',gen_salt('md5')) as hashed_value) UPDATE klop.users SET password = (SELECT hashed_value FROM encrypted_data);"

                        if (error) {
                            //  throw error
                            console.log(error);
                            if (error.code === '23505') {
                                res.status(500).json({
                                    status: 500,
                                    // message: "The email " + user.email + " is already registered, try again with a different one"
                                    message: error
                                })
                                return;
                            }
                            else if (error.code === '23503') {
                                res.status(500).json({
                                    status: 500,
                                    message: "this user not exist"

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

                            axios.post('https://fcm.googleapis.com/fcm/send', {
                                "to": "/topics/cleaners",
                                "collapse_key": "type_a",
                                "priority": "high",
                                "content_available": true,
                                "notification": {
                                    "body": "New Job posted :" + job.title,
                                    "title": "Kleanops"
                                },
                                "data": {
                                    "body": "New Job posted :" + job.title,
                                    "title": "Kleanops"
                                }
                            }, {
                                headers: {
                                    'Authorization': 'key=AAAAW-Zue1k:APA91bESzhIqrvroVh32Nz5pQB3CrJdwyCr3Q38mTYiFfC9lRtSr69HEwPCzp5v77NOhWiNaEqMmQOLHv9pIbmEI24BMT--4nUf_UwLmgzhgjtKB9BXZ5OZEkewC38AAqCImviHXs3Tl'
                                }
                            })
                                .then((response) => {
                                    res.status(201).json({status: 201, message: "Successfully registered job!"});
                                })
                                .catch((error) => {
                                    res.status(201).json({
                                        status: 201,
                                        message: "Successfully registered job, But not produce notification"
                                    });
                                })

                        }
                    });


                }
                else if (typeof job.title === 'undefined') {
                    res.status(400).json({status: 400, message: "title  is required"});
                }
                else if (typeof job.id_category === 'undefined') {
                    res.status(400).json({status: 400, message: "id_category is required"});
                }
                else {
                    res.status(500).json({status: 500, message: "Server Error"})
                }

            } else {
                res.status(401).json({
                    error: 401,
                    message: "Information is missing, please sign in again, and get it new token"
                });
            }
        }
    });


});

router.put('/api/jobs/:id', verifyToken, (req, res) => {
    console.log('PUT BY ID ', req.params.id);

    let token = req.get('Authorization');
    jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
            res.status(500).json({error: 500, message: err})
        }
        else {
            if (typeof decoded.id !== 'undefined') {
                let body = req.body;
                let query = "UPDATE klop_jobs SET  ";
                let fields = [];
                let somevalue = false;
                let sendToCleaner = false;
                if (body.id_status) {
                    fields.push("id_status=" + body.id_status);
                    somevalue = true;
                }

                if (body.id_cleaner) {
                    fields.push("users_id_cleaner=" + body.id_cleaner);
                    somevalue = true;
                    sendToCleaner = true;
                }

                if (body.id_valoration) {
                    fields.push("id_valoration=" + body.id_valoration);
                    somevalue = true;
                }

                if (body.id_location) {
                    fields.push("id_location=" + body.id_location);
                    somevalue = true;
                }

                if (body.id_category) {
                    fields.push("id_category=" + body.id_category);
                    somevalue = true;
                }
                fields.push(' date_updated=now()');

                query = query + fields.join(',') + " WHERE id=" + req.params.id
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

                            if (sendToCleaner) {
                                pool.query(SELECT_JOBS + " WHERE jo.id=" + req.params.id, (er, rest) => {
                                    //todo: send notifications via email and push

                                    res.status(200).json({status: 200, message: "job is updated!"});
                                });

                            }
                            else {
                                res.status(200).json({status: 200, message: "job is updated!"});
                            }

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
    });


    //res.send({message: "API OK!"});

});

router.delete('/api/jobs/:id', verifyToken, (req, res) => {
    console.log('DELETE BY ID ', req.params.id);
    res.send({message: "API OK!"});

});

module.exports = router;
