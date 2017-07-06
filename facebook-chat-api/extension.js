(function(ext) {
    var waiting = {};
    var last_error = "";
    var logged_in = false; 

    var details = {};

    window.msgQueue = [];
    window.readyNextMsg = true;
    window.currentMsg = null;

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        if (socket) {
            socket.close();
        }
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.connect = function(callback) {
        if (window.socket && socket.readyState == WebSocket.OPEN) {
            callback();
            return; 
        }
        socket = new WebSocket("ws://localhost:9888");
        socket.onopen = function() {
            callback();
        };
        socket.onmessage = function(d) {
            console.log("received " + d.data);
            var data = JSON.parse(d.data);
            if (data.event) {
                console.log("MESSAGE!");
                msgQueue.push(data.body);
            }
            if (waiting[data.id]) {
                if (!data.success) {
                    last_error = data.error;
                }
                waiting[data.id](data);
                delete waiting[data.id];
            }
        };
    };

    ext.login = function(email, password, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            logged_in = d.success;
            callback();
        }
        socket.send(JSON.stringify({action: "login", id: session, email: email, password: password}));
    };

    ext.logged_in = function() {
        return logged_in;
    };
 
    ext.send_message = function(msg, recipient, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback(d.messageID);
        };
        socket.send(JSON.stringify({action: "sendMessage", recipient: recipient, message: msg, id: session}));
    };

    ext.get_id_user = function(nm, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback(d.account);
        };
        socket.send(JSON.stringify({action: "getID", name: nm, id: session}));
    };

    ext.get_details_user = function(id, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            details[id] = d.details;
            callback();
        };
        socket.send(JSON.stringify({action: "getDetails", userID: id, id: session}));
    };

    ext.get_details_name = function(id) {
        return details[id] ? details[id].name : "";
    };
    ext.get_details_first_name = function(id) {
        return details[id] ? details[id].firstName : "";
    };
    ext.get_details_vanity = function(id) {
        return details[id] ? details[id].vanity : "";
    };
    ext.get_details_vanity = function(id) {
        return details[id] ? details[id].vanity : "";
    };
    ext.get_details_thumbnail = function(id) {
        return details[id] ? details[id].thumbSrc : "";
    };
    ext.get_details_profile = function(id) {
        return details[id] ? details[id].profileUrl : "";
    };
    ext.get_details_gender = function(id) {
        return details[id] ? details[id].gender : "";
    };
    ext.get_details_friend = function(id) {
        return details[id] ? details[id].isFriend : "";
    };
    ext.get_details_bd = function(id) {
        return details[id] ? details[id].isBirthday : "";
    };

    ext.set_title = function(group, title, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback();
        };
        socket.send(JSON.stringify({action: "setTitle", threadID: group, title: title, id: session}));
    };

    ext.add_to_group = function(user, group, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback();
        };
        socket.send(JSON.stringify({action: "addUserToGroup", threadID: group, userID: user, id: session}));
    };

    ext.remove_from_group = function(user, group, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback();
        };
        socket.send(JSON.stringify({action: "removeUserFromGroup", threadID: group, userID: user, id: session}));
    };

    ext.change_thread_color = function(thread, color, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback();
        };
        socket.send(JSON.stringify({action: "changeThreadColor", threadID: thread, color: color, id: session}));
    };

    ext.create_poll = function(question, group, options, callback) {
        var session = Math.random().toString();
        waiting[session] = function(d) {
            callback();
        };
        var opts = {};
        var o = options.split(',');
        for (var i = 0; i < o.length; i++) {
            opts[o[i]] = false;
        }
        console.log(opts);
        socket.send(JSON.stringify({action: "createPoll", threadID: group, question: question, options: opts, id: session}));
    };

    ext.check_next_msg = function() {
        if (msgQueue.length > 0 && readyNextMsg) {
            readyNextMsg = false;
            currentMsg = msgQueue.shift();
            return true;
        }
        return false;
    };

    ext.next_message = function() {
        readyNextMsg = true;
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'Open connection to the server', 'connect'],
            ['w', 'Login with %s, %s', 'login', 'email@provider.com', 'password'],
            ['b', 'Is logged in?', 'logged_in'],

            ['-'],['-'],

            ['w', 'Send message %s to %s', 'send_message', 'text', 'recipient id'],
            ['R', 'Send message %s to %s and get message ID', 'send_message', 'text', 'recipient id'],

            ['-'],['-'],

            ['R', 'ID of %s', 'get_id_user', 'name'],
            ['w', 'Request details of %n', 'get_details_user', 'id'],
            ['r', 'Name of %n', 'get_details_name', 'id'],
            ['r', 'First name of %n', 'get_details_first_name', 'id'],
            ['r', 'Vanity of %n', 'get_details_vanity', 'id'],
            ['r', 'Thumbnail URL of %n', 'get_details_thumbnail', 'id'],
            ['r', 'Profile URL of %n', 'get_details_profile', 'id'],
            ['b', 'Is it birthday of %n', 'get_details_bd', 'id'],
            ['b', 'Is %n a friend?', 'get_details_friend', 'id'],
            
            ['-'],['-'],

            ['w', 'Set %n\'s title to %s', 'set_title', 'group', 'title'],
            ['w', 'Add user %n to group %n', 'add_to_group', 'id', 'group'],
            ['w', 'Remove user %n from group %n', 'remove_from_group', 'id', 'group'],
            ['w', 'Change group %n color to #%s', 'change_thread_color', '', 'FFFFFF'],

            ['-'],['-'],

            ['w', 'Create poll %s in %n with options %s', 'create_poll', 'question', 'group', 'options(a,b,c..)'],
            
            ['-'],['-'],

            ['h', 'When there\'s a message', 'check_next_msg'],
            [' ', 'Finish message handling', 'next_message']
        ]
    };

    // Register the extension
    ScratchExtensions.register('Facebook Messenger', descriptor, ext);
})({});