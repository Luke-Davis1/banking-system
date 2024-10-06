var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/dashboard");
  } else {
    // redirect to login
    res.redirect("/login-user");
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      throw err;
    }
    res.redirect("/");
  });
});

router.get('/remove-proxy', function(req, res) {
  delete req.session.targetUserLoginId;
  // redirect back to search
  res.redirect("/search");
});

module.exports = router;
