var app = require('./config/mysql/express')();

var passport = require('./config/mysql/passport')(app);

var auth = require('./routes/mysql/auth')(passport);

app.use('/auth/', auth);

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
