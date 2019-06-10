const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
const bcrypt = require("bcrypt");
const {verifyToken} = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
const JWT_SEED = require("../config/sets").JWT_SEED;

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'darwin.c5@gmail.com',
        pass: 'jeda090301014'
    }
});

const SELECT_JOBS = "SELECT    " +
    "jo.id, jo.title,jo.description,jo.date_created, jo.date_updated, jo.date_schedule, jo.date_deadline, " +
    " jo.id_status, st.title as status_title, us.name as autor, us.id as id_autor, du.email as email_cleaner, " +
    "du.name as cleaner, du.id as id_cleaner " +
    "FROM  public.klop_jobs as jo " +
    "LEFT OUTER JOIN public.klop_users as us on jo.users_id_autor = us.id " +
    "LEFT OUTER JOIN public.klop_users as du on jo.users_id_cleaner = du.id " +
    "LEFT OUTER JOIN public.klop_job_status as st on jo.id_status = st.id ";

const ORDER_BY_JOBS = " ORDER BY jo.id desc";


router.get('/api/jobs', verifyToken, (req, res) => {
    console.log('GET JOBS');
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
let select = SELECT_JOBS;
    if (req.query.cleaner) {
      select += ' WHERE jo.users_id_cleaner=' + req.query.cleaner;
    }

    console.log(select);
    pool.query(select + ORDER_BY_JOBS, (error, results) => {

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

router.get('/api/self/jobs', verifyToken, (req, res) => {
    let token = req.get('Authorization');


    jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
            res.status(500).json({error: 500, message: err})
        }
        else {
            if (typeof decoded.id !== 'undefined') {
                let query = SELECT_JOBS
                    + ' WHERE '
                    + 'jo.users_id_autor = ' + decoded.id + ORDER_BY_JOBS;
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

    let id = req.params.id;

    pool.query(
        SELECT_JOBS
        + ' WHERE'
        + ' jo.id=' + id + ORDER_BY_JOBS, (error, results) => {
            if (error) {
                return res.status(500).json({status: 500, message: error});
            }
            else {
                let list = results.rows;
                let obj = list[0];
                //obj.list = [];
                //obj.count = list.length;
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

                if (typeof job.title !== 'undefined'
                ) {


                    let query = 'INSERT INTO public.klop_jobs(title,description,users_id_autor,date_deadline,date_schedule, id_status) ' +
                        ' VALUES('
                        + "'" + job.title + "',"
                        + "'" + (typeof job.description === 'undefined' ? "N/A" : job.description) + "',"
                        + "" + decoded.id + ","
                        + "'" + (typeof job.date_deadline === 'undefined' ? "N/A" : job.date_deadline) + "',"
                        + "'" + (typeof job.date_schedule === 'undefined' ? "N/A" : job.date_schedule) + "', 2"
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
                            res.status(201).json({status: 201, message: "Successfully registered job!"});
                        }
                    });


                }
                else {
                    res.status(400).json({status: 400, message: "title  is required"});
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
                fields.push(' date_updated=now()');

                query = query + fields.join(',') + " WHERE id=" + req.params.id
                console.log("PUT JOB ", query);

                if (somevalue) {
                    pool.query(query, (error, results) => {
                        console.log(results);
                        if (error) {
                            console.log("error ",error);
                            res.status(500).json({
                                status: 500,
                                message: error
                            });
                        }
                        else {

                           if(sendToCleaner) {
                               pool.query(SELECT_JOBS + " WHERE jo.id=" + req.params.id, (er, rest) => {

                                   let mailOptions = {
                                       from: 'darwin.c5@gmail.com',
                                       to: rest.rows[0].email_cleaner,
                                       subject: 'Job Accepted',
                                       text: 'A job you applied for has been accepted\n Id Job: ' + req.params.id +
                                       '\n Client: ' + rest.rows[0].autor + "\n Job: " + rest.rows[0].title
                                   };

                                   transporter.sendMail(mailOptions, (err_s, info) => {
                                       if (err_s) {
                                           console.log(err_s);
                                       } else {
                                           console.log('Email sent: ' + info.response);
                                       }
                                   });
                                   res.status(200).json({status: 200, message: "job is updated!"});
                               });

                           }
                           else{
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
