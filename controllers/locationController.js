const pool = require('../config/config').pool;
const sequelize = require('../config/config').sequelize;
const jwt = require("jsonwebtoken");
const JWT_SEED = require("../config/sets").JWT_SEED;
const {verifyToken} = require('../middlewares/auth');

module.exports = {


    /**
     * Create a new Location by self user
     * @param req
     * @param res
     */
    createSelfLocation: (req, res) => {
        console.log('POST  api/locations');
        console.log('body ', req.body);
        let token = req.get('Authorization');
        let aux = {

            title: null,
            address: null,
            latitude: null,
            longitude: null,
            city: "",
            country: "",
            street: "",
            phone: null,
            coordinates: null,
            postcode: "",
            description: "",
            references: "",


        };
        let location = req.body;
        Object.assign(aux,location);


        let less = [];

        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {
                    let idUser = decoded.id;
                    if (typeof location.title !== 'undefined' && typeof location.address !== 'undefined' && typeof location.coordinates !== 'undefined') {


                        let query = 'INSERT INTO public.klop_locations(' +
                            '\ttitle, address, latitude, longitude, city, country, street, phone, coordinates, postcode, description,place_references,id_user)\n' +
                            '\tVALUES (' +
                            '\'' + location.title + '\',' +
                            '\'' + location.address + '\',' +
                            '\'' + location.latitude + '\',' +
                            '\'' + location.longitude + '\',' +
                            '\'' + location.city + '\',' +
                            '\'' + location.country + '\',' +
                            '\'' + location.street + '\',' +
                            '\'' + location.phone + '\',' +
                            '\'' + location.coordinates + '\',' +
                            '\'' + location.postcode + '\',' +
                            '\'' + location.description + '\',' +
                            '\'' + location.references + '\',' +
                            '' + idUser + '' +
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
                                        message: " is already registered, try again with a different one"
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
                                res.status(201).json({status: 201, message: "Successfully registered location!"});
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
     * get locations by self user
     * @param req
     * @param res
     */
    getSelfLocations: (req, res) => {
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

        console.log("GET LOCATION BY USER ");


        jwt.verify(token, JWT_SEED, (err, decoded) => {

            if (err) {
                res.status(500).json({error: 500, message: err})
            }
            else {
                console.log(decoded);
                if (typeof decoded.id !== 'undefined') {


                    let query = 'SELECT * FROM klop_locations WHERE id_user = ' + decoded.id;
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


}