var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session); // mysql store 추가하며 session을 인자로
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

var app = express();
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
app.use(passport.initialize());
app.use(passport.session()); //이 코드는 세션 셋팅 뒤에 와야 함

var mysql = require('mysql');
var conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '111111',
  database : 'o2'
});
conn.connect();

//로그인 form
app.get('/auth/login', function(req, res){
  var output=`
    <h1>Login</h1>
    <form action="/auth/login" method="post">
      <p>
        <input type="text" name="username" placeholder="username">
      </p>
      <p>
        <input type="password" name="password" placeholder="password">
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
    <a href="/auth/facebook">facebook</a>
  `;
  res.send(output);
});

app.post('/auth/login',
  passport.authenticate('local', //로컬 서비스 로그인 strategy
    {
      //successRedirect: '/welcome', //로그인 성공
      failureRedirect: '/auth/login', //실패 시 재시도
      failureFlash: false //실패 시 메시지출현 옵션
    }
  ),
  function(req, res){
    req.session.save(function(){
      res.redirect('/welcome');
    })
  }
);

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope:['email']})
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook',
    {
      failureRedirect: '/auth/login'
    }
  ),
  function(req, res) {
    req.session.save(function(){
      // Successful authentication, redirect home.
      res.redirect('/welcome');
    });
  }
);

//로컬 로그인 strategy 설정
passport.use(new LocalStrategy(
  function(username, password, done) {
    var uname = username;
    var pwd = password;

    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, ['local:'+uname], function(err, results){
      if(err){
        return done('There is no user');
      }
      var user = results[0];
      return hasher({password : pwd, salt:user.salt}, function(err, pass, salt, hash) {
        //hasher 의 콜백이 비동기로 실행되기 때문에 hasher 완료 전에 다음으로 넘어가버림. return 으로 끝내게 한다.
        if (hash === user.password) {
          console.log('LocalStrategy', user);
          done(null, user); //serializeUser 호출, user 전달
        } else { //비번이 틀린 경우
          done(null, false);
          // done(null, false, { message : 'Incorrect password.'}); // failureFlash 옵션에 따라 message 출력
        }
      });
    });
  }
));

// Facebook federation 로그인 strategy 설정
passport.use(new FacebookStrategy({
    clientID: '576889166108457',
    clientSecret: 'd60204541e61a0d8206ae1fab43703f3',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id', 'displayName', 'email', 'gender', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [authId], function(err, results){
      console.log(results);
      if(results.length>0){ //사용자 존재
        done(null, results[0]);
      } else { // 사용자 미존재
        var newuser = {
          'authId':authId,
          'displayName':profile.displayName,
          'email':profile.emails[0].value
        };
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, newuser, function(err, results){
          if(err){
            console.log(err);
            done('Error');
          } else {
            done(null, newuser);
          }
        })
      }
    });
  }
));

//최초 로그인 시 세션에 등록
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId); // 우리 서비스엔 user.id 가 없기 때문에
});

//로그인 되어 있는 사용자의 세션이 존재할 때
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, [id], function(err, results){
    if(err){
      console.log(err);
      done('There is no user.');
    } else {
      done(null, results[0]);
    }
  });
});

app.get('/auth/register', function(req, res){
  var output=`
    <h1>Register</h1>
    <form action="/auth/register" method="post">
      <p>
        <input type="text" name="username" placeholder="username">
      </p>
      <p>
        <input type="password" name="password" placeholder="password">
      </p>
      <p>
        <input type="text" name="displayName" placeholder="dispaly name">
      </p>
      <p>
        <input type="text" name="email" placeholder="email">
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
  `;
  res.send(output);
});

app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName,
      email:req.body.email
    };
    var sql ='INSERT INTO users SET ?'
    conn.query(sql, user, function(err, results){
      if(err) {
        console.log(err);
        res.status(500);
      } else {
        //passport 을 통해 login 객체 활용
        req.login(user, function(err){
          req.session.save(function(){
            res.redirect('/welcome');
          });
        });
      }
    });
  });
});

app.get('/auth/logout', function(req, res){
  req.logout();
  // delete req.session.displayName; //이 세션의 displayName 제거
  req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName) { //로그인에 성공한 경우
    res.send(`
        <h1> Hello, ${req.user.displayName} </h1>
        <a href="/auth/logout">logout</a>
      `
    );
  } else {
    res.send(`
        <h1> Welcome. Please Login! </h1>
        <ul>
          <li><a href="/auth/login">Login</a></li>
          <li><a href="/auth/register">Register</a></li>
        </ul>
      `);
  }
});

app.listen(3003, function(){
  console.log('Connected 3003 port');
});
