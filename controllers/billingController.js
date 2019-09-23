const pool = require('../config/config').pool;
const sequelize = require('../config/config').sequelize;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SEED = require("../config/sets").JWT_SEED;
const {verifyToken} = require('../middlewares/auth');

module.exports = {


    /**
     * Add new skills by self user
     * @param req
     * @param res
     */
    saveBillingDetail: (req, res) => {
        console.log('POST  api/billing ',req.params.idjob);
        console.log('body ', req.body);
        let token = req.get('Authorization');
   let  body = req.body;


        let less = [];

        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {
                    let idUser = decoded.id;
                    if (typeof body.description !== 'undefined') {


                        let query = "INSERT INTO public.klop_billing_details(" +
                            " description,amount, comment,id_job) " +
                            " VALUES (" +
                            "'" + body.description + "'," + body.amount + ",'"+body.comment+"',"+req.params.idjob+
                            ");"


                        console.log(query);
                        pool.query(query, (error, results) => {
                            //   let other ="WITH encrypted_data AS (SELECT crypt('"+user.password+"',gen_salt('md5')) as hashed_value) UPDATE klop.users SET password = (SELECT hashed_value FROM encrypted_data);"

                            if (error) {
                                //  throw error
                                console.log(error);
                                if (error.code === '23505') {
                                    res.status(500).json({
                                        status: 500,
                                        message: " this bill is already registered by this user"
                                    })
                                    return;
                                }
                                else if (error.code === '23503') {
                                    res.status(500).json({
                                        status: 500,
                                        message: "this  bill not exist"
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
                                res.status(201).json({status: 201, message: "Successfully registered bill!"});
                            }
                        });


                    }
                    else {

                        res.status(500).json({
                            status: 500,
                            message: "fields required"
                        });

                    }
                }
            }
        });

    },

    /**
     * get skills by self user
     * @param req
     * @param res
     */

    getBillingDetail: (req, res) => {

        let idJob = req.params.idjob;

        console.log("GET billing BY job ");

         let query = 'SELECT * FROM public.klop_billing_details WHERE id_job='+idJob
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



}