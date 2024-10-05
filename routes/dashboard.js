var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session || !req.session.loggedIn) {
    console.log("dashboard.js: redirecting to /");
    res.redirect("/");
  }

  if(req.session.userType == "admin" && req.session.targetUserLoginId) {
    // admin does not get proxy view of financials
    delete req.session.targetUserLoginId;
  }

  let hasAccounts = false;
  let checkingAccountBalance = 0;
  let savingsAccountBalance = 0;
  if (req.session.targetUserLoginId) {
    // employee is proxying as customer
    let sql = "CALL get_account_balances(?, @savings_current_balance, @checking_current_balance); select @savings_current_balance; select @checking_current_balance";
    dbCon.query(sql, [req.session.targetUserLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      savingsAccountBalance = rows[1][0].savings_current_balance;
      checkingAccountBalance = rows[1][0].checking_current_balance;
      res.render('dashboard', {
        userFirstName: req.session.userFirstName,
        userLoginId: req.session.userLoginId,
        userType: req.session.userType,
        targetUserLoginId: req.session.targetUserLoginId,
        checkingAccountBalance: checkingAccountBalance,
        savingsAccountBalance: savingsAccountBalance
      });
    });
  } else {
    // Determine if user is customer, employee, or admin
    if (req.session.userType != "admin") {
      // need to get account data
      hasAccounts = true;
      let sql = "CALL get_account_balances(?, @savings_current_balance, @checking_current_balance); select @savings_current_balance; select @checking_current_balance";
      console.log("Type of userLoginId ", typeof req.session.userLoginId);
      dbCon.query(sql, [req.session.userLoginId], function(err, rows) {
        if (err) {
          throw err;
        }

        savingsAccountBalance = parseFloat(rows[1][0]["@savings_current_balance"]).toFixed(2);
        checkingAccountBalance = parseFloat(rows[2][0]["@checking_current_balance"]).toFixed(2);
        res.render('dashboard', {
          userFirstName: req.session.userFirstName,
          userLoginId: req.session.userLoginId,
          userType: req.session.userType,
          checkingAccountBalance: checkingAccountBalance,
          savingsAccountBalance: savingsAccountBalance
        });
      });
    } else {
      console.log("index.js: admin user navigating to dashboard");
      res.render('dashboard', {
        userFirstName: req.session.userFirstName,
        userLoginId: req.session.userLoginId,
        userType: req.session.userType
      });
    }
  }
});

module.exports = router;
