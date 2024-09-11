var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('profile', {name: "John", accountNumber: "123"});
});

module.exports = router;
