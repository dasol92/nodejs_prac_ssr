const express = require('express');
const router = express.Router();
router.get('/r1', function(req, res){
  res.send('Hello /p1/r1');
});
router.get('/r2', function(req, res){
  res.send('Hello /p1/r2');
});
module.exports = router;
