var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('create-account', { title: 'Create Account' });
});

router.post('/', function(req, res, next) {
    console.log('register.js: POST');
    res.redirect('/accounts');
});

module.exports = router;
