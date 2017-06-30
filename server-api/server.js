(function(ext) {
    var socket;
    var request_callback;
    var request;
    window.response = {};
    //var response = window.response;
    
    var connected = false;

    var ready_next_request = true;
    var queue = [];

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        if (socket) {
            socket.close();
            socket = null;
        }
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.connect = function(server, password, callback) {
        if (connected) {
            socket.close();
            connected = false;
        }
        socket = new WebSocket("ws://localhost:9889");
        socket.onopen = function() {
            socket.send(JSON.stringify({type: "subscribe", server: server, password: password, id: Math.random().toString()}));
        };
        socket.onerror = function() {
            socket = null;
            callback();
        };
        socket.onmessage = function(d) {
            var e = JSON.parse(d.data);
            if (!connected && e.response.data == "Server bound") {
                connected = true;
                callback();
                return;
            }
            if (!connected && e.response.data == "Error: Password is incorrect") {
                connected = false;
                callback();
                return;
            }
            if (e.type != "request") {
                return;
            }
            if (ready_next_request) {
                ready_next_request = false;
                request = e;
                response = {type: "response", id: request.id, success: true, code: 200, response: {}};
                console.log(request);
                request_callback();
            }
            else {
                queue.push(JSON.parse(d.data));
            }
        };
    };

    ext.is_opened = function() {
        return connected;
    };

    ext.get_request = function(callback) {
        if (request) {
            ready_next_request = false;
            callback();
        }
        else {
            request_callback = callback;
        }
    };

    ext.get_id = function() {
        return request.id;
    };

    ext.get_parameter = function(p) {
        return request.request[p];
    };

    ext.set_parameter = function(p, v) {
        response.response[p] = v;
    };

    ext.set_code = function(c) {
        response.code = c;
    };

    ext.send_response = function(c) {
        socket.send(JSON.stringify(response));  
        if (queue.length > 0) {
            request = queue.shift();
            response = {type: "response", id: request.id, success: true, code: 200, response: {}};
            request_callback();
        }
        else {
            request = null;
            ready_next_request = true;
        } 
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'Open server %s password %s', 'connect', '', ''],
            ['b', 'Server opened', 'is_opened'],
            ['w', 'Get next request', 'get_request'],
            ['r', 'Request ID', 'get_id'],
            ['r', 'Request parameter %s', 'get_parameter'],
            [' ', 'Set response parameter %s to %s', 'set_parameter'],
            [' ', 'Set response code %n', 'set_code'],
            [' ', 'Send response', 'send_response']
        ]
    };

    // Register the extension
    ScratchExtensions.register('Scrath Backend', descriptor, ext);
})({});