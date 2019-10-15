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
        console.log('POST  api/billing ', req.params.idjob);
        console.log('body ', req.body);
        let token = req.get('Authorization');
        let body = req.body;


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
                            "'" + body.description + "'," + body.amount + ",'" + body.comment + "'," + req.params.idjob +
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


    saveTransaction: (req, res) => {
        console.log('POST  api/billing/transaction ', req.params.idjob);
        let body = req.body;
        let idJob = req.params.idjob;

        let items = body.items;
        pool.query("DELETE FROM public.klop_billing_details WHERE id_job=" + idJob, (error, results) => {
            console.log("Error: ", error)
            console.log("Results: ", results);
            let valid = true;
            for (let i = 0; i < items.length; i++) {
                const query = 'INSERT INTO public.klop_billing_details( ' +
                    ' id, description, amount, comment, id_job, quantity, type) ' +
                    ' VALUES($1, $2, $3, $4, $5, $6, $7 );';
                console.log(query)

                const values = [items[i].id, items[i].description, items[i].amount, items[i].comment, idJob, items[i].quantity, items[i].type]
                console.log("values ", values);
                pool.query(query, values, (errr, ress) => {
                    if (errr) {
                        //  res.status(500).json({status:500,message:errr});
                        valid = false;
                        console.log(errr)
                    }
                    else {
                        console.log(items.length, " = ", i + 1);
                        if (items.length === (i + 1) && valid) {

                            res.status(201).json({status: 201, message: "Transaction saved"});

                        }
                        else if (items.length === (i + 1) && !valid) {
                            res.status(500).json({status: 201, message: "some or all  items not saved"});
                        }

                    }
                });


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

        let query = 'SELECT * FROM public.klop_billing_details WHERE id_job=$1 ORDER BY id'
        let values = [idJob]
        pool.query(query, values, (error, results) => {
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


    getInvoicesByCleaner: (req, res) => {
        let token = req.get('Authorization');
        jwt.verify(token, JWT_SEED, (err, decoded) => {


            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {

                if (typeof decoded.id !== 'undefined') {

                    let query = 'SELECT  j.id,j.title, j.date_invoice,\n' +
                        'j.id_status ,j.id_invoice_status as actual_status_invoice, c.name AS client, k.name as cleaner, \n' +
                        'ROUND(SUM(b.amount*b.quantity)::NUMERIC,2) as amount, \n' +
                        'json_build_object(\'id\',i.id,\'title\',i.title) as status\n' +
                        'FROM public.klop_jobs j\n' +
                        'LEFT OUTER JOIN  klop_users as c on c.id = j.users_id_autor\n' +
                        'LEFT OUTER JOIN  klop_users as k on k.id = j.users_id_cleaner\n' +
                        'LEFT OUTER JOIN  klop_billing_details as b on b.id_job = j.id\n' +
                        'LEFT OUTER JOIN klop_invoice_status as i on i.id = j.id_invoice_status\n' +
                        '\n' +
                        'WHERE j.users_id_cleaner=$1 \n' +
                        'GROUP BY j.id,c.id,k.id,b.id_job,i.id\n' +
                        'ORDER BY j.id'
                    console.log(query);
                    let values = [decoded.id];
                    console.log("values ",values);

                    pool.query(query,values,(err2,rest)=>{
                        if(err2){
                            console.log(err2)
                            res.status(500).json({error: 500, message: err2})
                        }
                        else{
                            let list = rest.rows;
                            let obj = {};
                            obj.list = list;
                            obj.count = list.length;
                            res.status(200).json(obj);
                        }
                    })

                }
            }


        });


    },


    getInvoicesByClient: (req, res) => {
        let token = req.get('Authorization');
        jwt.verify(token, JWT_SEED, (err, decoded) => {


            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {

                if (typeof decoded.id !== 'undefined') {

                    let query = 'SELECT  j.id,j.title, j.date_invoice,\n' +
                        'j.id_status ,j.id_invoice_status as actual_status_invoice, c.name AS client, k.name as cleaner, \n' +
                        'ROUND(SUM(b.amount*b.quantity)::NUMERIC,2) as amount, \n' +
                        'json_build_object(\'id\',i.id,\'title\',i.title) as status\n' +
                        'FROM public.klop_jobs j\n' +
                        'LEFT OUTER JOIN  klop_users as c on c.id = j.users_id_autor\n' +
                        'LEFT OUTER JOIN  klop_users as k on k.id = j.users_id_cleaner\n' +
                        'LEFT OUTER JOIN  klop_billing_details as b on b.id_job = j.id\n' +
                        'LEFT OUTER JOIN klop_invoice_status as i on i.id = j.id_invoice_status\n' +
                        '\n' +
                        'WHERE j.users_id_autor=$1 and j.id_status>4\n' +
                        'GROUP BY j.id,c.id,k.id,b.id_job,i.id\n' +
                        'ORDER BY j.id'
                    console.log(query);
                    let values = [decoded.id];
                    console.log("values ",values);

                    pool.query(query,values,(err2,rest)=>{
                        if(err2){
                            console.log(err2)
                            res.status(500).json({error: 500, message: err2})
                        }
                        else{
                            let list = rest.rows;
                            let obj = {};
                            obj.list = list;
                            obj.count = list.length;
                            res.status(200).json(obj);
                        }
                    })

                }
            }


        });


    },


}