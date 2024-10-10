var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");
const { format, utcToZonedTime } = require('date-fns-tz');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session || !req.session.loggedIn || req.session.userType == "admin") {
    console.log("dashboard.js: redirecting to /");
    return res.redirect("/");
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // determine if proxied or not
  if (req.session.targetUserLoginId) {
    // get desired account balance
    let sql = "CALL get_account_balances(?, @savings_current_balance, @checking_current_balance); select @savings_current_balance; select @checking_current_balance;";
    dbCon.query(sql, [req.session.targetUserLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      // Get the desired account balance
      let accountBalance = 0;
      if (req.session.selectedDetailsView == "savings") {
        accountBalance = parseFloat(rows[1][0]["@savings_current_balance"]).toFixed(2);
      } else {
        accountBalance = parseFloat(rows[2][0]["@checking_current_balance"]).toFixed(2);
      }

      // Get transaction history
      sql = "CALL get_transaction_history(?, ?);";
      dbCon.query(sql, [req.session.targetUserLoginId, req.session.selectedDetailsView], function(error, results) {
        if (error) {
          throw error;
        }
        
        console.log("TRANSACTION HISTORY: ", JSON.stringify(results[0]));
        const transactionHistory = results[0];
        const formattedTransactionHistory = transactionHistory.map(transaction => ({
          ...transaction,
          timestamp: formatTimestamp(transaction.timestamp)
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));;

        const selectedViewFormatted = req.session.selectedDetailsView == "savings" ? "Savings" : "Checking";

        res.render("account-details", {
          userLoginId: req.session.userLoginId,
          userFirstName: req.session.userFirstName,
          userType: req.session.userType,
          targetUserLoginId: req.session.targetUserLoginId,
          selectedDetailsView: selectedViewFormatted,
          accountBalance: accountBalance,
          transactionHistory: formattedTransactionHistory
        })
      });
    })
  } else {
    let sql = "CALL get_account_balances(?, @savings_current_balance, @checking_current_balance); select @savings_current_balance; select @checking_current_balance;";
    dbCon.query(sql, [req.session.userLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      // Get the desired account balance
      let accountBalance = 0;
      if (req.session.selectedDetailsView == "savings") {
        accountBalance = parseFloat(rows[1][0]["@savings_current_balance"]).toFixed(2);
      } else {
        accountBalance = parseFloat(rows[2][0]["@checking_current_balance"]).toFixed(2);
      }

      // Get transaction history
      sql = "CALL get_transaction_history(?, ?);";
      dbCon.query(sql, [req.session.userLoginId, req.session.selectedDetailsView], function(error, results) {
        if (error) {
          throw error;
        }
        
        console.log("TRANSACTION HISTORY: ", JSON.stringify(results[0]));
        const transactionHistory = results[0];
        const formattedTransactionHistory = transactionHistory.map(transaction => ({
          ...transaction,
          timestamp: formatTimestamp(transaction.timestamp)
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));;

        const selectedViewFormatted = req.session.selectedDetailsView == "savings" ? "Savings" : "Checking";

        res.render("account-details", {
          userLoginId: req.session.userLoginId,
          userFirstName: req.session.userFirstName,
          userType: req.session.userType,
          selectedDetailsView: selectedViewFormatted,
          accountBalance: accountBalance,
          transactionHistory: formattedTransactionHistory
        })
      });
    })
  }
});

module.exports = router;
