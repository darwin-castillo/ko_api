const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
const bcrypt = require("bcrypt");
const {verifyToken} = require('../middlewares/auth');
const jwt = require('jsonwebtoken');
const JWT_SEED = require("../config/sets").JWT_SEED;


/**
 * -- Table: public.klop_proposal

 -- DROP TABLE public.klop_proposal;

 CREATE TABLE public.klop_proposal
 (
 id_user bigint NOT NULL,
 id_job bigint NOT NULL,
 date_created timestamp(6) without time zone,
 date_updated timestamp(6) without time zone,
 comment character varying(255) COLLATE pg_catalog."default",
 status bigint,
 CONSTRAINT id_user_job PRIMARY KEY (id_user, id_job),
 CONSTRAINT id_job_fk FOREIGN KEY (id_job)
 REFERENCES public.klop_jobs (id) MATCH SIMPLE
 ON UPDATE NO ACTION
 ON DELETE NO ACTION,
 CONSTRAINT id_user_fk FOREIGN KEY (id_user)
 REFERENCES public.klop_users (id) MATCH SIMPLE
 ON UPDATE NO ACTION
 ON DELETE NO ACTION
 )
 WITH (
 OIDS = FALSE
 )
 TABLESPACE pg_default;

 ALTER TABLE public.klop_proposal
 OWNER to postgres;
 */


let queryProposals = 'SELECT \n' +
    'u.name as proposer,\n' +
    'u.id as id_proposer,\n' +
    'p.date_created as date_created, \n' +
    'j.id as id_job, \n' +
    'uu.name as posted_by,\n' +
    'uu.id as id_posted_by,\n' +
    'p.comment as comments\n' +
    '\tFROM klop_users u, klop_proposal p, klop_jobs j, klop_users uu\n' +
    '\t\n' +
    'WHERE u.id = p.id_user \n' +
    'AND p.id_job = j.id\n' +
    'AND j.users_id_autor = uu.id';

router.get('/api/proposals', verifyToken, (req, res) => {
    console.log('GET PROPOSALS ');
    console.log('req.query.id  ', req.query.j);

    let query = queryProposals;


    if (req.query.j) {
        query += ' AND j.id=' + req.query.j;
    }
    if (req.query.u) {
        query += ' AND u.id=' + req.query.u;
    }

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


router.get('/api/proposals/:id', verifyToken, (req, res) => {
    console.log('GET JOBS ');
    console.log('req.query.id  ', req.params.id);

    let query = queryProposals + " AND p.id_job = " + req.params.id;


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


router.post('/api/proposals', verifyToken, (req, res) => {
    let body = req.body;
    console.log("body ", req.body);
    let idPost = body.id_job;
    let token = req.get('Authorization');

    if (idPost) {

        jwt.verify(token, JWT_SEED, (err, decoded) => {

            let insertInto = "INSERT INTO klop_proposal(id_user,id_job,date_created) VALUES(" +
                "" + decoded.id + ", " +
                "" + idPost + ", " +
                " now() " +
                ")";

            pool.query(insertInto, (error, results) => {

                    if (error) {

                        if (error.code === '23505') {
                            res.json({
                                status: 500,
                                error: 23505,
                                message: "user " + decoded.id + " has already registered a proposal for this job " + idPost
                            });
                        }
                        else {
                            res.json({
                                status: 500,
                                message: error
                            });
                        }
                    }
                    else {

                        res.json({
                            status: 201,
                            message: "Proposal has been registered to job " + idPost + ", by user id " + decoded.id
                        })

                    }


                }
            );


        });

    }
    else {
        res.json({
            status: 400,
            message: "Id job is required"
        });
    }

});


router.put('/api/proposals/:id', verifyToken, (req, res) => {
    console.log('PUT BY ID ', req.params.id);
    /*
    UPDATE table
SET column1 = value1,
    column2 = value2 ,...
WHERE
   condition;
     */
    let token = req.get('Authorization');
    jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
            res.status(500).json({error: 500, message: err})
        }
        else {
            if (typeof decoded.id !== 'undefined') {


                let query = "UPDATE klop_proposal SET  "
                    + " status=" + req.body.status +", date_updated='now()' "
                    + " WHERE id_job=" + req.params.id
                    + " AND id_user=" + decoded.id;
                console.log("PUT PROPOSAL ", query);

                pool.query(query, (error, results) => {
                   if(error) {
                       res.status(500).json({
                           status: 500,
                           message: error
                       });
                   }
                   else{
                       res.status(200).json({status:200, message:"proposal is updated!"});
                   }
                });



            }
        }
    });


    //res.send({message: "API OK!"});

});


module.exports = router;
