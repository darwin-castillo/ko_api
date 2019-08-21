module.exports = {


    show: () => {
        let http = require('http'),
            fs = require('fs');


        fs.readFile('./html/index.html', function (err, html) {
            if (err) {
                throw err;
            }
            http.createServer(function (request, response) {
                response.writeHeader(200, {"Content-Type": "text/html"});
                response.write(html);
                response.end();
            }).listen(8992);
        });
    },

}