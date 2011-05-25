
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

var getClient = function(client){
  return sessions[client.sessionId.toString()];
}
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
  client.on('message', function(message_json){
    request = JSON.parse(message_json);
    if(request.message){
      var client_name = getClient(client);
      var msg = { message: [client_name, request.message] };
      config.push(client_name, request.message);
      client.broadcast(msg);
    } else if(request.name) {
      var verifyCallback = function(err, row){
        if(row) {
          sessions[client.sessionId.toString()] = row.email;
          client.broadcast({ announcement: [row.email , 'connected'] });
          var callback = function(err, rows){
            client.send({buffer: rows});
          }
          config.all(_und.bind(callback, this));
          var callbackOrders = function(err, rows){
            client.send({orders: rows});
          }
          config.allOrders(_und.bind(callbackOrders, this));
        } else {
          client.send({disconnect: true});
        }
      }
      config.verify(request.name, verifyCallback);
    } else if(request.order) {
      console.log(request.order)
      var client_name = getClient(client);
      var orderCallback = function(err, rows){
        client.broadcast({ announcement: [client_name , 'made order'] });
        client.send({orders : rows});
      }
      config.order(client_name, request.order.text, request.order.price, orderCallback);
    }
  });

  client.on('disconnect', function(){
    var client_name = sessions[client.sessionId.toString()];
    delete sessions[client.sessionId.toString()];
    client.broadcast({ announcement: [client_name, 'disconnected'] });
  });
})
