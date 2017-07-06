(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.happiness_a = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/sentiment/",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				c(d.results*100);
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	ext.happiness_c = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/sentiment/",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				if(parseFloat(d.results)>0.5){
					c(true);
				}
				else{
					c(false);
				}
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	ext.language = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/language",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				var arr = Object.keys( d.results ).map(function ( key ) { return d.results[key]; });
				var max = Math.max.apply( null, arr );
				for(var key in d.results){
					if(d.results[key]==max)
					{
						c(key);
					}
				}
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	ext.themeb = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/texttags",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				var arr = Object.keys( d.results ).map(function ( key ) { return d.results[key]; });
				var max = Math.max.apply( null, arr );
				for(var key in d.results){
					if(d.results[key]==max)
					{
						c(key);
					}
				}
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	ext.keywords = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/keywords",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				var arr = Object.keys( d.results ).map(function ( key ) { return d.results[key]; });
				if(d==undefined)
				{
					c("there is no theme");
				}
				var max = Math.max.apply( null, arr );
				for(var key in d.results){
					if(d.results[key]==max)
					{
						c(key);
					}
				}
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	
	ext.people = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/people",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				c(d.results[0]["text"]);
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	ext.places = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/places",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				c(d.results[0]["text"]);
			},
			error: function (e){
				c("error");
			}
		});
    };
	
	ext.emotion = function(sen,c) {
		$.ajax({
			url: "https://apiv2.indico.io/emotion",
			type: "POST",
			data: {
				data: sen,
				api_key: 'bdd2e08da194b0d0e862524969a5f504'
			},
			success: function(e) { 
				var d =JSON.parse(e);
				var arr = Object.keys( d.results ).map(function ( key ) { return d.results[key]; });
				if(d==undefined)
				{
					c("there is no theme");
				}
				var max = Math.max.apply( null, arr );
				for(var key in d.results){
					if(d.results[key]==max)
					{
						c(key);
					}
				}
			},
			error: function (e){
				c("error");
			}
		});
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ['R', '%s Happiness in this sentance', 'happiness_a'],
			['R', '%s Is sentance happy?', 'happiness_c'],
			['R', '%s Sentence language', 'language'],
			['R', '%s The theme of this sentance is', 'themeb'],
			['R', '%s The keyword of this sentance is', 'keywords'],
			['R', '%s You are talking about him', 'people'],
			['R', '%s The place you speak abuot is', 'places'],
			['R', '%s You feel', 'emotion']
        ]
    };

    // Register the extension
    ScratchExtensions.register('My first extension', descriptor, ext);
})({});