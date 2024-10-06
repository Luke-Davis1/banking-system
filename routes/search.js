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

  // Verify that user has access to search
  if(req.session.userType == "customer") {
    // reroute back to dashboard
    res.redirect("/");
  }

  console.log("SEARCH GET: state of targetUserLoginId", req.session.targetUserLoginId);

  res.render('search', {
    userLoginId: req.session.userLoginId,
    userFirstName: req.session.userFirstName
  });
});

router.post('/', function(req, res, next) {
  // Get the desired login id and verify it is legit
  let targetUserLoginId = parseInt(req.body.targetUserLoginId);

  let sql = "CALL search_user(?, @user_type); select @user_type;";
  dbCon.query(sql, [targetUserLoginId], function(err, rows) {
    if (err) {
      throw err;
    }

    // Attempt to get user type
    console.log(JSON.stringify(rows));
    const user_type = rows[1]?.[0]?.["@user_type"] || undefined;

    if (user_type) {
      // got back a valid user
      // check if employee is trying to proxy
      if (req.session.userType == "employee") {
        // employee can only view customer accounts
        console.log("REQUESTED USER TYPE:", user_type);
        if (user_type != "customer") {
          res.render('search', {
            userFirstName: req.session.userFirstName,
            userLoginId: req.session.userLoginId,
            message: "You don't have accesss to view that login ID, enter a customer login ID"
          });
        } else {
          // set the target and redirect to target user dashboard
          req.session.targetUserLoginId = targetUserLoginId;
          req.session.save(function(err) {
            if (err) {
                throw err;
            }
            console.log("search.js: saving the targetUserLoginId");

            // redirect to the home page. Let that redirect the user to the next correct spot
            res.redirect("/");
          });
        }
      } else {
        // admin trying to change passwords
        req.session.targetUserLoginId = targetUserLoginId;
        req.session.save(function(err) {
          if (err) {
              throw err;
          }
          console.log("search.js: saving the targetUserLoginId");

          // redirect to the home page. Let that redirect the user to the next correct spot
          res.redirect("/profile");
        });
      }
    } else {
      // user doesn't exist
      res.render('search', {
        userFirstName: req.session.userFirstName,
        userLoginId: req.session.userLoginId,
        message: "Login ID does not exist, try a different ID"
      });
    }
  });
})

module.exports = router;
