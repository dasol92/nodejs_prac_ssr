var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session); // FileStore 추가하며 session을 인자로
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy;

var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: '123asdf!@#',
  resave: false, // default
  saveUninitialized: true, //default
  store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session()); //이 코드는 세션 셋팅 뒤에 와야 함

var users = [
  {
    authId:'local:dasol',
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
    <a href="/auth/facebook">facebook</a>
  `;
  res.send(output);
});

//최초 로그인 시 세션에 등록
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId); // 우리 서비스엔 user.id 가 없기 때문에
});

//로그인 되어 있는 사용자의 세션이 존재할 때
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  for (var i=0;i<users.length; i++) {
    var user = users[i];
    if(user.authId === id) {
      return done(null, user);
    }
  }
  // MongoDB 기준
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
});

//로컬 로그인 strategy 설정
passport.use(new LocalStrategy(
  function(username, password, done) {
    var uname = username;
    var pwd = password;

    for (var i=0;i<users.length; i++) {
      var user = users[i];
      if(uname === user.username) {
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
      }
    }
    //없는 아이디인 경우
    done(null, false);
    // done(null, false, { message : 'Incorrect username.'});
  }
));

passport.use(new FacebookStrategy({
    clientID: '576889166108457',
    clientSecret: 'd60204541e61a0d8206ae1fab43703f3',
    callbackURL: "/auth/facebook/callback"
    ,
    profileFields:['id', 'displayName', 'email', 'gender']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    for(var i=0; i<users.length; i++){
      var user = users[i];
      if(user.authId === authId){
        // already exist user.
        return done(null, user);
      }
    }
    var newuser = {
      'authId':authId,
      'displayName':profile.displayName
    };
    users.push(newuser);
    done(null, newuser);
  }
));

app.post('/auth/login',
  passport.authenticate('local', //로컬 서비스 로그인 strategy
    {
      //successRedirect: '/welcome', //로그인 성공
      failureRedirect: '/auth/login', //실패 시 재시도
      failureFlash: false //실패 시 메시지출현 옵션
    }
  )
  ,
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
  passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
  function(req, res) {
    req.session.save(function(){
      // Successful authentication, redirect home.
      res.redirect('/welcome');
    });
  });


/* Passport JS 모듈 사용으로 아래 부분 주석 처리
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
          res.send('Who are you? <a href="/auth/login">login</a>');
        }
      });
    }
    // if(uname === user.username && pwd == user.password) {
    //   req.session.displayName = user.displayName; //이 세션에 displayName 추가!
    //   return req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
    //     res.redirect('/welcome');
    //   });
  }
  //없는 아이디인 경우
  res.send('Who are you? 2 <a href="/auth/login">login</a>');
});
*/

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
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user); // 전역변수 users 배열에 새유저 추가

    //passport 을 통해 login 객체 활용
    req.login(user, function(err){
      req.session.save(function(){
        res.redirect('/welcome');
      });
    });
    // // welcome으로 redirect 하기 전 로그인 처리
    // req.session.displayName = req.body.displayName;

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
