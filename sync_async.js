const fs = require('fs');

//sync mode
console.log(1);
var data = fs.readFileSync('data.txt', {encoding:'utf8'});
console.log(data);

//async mode
console.log(2);
fs.readFile('data.txt', {encoding:'utf8'}, function(err, data){
  console.log(3);
  console.log(data);
})
console.log(4);

//async mode DOCS 버전
console.log(5);
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(6);
  console.log(data);
})
console.log(7);
