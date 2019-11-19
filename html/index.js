const pool = require('../config/config').pool;
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

    timing: (req, res) => {
        let epoch = Math.floor(new Date().getTime() / 1000);
        res.status(200).json({ok: epoch});
    },

    validEmail: (req, res) => {
        let value = req.params.id
        let http = require('http'),
            fs = require('fs');
        var fileName = './html/index.html';
        //   var stream = fs.createWriteStream(fileName);
        //   var html = buildHtml();
        let current = Math.floor(new Date().getTime() / 1000);

        let dateEp = value.split("ko2vu1")[0];
        let id = value.split("ko2vu1")[1];

        console.log(current);
        let diff = (current - dateEp);
        console.log("link diff time ", diff);
        if (diff <= 86400 && diff >= 0) {
            let query = 'UPDATE klop_users SET verified=true WHERE id=' + id;

            pool.query(query, (error, results) => {

                fs.readFile('./html/index.html', function (err, html) {
                    console.log("html read error ", err);
                    if (err) {
                        throw err;
                    }
                    else {
                        console.log("no error in html");
                        res.end(html);
                    }
                });

            });
        }
        else {
            fs.readFile('./html/expired.html', function (err, html) {
                console.log("html read error ", err);
                if (err) {
                    throw err;
                }
                else {
                    console.log("no error in html");
                    res.end(html);
                }
            });
        }


        /*  stream.once('open', function(fd) {
              var html = buildHtml();
              stream.end(html);
              console.log(html);
              res.end(html);

          });
          */
    },


}

function buildHtml() {
    var body =
        '  <p>London is the capital city of England. It is the most populous city in the United Kingdom, with a metropolitan area of over 13 million inhabitants.</p>\n' +
        '  <p>Standing on the River Thames, London has been a major settlement for two millennia, its history going back to its founding by the Romans, who named it Londinium.</p>\n';

    var header = '<div style="background-color:dodgerblue;color:white;padding:20px;">Welcome to Kleanops</div> ';


    // concatenate header string
    // concatenate body string

    return '<!DOCTYPE html>'
        + '<html><head>' + header + '</head><body>' + body + '</body></html>';
}