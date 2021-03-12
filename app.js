const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static('public'));
// 정적인 파일은 public 디렉토리에서 불러옴 -> node app.js를 reload할 필요 없음

app.get('/', function(req, res){
  res.send('Welcome to home page');
});
// 사용자가 홈으로 들어오면, 콜백함수 호출하면서 사용자의 요청정보가 담긴 request 를 전달
// 사용자에게 응답할 수 있는 정보를 가지고 있는 응답 객체 response

// /login 페이지
app.get('/login', function(req, res){
  res.send('<h1>Login please</h1>');
});

//위의 것과 같은 것 (url만 달라짐)
app.get('/repeat', (req, res) => {
  res.send('<h1>Login please</h1>');
});

//정적으로 이미지 파일 불러옴. public/router.png
app.get('/route', function(req, res){
  res.send('Hello Router, <img src="/router.png">');
});


//동적으로 파일 실행
app.get('/dynamic', function(req, res){
  var lis = '';
  var time = Date();
  for(var i=0; i<5; i++){
    lis = lis + '<li>coding</li>';
  }
  var output = `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
      Hello, Dynamic!
      <ul>
        ${lis}
      </ul>
      ${time}
    </body>
  </html>`;
  res.send(output);
});

////template, pug 이용하기
app.set('view engine', 'pug'); // 사용할 템플리트 엔진은 pug 임
app.set('views', './views'); //views, 템플리트가 있는 디렉토리는  ./views
app.locals.pretty = true; // 생성된 html 페이지의 코드를 이쁘게 보게 만든다. 최소화 X
app.get('/template', (req, res) =>{
  res.render('index', { title: 'Hey', message: 'Hello there!', time:Date()});
});
////


////////////////////////////////////////////////////
//// query string 익히기 - ?를 쓰기
/*
app.get('/topic', (req, res) => {
  var topics = [
    'Javascript is...',
    'Nodejs is...',
    'Express is...'
  ];
  var output = `
    <a href="/topic?id=0">Javascript</a><br>
    <a href="/topic?id=1">Nodejs</a><br>
    <a href="/topic?id=2">Express</a><br><br>
    ${topics[req.query.id]}
  `
  res.send(output);
});*/
//// query string 을 semantic URL 로 연결
app.get('/topic/:id', (req, res) => {
  var topics = [
    'Javascript is...',
    'Nodejs is...',
    'Express is...'
  ];
  var output = `
    <a href="/topic/0">Javascript</a><br>
    <a href="/topic/1">Nodejs</a><br>
    <a href="/topic/2">Express</a><br><br>
    ${topics[req.params.id]}
  `
  res.send(output);
});
//// query string 을 semantic URL 여러개 전달
app.get('/semantic/:id/:mode', (req, res) => {
  res.send(req.params.id+','+req.params.mode);
});
////////////////////////////////////////////////////


////////////////////////////////////////////////////
//POST 방식 학습
app.get('/form', (req, res) => {
  res.render('form');
});

//이건 GET 방식. @form.pug 의 form 의 method 지정 안하면 기본 get 방식임.
  app.get('/form_receiver', (req, res) => {
  var title = req.query.title;
  var description = req.query.description;
  res.send(title+', '+description);
});

// POST 방식
// body-parser 이용하기
app.use(bodyParser.urlencoded({extended: false}));

app.post('/form_receiver', (req, res) => {
  var title = req.body.title;
  var description = req.body.description;
  res.send(title+', '+description);
});


////////////////////////////////////////////////////


app.listen(3000, function(){
  console.log('Connected 3000 port!');
});
