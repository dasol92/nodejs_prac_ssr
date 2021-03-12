module.exports = function(app){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy;
  var conn = require('./db')();
    
  app.use(passport.initialize());
  app.use(passport.session()); //이 코드는 세션 셋팅 뒤에 와야 함

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
      clientID: '01234567890',
      clientSecret: '01234567890123456789012345678901',
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

  return passport;
};
