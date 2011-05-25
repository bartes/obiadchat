var sqlite = require('sqlite3').verbose();
var db = exports.db = new sqlite.Database('./chat.db');
exports.reinit = function(){
  db.serialize(function(){
    db.run("DROP TABLE IF EXISTS entries");
    db.run("CREATE TABLE entries(id INTEGER PRIMARY KEY ASC, user TEXT, message TEXT, timestamp INTEGER)");
    db.close();
  })
}
exports.all = function(callback){
  db.all("SELECT * FROM entries LIMIT 50", callback);
}
exports.push = function(user, message){
  db.run("INSERT INTO entries (id, user, message, timestamp) VALUES (NULL, ?, ?, ?)", user, message, (new Date()).getTime() ,function(err) {
  });
}

