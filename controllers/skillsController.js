const pool = require('../config/config').pool;
const sequelize = require('../config/config').sequelize;
const jwt = require("jsonwebtoken");
const JWT_SEED = require("../config/sets").JWT_SEED;
const {verifyToken} = require('../middlewares/auth');

module.exports = {


    /**
     * Add new skills by self user
     * @param req
     * @param res
     */
    createSelfSkills: (req, res) => {
        console.log('POST  api/skills');
        console.log('body ', req.body);
        let token = req.get('Authorization');
        let aux = {

            id_skill: null,


        };
        let skill = req.body;
        Object.assign(aux, skill);


        let less = [];

        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {
                    let idUser = decoded.id;
                    if (typeof skill.id_skill !== 'undefined') {


                        let query = 'INSERT INTO public.klop_skills_users(' +
                            'notes, users_id, skills_id) ' +
                            '\tVALUES (' +
                            '\'\',' + decoded.id + ',' + skill.id_skill +
                            ');'


                        console.log(query);
                        pool.query(query, (error, results) => {
                            //   let other ="WITH encrypted_data AS (SELECT crypt('"+user.password+"',gen_salt('md5')) as hashed_value) UPDATE klop.users SET password = (SELECT hashed_value FROM encrypted_data);"

                            if (error) {
                                //  throw error
                                console.log(error);
                                if (error.code === '23505') {
                                    res.status(500).json({
                                        status: 500,
                                        message: " this skill is already registered by this user"
                                    })
                                    return;
                                }
                                else if (error.code === '23503') {
                                    res.status(500).json({
                                        status: 500,
                                        message: "this skills not exist"
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
                                res.status(201).json({status: 201, message: "Successfully registered skill!"});
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
    getSelfSkills: (req, res) => {
        let location = {

            title: null,
            address: null,
            latitude: null,
            longitude: null,
            city: null,
            country: null,
            street: null,
            phone: null,
            coordinates: null,
            postcode: null,
            description: null,


        };
        let token = req.get('Authorization');

        console.log("GET SKILLS BY USER ");


        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {


                    let query = 'SELECT sk.id,sk.title,sk.description \n' +
                        '\tFROM public.klop_skills_users su\n' +
                        '\tLEFT OUTER JOIN  public.klop_users as us on su.users_id = us.id\n' +
                        '\tLEFT OUTER JOIN public.klop_skills as sk on su.skills_id = sk.id WHERE us.id =' + decoded.id;
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
            }
        });

    },

    getSkills: (req, res) => {
        let location = {

            title: null,
            address: null,
            latitude: null,
            longitude: null,
            city: null,
            country: null,
            street: null,
            phone: null,
            coordinates: null,
            postcode: null,
            description: null,


        };
        let token = req.get('Authorization');

        console.log("GET SKILLS BY USER ");


        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {


                    let query = 'SELECT * FROM public.klop_skills'
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
            }
        });

    },

    deleteSelfSkill: (req, res) => {
        let id_skill = req.params.idskill;
        let token = req.get('Authorization');

        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {
                    let idUser = decoded.id;
                    if (typeof id_skill !== 'undefined') {
                        let query = "DELETE FROM public.klop_skills_users " +
                            "WHERE skills_id=" + id_skill + " AND users_id=" + decoded.id;

                        console.log(query);
                        pool.query(query, (error, results) => {

                            if (error) {
                                return res.status(500).json({status: 500, message: err});
                            }

                            else{
                                return res.status(200).json({status: 200, message: "Skill deleted from this user"});
                            }
                        });
                    }
                    else {
                        return res.status(400).json({status: 400, message: "id_skill is required"});
                    }

                }
                else {
                    return res.status(400).json({status: 400, message: "not valid token"});
                }


            }
        });

    },

}