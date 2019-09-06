const express = require('express')
const router = express.Router();
const pool = require('../config/config').pool;
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


/*let queryProposals = 'SELECT \n' +
    'u.name as proposer,\n' +
    'u.id as id_proposer,\n' +
    'p.date_created as date_created, \n' +
    'j.id as id_job, \n' +
    'uu.name as posted_by,\n' +
    'j.id_location,\n' +
    'uu.id as id_posted_by,\n' +
    'p.comment as comments\n' +
    '\tFROM klop_users u, klop_proposal p, klop_jobs j, klop_users uu\n' +
    '\t\n' +
    'WHERE u.id = p.id_user \n' +
    'AND p.id_job = j.id\n' +
    'AND j.users_id_autor = uu.id '

*/

let queryProposals = "SELECT \n" +
    "u.name as proposer,\n" +
    "u.id as id_proposer,\n" +
    "p.date_created as date_created, \n" +
    "j.id as id_job, \n" +
    "uu.name as posted_by,\n" +
    "uu.id as id_posted_by,\n" +
    "lc.address as location,\n" +
    "j.description as description,\n" +
    "j.title as title,\n" +
    "j.id_status,\n" +
    "j.users_id_cleaner as id_cleaner,\n" +
    "p.comment as comments\n" +
    "        FROM  klop_proposal p\n" +
    "\t\tINNER JOIN klop_jobs  AS j ON  j.id=p.id_job \n" +
    "        LEFT OUTER JOIN klop_locations as lc on lc.id=j.id_location\n" +
    "\t\tINNER JOIN klop_users as u on u.id = p.id_user \t\n" +
    "\t\tINNER JOIN klop_users  as uu on uu.id =j.users_id_autor \n";
// "\t\tWHERE  u.id='43';"
;

router.get('/api/proposals', verifyToken, (req, res) => {
    console.log('GET PROPOSALS ', queryProposals);
    console.log('req.query.id  ', req.query.j);

    let query = queryProposals;

    let flag = false;
    if (req.query.j) {
        query += 'WHERE j.id=' + req.query.j;
        flag = true;

    }
    if (req.query.u) {
        query += ((flag) ? " AND " : " WHERE ") + ' u.id=' + req.query.u;
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


router.get('/api/self/proposals', verifyToken, (req, res) => {
    console.log('GET PROPOSALS ', queryProposals);
    let token = req.get('Authorization');


    let query = queryProposals;
    let flag = false;

    jwt.verify(token, JWT_SEED, (err, decoded) => {

        if (err) {
            res.status(400).json({status: 400, message: error});
        }
        else {
                query += " AND  u.id=" + decoded.id;

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
        }
    });

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
                    + " status=" + req.body.status + ", date_updated='now()' "
                    + " WHERE id_job=" + req.params.id
                    + " AND id_user=" + decoded.id;
                console.log("PUT PROPOSAL ", query);

                pool.query(query, (error, results) => {
                    if (error) {
                        res.status(500).json({
                            status: 500,
                            message: error
                        });
                    }
                    else {
                        res.status(200).json({status: 200, message: "proposal is updated!"});
                    }
                });


            }
        }
    });


    //res.send({message: "API OK!"});

});


module.exports = router;
