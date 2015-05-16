var express = require('express');
var router = express.Router();
var moment = require('moment');
var auth = require('../core/auth');
var mysql = require('mysql');
var crypto = require('crypto');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kalorimerkezi3'
});

connection.connect();

/*
 Post
 mail ve şifreyle giriş yapılmasını sağlar
 mail ve şifre bulunması durumunda token random token üretir
 @post user.mail
 @post user.password
 */
router.post('/login', function (req, res) {
  console.log("login fonk. girdi");
  var mail = req.body.username;
  var password = crypto.createHash('md5').update(req.body.password).digest('hex');
  console.log("mail : " + mail + "pass : " + password);
  connection.query('select k_id,isim from kullanici where mail = ? and password = ?', [mail, password], function (err, user) {
    //girilen mail ve şifreyle eşleşen kullanıcı var mı kontrolü yapılıyor
    console.log(user);
    if (user.length === 0) {
      console.log("kullanıcı bulunamadı");
      res.json({
        "result": "error",
        "data": "user_not_found"
      });
    } else {
      //token ölmemişse, aynı token geri döndürülüyor
      console.log("kullanıcı bulundu token kontrol edilcek");
      connection.query('select * from tokens where user_id = ?', [user[0].k_id], function (err, result) {
        if (result.length > 0) {
          console.log("eski token bulundu ve döndürüldü");
          res.json({
            "result": "success",
            "data": result[0].token,
            "username": user[0].isim
          });
        } else {
          //token yoksa yeni token veriliyor.
          console.log("eski token yok yeni token oluşturulup kaydedilcek");

          var token = require('rand-token').uid(16);
          console.log("buraya geldiyse burda token'ı kaydedecek demektir k_id = " + user[0].k_id + " token = " + token);
          connection.query('insert into tokens (user_id, token) values (?, ?)', [user[0].k_id, token], function (err, result) {
            if (err) throw err;
            res.json({
              "result": "success",
              "data": token,
              "username": user[0].isim
            });
          });
          console.log("kaydetmiş olması lazım");
        }
      });
    }
  });
});


/*
 Get
 Çıkış yapar.
 */
router.get('/logout', function (req, res) {
  console.log("/logout'a girildi token : " + req.headers.kalori_token);
  connection.query('delete from tokens where token = ?', [req.headers.kalori_token], function (err, user) {
    res.status(200).send();
  });

});

module.exports = router;
