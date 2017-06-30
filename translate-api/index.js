const http          =           require("http");
const url           =           require("url");
const translate     =           require("google-translate-api");

const port = 8080;


const httpserver = http.createServer(function(req, res) {
    var data = "";
    var get = url.parse(req.url, true);
    req.on("data", function(d) {
        data += d;
    });
    req.on("end", function() {
        console.log("From " + get.query.from);
        console.log("To " + get.query.to);
        console.log("Data " + data);
        translate(data, {from: get.query.from, to: get.query.to}).then(function(result) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.write(result.text);
            res.end();
        }).catch(function(err) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(500);
            console.log(err);
            res.end();
        });
    });
});

httpserver.listen(port, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("HTTP server is active on " + port);
});