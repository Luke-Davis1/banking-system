var mysql2 = require('mysql2/promise');

var dbCon = require('../lib/database');

let sql = "CREATE DATABASE IF NOT EXISTS NodeExpressSessionStorage";
console.log("sessionPool.js: sql message will be " + sql);
dbCon.execute(sql, function(err, results, fields) {
  if (err) {
    console.log("sessionPool.js: Problem: Is the MySQL server running?");
    console.log(err.message);
    throw err;
  } else {
    console.log("sessionPool.js: Created session database if it didn't already exist");
  }
});

// Now that the session database and table exists, create a MySQL pool so it can be hooked up to expression session storage
var dbConnectionInfo = require('../lib/connectionInfo');

var options = {
  host: dbConnectionInfo.host,
  port: dbConnectionInfo.port,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  database: 'NodeExpressSessionStorage',
  //createDatabaseTable: true
};

var pool = mysql2.createPool(options);

module.exports = pool;