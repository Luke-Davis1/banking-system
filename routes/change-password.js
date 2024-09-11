var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('change-password', {name: "John", accountNumber: "123"});
});

router.post("/", function(req, res, next) {
    console.log("changing-password.js: POST");
    res.redirect("/profile");
})

module.exports = router;
