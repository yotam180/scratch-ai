(function(ext) {
    // Cleanup function when the extension is unloaded
	var session = Math.round(Math.random() * 100000000);
	var last_error = "";
	var results = {};
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
	
	
	ext.ask_bot = function(b, q, callback) {
		$.ajax({
			url: "https://api.api.ai/v1/query?", // Note the query parameter - it's a natural language text. The result will interpret it and return an intent ("buy") with parameters ("item1": "dog") as defined in the "buy" intent from the API.AI website. How cool?
			headers: {
				Authorization: "Bearer " + b // This is an access token for my API.AI agent, used to authorize a client request (no developer permissions). Be sure to include an access token in every API call (http request) you make!
			},
			data: {
				"query": q,
				"lang": "en",
				"sessionId": session
			},
			success: function(e) {
				if (e.status.code != 200) {
					last_error = e.status.errorDetails;
					callback(-1);
					return;
				}
				var result = {
					intent: e.result.metadata.intentName,
					parameters: e.result.parameters
				};
				var I = Math.round(Math.random() * 100000);
				results[I] = result;
				callback(I);
			},
			error: function(a, b, c) {
				last_error = b.toString();
				callback(-1);
			}
		});
	};
	
	ext.get_intent = function(x) {
		return (results[x] ? results[x].intent : "");
	};
	
	ext.get_prop = function(y, x) {
		return (results[x] ? results[x].parameters[y] : "");
	};
	
	ext.get_all_props = function(x, y) {
		return (results[x] ? JSON.stringify(results[x].parameters) : "");
	};
	
	ext.clear_response = function(x, y) {
		results[x] && delete results[x];
	};

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			['R', 'Ask %s : %s', 'ask_bot', '<api-key>', 'what\'s the weather?'],
			['r', 'Intent of %n', 'get_intent', '<reponse>'],
			['r', 'Parameter %s of %n', 'get_prop', 'item1', '<response>'],
			['r', 'Parameters of %n', 'get_all_props', '<response>'],
			[' ', 'Clean response %s', 'clear_response', '<response>']
        ]
    };

    // Register the extension
    ScratchExtensions.register('API.AI', descriptor, ext);
})({});