const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const useragent = require('express-useragent');


// Settings
app.set('port', process.env.PORT || 48002);


// Middlewares
app.use(express.json());
app.use(useragent.express());

// Routes
app.use(require('./routes/userRoutes'));
app.use(require('./routes/jobRoutes'));
app.use(require('./routes/loginRoutes'));
app.use(require('./routes/proposalRoutes'));



io.on('connection',(socket)=> {
    console.log('Alguien se ha conectado con Sockets');
});
const firebaseConfig = {
    apiKey: "AIzaSyCUNtKiJWcFQTSiRVk0BytKLCctZsijBUI",
    authDomain: "kleanops-50f0c.firebaseapp.com",
    databaseURL: "https://kleanops-50f0c.firebaseio.com",
    projectId: "kleanops-50f0c",
    storageBucket: "kleanops-50f0c.appspot.com",
    messagingSenderId: "394708024153",
    appId: "1:394708024153:web:fcacd52019f97a39"
};
// Starting the server
server.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
    console.log("var_env ", process.env.VAR_ENV);


    // Initialize Firebase
   // firebase.initializeApp(firebaseConfig);
});