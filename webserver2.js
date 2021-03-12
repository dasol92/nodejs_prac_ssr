const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(function(req, res){
  res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
  res.end('Hello World!\n한글지원이 되는 서버입니다');
});
server.listen(port, hostname, function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});
