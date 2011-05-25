
/**
 * Module dependencies.
 */
var express = require('express');
var _und = require("underscore");
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'obiadChat' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/*var getDailyOrder = function(req, res, next){*/
  //req.orders = []
  //next();
//}
//var discoverDeal = function(req, res, next){
  //if(deal){
    //next();
  //} else {
    //next(new Error("unSupportedDeal"));
  //}
/*}*/
// Routes
app.get('/', function(req, res, next){
  res.render('index', {
    title: 'Obiad Chat',
    layout: 'index_layout'
  });
});
app.get('/chat', function(req, res, next){
  res.render('chat',{
    title: 'Obiad Chat'
  });
});
// Only listen on $ node app.js
if (!module.parent) {
  app.listen(8081);
  console.log("Express server listening on port %d", app.address().port);
}
var config = require("./config");
// socket.io
var io = require('socket.io');
var socket = io.listen(app);
var sessions = {};
socket.on('connection', function(client){
  var callback = function(err, rows){
    client.send({buffer: rows});
  }
  config.all(_und.bind(callback, this));
  client.on('message', function(message_json){
    request = JSON.parse(message_json);
    if(request.message){
      var client_name = sessions[client.sessionId.toString()];
      var msg = { message: [client_name, request.message] };
      config.push(client_name, request.message);
      client.broadcast(msg);
    } else if(request.name) {
      sessions[client.sessionId.toString()] = request.name;
      client.broadcast({ announcement: [request.name , 'connected'] });
    }
  });

  client.on('disconnect', function(){
    var client_name = sessions[client.sessionId.toString()];
    client.broadcast({ announcement: [client_name, 'disconnected'] });
  });
})
