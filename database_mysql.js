var mysql = require('mysql');
var conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '111111',
  database : 'o2'
});
conn.connect();
//var sql = 'SELECT * FROM topic';
//var sql = 'INSERT INTO topic (title, description, author) VALUES("NodeJS", "Server side JS", "dasol")';
var sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
var params = ['Supervisor', 'Watcher', 'graphittie'];
conn.query(sql, parmams, function(err, rows, fileds){
  if(err) {
    console.log(err);
  } else {
    console.log(rows);
  }
});
conn.end();
