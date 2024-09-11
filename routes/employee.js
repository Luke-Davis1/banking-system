var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('employee', {name: "John", accountNumber: "123"});
});

router.post('/', function(req, res, next) {
    res.redirect("/accounts", {name: "John", accountNumber: "123"});
})

module.exports = router;
