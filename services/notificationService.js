const axios = require('axios');
const pool = require('../config/config').pool;
const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'kleanops.notifications@gmail.com', // Your email id
        pass: 'Ko123456.' // Your password
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});


function sendEmailtoUser(email, title, message) {
    let mailOptions = {
        from: 'darwin.c5@gmail.com',
        to: '' + email,
        subject: 'New Notification',//+ results.rows[0].name,
        // text: 'That was easy!'
        html: '<h1> ' + title + ' </h1><p>' + message + '  </p>',
    };


    return new Promise(function (resolve, reject) {


        transporter.sendMail(mailOptions, function (errors, info) {
            if (errors) {
                console.log(errors);
                reject()
            } else {
                console.log('Email sent [' + email + ']: ' + info.response);
                resolve()

            }
        });


    });
}

function sendPushToUser(id, title, message) {
    return new Promise(function (resolve, reject) {

        let query = "SELECT tk.fcm_token FROM public.klop_users_tokens tk\n" +
            "INNER JOIN klop_users as u on u.id=tk.id_user\n" +
            "WHERE id_user=$1 AND tk.fcm_token IS NOT NULL\n";
        let values = [id];


        console.log(query);
        pool.query(query, values, (error, results) => {
            if (error) {
                console.log(error);
                reject();
            }
            else {
                console.log(results.rows);
                let tokens = [];
                for (let i = 0; i < results.rows.length; i++) {
                    tokens.push(results.rows[i].fcm_token);
                }
                console.log(tokens);


                axios.post('https://fcm.googleapis.com/fcm/send',
                    {
                        "registration_ids": tokens,
                        "collapse_key": "type_a",
                        "priority": "high",
                        "content_available": true,
                        "notification": {
                            "body": message,
                            "title": title
                        },
                        "data": {
                            "body": message,
                            "title": title


                        }
                    }
                    , {
                        headers: {
                            'Authorization': 'key=AAAAW-Zue1k:APA91bESzhIqrvroVh32Nz5pQB3CrJdwyCr3Q38mTYiFfC9lRtSr69HEwPCzp5v77NOhWiNaEqMmQOLHv9pIbmEI24BMT--4nUf_UwLmgzhgjtKB9BXZ5OZEkewC38AAqCImviHXs3Tl'
                        }
                    })
                    .then((response) => {
                        console.log(response);
                        resolve()
                    })
                    .catch((error) => {
                        console.log(error);
                        reject();
                    });


            }
        });

    });
}


module.exports = {


    test: () => {
        return new Promise(function (resolve, reject) {


        });
    },

    testLoop: () => {
        var item = ["A", "B", "C"];
        Promise.map(items, function (item) {
            return performAsyncOperation(item);
        }, {concurrency: n})
            .then(function (allResults) {
                //  'allResults' now contains an array of all
                //  the results of 'performAsyncOperation'
            })
    },


    sendPushtoUser: (id, title, message) => {
        return new Promise(function (resolve, reject) {

            let query = "SELECT tk.fcm_token FROM public.klop_users_tokens tk\n" +
                "INNER JOIN klop_users as u on u.id=tk.id_user\n" +
                "WHERE id_user=$1 AND tk.fcm_token IS NOT NULL\n";
            let values = [id];


            console.log(query);
            pool.query(query, values, (error, results) => {
                if (error) {
                    console.log(error);
                    reject();
                }
                else {
                    console.log(results.rows);
                    let tokens = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        tokens.push(results.rows[i].fcm_token);
                    }
                    console.log(tokens);


                    axios.post('https://fcm.googleapis.com/fcm/send',
                        {
                            "registration_ids": tokens,
                            "collapse_key": "type_a",
                            "priority": "high",
                            "content_available": true,
                            "notification": {
                                "body": message,
                                "title": title
                            },
                            "data": {
                                "body": message,
                                "title": title


                            }
                        }
                        , {
                            headers: {
                                'Authorization': 'key=AAAAW-Zue1k:APA91bESzhIqrvroVh32Nz5pQB3CrJdwyCr3Q38mTYiFfC9lRtSr69HEwPCzp5v77NOhWiNaEqMmQOLHv9pIbmEI24BMT--4nUf_UwLmgzhgjtKB9BXZ5OZEkewC38AAqCImviHXs3Tl'
                            }
                        })
                        .then((response) => {
                            console.log(response);
                            resolve()
                        })
                        .catch((error) => {
                            console.log(error);
                            reject();
                        });


                }
            });


        });
    },
    sendEmailtoUser: (id, title, message) => {

    },

    sendNotificationToUser: (id, title, message) => {
        return new Promise(function (resolve, reject) {

            let query = "SELECT notif_email,notif_push,email FROM klop_users WHERE id=$1";
            let values = [id];

            pool.query(query, values, (error, results) => {
                let user = results.rows[0];
                if (user.notif_email) {
                    sendEmailtoUser(user.email, title, message);

                }
                if (user.notif_push) {
                    sendPushToUser(id, title, message);
                }
                resolve();
            });
        });


    },


    sendNotificationByJob: (idJob, title, message) => {
        return new Promise(function (resolve, reject) {

            let query = "SELECT j.title, k.notif_email as notif_email_cleaner, k.id as id_cleaner, k.email as email_cleaner, k.notif_push as notif_push_cleaner," +
                " c.notif_email as notif_email_client, c.id as id_client, c.email as email_client, c.notif_push as notif_push_client  " +
                "FROM klop_jobs j " +
                "LEFT OUTER JOIN klop_users as k on j.users_id_cleaner = k.id " +
                "LEFT OUTER JOIN klop_users as c on j.users_id_autor = c.id WHERE j.id = $1";
            let values = [idJob];

            pool.query(query, values, (error, results) => {
                let user = results.rows[0];
                console.log(user);
                if (user.notif_email_cleaner) {
                    sendEmailtoUser(user.email_cleaner, title, user.title+": "+message);

                }
                if (user.notif_push_cleaner) {
                    sendPushToUser(user.id_cleaner, title, user.title+": "+message);
                }

                if (user.notif_email_client) {
                    sendEmailtoUser(user.email_client, title, user.title+": "+message);

                }
                if (user.notif_push_client) {
                    sendPushToUser(user.id_client, title, user.title+": "+message);
                }
                resolve();
            });
        });


    }


}