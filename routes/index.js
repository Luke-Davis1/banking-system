var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.test === undefined) {
    console.log("Session key test not set");
    req.session.test = "Putting data in a session variable";
    req.session.save(function(err) {
      if (err) {
        throw err;
      }
      console.log("Session variable set test: " + req.session.test);
    });
  } else {
    console.log("Session variable set test: " + req.session.test);
  }
  res.render('index', { title: 'Express Bank' });
});

module.exports = router;
