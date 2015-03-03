var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'kalorimerkezi3'
});

connection.connect();

module.exports = {
	/**
		token kontrolü yapar
	*/
	"secure" : function(req, res, next) {
		var token = req.headers.token;
		console.log("secureye girdi");
		connection.query('SELECT * from tokens where token = ?', [token], function(err, result) {
	  		if (result.length === 0) {
	  			//token var mı yok mu kontrolü
	  			console.log("HTTP isteği alındı, istekle eşleşen token yok.");
	  			res.status(401).send({
	  				"status" 	: "error",
	  				"message"	: "not_authorized"
	  			});
	  		} else if (result[0].yetki == 0) {
	  			//aktif mi değil mi kontrolü (0'sa aktif değil)
	  			console.log("HTTP isteği alındı, istekle eşleşen token var ama kullanıcı aktif degil.");
	  			res.status(401).send({
	  				"status" 	: "error",
	  				"message"	: "inactive_user"
	  			});
	  		} else {
	  			//hem token var, hem aktif. o zaman adama yetkisi atanıyor
	  			console.log("HTTP isteği alındı, istekle eşleşen token var yetki ve kullanici adi atandi");
	  			req.user_id = result[0].user_id;
	  			req.auth = result[0].yetki;
				next();
	  		}
		});
	},

	/**
		kullanıcı admin mi kontrol eder.
	*/
	"isAdmin" : function(req, res, next) {
		
		connection.query('SELECT yetki FROM kullanici WHERE k_id = ?', [req.user_id], function(err, result) {
			console.log("admin misin kontrol ediyoruz xDXD");
			if (result[0].yetki == 2) next(); 
			else {
				res.status(401).send({"status":"error", "message":"unauthorized_connection"});
				console.log("yetkisiz giriş siktir git göt");
			}
		});
	}




}

