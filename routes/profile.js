var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  // Verify login
  if (!req.session || !req.session.loggedIn) {
    console.log("dashboard.js: redirecting to /");
    res.redirect("/");
  }

  if (req.session.targetUserLoginId && req.session.userType == "employee") {
    // Employee trying to view user profile, came from search page
    let sql = "CALL get_user_details(?);";
    dbCon.query(sql, [req.session.targetUserLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      const userDetails = rows[0];
      if (userDetails.length > 0) {
        const {first_name, last_name, user_login_id, email} = userDetails[0];
        res.render('profile', {
          targetUserLoginId: user_login_id,
          targetUserFirstName: first_name,
          targetUserLastName: last_name,
          targetUserEmail: email,
          userType: req.session.userType,
          userLoginId: req.session.userLoginId,
          userFirstName: req.session.userFirstName
        })
      } else {
        console.log("profile.js: Desired account does not exist");
        // Something went wrong finding the target user account, reroute back to dashboard
        res.redirect("/");
      }
    });

  } else {
    // Employee, customer, or admin trying to view their own profile page
    let sql = "CALL get_user_details(?);";

    dbCon.query(sql, [req.session.userLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      const userDetails = rows[0];
      if (userDetails.length > 0) {
        console.log("USER DETAILS");
        console.log(JSON.stringify(userDetails[0]));
        const {first_name, last_name, user_login_id, email} = userDetails[0];
        res.render('profile', {
          userLoginId: user_login_id,
          userFirstName: first_name,
          userLastName: last_name,
          userEmail: email,
          userType: req.session.userType,
        })
      } else {
        console.log("profile.js: Desired account does not exist");
        // Something went wrong finding the target user account, reroute back to dashboard
        res.redirect("/");
      }
    });
  }
});

module.exports = router;
