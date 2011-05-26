var sqlite = require('sqlite3').verbose();
var _und = require("underscore");
var users = require('./users').config();
var db = exports.db = new sqlite.Database('./chat.db');
exports.reinit = function(){
  db.serialize(function(){
    db.run("DROP TABLE IF EXISTS entries");
    db.run("DROP TABLE IF EXISTS orders");
    db.run("CREATE TABLE entries(id INTEGER PRIMARY KEY ASC, user TEXT, message TEXT, timestamp INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY ASC, email TEXT)");
    db.run("CREATE INDEX IF NOT EXISTS email_idx ON users(email)");
    db.run("CREATE TABLE orders(id INTEGER PRIMARY KEY ASC, user TEXT, price TEXT, text TEXT, name TEXT, timestamp INTEGER)");
    db.run("CREATE INDEX  IF NOT EXISTS user_idx ON orders(user)");
    db.close();
  })
}
exports.users = function(){
  db.serialize(function(){
    db.run("DROP TABLE IF EXISTS users");
    db.run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY ASC, email TEXT)");
    db.run("CREATE INDEX IF NOT EXISTS email_idx ON users(email)");
    _und.each(users,function(user){
     db.run("INSERT INTO users (id, email) VALUES (NULL, ?)", user);
    })
    db.close();
  });
}
exports.all = function(callback){
  db.all("SELECT * FROM entries LIMIT 50", callback);
}
exports.allOrders = function(callback){
  db.all("SELECT * FROM orders", callback);
}
exports.push = function(user, message){
  db.run("INSERT INTO entries (id, user, message, timestamp) VALUES (NULL, ?, ?, ?)", user, message, (new Date()).getTime());
}
exports.order = function(user, text, price, callback) {
  db.serialize(function(){
    db.run("INSERT INTO orders (id, user, text, price, timestamp) VALUES (NULL, ?, ?, ?, ?)", user, text, price, (new Date()).getTime());
    db.all("SELECT * FROM orders", callback);
  });
}
exports.disorder = function(user, callback) {
  db.serialize(function(){
    db.run("DELETE FROM orders WHERE user = ?", user);
    db.all("SELECT * FROM orders", callback);
  });
}

exports.verify = function(user, callback) {
  db.get("SELECT * FROM users WHERE email = ? LIMIT 1", user, callback);
}

