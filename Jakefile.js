desc('Running initial migration.');
task('remigrate', [], function (params) {
  console.log('rebuilding DB');
  var config = require("./config");
  config.reinit();
});
