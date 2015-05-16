var express = require('express');
var router = express.Router();
var constants = require('../core/constants');
var crypto = require('crypto');
var moment = require('moment');
var mysql = require('mysql');
var app = require('../app');
var mailer = require('../core/mailHelper');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kalorimerkezi3'
});

connection.connect();

/**
 * TEST DATA
 */
router.get('/list', function (req, res) {
  console.log("/list'e istek geldi çünkü adminsin kanki admin olmasan gelmezdi");
  connection.query('SELECT * FROM kullanici', function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

/*  
 GET
 kullanıcı profilini getirir.
 @requestParams    : user_id
 */
router.get('/information', function (req, res) {
  connection.query('SELECT * from kullanici where k_id = ?', [req.user_id], function (err, user) {
    if (err) throw err;
    res.json(user);
  });
});

/*  
 GET
 ölçüler ekranındaki ilk açılışta çalıştırılması lazım
 burada kullanıcının o ana kadar giriş yapılmış tarihleri ve en son girilmiş ölçüleri getirilir
 @requestParams    : user_id
 */
router.get('/information/datesAndSize', function (req, res) {
  connection.query('SELECT tarih from olculer where k_id = ? order by tarih desc', [req.user_id], function (err, tarihler) {
    connection.query('SELECT * from olculer where k_id = ? and tarih = ?', [req.user_id, tarihler[0].tarih], function (err, size) {
      if (err) throw err;
      res.json({
        "tarihler": tarihler,
        "size": size
      });
    });
  });
});

/*  
 GET
 istenilen tarihe göre kullanıcı ölçülerini getirir
 @params           : tarih Açıklama tarih formatı YYYY-AA-GG şeklinde olmalıdır. örn : 2015-02-18
 @requestParams    : user_id
 */
router.get('/information/size/:tarih', function (req, res) {
  connection.query('SELECT * from olculer where k_id = ? and tarih = ?', [req.user_id, req.params.tarih], function (err, size) {
    if (err) throw err;
    res.json(size);
  });
});

/**
 * Salon için kullanıcı listesini ve toplam kullanıcı sayısını getirir.
 */
router.get('/userList', function (req, res) {
  var salon_id = req.user_id;
  console.log("/userList'e istek geldi çünkü adminsin kanki admin olmasan gelmezdi");
  connection.query('SELECT k_id,isim, soyisim, mail, tel, yetki FROM kullanici where salon_id = ? order by uyelik_tarihi desc limit ?', [salon_id, constants.page_size], function (err, result) {
    connection.query('SELECT isim from kullanici where salon_id = ?', [salon_id], function (err, sayi) {
      if (err) throw err;
      res.json({
        "result": result,
        "sayi": sayi.length
      });
    });
  });
});

/**
 * Salon için sayfalamalı olarak kullanıcı listesini getirir.
 */
router.get('/userList/:page', function (req, res) {
  var salon_id = req.user_id;
  var page = req.params.page;
  var minSize = (page - 1) * constants.page_size;
  connection.query('SELECT k_id,isim, soyisim, mail, tel, yetki FROM kullanici where salon_id = ? order by uyelik_tarihi desc limit ?,?', [salon_id, minSize, constants.page_size], function (err, result) {
    connection.query('SELECT isim from kullanici where salon_id = ?', [salon_id], function (err, sayi) {
      if (err) throw err;
      res.json({
        "result": result,
        "sayi": sayi.length
      });
    });
  });
});

/**
 * Salon için kullanıcı adını getirir.
 */
router.get('/userName', function (req, res) {
  var salon_id = req.user_id;
  console.log("userName girdim. salon_id : " + salon_id);
  connection.query('SELECT isim from kullanici where k_id = ?', [salon_id], function (err, result) {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});

/**
 * Salon için kullanıcı kaydı yapar
 */
router.post('/register', function (req, res) {
  console.log("/register girdi");
  var salon_id = req.user_id;
  var name = req.body.name;
  var surname = req.body.surname;
  var mail = req.body.mail;
  var tel = req.body.tel;
  var password = crypto.createHash('md5').update(req.body.password).digest('hex');
  console.log('pass : ' + password);
  var date = moment().format('YYYY-MM-DD');
  console.log('pass : ' + password + " data : " + date);
  connection.query('insert into kullanici (isim,uyelik_tarihi,password,mail,salon_id,soyisim,tel,yetki) values (?,?,?,?,?,?,?,?)', [name, date, password, mail, salon_id, surname, tel, 1], function (err, result) {
    if (err) {
      throw err;
    } else {
      mailer.send(mail, 'Kullanıcı Kayıt Başarılı', '');
    }
    res.json(result);
  });
});

/**
 * Salon için mail kontrolü yapar
 */
router.get('/kullaniciKontrol/:mail', function (req, res) {
  var salon_id = req.user_id;
  var mail = req.params.mail;
  connection.query('select mail from kullanici where mail = ? ', [mail], function (err, result) {
    if (err) throw err;
    console.log(result);
    if (result.length == 0) {
      console.log("success");
      res.json({"durum": "success"});
    } else {
      console.log("failed");
      res.json({"durum": "failed"});
    }
  });

});


module.exports = router;