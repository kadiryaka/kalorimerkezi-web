/**
 * Created by kadiryaka on 10.04.15.
 */
var express = require('express');
var router  = express.Router();
var moment  = require('moment')




/*
 GET
 Kullanıcı ve salon id sine göre sporcunun atanmış egzersiz kayıtlarını listeler
 şuan eksik-------
 */
router.get('/userExcersizeList', function(req, res) {
    var salon_id = req.user_id;
    connection.query('SELECT * from  where kalori > -1', function(err, food) {
        if (err) throw err;
        res.json(food);
    });
});

/*
 GET
 Salon için kullanıcı profilini getirir.
 @requestParams    : user_id
 */
router.get('/userinformation' , function(req, res) {
    connection.query('SELECT * from kullanici where k_id = ?',[req.headers.k_id], function(err, user) {
        if (err) throw err;
        res.json(user);
    });
});

module.exports = router;
