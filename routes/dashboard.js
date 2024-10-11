var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session || !req.session.loggedIn) {
    console.log("dashboard.js: redirecting to /");
    return res.redirect("/");
  }

  if(req.session.userType == "admin" && req.session.targetUserLoginId) {
    // admin does not get proxy view of financials
    delete req.session.targetUserLoginId;
  }

  let checkingAccountBalance = 0;
  let savingsAccountBalance = 0;
  if (req.session.targetUserLoginId > 0) {
    // employee is proxying as customer
    let sql = "CALL get_account_balances(?, @savings_current_balance, @checking_current_balance); select @savings_current_balance; select @checking_current_balance";
    dbCon.query(sql, [req.session.targetUserLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      savingsAccountBalance = parseFloat(rows[1][0]["@savings_current_balance"]).toFixed(2);
      checkingAccountBalance = parseFloat(rows[2][0]["@checking_current_balance"]).toFixed(2);
      return res.render('dashboard', {
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

router.post("/", function(req, res, next) {
  // Setting the desired account type
  const {selectedAccountType, selectedDetailsView} = req.body;
  // const selectedAccountType = req.body.selectedAccountType;

  if (selectedAccountType) {
    // trying to transact
    req.session.selectedAccountType = selectedAccountType;
  
    req.session.save(function(err) {
      if (err) {
          throw err;
      }
      console.log("dashboard.js: Going to transfer page for : " + req.session.selectedAccountType);
  
      res.redirect("/transfer");
    });
  } else {
    // trying to view details
    req.session.selectedDetailsView = selectedDetailsView;
  
    req.session.save(function(err) {
      if (err) {
          throw err;
      }
      console.log("dashboard.js: Going to details page for : " + req.session.selectedDetailsView);
  
      res.redirect("/account-details");
    });
  }

});

module.exports = router;
