var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  // Verify only admins can get to this page
  if (!req.session || !req.session.loggedIn || req.session.userType != "admin") {
    console.log("dashboard.js: redirecting to /");
    res.redirect("/");
  }

  // display the page
  res.render('elevate-role', {
    userLoginId: req.session.userLoginId,
    userFirstName: req.session.userFirstName,
    userType: req.session.userType,
  })
});

router.post("/", function(req, res, next) {
  // extract user login id
  const {userLoginIdToUpdate, desiredUserType} = req.body;

  // Validate that the user exists and the doesn't have the current user type
  let sql = "CALL change_user_type(?, ?, @result_message); select @result_message;";
  dbCon.query(sql, [parseInt(userLoginIdToUpdate), desiredUserType], function(err, rows) {
    if (err) {
      throw err;
    }

    let result_message = rows[1][0]["@result_message"];
    if (result_message != "Success updating role") {
      // something went wrong updating role, inform admin
      res.render('elevate-role', {
        userLoginId: req.session.userLoginId,
        userFirstName: req.session.userFirstName,
        userType: req.session.userType,
        message: result_message
      });
    } else {
      // successfully updated role
      res.render('elevate-role', {
        userLoginId: req.session.userLoginId,
        userFirstName: req.session.userFirstName,
        userType: req.session.userType,
        success_message: result_message
      });
    }
  });
});

module.exports = router;
