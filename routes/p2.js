module.exports = function(app){
  const express = require('express');
  const router = express.Router();
  router.get('/r1', function(req, res){
    res.send('Hello /p2/r1');
  });
  router.get('/r2', function(req, res){
    res.send('Hello /p2/r2');
  });

  app.get('/p3/r1', function(req, res){
    res.send('Hello p3/r1');
  });
  return router;
};
