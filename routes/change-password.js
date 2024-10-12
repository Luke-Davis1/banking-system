var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  // Check if user is logged in
  if (!req.session || !req.session.loggedIn) {
    console.log("dashboard.js: redirecting to /");
    res.redirect("/");
  }

  // Check if changing password is being made on behalf of someone by an admin
  if(req.session.userType == "admin" && req.session.targetUserLoginId) {
    // Get the current salt for the target user
    let sql = "CALL get_salt_and_user_type(?);";
    dbCon.query(sql, [req.session.targetUserLoginId], function(err, rows) {
      if (err) {
        throw err;
      }

      if(rows[0][0] == undefined) {
        // something went wrong getting the target user salt
        console.log("change-password.js: GET something went wrong getting target user salt");
        res.redirect("/");
      }

      const targetUserSalt = rows[0][0].salt;
      res.render("change-password", {
        userLoginId: req.session.userLoginId,
        userFirstName: req.session.userFirstName,
        userType: req.session.userType,
        targetUserLoginId: req.session.targetUserLoginId,
        salt: targetUserSalt
      })
    });
  } else {
    // normal user changing password on their own behalf
    console.log("CURRENT STATE OF SALT:", req.session.salt);
    res.render("change-password", {
      userLoginId: req.session.userLoginId,
      userFirstName: req.session.userFirstName,
      userType: req.session.userType,
      salt: req.session.salt
    });
  }
});

router.post("/", function(req, res, next) {
    console.log("changing-password.js: POST");
    
    // Get all the variables
    let {newPasswordHash, newSalt, currentHash, currentSalt} = req.body;

    // Verify current password hash
    if (currentHash) {
      let sql = "CALL check_credentials(?, ?);";
      console.log("Searching for credentials for,", req.session.userLoginId);
      dbCon.query(sql, [req.session.userLoginId, currentHash], function(err, rows) {
        if (err) {
          throw err;
        }

        console.log("current user login id: ", req.session.userLoginId);
        console.log("Current user current salt:", currentSalt);
        console.log("Current user current hash:", currentHash);
        console.log(JSON.stringify(rows));
        let userFirstName = rows[0]?.[0]?.first_name || undefined;
        if(userFirstName) {
          // Valid update, change password and hash
          sql = "CALL update_password(?, ?, ?, @result_message); select @result_message;";
          dbCon.query(sql, [req.session.userLoginId, newPasswordHash, newSalt], function(error, result) {
            if (error) {
              throw error;
            }

            // Get the result message
            let result_message = result[1][0]["@result_message"];
            if (result_message == "Password update successful") {
              // Route back to change-password with some kind of sucess message
              res.render("change-password", {
                userLoginId: req.session.userLoginId,
                userFirstName: req.session.userFirstName,
                userType: req.session.userType,
                salt: newSalt,
                success_message: result_message
              });
            } else {
              res.render("change-password", {
                userLoginId: req.session.userLoginId,
                userFirstName: req.session.userFirstName,
                userType: req.session.userType,
                salt: currentSalt,
                message: "Something went wrong updating the password. Try again."
              });
            }
          });
        } else {
          res.render("change-password", {
            userLoginId: req.session.userLoginId,
            userFirstName: req.session.userFirstName,
            userType: req.session.userType,
            salt: currentSalt,
            message: "Incorrect current password. Try again."
          });
        }
      });
    } else {
      // admin updating password on behalf of another user
      let sql = "CALL update_password(?, ?, ?, @result_message); select @result_message;";
      dbCon.query(sql, [req.session.targetUserLoginId, newPasswordHash, newSalt], function(error, result) {
        if (error) {
          throw error;
        }

        // Get the result message
        let result_message = result[1][0]["@result_message"];
        if (result_message == "Password update successful") {
          // Route back to change-password with some kind of sucess message
          res.render("change-password", {
            userLoginId: req.session.userLoginId,
            userFirstName: req.session.userFirstName,
            userType: req.session.userType,
            targetUserLoginId: req.session.targetUserLoginId,
            salt: newSalt,
            success_message: result_message
          });
        } else {
          res.render("change-password", {
            userLoginId: req.session.userLoginId,
            userFirstName: req.session.userFirstName,
            userType: req.session.userType,
            salt: currentSalt,
            message: "Something went wrong updating the password. Try again."
          });
        }
      });
    }
})

module.exports = router;
