const express = require('express');
const fs = require('fs');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '111111',
  database : 'o2'
});
conn.connect();
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}));

app.set('views', './views/mysql');
app.set('view engine', 'pug');2
app.locals.pretty = true;

app.get('/topic/add', function(req,res){
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('topic/add', {topics:topics});
  });
});

app.post('/topic/add', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var params = [title, description, author];
  var sql = 'INSERT INTO topic (title, description, author) VALUES (?, ?, ?)';
  conn.query(sql, params, function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(result);
      res.redirect('/topic/'+result.insertId);
    }
  });
});

app.get(['/topic', '/topic/:id'], function(req, res){
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    console.log('topics: ', topics);
    var id = req.params.id;
    if(id) {
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log('topic: ', topic);
          res.render('topic/view', {topics:topics, topic:topic[0]});
        }
      });
    } else {
      res.render('topic/view', {topics:topics});
    }
  });
});

app.get(['/topic/:id/edit'], function(req, res){
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    console.log('topics: ', topics);
    var id = req.params.id;
    if(id) {
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log('topic: ', topic);
          res.render('topic/edit', {topics:topics, topic:topic[0]});
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Error');
    }
  });
});

app.post(['/topic/:id/edit'], function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var id = req.params.id;
  var params = [title, description, author, id];
  var sql='UPDATE topic SET title=?, description=?, author=? WHERE id=?'
  conn.query(sql, params, function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/topic/'+id);
    }
  });
});

app.get('/topic/:id/delete', function(req, res){
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    console.log('topics: ', topics);
    var id = req.params.id;
    if(id) {
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log('topic: ', topic);
          res.render('topic/delete', {topics:topics, topic:topic[0]});
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Error');
    }
  });
});

app.post('/topic/:id/delete', function(req, res){
  var id = req.params.id;
  var sql = 'DELETE FROM topic WHERE id=?';
  conn.query(sql, [id], function(err, result){
    console.log(result);
    res.redirect('/topic');
  })
});

app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
