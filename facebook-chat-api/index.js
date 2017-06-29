const login = require("facebook-chat-api");
const ws = require("ws").Server;

var clients = {}

const server = new ws({port: 9888});
server.on("connection", function(conn) {
    conn.on("message", function(data) {
        var msg = JSON.parse(data);
        actions[msg.action](conn, msg);
    });
    conn.on("close", function() {
        if (clients[conn]) delete clients[conn];
    })
});

function loggedin(conn, msg) {
    var api = clients[conn];
    if (!api) {
        conn.send(JSON.stringify({id: msg.id, success: false, err: "No connected account"}));
        return false;
    }
    return api;
}

var actions = 
{
    /*
    Fields: username, password
    */
    "login": function(conn, msg) {
        login({email: msg.email, password: msg.password}, function(err, api) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            clients[conn] = api;
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: message, recipient
    */
    "sendMessage": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.sendMessage(msg.message, msg.recipient, function(err, messageInfo) {
            if (err && err.error) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: name
    */
    "getID": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.getUserID(msg.name, function(err, data) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true, account: data[0].userID}));
        });
    }
}