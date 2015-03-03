var express = require('express');
var router  = express.Router();
var moment  = require('moment')

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'kalorimerkezi3'
});

connection.connect();

/*
	GET
	İstenen tarihe özel besin kayıtlarını, egzersiz kayıtlarını, 
	besin ve egzersiz için ayrı ayrı total kalori değerlerini 
	ve herhangi bir kalori kaydı girilmiş tarihleri getirir,
	@param 			    : mail
	@param  			: date,    		açıklama : tarih formatı : YYYY-AA-GG örn : 2015-02-13
	@requestParams 		: user id
*/
router.get('/getrecord/:date' , function(req, res) {	
	connection.query('SELECT besin_id, besin.ad, besin.kalori, kayitlar.miktar, kayitlar.id FROM besin,kayitlar WHERE kayitlar.k_id = ? and kayitlar.tarih = ? and besin.besin_id=kayitlar.b_id', [req.user_id,req.params.date], function(err, foodRecords) {
		connection.query('SELECT egzersiz.egz_id, egzersiz.egz_ad, egzersiz.kalori, kayitlar_egz.id, kayitlar_egz.tarih, kayitlar_egz.agirlik, kayitlar_egz.set, kayitlar_egz.makina_no FROM egzersiz,kayitlar_egz WHERE kayitlar_egz.k_id = ? and kayitlar_egz.tarih = ? and egzersiz.egz_id=kayitlar_egz.id', [req.user_id,req.params.date], function(err, trainingRecords) {
			connection.query("select tarih from kayitlar where k_id = ? group by tarih UNION select tarih from kayitlar_egz where k_id = ? group by tarih",[req.user_id,req.user_id], function(err, dateList) {
				//total calori is calculating..
				var totalCaloriesByFood = 0;
				var totalCaloriesByTraining = 0;
				if (foodRecords.length > 0) {
					for (var i=0; i<foodRecords.length; i++) {
						if (foodRecords[i].kalori != null && foodRecords[i].kalori > 0) {
							totalCaloriesByFood = totalCaloriesByFood + foodRecords[i].kalori*foodRecords[i].miktar;
						}
					}
				}
				if (trainingRecords.length > 0) {
					for (var i=0; i<trainingRecords.length; i++) {
						if (trainingRecords[i].kalori != null && trainingRecords[i].kalori < 1) {
							totalCaloriesByTraining = totalCaloriesByTraining + trainingRecords[i].kalori*trainingRecords[i].set;
						}
					}
				}
			  	res.json({
			  		"foodRecords" : foodRecords,
			  		"trainingRecords" : trainingRecords,
			  		"totalCaloriesByFood" : totalCaloriesByFood,
			  		"totalCaloriesByTraining" : totalCaloriesByTraining,
			  		"dateList" : dateList
			  	});
		  	});
		});
	});
});

/*  
	GET
	Kullanıcının  eklediği besini kaydeder
	@param   	   : time  	Açıklama : time formatı bugün  için = 0, dün için = 1
	@param         : foodId 	
	@param 	       : quantity
	@requestParams : user_id
*/

router.get('/save/food/:time/:foodId/:quantity' , function(req, res) {
	if (req.params.time == 0) {
		var date = moment().format('YYYY-MM-DD');
	} else if (req.params.time == 1) {
		var date = moment().subtract(1, 'days').format('YYYY-MM-DD');
	}	
	connection.query("Insert into kayitlar (k_id, b_id, tarih, miktar) values (?,?,?,?)",[req.user_id, req.params.foodId, date, req.params.quantity], function(err) {
  		if (err) throw err;
 		res.status(200).send();
});
});

/*  
	GET
	Kullanıcının  eklediği egzersizi kaydeder
	@param   	   : time  	Açıklama : time formatı bugün  için = 0, dün için = 1
	@param         : id	 	Açıklama : egzersiz id si
	@param 	       : set
	@param 	       : agirlik
	@param 	       : no
	@requestParams : user_id
*/

router.get('/save/training/:time/:trainingId/:adet/:agirlik/:no' , function(req, res) {
	if (req.params.time == 0) {
		var date = moment().format('YYYY-MM-DD');
	} else if (req.params.time == 1) {
		var date = moment().subtract(1, 'days').format('YYYY-MM-DD');
	}	
	connection.query("Insert into kayitlar_egz (k_id, egz_id, tarih, adet, makina_no, agirlik) values (?,?,?,?,?,?)",[req.user_id, req.params.trainingId, date, req.params.adet,req.params.no, req.params.agirlik], function(err) {
  		if (err) throw err;
 		res.status(200).send();
});
});

/*  
	get
	Kullanıcının besin kaydını siler
	@param         : recordId
*/

router.get('/delete/food/:foodId' , function(req, res) {
	connection.query("DELETE FROM kayitlar where id = ? and k_id = ?",[req.params.foodId, req.user_id], function(err) {
  		if (err) throw err;
  		res.status(200).send();
});
});

/*  
	GET 
	kullanıcının besin eklenmiş tarihlerini getirir. 
	@requestParams : user_id
*/

router.get('/dateList' , function(req, res) {
	connection.query("select tarih from kayitlar where k_id = ? group by tarih",[req.user_id], function(err, result) {
  	if (err) throw err;
  	res.json(result);
});
});



module.exports = router;
