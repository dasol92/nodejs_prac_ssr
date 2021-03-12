module.exports = function(passport){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var route = require('express').Router();
  var conn = require('../../config/mysql/db')();

  var app = require('express');

  route.get('/login', function(req, res){
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
      res.render('auth/login', {topics:topics});
    });
  });

  route.post('/login',
    passport.authenticate('local', //로컬 서비스 로그인 strategy
      {
        //successRedirect: '/welcome', //로그인 성공
        failureRedirect: '/auth/login', //실패 시 재시도
        failureFlash: false //실패 시 메시지출현 옵션
      }
    ),
    function(req, res){
      req.session.save(function(){
        res.redirect('/topic');
      });
    }
  );

  route.get('/facebook',
    passport.authenticate('facebook', {scope:['email']})
  );

  route.get('/facebook/callback',
    passport.authenticate('facebook',
      {
        failureRedirect: '/auth/login'
      }
    ),
    function(req, res) {
      req.session.save(function(){
        // Successful authentication, redirect home.
        res.redirect('/topic');
      });
    }
  );


  route.get('/register', function(req, res){
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
      res.render('auth/register', {topics:topics});
    });

  });

  route.post('/register', function(req, res){
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
              res.redirect('/topic');
            });
          });
        }
      });
    });
  });

  route.get('/logout', function(req, res){
    req.logout();
    // delete req.session.displayName; //이 세션의 displayName 제거
    req.session.save(function(){ //session 정보 저장이 되기 전에 redirect 실행방지
      res.redirect('/topic');
    });
  });


  return route;
};
