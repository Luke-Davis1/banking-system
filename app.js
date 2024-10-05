var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var createAccountRouter = require('./routes/create-account');
var loginUserRouter = require('./routes/login-user');
var elevateRoleRouter = require('./routes/elevate-role');
var dashboardRouter = require('./routes/dashboard.js');
var accountDetailsRouter = require('./routes/account-details');
var transferRouter = require('./routes/transfer');
var searchRouter = require('./routes/search');
var profileRouter = require('./routes/profile');
var changePasswordRouter = require('./routes/change-password');
var employeeRouter = require('./routes/employee');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons")));
app.use(express.static(path.join(__dirname, "node_modules/crypto-js")));

var dbCon = require('./lib/database');

var dbSessionPool = require('./lib/sessionPool.js');
var sessionStore = new MySQLStore({}, dbSessionPool);
// Necessary middleware to store session cookies in MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret1234',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  cookie : {
    sameSite: 'strict'
  }
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/create-account', createAccountRouter);
app.use('/login-user', loginUserRouter);
app.use('/elevate-role', elevateRoleRouter);
app.use('/dashboard', dashboardRouter);
app.use('/account-details', accountDetailsRouter);
app.use('/transfer', transferRouter);
app.use('/search', searchRouter);
app.use('/profile', profileRouter);
app.use('/change-password', changePasswordRouter);
app.use('/employee', employeeRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
