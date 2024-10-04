var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET page. */
router.get('/', function(req, res, next) {
    console.log('loginuser.js: GET');
    res.render('login-user', {});
});

/* POST page. */
router.post('/', function(req, res, next) {
    console.log('loginuser.js: POST');
    if (req.body.hashedPassword) {
        // user is submitting user/password credentials
        const userLoginId = req.session.userLoginId;
        const hashedPassword = req.body.hashedPassword;
        const sql = "CALL check_credentials(?, ?)";
        dbCon.query(sql, [userLoginId, hashedPassword], function(err, results) {
            if (err) {
                throw err;
            }
            console.log("loginuser.js: Obtained check_credentials reply from database");
            if (results[0].length === 0) {
                console.log("loginuser.js: No login credentials found");
                res.render('login-user', {message: "Password not valid for id '" + userLoginId + "'. Please log in again."});
            } else {
                console.log("loginuser.js: Credentials matched");
                req.session.userFirstName = results[0][0].first_name;
                req.session.loggedIn = true;
                res.redirect("/");
            }
        });
    } else if (req.body.userLoginId != "") {
        const user_login_id = parseInt(req.body.userLoginId);
        const sql = "CALL get_salt(" + user_login_id + ")";
        dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }
            if (results[0][0] === undefined) {
                console.log("loginuser: No results found");
                res.render('login-user', {message: "Id '" + user_login_id + "' not found"});
            } else {
                const salt = results[0][0].salt;
                req.session.userLoginId = user_login_id;
                req.session.salt = salt;
                res.render('login-password', {
                    userLoginId: user_login_id,
                    salt: salt
                });
            }

        });
    }
});

module.exports = router;
