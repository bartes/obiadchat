desc('Running initial migration.');
task('remigrate', [], function (params) {
  console.log('rebuilding DB');
  var config = require("./config");
  config.reinit();
});
task('users', [], function (params) {
  console.log('putting users to DB');
  var config = require("./config");
  config.users();
});
