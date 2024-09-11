var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin-update-password', {name: "John", accountNumber: "123"});
});

router.post("/", function(req, res, next) {
    console.log("admin-update-password.js: POST");
    res.redirect("/admin");
})

module.exports = router;
