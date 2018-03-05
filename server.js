var express = require('express')
var http = require('http')
var path = require('path') 
var reload = require('reload')
var bodyParser = require('body-parser')
var logger = require('morgan')
var watch = require('watch')
var war = require('./war.js')
 
var app = express()
 
var publicDir = path.join(__dirname, 'angular-seed/app')
 
app.set('port', process.env.PORT || 3000)
app.use(logger('dev'))
app.use(bodyParser.json()) // Parses json, multi-part (file), url-encoded 
 

app.use(express.static(publicDir));

app.get('/war', function (req, res) {
 	res.sendFile(path.join(publicDir, 'index.html'))
})
app.post('/war/setup', function (req, res) {
	var config = req.body;
	var setupResponse = war.setup(config);
 	res.send(setupResponse);
})
app.get('/war/shuffle', function (req, res) {
	var deck = war.shuffle();

	deck.then(function(d) {
		//console.log(d);
 		res.send(d);
 	});
})
app.get('/war/deal', function (req, res) {
	war.deal()
	.then(function(players) {
 		res.send(players);
 	});
})
app.get('/war/play', function (req, res) {
	var playResponse = war.play()
	.then(function(pot) {
 		res.send(pot);
 	});
})
 
var server = http.createServer(app)
 
// Reload code here 
var reloadServer = reload(app);
watch.watchTree(publicDir, function (f, curr, prev) {
    // Fire server-side reload event 
    reloadServer.reload();
});

server.listen(app.get('port'), function () {
  console.log('Web server listening on port ' + app.get('port'))
})