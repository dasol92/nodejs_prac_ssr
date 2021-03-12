var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());

var products = {
  1:{title:'The history of web'},
  2:{title:'The next web'}
};

app.get('/products', function(req, res){
  var output='';
  for(var name in products){
    output += `
      <li>
        <a href="/cart/${name}">${products[name].title}</a>
      </li>
    `
    console.log(products[name].title);
  }
  res.send(
    `<h1>Products</h1>
    <ul>${output}</ul>
    <a href="/cart">Cart</a>`
  );
});

app.get('/cart/:id', function(req, res){
  var id = req.params.id;
  if(req.cookies.cart){ // cart 라는 쿠키가 있는가
    var cart = req.cookies.cart; // 있는 쿠키 사용. string
  } else { // 없으면
    var cart = {};
  }
  if(!cart[id]){
    cart[id] = 0;
  }
  cart[id] = parseInt(cart[id])+1;
  res.cookie('cart', cart);
  res.redirect('/cart');
});

app.get('/cart', function(req, res){
  var cart = req.cookies.cart;
  if(!cart){
    res.send('Empty!')
  } else {
    var output = '';
    for (var id in cart) {
      output += `<li>${products[id].title} (${cart[id]})</li>`
    }
  }
  res.send(`
    <h1>Cart</h1>
    <ul>${output}</ul>
    <a href="/products">products</a>
    `);
});

app.listen(3003, function(){
  console.log('Connected 3003 port');
});
