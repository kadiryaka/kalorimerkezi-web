var express = require('express');
var router  = express.Router();
var moment  = require('moment')
var auth 	= require('../core/auth');
var mysql   = require('mysql');
var crypto  = require('crypto');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
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
router.post('/login', function(req, res){
	var mail = req.body.mail;
	var password = crypto.createHash('md5').update(req.body.password).digest('hex');
	connection.query('select * from kullanici where mail = ? and password = ?',[mail,password], function(err, user) {
		//girilen mail ve şifreyle eşleşen kullanıcı var mı kontrolü yapılıyor
		if(user.length === 0) {
			res.status(404).send({
  				"result" 	: "error",
  				"data"		: "user_not_found"
  			});
		} else {
			//token ölmemişse, aynı token geri döndürülüyor
			connection.query('select * from tokens where user_id = ?', [user[0].k_id], function(err, result) {
				if(result.length > 0) {
					res.json({"result":"success", "data" : result[0].token});
				} else {
					//token yoksa yeni token veriliyor.
					var token = require('rand-token').uid(16);
					connection.query('insert into tokens (user_id, token) values (?, ?)',[user[0].k_id, token], function(err, result) {
						res.json({
							"result" : "success",
							"data"   : token
						});
					});		
				}
			});
			
		}
	});		
});



/*
	Get
	Çıkış yapar.
*/
router.get('/logout', function(req, res){
	connection.query('delete from tokens where token = ?',[req.headers.token], function(err, user) {
		res.status(200).send();
	});

});

module.exports = router;
