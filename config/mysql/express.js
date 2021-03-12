module.exports = function(){
  var express = require('express');
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session); // mysql store 추가하며 session을 인자로
  var bodyParser = require('body-parser');
  var app = express();

  app.set('views', './views/mysql');
  app.set('view engine', 'pug');

  app.use(bodyParser.urlencoded({extended:false}));
  app.use(session({
    secret: '123123123',
    resave: false, // default
    saveUninitialized: true, //default
    store: new MySQLStore({
      host : 'localhost',
      port : 3306,
      user : 'root',
      password : '111111',
      database : 'o2'
    })
  }));

  return app;
}
