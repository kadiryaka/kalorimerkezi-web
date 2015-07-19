var express = require('express');
var app = module.exports = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var auth = require('./core/auth');
var routes = require('./routes/index');
var user = require('./routes/user');
var admin = require('./routes/admin');
var services = require('./routes/services');
var token = require('./routes/token');
var search = require('./routes/search');
var constants = require('./core/constants');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'kadir',
  password: '00125658',
  database: 'kalorimerkezi3'
});

connection.connect();
global.connection = connection; // ;)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//api nin altında herhangi bir url ' e gidersen önce secure ye uğra
app.all('/api/*', auth.secure);
//aşağıdaki url lere girersen admin mi diye kontrol ettir
app.all([
  '/api/user/userList',
  '/api/user/list',
  '/api/user/add'
], auth.isAdmin);
app.all([
  '/api/services/setTemplateForUser',
  '/api/services/setDiyetTemplateForUser',
  '/api/services/getExcersizeListByUser',
  '/api/services/getDiyetListByUser',
  '/api/services/sporcuOlcuKayit',
  '/api/services/getUserSize',
  '/api/services/getUserExersizeDateList',
  '/api/services/getEgzersizByDate',
  '/api/services/getEgzersizByDate',
  '/api/services/userinformationforUser',
  '/api/services/userinformation',
  '/api/services/editUser',
  '/api/services/deleteUserById',
  '/api/services/',
], auth.haveUser);
app.use('/api/user', user);
app.use('/api/services', services);
app.use('/token', token);
app.use('/api/admin', admin);
app.use('/api/search', search);

app.use(function (req, res, next) {
  //var err = new Error('Not Found');
  //err.status = 404;
  //next(err);
    res.render('error');
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json('error', {
    message: err.message,
    error: {}
  });
});