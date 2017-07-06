const login = require("facebook-chat-api");
const ws = require("ws").Server;

var clients = {}

const server = new ws({port: 9888});
server.on("connection", function(conn) {
    conn.on("message", function(data) {
        //try {
            var msg = JSON.parse(data);
            actions[msg.action](conn, msg);
        /*}
        catch (e) {
            try {
                conn.send(JSON.stringify({id: msg.id, success: false, err: "Internal server error: " + JSON.stringify(e)}));
            }
            catch (e2) { }
        }*/
    });
    conn.on("close", function() {
        if (clients[conn]) {
			if (clients[conn].stopListening) {
				clients[conn].stopListening();
			}
			clients[conn].api.logout(function(){});
			delete clients[conn];
		}
    })
});

function loggedin(conn, msg) {
    var api = clients[conn] ? clients[conn]["api"] : null;
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
            clients[conn] = {api: api, stopListening: 
				api.listen(function(err, event) {
					if (event.type == "message") {
						conn.send(JSON.stringify({event: "message", body: event, sender: event.threadID}));
					}
				})
			};
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
            conn.send(JSON.stringify({id: msg.id, success: true, messageID: messageInfo.messageID}));
        });
    },
    /*
    Fields: name
    */
    "getID": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.getUserID(msg.name, function(err, data) {
            if (err) {a
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true, account: data[0].userID}));
        });
    },
    /*
    Fields: userID
    */
	"getDetails": function(conn, msg) {
		var api = loggedin(conn, msg);
        if (!api) return;
		
		api.getUserInfo([msg.userID], function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true, details: ret[msg.userID]}));
        });
	},
    /*
    Fields: threadID, title
    */
    "setTitle": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.setTitle(msg.title, msg.threadID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: userID, threadID
    */
    "addUserToGroup": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.addUserToGroup(msg.userID, msg.threadID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: userID, threadID
    */
    "removeUserFromGroup": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.removeUserFromGroup(msg.userID, msg.threadID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: threadID, color
    */
    "changeThreadColor": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.changeThreadColor(msg.color, msg.threadID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: threadID, emoji
    */
    "changeThreadEmoji": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.changeThreadColor("🇨🇭", msg.threadID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: question, options {str: bool}, threadID
    */
    "createPoll": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.createPoll(msg.question, msg.threadID, msg.options, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: messageID
    */
    "deleteMessage": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.deleteMessage(msg.messageID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    },
    /*
    Fields: threadID
    */
    "deleteThread": function(conn, msg) {
        var api = loggedin(conn, msg);
        if (!api) return;

        api.deleteThread(msg.threadID, function(err, ret) {
            if (err) {
                conn.send(JSON.stringify({id: msg.id, success: false, error: err.error}));
                return;
            }
            conn.send(JSON.stringify({id: msg.id, success: true}));
        });
    }
}