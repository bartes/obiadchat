var express = require('express');
var _ = require("underscore");
var users = require('./users').config();
var config = require("./config");
var io = require('socket.io');
// Framework

var express = require('express');

var app = module.exports = express.createServer();

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

app.get('/', function(req, res, next){
  res.render('index',{
    title: 'Obiad Chat'
  });
});

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(8081);
  console.log("Express server listening on port %d", app.address().port);
}

// Configuration

var getClient = function(client){
  return sessions[client.sessionId.toString()];
}

// socket.io
var socket = io.listen(app);
var sessions = {};

socket.on('connection', function(client){
  client.on('message', function(message_json){
    request = JSON.parse(message_json);
    if(request.message){
      var client_name = getClient(client);
      var msg = { message: [client_name, request.message] };
      config.push(client_name, request.message);
      console.log(msg.message[0])
      client.broadcast(msg);
    } else if(request.name) {
      var verifyCallback = function(err, row){
        if(row) {
          sessions[client.sessionId.toString()] = row.email;
          client.broadcast({ announcement: [row.email , 'connected'] });
          var callback = function(err, rows){
            client.send({buffer: rows});
          }
          config.all(_.bind(callback, this));
          var callbackOrders = function(err, rows){
            client.send({orders: rows});
          }
          config.allOrders(_.bind(callbackOrders, this));
        } else {
          client.send({disconnect: true});
        }
        var members =  _.uniq(_.values(sessions));
        client.send({members: members});
        client.broadcast({members: members});
      }
      config.verify(request.name, verifyCallback);
    } else if(request.order) {
      var client_name = getClient(client);
      var orderCallback = function(err, rows){
        client.broadcast({ orders: rows, announcement: [client_name , 'made order'] });
        client.send({orders : rows});
      }
      config.order(client_name, request.order.text, request.order.price, orderCallback);
     } else if(request.disorder) {
      var client_name = getClient(client);
      var disorderCallback = function(err, rows){
        client.broadcast({ orders: rows, announcement: [client_name , 'removed order'] });
        client.send({orders : rows});
      }
      config.disorder(client_name, disorderCallback);
    }
  });

  client.on('disconnect', function(){
    var client_name = sessions[client.sessionId.toString()];
    delete sessions[client.sessionId.toString()];
    client.send({members: _.uniq(_.values(sessions))});
    client.broadcast({members: _.uniq(_.values(sessions))});
  });
})
