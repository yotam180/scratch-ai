const ws = require("ws").Server;
const fs = require("fs");

var clients = {};

var servers = {};

const server = new ws({port: 9889});
server.on("connection", function(conn) {
    conn.on("message", function(d) {
        var data = {};
        //try
        //{
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
        /*}
        catch (e) {
            if (data.type != "response")
                conn.send(JSON.stringify({id: data.id, code: 500, response: {}}));
        }*/
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