import { Session } from 'inspector';

var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var sessionStorage = require('express-mysql-session');//Redis or mongoDB replace ok. But plugin name is different.
var favicon = require('serve-favicon');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var minify = require('express-minify');
var csurf = require('csurf');
var multer = require('multer');
var logger = require('morgan');
var compress = require("compression");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon((path.join(__dirname, 'public','images','favicon.ico'))));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(compress());

//Security XSS
app.use(function(req,res,next){
  //Prevent ClickJacking security breach.
  res.set('Content-Security-policy',"frame-ancestors 'self'");
  next();
});

if(true){//It should be set to a variable in config. 
  app.use(function(req,res,next){
    if(/.min\.(css|js)$/.test(req.url)){
      res._no_minify = true;
    }
    next();
  });

  app.use(minify({cache:path.join(__dirname,'cache')}));
}


//Proxy/Reserve enabled
app.enable('trust proxy');
//Session part.
app.use(Session({
  name : "reservation-sid",
  secret: "Frame by reservation",
  cookie: {secure: true},//It should be set to a variable in config.
  store: new sessionStorage({
        host:"",
        user:"",
        password:"",
        port:"",
        database:""
  }),
  resave:false,
  saveUninitialized: false,
  unset:'destroy'
}));

//Directory place where files saved temporarylly about this middleware.
app.use(multer({
        dest : './tempfile/',
        rename : function(fieldname, filename){
          return filename + '_' + Date.now();
        }}
      ));


passport.serializeUser(function(user,done){
   done(null,user);
});
passport.deserializeUser();

//TODO 
app.use('/', indexRouter);
app.use('/users', usersRouter);

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
