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
var PassportLocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var minify = require('express-minify');
var csurf = require('csurf');
var multer = require('multer');
var logger = require('morgan');
var compress = require('compression');
var attempLogin = require('.lib/uti/login');
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
passport.deserializeUser(function(obj,done){
  done(null,obj);
}); 

passport.use(new PassportLocalStrategy(function(username, password, done){
  var callbacks = {};

  callbacks.getUserSucess = function(userRows){
    var login_user = userRows[0];
    if(!login_user){
       // Message content will be replaced in future.
       return done(null, false, { message: 'User or password is Invalid credential maybe.'});
    }

    var passwdCompareCallback = function(err, isMatch){
        if(err) return done(err);
        if(isMatch){
          // login function should be called.
          attempLogin.passwordAuthSuccess
          return done(null, login_user);
        }else{
          // login function is failed should be called.
          
          return done(null, false, {message : 'User or password is Invalid credential maybe.'});
        }
    };

    if(login_user.attempts > CONSTANTS.MAX_LOGIN_ATTEMPTS){
       
      if(config.account_lock_time_limit === 0 ){
        return done(null, false, {message : 'Account Locked! Too many login attempts.'});
      }else if(login_user.lockout_limit < config.account_lock_time_limit){
        return done(null, false, {message : 'Account locked. Wait ' + parseInt(config.account_lock_time_limit - login_user.lockout_limit) + ' minutes to try again.'});
      }else{
        // login function should be called.
        atttempLogin.resetAttemptCount();

      }
    }

  };

  callbacks.getUserFailure = function(error){
      return done(null, false, {message : 'Database is error.'});
  }

  attempLogin.getAuthUser({username:username},callbacks);
}));


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
