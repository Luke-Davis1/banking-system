var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session || !req.session.loggedIn) {
    console.log("dashboard.js: redirecting to /");
    res.redirect("/");
  }

  let hasAccounts = false;
  let checkingAccountBalance = 0;
  let savingsAccountBalance = 0;
  // TODO: Add logic to handle proxying with target user id
  if (req.session.targetUserLoginId) {
    // employee is proxying as customer
    let sql = "CALL get_account_balances(?, @savings_current_balance, @checking_current_balance); select @savings_current_balance; select @checking_current_balance";
    dbCon.query(sql, [req.session.targetUserLoginId], function(err, rows) {
      if (err) {
        throw err;
      }
      savingsAccountBalance = rows[1][0].savings_current_balance;
      checkingAccountBalance = rows[1][0].checking_current_balance;
      console.log("index.js: Customer account balances: Savings - " + savingsAccountBalance + " Checking - " + checkingAccountBalance);
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
      dbCon.query(sql, [req.session.userLoginId], function(err, rows) {
        if (err) {
          throw err;
        }
        savingsAccountBalance = rows[1][0].savings_current_balance;
        checkingAccountBalance = rows[1][0].checking_current_balance;
        console.log("index.js: Logged in user account balances: Savings - " + savingsAccountBalance + " Checking - " + checkingAccountBalance);
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
        userLoginAccountNumber: req.session.userLoginId,
        userType: req.session.userType
      });
    }
  }
});

module.exports = router;
