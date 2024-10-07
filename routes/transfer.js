var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  // Make sure user is logged in and not an admin trying to access financials
  if (!req.session || !req.session.loggedIn || req.session.userType == "admin") {
    console.log("dashboard.js: redirecting to /");
    res.redirect("/");
  }

  const selectedAccountType = req.query.accountType;
  // If there is a target user id, employee is moving money on behalf of a customer
  if (req.session.targetUserLoginId) {
    // render with target user login id and their account type
    res.render("transfer", {
      userFirstName: req.session.userFirstName,
      userLoginId: req.session.userLoginId,
      targetUserLoginId: req.session.targetUserLoginId,
      selectedAccountType: selectedAccountType
    });
  } else {
    // user managing their own account
    res.render("transfer", {
      userFirstName: req.session.userFirstName,
      userLoginId: req.session.userLoginId,
      selectedAccountType: selectedAccountType
    })
  }
});

module.exports = router;
