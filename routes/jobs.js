const express = require('express')
const router = express.Router();
const pool = require('../pgconex.js');
const bcrypt = require("bcrypt");
const {verifyToken} = require('../middlewares/auth');


router.get('/api/jobs',verifyToken, (req, res) => {
    console.log('GET JOBS');

pool.query('SELECT' 
+ ' klop_jobs.id,' 
+ ' klop_jobs.title,' 
+  'klop_jobs.description,' 
+  'klop_jobs.date_created,' 
+  'klop_jobs.date_updated,' 
 + 'klop_users.name as autor'
+' FROM ' 
 + ' public.klop_jobs,' 
 + ' public.klop_users'
+' WHERE ' 
+ ' klop_jobs.users_id_autor = klop_users.id', (error, results) => {
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


router.get('/api/jobs/:id',verifyToken, (req, res) => {
    console.log('GET JOBS BY id= ',req.params.id);
    
let id = req.params.id;

   pool.query('SELECT' 
+ ' klop_jobs.id,' 
+ ' klop_jobs.title,' 
+  'klop_jobs.description,' 
+  'klop_jobs.date_created,' 
+  'klop_jobs.date_updated,' 
 + 'klop_users.name as autor'
+'FROM' 
 + 'public.klop_jobs,' 
 + 'public.klop_users'
+'WHERE' 
+ ' klop_jobs.users_id_autor = klop_users.id AND klop_jobs.users_id_autor='+id, (error, results) => {
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


router.post('/api/jobs',verifyToken, (req, res) => {
    console.log('POST JOBS');
   let job = req.body;

 if (typeof job.title !== 'undefined'
  && typeof job.id_autor !== 'undefined' 
 ) {


    let query = 'INSERT INTO public.klop_jobs(title,description,users_id_autor) ' +
                ' VALUES('
                +"'"+job.title+"',"
                +"'" + (typeof job.description === 'undefined' ? "N/A" : job.description) + "',"
                   +""+job.id_autor+")"
                   console.log(query);

                    pool.query(query, (error, results) => {
                //   let other ="WITH encrypted_data AS (SELECT crypt('"+user.password+"',gen_salt('md5')) as hashed_value) UPDATE klop.users SET password = (SELECT hashed_value FROM encrypted_data);"

                if (error) {
                    //  throw error
                    console.log(error);
                    if (error.code === '23505') {
                       res.status(500).json({
                            status: 500,
                           // message: "The email " + user.email + " is already registered, try again with a different one"
                            message:error
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
                    res.status(201).json({status: 201, message: "Successfully registered job!"});
                }
            });


    }
    else{
           res.status(400).json({status: 400, message: "title and id_autor is required"});
    }

});

router.put('/api/jobs/:id',verifyToken, (req, res) => {
    console.log('PUT BY ID ',req.params.id);
    res.send({message: "API OK!"});

});

router.delete('/api/jobs/:id',verifyToken, (req, res) => {
    console.log('DELETE BY ID ',req.params.id);
    res.send({message: "API OK!"});

});

module.exports = router;
