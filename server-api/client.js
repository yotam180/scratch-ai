(function(ext) {
    var socket;
    var connected = false;

    window.requests = {};

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

    ext.connect = function(callback) {
        if (connected) {
            socket.close();
            connected = false;
        }
        socket = new WebSocket("ws://localhost:9889");
        socket.onopen = function() {
            connected = true; 
            callback();
        };
        socket.onmessage = function(d) {
            var data = JSON.parse(d.data);
            if (requests[data.id].callback) {
                requests[data.id].response = data;
                requests[data.id].callback();
            }
        };
    };

    ext.is_connected = function() {
        return connected;
    };

    ext.new_request = function() {
        var id = Math.round(Math.random() * 1000000).toString();
        requests[id] = {request: {id: id, type: "request", server: "", request: {}}, response: {}};
        return id;
    };

    ext.set_parameter = function(r, p, v) {
        requests[r].request.request[p] = v;
    };

    ext.send_request = function(r, s, callback) {
        requests[r].request.server = s;
        requests[r].callback = callback;
        socket.send(JSON.stringify(requests[r].request));
    };
    
    ext.get_response_code = function(r) {
        return requests[r].response.code;
    };

    ext.get_response_parameter = function(p, r) {
        return requests[r].response.response[p];
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', 'Connect', 'connect'],
            ['b', 'Connected to server?', 'is_connected'],
            ['r', 'Construct new request', 'new_request'],
            [' ', 'Set request %n parameter %s to %s', 'set_parameter'],
            ['w', 'Send request %n to server %s', 'send_request'],
            ['r', 'Response code of %n', 'get_response_code'],
            ['r', 'Parameter %s of %n', 'get_response_parameter']
        ]
    };

    // Register the extension
    ScratchExtensions.register('Scrath Frontend', descriptor, ext);
})({});