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

  console.log("SELECTED ACCOUNT TYPE:", req.session.selectedAccountType);
  // If there is a target user id, employee is moving money on behalf of a customer
  if (req.session.targetUserLoginId) {
    // render with target user login id and their account type
    res.render("transfer", {
      userFirstName: req.session.userFirstName,
      userLoginId: req.session.userLoginId,
      targetUserLoginId: req.session.targetUserLoginId,
      selectedAccountType: req.session.selectedAccountType
    });
  } else {
    // user managing their own account
    res.render("transfer", {
      userFirstName: req.session.userFirstName,
      userLoginId: req.session.userLoginId,
      selectedAccountType: req.session.selectedAccountType
    })
  }
});

router.post("/", function(req, res, next) {
  // Extract all the guaranteed variables
  let {transactionType, sendingAccountType, amount, memo} = req.body;

  // convert amount to a float
  amount = Math.round(parseFloat(amount) * 100) / 100;
  
  // determine if user is proxied first
  if (req.session.targetUserLoginId) {
    // determine which transaction type is happening
    if (transactionType == "transfer") {
      // Need the destination user login id and account type
      const {destinationUserLoginId, destinationAccountType} = req.body;

      // Verify that the user isn't sending money to the exact same account
      if (req.session.targetUserLoginId == parseInt(destinationUserLoginId) && sendingAccountType == destinationAccountType) {
        // user is trying to send money to the exact same account
        res.render(`transfer`, {
          userFirstName: req.session.userFirstName,
          userLoginId: req.session.userLoginId,
          targetUserLoginId: req.session.targetUserLoginId,
          selectedAccountType: req.session.selectedAccountType,
          selectedForm: transactionType,
          message: "Can't send money to exact same account."
        })
      }

      // Transfer the money
      let sql = "CALL transfer_money(?, ?, ?, ?, ?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.targetUserLoginId, sendingAccountType, parseInt(destinationUserLoginId), destinationAccountType, amount, memo, transactionType], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("AFTER MAKING TRANSACTION CALL: ", JSON.stringify(rows));
        // get the result
        const result = rows[1][0]["@result_message"];

        if (result != "Transaction successful") {
          // something went wrong, send user back to transfer page
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            targetUserLoginId: req.session.targetUserLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            message: result
          });
        } else {
          // transaction successful
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            targetUserLoginId: req.session.targetUserLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            success_message: result
          });
        }
      });
    } else if (transactionType == "deposit") {
      // employee trying to deposit on behalf of customer
      // Transfer the money
      let sql = "CALL transfer_money(?, ?, ?, ?, ?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.targetUserLoginId, sendingAccountType, null, null, amount, memo, transactionType], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("AFTER MAKING TRANSACTION CALL: ", JSON.stringify(rows));
        // get the result
        const result = rows[1][0]["@result_message"];

        if (result != "Transaction successful") {
          // something went wrong, send user back to transfer page
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            targetUserLoginId: req.session.targetUserLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            message: result
          });
        } else {
          // transaction successful
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            targetUserLoginId: req.session.targetUserLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            success_message: result
          });
        }
      });
    } else {
      // Withdraw the money
      let sql = "CALL transfer_money(?, ?, ?, ?, ?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.targetUserLoginId, sendingAccountType, null, null, amount, memo, transactionType], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("AFTER MAKING TRANSACTION CALL: ", JSON.stringify(rows));
        // get the result
        const result = rows[1][0]["@result_message"];

        if (result != "Transaction successful") {
          // something went wrong, send user back to transfer page
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            targetUserLoginId: req.session.targetUserLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            message: result
          });
        } else {
          // transaction successful
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            targetUserLoginId: req.session.targetUserLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            success_message: result
          });
        }
      });
    }
  } else {
    // normal user in their own account
    // determine which transaction type is happening
    if (transactionType == "transfer") {
      // Need the destination user login id and account type
      const {destinationUserLoginId, destinationAccountType} = req.body;

      // Verify that the user isn't sending money to the exact same account
      if (req.session.userLoginId == parseInt(destinationUserLoginId) && sendingAccountType == destinationAccountType) {
        // user is trying to send money to the exact same account
        res.render(`transfer`, {
          userFirstName: req.session.userFirstName,
          userLoginId: req.session.userLoginId,
          selectedAccountType: req.session.selectedAccountType,
          selectedForm: transactionType,
          message: "Can't send money to exact same account."
        })
      }

      // Transfer the money
      let sql = "CALL transfer_money(?, ?, ?, ?, ?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.userLoginId, sendingAccountType, parseInt(destinationUserLoginId), destinationAccountType, amount, memo, transactionType], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("AFTER MAKING TRANSACTION CALL: ", JSON.stringify(rows));
        // get the result
        const result = rows[1][0]["@result_message"];

        if (result != "Transaction successful") {
          // something went wrong, send user back to transfer page
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            message: result
          });
        } else {
          // transaction successful
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            success_message: result
          });
        }
      });
    } else if (transactionType == "deposit") {
      // employee trying to deposit on behalf of customer
      // Transfer the money
      let sql = "CALL transfer_money(?, ?, ?, ?, ?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.userLoginId, sendingAccountType, null, null, amount, memo, transactionType], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("AFTER MAKING TRANSACTION CALL: ", JSON.stringify(rows));
        // get the result
        const result = rows[1][0]["@result_message"];

        if (result != "Transaction successful") {
          // something went wrong, send user back to transfer page
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            message: result
          });
        } else {
          // transaction successful
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            success_message: result
          });
        }
      });
    } else {
      // Withdraw the money
      let sql = "CALL transfer_money(?, ?, ?, ?, ?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.userLoginId, sendingAccountType, null, null, amount, memo, transactionType], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("AFTER MAKING TRANSACTION CALL: ", JSON.stringify(rows));
        // get the result
        const result = rows[1][0]["@result_message"];

        if (result != "Transaction successful") {
          // something went wrong, send user back to transfer page
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            message: result
          });
        } else {
          // transaction successful
          res.render(`transfer`, {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            selectedAccountType: req.session.selectedAccountType,
            selectedForm: transactionType,
            success_message: result
          });
        }
      });
    }
  }
});

module.exports = router;
