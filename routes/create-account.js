var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('create-account', { title: 'Create Account' });
});

router.post('/', function(req, res, next) {
    console.log('register.js: POST');

    // Extract values from request
    const {firstName, lastName, email, hash, salt} = req.body;

    // Use stored procedure to create account
    let sql = "CALL create_user(?, ?, ?, ?, ?, @new_user_login_id); select @new_user_login_id;"
    dbCon.query(sql, [firstName, lastName, email, hash, salt], function(err, rows) {
      if (err) {
        throw err;
      }

      const new_user_login_id = rows[1][0]["@new_user_login_id"];
      if(new_user_login_id > 0) {
        // registration was successful
        req.session.userFirstName = firstName;
        req.session.loggedIn = true;
        req.session.userLoginId = new_user_login_id;
        // Everyone is a customer by default on registration
        req.session.loggedInUserType = "customer";
        req.session.save(function(err) {
          if (err) {
              throw err;
          }
          console.log("register.js: Successful registration, cookie is: " + req.session.loggedInUserId);

          // redirect to the home page. Let that redirect the user to the next correct spot
          res.redirect("/");
        });
      } else {
        console.log("register.js: user_login_id already exists. Reload register page with that message");
        res.render('register', {message: "Couldn't assign you a user_login_id given to someone else, try again."});
      }
    });
  
});

module.exports = router;
