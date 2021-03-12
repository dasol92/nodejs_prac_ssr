var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var FileStore = require('session-file-store')(session); // FileStore 추가하며 session을 인자로
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: '123123123',
  resave: false, // default
  saveUninitialized: true, //default
  store: new FileStore({path:'./sessions'})
}));

app.get('/count', function(req, res){
  if(req.session.count) { //특정 세션에 count 변수가 있는가?
    req.session.count++;
  } else {
    req.session.count = 1; // 없다면 새로 만들자.
  }
  res.send('count : ' +req.session.count);
});

//로그인 예제
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
  `;
  res.send(output);
});

app.post('/auth/login', function(req, res){
  var user = {
    username:'dasol',
    password:'111',
    displayName:'Dasol Kim'
  };
  var uname = req.body.username;
  var pwd = req.body.password;
  if(uname === user.username && pwd == user.password) {
    req.session.displayName = user.displayName; //이 세션에 displayName 추가!
    req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
      res.redirect('/welcome');
    });
  } else {
    res.send('Who are you? <a href="/auth/login">login</a>');
  }
});

app.get('/auth/logout', function(req, res){
  delete req.session.displayName; //이 세션의 displayName 제거
  req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req, res){
  if(req.session.displayName) { //로그인에 성공
    res.send(`
        <h1> Hello, ${req.session.displayName} </h1>
        <a href="/auth/logout">logout</a>
      `
    );
  } else {
    res.send(`
        <h1> Welcome. Please Login! </h1>
        <a href="/auth/login">Login</a>
      `);
  }
});

app.listen(3003, function(){
  console.log('Connected 3003 port');
});
