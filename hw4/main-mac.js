var shelljs = require('shelljs');
var express = require('express');
var app = express();

app.use(express.static('public'));
 
app.get ('/', function (req, res) {
	console.log ('client connected')
	res.sendFile(__dirname + '/index.html');
	//res.send ('hello world');
});

app.get ('/api', function (req, res) {

	console.log ('url:' + req.url);

	var argv = req.query.argv;
		
	shelljs.exec('./a.out ' + argv, function(status, output) {
	  console.log('Exit status:', status);
		  
          var output = {
          	status: status,
          	output: output
          };

          /*
            The response header for supporting CORS:
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type"
          */

		  res.writeHead(200, {
		  	"Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type"
		  });
	
		  res.write(JSON.stringify(output));
		  res.end();

	});
});

var server = app.listen (1337, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log ('server started on http://' + host + ':' + port);
});
