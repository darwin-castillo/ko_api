const pool = require('../config/config').pool;
const sequelize = require('../config/config').sequelize;
const jwt = require("jsonwebtoken");
const JWT_SEED = require("../config/sets").JWT_SEED;
const {verifyToken} = require('../middlewares/auth');
const admin = require("firebase-admin");
const serviceAccount = require("../kleanops-50f0c-firebase-adminsdk-bgqfx-b76edf07c8");
const JWT_CADUCITY = require("../config/sets").JWT_CADUCITY;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kleanops-50f0c.firebaseio.com"
});


module.exports = {


    socialAuth: (req, res) => {
        let body = req.body;
        let user_agent = req.useragent.source;
        admin.auth().verifyIdToken(body.id_token)
            .then(function (decodedToken) {
                console.log("token decoded ",decodedToken);
                let uid = decodedToken.uid;
                let name = decodedToken.name;
                let email = decodedToken.email;
                let image = decodedToken.picture;
              let fcm_token = body.fcm_token;



                let insert = 'INSERT INTO public.klop_users(dni,name,surname,email,phone,address,city,' +
                    'postcode,image,comment,description,id_role_fk,password,verified) ' +
                    ' VALUES('
                    + "'" + uid + "',"
                    +"'" + name + "'" + ','
                    + "''" + ','
                    + "'" + email + "'" + ','
                    + "''" + ','
                    + "''" + ','
                    + "''" + ','
                    + "''" + ','
                    + "'" + image + "'" + ','
                    + "''" + ','
                    + "''" + ','
                    + "4,"
                    + "'" + Math.floor(new Date() / 1000) + "',true"
                    + ')';


                let select = "SELECT id,name,surname,email,phone,address,image,verified,password,id_role_fk as role FROM klop_users WHERE email='" + email + "'";

                pool.query(select, (errorSelect, resultsSelect) => {

                    if (errorSelect) {
                        res.status(500).json({status: 500, message: errorSelect});
                    }
                    else {
                        if (resultsSelect.rowCount <= 0) {
                            console.log(insert);


                            pool.query(insert + "; \n" + "select * from klop_users where email='" + email + "'", (errorInsert, resultsInsert) => {
                                if (errorInsert) {
                                    res.status(500).json({status: 500, message: errorInsert});
                                }
                                else {

                                   console.log(resultsInsert[1]);
                                    let select_resp = resultsInsert[1].rows[0];
                                    let tokenData = {
                                        id: select_resp.id,
                                        username: select_resp.name,
                                        email: select_resp.email,


                                        // ANY DATA
                                    };

                                    let token = jwt.sign(tokenData, JWT_SEED, {
                                        expiresIn: JWT_CADUCITY
                                    });

                                    let userResp = {};
                                    userResp.id = select_resp.id;
                                    userResp.name = name;
                                    userResp.surname = '';
                                    userResp.email = email;
                                    userResp.phone = '';
                                    userResp.address = '';
                                    userResp.image = image;
                                    userResp.role = 4;
                                    userResp.verified=true;


                                    let objResp = {};

                                    objResp.user = userResp;
                                    objResp.token = token;
                                    objResp.status = 201;
                                    objResp.message = "User created and logged!";


                                    let token_query = "INSERT INTO public.klop_users_tokens(id_user,token,date_created,active,fcm_token,user_agent)  \n" +
                                        "  VALUES(" + select_resp.id + ",'" + token + "',now(),true," + (typeof fcm_token === 'undefined' ? "NULL" : "'" + fcm_token + "'") + ",'" + user_agent + "')";


                                    console.log(token_query)
                                    pool.query(token_query

                                        , (errrToken, resultsToken) => {


                                        console.log("token process");
                                            console.log("error-> ", errrToken);
                                          if(errrToken){
                                              console.log("user saved with errors");
                                              res.status(201).json(objResp);
                                          }
                                          else {
                                              console.log(resultsToken);
                                              console.log("user saved");
                                              res.status(201).json(objResp);
                                          }

                                        });

                                }


                            });


                           // res.status(200).json({message: resultsSelect});


                        }
                        else {
                            let obj = resultsSelect.rows;
                            let user = obj[0];


                            let tokenData = {
                                id: user.id,
                                username: user.name,
                                email: user.email,


                                // ANY DATA
                            };

                            let token = jwt.sign(tokenData, JWT_SEED, {
                                expiresIn: JWT_CADUCITY
                            });


                            let obj_resp = {};

                            //user.role = user.role_id_fk;
                            obj_resp.user = user;
                            obj_resp.token = token;
                            delete obj_resp.user.password;
                            obj_resp.status = 200;
                          //  obj_resp.user.role = user.role_id_fk;

                            obj_resp.message = "User Logged!";
                            console.log("user: ",user);



                            let token_query = "INSERT INTO public.klop_users_tokens(id_user,token,date_created,active,fcm_token,user_agent)  \n" +
                                "  VALUES(" + user.id + ",'" + obj_resp.token + "',now(),true,'','"+user_agent  + "')";


                            console.log(token_query)
                            pool.query(token_query

                                , (errr, results) => {
                                    console.log("token process");
                                    console.log("error-> ", errr);
                                    console.log(results);
                                    res.status(200).json(obj_resp);

                                });


                        }


                    }


                });

                /*  pool.query(query, (error, results) => {

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
                  }); */


                // ...
            }).catch(function (error) {
            // Handle error
            res.status(500).json({status: 500, error: error});
        });


    },
    socialVerify: (req, res) => {
        res.status(200).json({message: "social verify in building..."});
    }


}