var express = require('express')
var cookieParser = require('cookie-parser');
var app = express();
//app.use(cookieParser());
//아래는 쿠키 암호화
app.use(cookieParser('12323123123'));
app.get('/count', function(req, res){
  if(req.signedCookies.count){ // 브라우저한테 count라는 쿠키 있는가?
    var count = parseInt(req.signedCookies.count); //text to Int
  } else {
    var count = 0;
  }
  //res.cookie('count', count+1);
  //아래는 쿠키 암호화
  res.cookie('count', count+1, {signed:true});
  res.send('count : '+count);
})
app.listen(3003, function(){
  console.log('Connected 3003 port');
})
