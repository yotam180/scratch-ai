const fs = require("fs");    
// you'll probably load configuration from config
    var ws_cfg = {
        ssl: true,
        port: 9889,
        ssl_key: 'private_key.pem',
        ssl_cert: 'scratch-ai.win.crt'
    };

var processRequest = function(req, res) {
    console.log("Request received.");
    res.end("Hey!");
};

var httpServ = require('https');
var app = null;

app = httpServ.createServer({
  key: fs.readFileSync(ws_cfg.ssl_key),
  cert: fs.readFileSync(ws_cfg.ssl_cert)
}, processRequest).listen(ws_cfg.port);


// From here and on this is the actual coding of the websocket. Till here was only ssl certificates and shit like that.

var WebSocketServer = require('ws').Server;

var clients = {};

var servers = {};

var ws_server = new WebSocketServer( {server:app} );

ws_server.on("connection", function(conn) {
    conn.on("message", function(d) {
        var data = {};
        try
        {
            data = JSON.parse(d);
            if (data.type == "request") {
                if (!servers[data.server]) {
                    console.log(servers);
                    conn.send(JSON.stringify({id: data.id, code: 503, response: {}}));
                    return;
                }
                clients[data.id] = conn;
                servers[data.server].send(d);
            }
            else if (data.type == "response") {
                console.log("Got response " + d);
                if (clients[data.id]) {
                    clients[data.id].send(d);
                    delete clients[data.id];
                }
            }
            else if (data.type == "subscribe") {
                if (!fs.existsSync(data.server + ".txt")) {
                    fs.writeFileSync(data.server + ".txt", data.password, {encoding: "utf-8"});
                }
                var pass = fs.readFileSync(data.server + ".txt", "utf-8");
                if (pass != data.password) {
                    conn.send(JSON.stringify({id: data.id, success: false, response: {data: "Error: Password is incorrect"}}));
                    return;
                }
                servers[data.server] = conn;
                conn.send(JSON.stringify({id: data.id, success: true, response: {data: "Server bound"}}));
            }
        }
        catch (e) {
            if (data.type != "response")
                conn.send(JSON.stringify({id: data.id, code: 500, response: {}}));
        }
    });
    conn.on("close", function() {
        for (var x in clients) {
            if (clients[x] == conn) delete clients[x];
        }
        for (var x in servers) {
            if (servers[x] == conn) delete servers[x];
        }
    });
});