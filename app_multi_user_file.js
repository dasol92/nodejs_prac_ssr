var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var FileStore = require('session-file-store')(session); // FileStore 추가하며 session을 인자로
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

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

// var salt = 'sjdkfjskdfhajslkdgnke*78394*62'
var users = [
  {
    username:'dasol',
    password:'hFZRZGwQXDZ5eGoIaWxuKwFdvEG0jMduJLqjo0cVOEvAWZ3QB879nU6WLIH7oeBdq0h+H/WUumsukBXL9R0RxRxC/RESPUQ0imUw/EW27Y1uzfnXZWl03BSUJyAeNCb1nTp3fzOjcCy1TW+tP7yZYyfSoPG/WVi75g80Sn80SKA=',
    salt : 'kl0u5wkNQ9Jue3Exg4cRf+vUHzapxSJf5WlgeRMMd/poljnFMfB9n1EYVRh3GUeoruA/2TyBqB8egKYSx4PXaA==',
    displayName:'Dasol Kim'
  }
];

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
  var uname = req.body.username;
  var pwd = req.body.password;
  //md5 암호화
  //pwd = md5(salt+pwd);
  for (var i=0;i<users.length; i++) {
    var user = users[i];
    if(uname === user.username) {
      return hasher({password : pwd, salt:user.salt}, function(err, pass, salt, hash) {
        //hasher 의 콜백이 비동기로 실행되기 때문에 hasher 완료 전에 81 번줄로 넘어가버림. return 으로 끝내게 한다.
        if (hash === user.password) {
          req.session.displayName = user.displayName;
          req.session.save(function(){
            res.redirect('/welcome');
          })
        } else { //비번이 틀린 경우
          res.send('Who are you? Wrong password. <a href="/auth/login">login</a>');
        }
      });
    }
    // hasher 적용 전 아래 코드 주석처리. 
    // if(uname === user.username && pwd == user.password) {
    //   req.session.displayName = user.displayName; //이 세션에 displayName 추가!
    //   return req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
    //     res.redirect('/welcome');
    //   });
  }
  //없는 아이디인 경우
  res.send('Who are you? The id is not exist. <a href="/auth/login">login</a>');
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
        <input type="submit">
      </p>
    </form>
  `;
  res.send(output);
});

app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user); // 전역변수 users 배열에 새유저 추가

    // welcome으로 redirect 하기 전 로그인 처리
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
      res.redirect('/welcome');
    });
  });
});

app.get('/auth/logout', function(req, res){
  delete req.session.displayName; //이 세션의 displayName 제거
  req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req, res){
  if(req.session.displayName) { //로그인에 성공한 경우
    res.send(`
        <h1> Hello, ${req.session.displayName} </h1>
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
