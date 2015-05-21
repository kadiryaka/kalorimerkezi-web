var express = require('express');
var router = express.Router();
var constants = require('../core/constants');
var crypto = require('crypto');
var moment = require('moment');
var app = require('../app');
var mailer = require('../core/mailHelper');

connection = global.connection;

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
 kullanıcı id sine göre sporcu ölçülerini getirir
 @requestParams    : user_id
 */
router.get('/getUserSize', function (req, res) {
    moment.locale('tr');
    var user_id = req.user_id;
    connection.query('select * from olculer where k_id = ? order by tarih desc', [user_id], function (err, list) {
        if (err) throw err;
        for (var i = 0; i < list.length; i++) {
            //tarihlerin format tipi ayarlanıyor
            list[i].tarih = moment(list[i].tarih).format('DD MMM ddd YYYY');
        }
        res.json({
            'sizeList': list
        });
    });
});

/*
 GET
 kullanıcının o güne kadar eklenmiş egzersiz templatelerinin tamamını getirir
 @requestParams    : user_id
 */
router.get('/getExcersizeListByUser', function (req, res) {
    moment.locale('tr');
    var user_id = req.user_id;
    connection.query('SELECT k.temp_id, u.bas_tarihi, u.bitis_tarihi, k.temp_adi from egzersiz_kullanici_kayit u inner join egzersiztemplate k ON u.egz_temp_id = k.temp_id where u.k_id = ? order by u.eklenis_tarihi desc', [user_id], function (err, list) {
        if (err) throw err;
        var currentExcersize = 1;
        if (list.length != 0) {
            var date = moment().format('YYYY-MM-DD');
            if ((date.valueOf() <= moment(list[0].bitis_tarihi).format('YYYY-MM-DD').valueOf()) && (date.valueOf() >= moment(list[0].bas_tarihi).format('YYYY-MM-DD').valueOf())) {
                currentExcersize = 0;
            } else {
                currentExcersize = 1;
            }
            for (var i = 0; i < list.length; i++) {
                list[i].bas_tarihi = moment(list[i].bas_tarihi).format('DD MMM ddd YYYY');
                list[i].bitis_tarihi = moment(list[i].bitis_tarihi).format('DD MMM ddd YYYY');
            }
        }

        res.json({
            'excersizeList': list,
            "currentExcersize": currentExcersize
        });
    });
});

/*
 GET
 kullanıcının o güne kadar eklenmiş diyet templatelerinin tamamını getirir
 @requestParams    : user_id
 */
router.get('/getDiyetListByUser', function (req, res) {
    moment.locale('tr');
    var user_id = req.user_id;
    connection.query('SELECT k.icerik, k.temp_id, u.bas_tarihi, u.bitis_tarihi, k.temp_adi from diyet_kullanici_kayit u inner join diyettemplate k ON u.diyet_temp_id = k.temp_id where u.k_id = ? order by u.eklenis_tarihi desc', [user_id], function (err, list) {
        if (err) throw err;
        console.log(list)
        var currentDiyet = 1;
        if (list.length != 0) {
            var date = moment().format('YYYY-MM-DD');
            if ((date.valueOf() <= moment(list[0].bitis_tarihi).format('YYYY-MM-DD').valueOf()) && (date.valueOf() >= moment(list[0].bas_tarihi).format('YYYY-MM-DD').valueOf())) {
                //geçerli bir diyet programının olduğu belirtiliyor
                currentDiyet = 0;
            } else {
                currentDiyet = 1;
            }
            for (var i = 0; i < list.length; i++) {
                //tarihlerin format tipi ayarlanıyor
                list[i].bas_tarihi = moment(list[i].bas_tarihi).format('DD MMM ddd YYYY');
                list[i].bitis_tarihi = moment(list[i].bitis_tarihi).format('DD MMM ddd YYYY');
            }
        }
        res.json({
            'diyetList': list,
            "currentDiyet": currentDiyet
        });
    });
});

/*
 GET
 verilen template id'sine göre o template içerisindeki egzersiz programını getirir
 @requestParams    : user_id
 */
router.get('/getExcersizeByExcersizeTemplate', function (req, res) {
    var temp_id = req.headers.temp_id;
    var user_id = req.user_id;
    var date = moment().format('YYYY-MM-DD');
    connection.query('select icerik.id, icerik.adet, icerik.agirlik, icerik.makina_no, egz.egz_ad, egz.egz_id from egzersiz_template_icerik icerik inner join egzersiz egz ON icerik.egz_id = egz.egz_id where icerik.temp_id = ?', [temp_id], function (err, list) {
        connection.query('select * from egz_kullanici_kayitlari where k_id = ? and tarih = ?', [user_id, date], function (err, doList) {
            if (err) throw err;
            res.json({
                'excersizeList': list,
                'doList': doList
            });
        });
    });
});


/*
 GET
 Kullanıcının  eklediği egzersizi kaydeder
 @body         : id	 	Açıklama : egzersiz id si
 @body 	       : set
 @body 	       : agirlik
 @body 	       : makina_no
 @requestParams : user_id
 */

router.post('/save/excercize', function (req, res) {

    var deleteData = req.body.doDelete;
    var addData = req.body.doAdd;
    var user_id = req.user_id;
    var date = moment().format('YYYY-MM-DD');

    //gelen dizi datasındakileri tek tek ekliyor
    for (var i = 0; i < addData.length; i++) {
        var egz_id = addData[i].egz_id;
        var adet = addData[i].adet;
        var agirlik = addData[i].agirlik;
        var makina_no = addData[i].makina_no;
        connection.query("Insert into egz_kullanici_kayitlari (k_id, egz_id, tarih, adet, makina_no, agirlik) values (?,?,?,?,?,?)", [user_id, egz_id, date, adet, makina_no, agirlik], function (err) {
            if (err) throw err;
        });
    }

    //gelen dizi datasındakileri tek tek siliyor
    for (var i = 0; i < deleteData.length; i++) {
        connection.query("delete from egz_kullanici_kayitlari where id = ?", [deleteData[i]], function (err) {
            if (err) throw err;
        });
    }

    res.status(200).send();
});

/*
 GET
 Kullanıcının elden eklediği egzersizi kaydeder
 @body         : id	 	Açıklama : egzersiz id si
 @body 	       : set
 @body 	       : agirlik
 @body 	       : makina_no
 @requestParams : user_id
 */

router.post('/save/other/excercize', function (req, res) {

    var egz_id = req.body.egz_id;
    var agirlik = req.body.agirlik;
    var makina_no = req.body.makina_no;
    var adet = req.body.adet;
    var user_id = req.user_id;
    var date = moment().format('YYYY-MM-DD');

    connection.query("Insert into egz_kullanici_kayitlari (k_id, egz_id, tarih, adet, makina_no, agirlik) values (?,?,?,?,?,?)", [user_id, egz_id, date, adet, makina_no, agirlik], function (err) {
        if (err) throw err;
        res.status(200).send();
    });
});

/*
 GET kullanıcı ölçülerini getirir
 @requestParams    : user_id
 */
router.get('/getUserSize', function (req, res) {
    moment.locale('tr');
    var user_id = req.user_id;
    connection.query('select * from olculer where k_id = ? order by tarih desc', [user_id], function (err, list) {
        if (err) throw err;
        for (var i = 0; i < list.length; i++) {
            //tarihlerin format tipi ayarlanıyor
            list[i].tarih = moment(list[i].tarih).format('DD MMM ddd YYYY');
        }
        res.json({
            'sizeList': list
        });
    });
});

/*
 GET
 kullanıcının egzersiz eklenmiş tarihlerini getirir.
 ekran ilk açılışta burası çalışır.
 */

router.get('/dateListAndEgzersizList', function (req, res) {
    moment.locale('tr');
    var user_id = req.user_id;
    var date = moment().format('YYYY-MM-DD');
    connection.query("select tarih from egz_kullanici_kayitlari where k_id = ? group by tarih order by tarih desc", [user_id], function (err, dateList) {
        var dateFormatList = [{}];
        for (var i = 0; i < dateList.length; i++) {
            //tarihlerin format tipi ayarlanıyor
            dateFormatList.push({"tarih" : moment(dateList[i].tarih).format('DD MMMM dddd YYYY')});
        }
        if (dateFormatList.length != 1)
            dateFormatList.shift();

        res.json({
            "dateList": dateList,
            "dateFormatList": dateFormatList
        });
        /*
        connection.query("select * from egz_kullanici_kayitlari where k_id = ? and tarih = ?", [user_id, date], function (err, egzList) {
            if (err) throw err;
            console.log(dateList)
            var dateFormatList = [{}];
            for (var i = 0; i < dateList.length; i++) {
                //tarihlerin format tipi ayarlanıyor
                dateFormatList.push({"tarih" : moment(dateList[i].tarih).format('DD MMMM dddd YYYY')});
            }
            if (dateFormatList.length != 1)
                dateFormatList.shift();
            res.json({
                "dateList": dateList,
                "dateFormatList": dateFormatList,
                'egzersizList': egzList
            });
        });
        */
    });
});

/*
 GET
 verilen tarihe göre kullanıcının yaptığı egzersiz listesini döndürür.
 */

router.get('/excersizListByDate', function (req, res) {
    moment.locale('tr');
    var user_id = req.user_id;
    var date = moment(req.headers.date).format('YYYY-MM-DD');
    connection.query("select * from egz_kullanici_kayitlari where k_id = ? and tarih = ?", [user_id, date], function (err, egzList) {
        if (err) throw err;
        res.json({
            'egzersizList': egzList
        });
    });
});

//buradan sonrasına yeniden bakılacak


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