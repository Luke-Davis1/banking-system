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

router.post("/", function(req, res, next) {
  // Extract all the guaranteed variables
  const {transactionType, sendingAccountType, amount, memo} = req.body;
  
  // determine if user is proxied first
  if (req.session.targetUserLoginId) {
    // determine which transaction type is happening
    if (transactionType == "transfer") {
      // Need the destination user login id and account type
      const {destinationUserLoginId, destinationAccountType} = req.body;

      // Verify that the user isn't sending money to the exact same account
      if (req.session.userLoginId == parseInt(destinationUserLoginId) && sendingAccountType == destinationAccountType) {
        // user is trying to send money to the exact same account
        res.render(`/transfer?accountType=${sendingAccountType}`, {
          userFirstName: req.session.userFirstName,
          userLoginId: req.session.userLoginId,
          targetUserLoginId: req.session.targetUserLoginId,
          selectedAccountType: selectedAccountType,
          message: "Doesn't make sense sending money to the exact same account and account type, try again."
        })
      }

      // Transfer the money
      let sql = "CALL "
    }
  } else {
    // normal user in their own account
  }
  res.redirect("/transfer");
});

module.exports = router;
