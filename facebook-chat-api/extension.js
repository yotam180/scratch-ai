(function(ext) {
    var socket;
    window.waiting = {};
    var waiting = window.waiting;
    var last_error = "";
    var logged_in = false;

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
        socket = new WebSocket("ws://localhost:9888");
        socket.onopen = function() {
            callback();
        };
        socket.onmessage = function(d) {
            var data = JSON.parse(d.data);
            if (waiting[data.id]) {
                var callback = waiting[data.id].callback;
                var custom = waiting[data.id].custom;
                var error = waiting[data.id].error;
                if (!data.success) {
                    last_error = data.error;
                    if (error) {
                        error();
                    }
                    callback();
                }
                else if (custom) {
                    callback(custom(data));
                }
                else if (data.value) {
                    callback(data.value)
                }
                else {
                    callback();
                }
                delete waiting[data.id];
            }
        };
    };

    ext.login = function(email, password, callback) {
        var session = Math.random().toString();
        waiting[session] = {callback: callback, custom: (x) => {
            logged_in = true;
        }, error: (x) => {
            logged_in = false;
        }};
        socket.send(JSON.stringify({action: "login", id: session, email: email, password: password}));
    };

    ext.logged_in = function() {
        return logged_in;
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'Open connection to the server', 'connect'],
            ['w', 'Login with %s, %s', 'login', 'email@provider.com', 'password'],
            ['b', 'Is logged in?', 'logged_in']
        ]
    };

    // Register the extension
    ScratchExtensions.register('Facebook Messenger', descriptor, ext);
})({});