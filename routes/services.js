var express = require('express');
var router = express.Router();
var moment = require('moment')

connection = global.connection;

/*
 GET
 İstenen tarihe özel besin kayıtlarını, egzersiz kayıtlarını,
 besin ve egzersiz için ayrı ayrı total kalori değerlerini
 ve herhangi bir kalori kaydı girilmiş tarihleri getirir,
 @param 			    : mail
 @param  			: date,    		açıklama : tarih formatı : YYYY-AA-GG örn : 2015-02-13
 @requestParams 		: user id
 */
router.get('/getrecord/:date', function (req, res) {
    connection.query('SELECT besin_id, besin.ad, besin.kalori, kayitlar.miktar, kayitlar.id FROM besin,kayitlar WHERE kayitlar.k_id = ? and kayitlar.tarih = ? and besin.besin_id=kayitlar.b_id', [req.user_id, req.params.date], function (err, foodRecords) {
        connection.query('SELECT egzersiz.egz_id, egzersiz.egz_ad, egzersiz.kalori, kayitlar_egz.id, kayitlar_egz.tarih, kayitlar_egz.agirlik, kayitlar_egz.set, kayitlar_egz.makina_no FROM egzersiz,kayitlar_egz WHERE kayitlar_egz.k_id = ? and kayitlar_egz.tarih = ? and egzersiz.egz_id=kayitlar_egz.id', [req.user_id, req.params.date], function (err, trainingRecords) {
            connection.query("select tarih from kayitlar where k_id = ? group by tarih UNION select tarih from kayitlar_egz where k_id = ? group by tarih", [req.user_id, req.user_id], function (err, dateList) {
                //total calori is calculating..
                var totalCaloriesByFood = 0;
                var totalCaloriesByTraining = 0;
                if (foodRecords.length > 0) {
                    for (var i = 0; i < foodRecords.length; i++) {
                        if (foodRecords[i].kalori != null && foodRecords[i].kalori > 0) {
                            totalCaloriesByFood = totalCaloriesByFood + foodRecords[i].kalori * foodRecords[i].miktar;
                        }
                    }
                }
                if (trainingRecords.length > 0) {
                    for (var i = 0; i < trainingRecords.length; i++) {
                        if (trainingRecords[i].kalori != null && trainingRecords[i].kalori < 1) {
                            totalCaloriesByTraining = totalCaloriesByTraining + trainingRecords[i].kalori * trainingRecords[i].set;
                        }
                    }
                }
                res.json({
                    "foodRecords": foodRecords,
                    "trainingRecords": trainingRecords,
                    "totalCaloriesByFood": totalCaloriesByFood,
                    "totalCaloriesByTraining": totalCaloriesByTraining,
                    "dateList": dateList
                });
            });
        });
    });
});


/*
 GET
 Salon için kullanıcı profilini getirir.
 @requestParams    : user_id
 */
router.get('/userinformation', function (req, res) {
    var salon_id = req.user_id;
    connection.query('SELECT * from kullanici where k_id = ?', [req.headers.k_id], function (err, user) {
        connection.query('SELECT * from kullanici where k_id = ?', [salon_id], function (err, salon) {
            if (err) throw err;
            res.json({
                'user': user,
                'salon': salon
            });
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
    var salon_id = req.user_id;
    connection.query('SELECT k.temp_id, u.bas_tarihi, u.bitis_tarihi, k.temp_adi from egzersiz_kullanici_kayit u inner join egzersiztemplate k ON u.egz_temp_id = k.temp_id where u.k_id = ? order by u.eklenis_tarihi desc', [req.headers.k_id], function (err, list) {
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
 verilen template id'sine göre o template içerisindeki egzersiz programını getirir
 @requestParams    : user_id
 */
router.get('/getExcersizeByExcersizeTemplate', function (req, res) {
    var salon_id = req.user_id;
    var temp_id = req.headers.temp_id;
    connection.query('select icerik.id, icerik.adet, icerik.agirlik, icerik.makina_no, egz.egz_ad from egzersiz_template_icerik icerik inner join egzersiz egz ON icerik.egz_id = egz.egz_id where icerik.temp_id = ?', [temp_id], function (err, list) {
        if (err) throw err;
        res.json({
            'excersizeList': list
        });
    });
});

/*
 GET
 verilen template id'sine ve verilen güne göre o template içerisindeki egzersiz programını getirir
 @requestParams    : user_id
 */
router.get('/getExcersizeByExcersizeTemplateAndDayId', function (req, res) {
    var salon_id = req.user_id;
    var temp_id = req.headers.temp_id;
    var day_id = req.headers.day_id;
    connection.query('select icerik.id, icerik.adet, icerik.agirlik, icerik.makina_no, egz.egz_ad from egzersiz_template_icerik icerik inner join egzersiz egz ON icerik.egz_id = egz.egz_id where icerik.temp_id = ? and icerik.gun = ?', [temp_id, day_id], function (err, list) {
        if (err) throw err;
        res.json({
            'excersizeList': list
        });
    });
});

/*
 GET
 salonid sine göre egzersiz template'lerinin adlarını listeler
 @requestParams    : user_id
 */
router.get('/getAllExcersizeTemplate', function (req, res) {
    var salon_id = req.user_id;
    connection.query('select * from egzersiztemplate where salon_id = ? or salon_id = ?', [salon_id, 0], function (err, list) {
        if (err) throw err;
        res.json({
            'excersizeTemplateList': list
        });
    });
});

/*
 GET
 kullanıcı için egzersiz template kayıt eder
 @requestParams    : user_id
 */
router.get('/setTemplateForUser', function (req, res) {
    var salon_id = req.user_id;
    var user_id = req.headers.k_id;
    var bas_tarihi = req.headers.bas_tarihi;
    var bitis_tarihi = req.headers.bit_tarihi;
    var program = req.headers.program;
    var date = moment().format('YYYY-MM-DD HH:mm:ss.SS');
    connection.query('insert into egzersiz_kullanici_kayit (k_id,bas_tarihi,bitis_tarihi,egz_temp_id,eklenis_tarihi) values (?,?,?,?,?)', [user_id, bas_tarihi, bitis_tarihi, program, date], function (err, cevap) {
        if (err) throw err;
        res.json({
            'response': cevap
        });
    });
});

/*
 GET
 salon için sporcu ölçü bilgilerini kayıt eder
 @requestParams    : user_id
 */
router.get('/sporcuOlcuKayit', function (req, res) {
    var baslik = req.headers.baslik;
    var kilo = req.headers.kilo;
    var omuz = req.headers.omuz;
    var sag_pazu = req.headers.sag_pazu;
    var sol_pazu = req.headers.sol_pazu;
    var gogus = req.headers.gogus;
    var karin = req.headers.karin;
    var bel = req.headers.bel;
    var kalca = req.headers.kalca;
    var sag_bacak = req.headers.sag_bacak;
    var sol_bacak = req.headers.sol_bacak;
    var k_id = req.headers.k_id;
    var date = moment().format('YYYY-MM-DD');

    connection.query('insert into olculer (sag_pazu,sol_pazu,gogus,karin,bel,kalca,sag_bacak,sol_bacak,omuz,kilo,tarih,k_id,baslik) values (?,?,?,?,?,?,?,?,?,?,?,?,?)', [sag_pazu, sol_pazu, gogus, karin, bel, kalca, sag_bacak, sol_bacak, omuz, kilo, date, k_id, baslik], function (err, cevap) {
        if (err) throw err;
        res.json({
            'response': cevap
        });
    });

});

/*
 GET
 salon için kullanıcı id sine göre sporcu ölçülerini getirir
 @requestParams    : user_id
 */
router.get('/getUserSize', function (req, res) {
    var user_id = req.headers.k_id;
    connection.query('select * from olculer where k_id = ? order by id desc', [user_id], function (err, list) {
        if (err) throw err;
        res.json({
            'sizeList': list
        });
    });
});

/*
 GET
 id si verilen ölçü elemanını siler ve listeyi geri döndürür
 @requestParams    :
 */
router.get('/deleteUserSizeById', function (req, res) {
    var olcu_id = req.headers.olcu_id;
    connection.query("delete from olculer where id = ?", [olcu_id], function (err, cevap) {
        if (err) throw err;
        res.json({});
    });
});

/*
 GET
 kullanıcı id sine göre sporcu ölçü başlıklarını getirir
 @requestParams    : user_id
 */
router.get('/getSizeNameList', function (req, res) {
    var user_id = req.headers.k_id;
    connection.query('select baslik from olculer where k_id = ? order by tarih desc', [user_id], function (err, sizeNameList) {
        if (err) throw err;
        res.json({
            'sizeNameList': sizeNameList
        });
    });
});

/*
 GET
 kullanıcı id sine göre sporcunun egzersiz yaptığı günleri getirir
 @requestParams    : user_id
 */
router.get('/getUserExersizeDateList', function (req, res) {
    var user_id = req.headers.k_id;
    connection.query("select DISTINCT id,tarih from egz_kullanici_kayitlari where k_id = ? group by tarih desc", [user_id], function (err, dateList) {
        connection.query("select DISTINCT id,tarih from egz_kullanici_kayitlari where k_id = ? group by tarih desc", [user_id], function (err, normalDateList) {
            if (normalDateList != null && normalDateList.length != 0) {
                for (var i = 0; i < dateList.length; i++) {
                    normalDateList[i].tarih = moment(normalDateList[i].tarih).format('DD MMMM YYYY dddd');
                }
            }
            if (err) throw err;
            res.json({
                "dateList": dateList,
                "normalDateList": normalDateList
            });
        });
    });
});

/*
 POST
 kullanıcı id sine ve tarihe göre yapılan egzersiz listesini getirir
 @requestParams    : user_id
 */
router.post('/getEgzersizByDate', function (req, res) {
    var user_id = req.headers.k_id;
    var tarih = req.body.tarih;
    connection.query("select k.adet,k.agirlik,k.makina_no,e.egz_ad from egz_kullanici_kayitlari k  inner join egzersiz e ON e.egz_id = k.egz_id where k.k_id = ? and k.tarih = ? order by k.tarih desc", [user_id, tarih], function (err, egzersizList) {
        if (err) throw err;
        res.json({
            'egzersizList': egzersizList
        });
    });
});

/*
 GET
 egzersizleri getirir
 @requestParams    :
 */
router.get('/getAllExcersize', function (req, res) {
    connection.query("select * from egzersiz", function (err, egzersizList) {
        if (err) throw err;
        res.json({
            'egzersizList': egzersizList
        });
    });
});

/*
 GET
 egzersiz template adını kayıt eder
 @requestParams    :
 */
router.get('/saveExersizeTemplateName', function (req, res) {
    var tempName = req.headers.temp_name;
    var salon_id = req.user_id;
    connection.query("insert into egzersiztemplate (temp_adi, salon_id) values (?,?)", [tempName, salon_id], function (err, cevap) {
        if (err) throw err;
        var id = cevap.insertId;
        res.json({
            'insertId': id
        });
    });
});

/*
 POST
 eklenen egzersiz template maddesini kayıt eder
 @requestParams    :
 */
router.post('/saveExersizeTemplateContent', function (req, res) {
    var salon_id = req.user_id;
    var egz_id = req.body.egz_id;
    var set = req.body.set;
    var agirlik = req.body.agirlik;
    var makina = req.body.makina;
    var temp_id = req.body.temp_id;
    var day_id = req.body.day_id;
    connection.query("select * from egzersiz_template_icerik where temp_id = ? and gun = ? and adet = ? and egz_id = ?", [temp_id, day_id, set, egz_id], function (err, veriList) {
        if (veriList == null || veriList.length == 0) {
            connection.query("insert into egzersiz_template_icerik (egz_id, agirlik, adet, makina_no, temp_id, gun) values (?,?,?,?,?,?)", [egz_id, agirlik, set, makina, temp_id, day_id], function (err, cevap) {
                if (err) throw err;
                res.json({
                    'result': "success"
                });
            });
        } else {
            res.json({
                'result': "failed",
                'message': "Lütfen aynı egzersiz ve set bilgisini birden fazla giriş yapmayınız."
            });
        }
    });
});

/*
 GET
 id si verilen template elemanını siler ve templatei geri döndürür
 @requestParams    :
 */
router.get('/deleteExersizeById', function (req, res) {
    var temp_id = req.headers.temp_id;
    var egz_id = req.headers.egz_id;
    var day_id = req.headers.day_id;
    connection.query("delete from egzersiz_template_icerik where id = ?", [egz_id], function (err, cevap) {
        connection.query('select icerik.id, icerik.adet, icerik.agirlik, icerik.makina_no, egz.egz_ad from egzersiz_template_icerik icerik inner join egzersiz egz ON icerik.egz_id = egz.egz_id where icerik.temp_id = ? and icerik.gun = ?', [temp_id, day_id], function (err, list) {
            if (err) throw err;
            res.json({
                'excersizeList': list
            });
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
    var salon_id = req.user_id;
    connection.query('SELECT k.temp_id, u.bas_tarihi, u.bitis_tarihi, k.temp_adi from diyet_kullanici_kayit u inner join diyettemplate k ON u.diyet_temp_id = k.temp_id where u.k_id = ? order by u.eklenis_tarihi desc', [req.headers.k_id], function (err, list) {
        if (err) throw err;
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
 verilen template id'sine göre o template içerisindeki diyet programını getirir
 @requestParams    : user_id
 */
router.get('/getDiyetByDiyetTemplate', function (req, res) {
    var temp_id = req.headers.temp_id;
    connection.query('select * from diyettemplate where temp_id = ?', [temp_id], function (err, list) {
        if (err) throw err;
        res.json({
            'diyetList': list
        });
    });
});

/*
 GET
 salonid sine göre diyet template'lerinin adlarını listeler
 @requestParams    : user_id
 */
router.get('/getAllDiyetTemplate', function (req, res) {
    var salon_id = req.user_id;
    connection.query('select * from diyettemplate where salon_id = ? or salon_id = ?', [salon_id, 0], function (err, list) {
        if (err) throw err;
        res.json({
            'diyetTemplateList': list
        });
    });
});

/*
 GET
 kullanıcı için diyet template kayıt eder
 @requestParams    : user_id
 */
router.get('/setDiyetTemplateForUser', function (req, res) {
    var salon_id = req.user_id;
    var user_id = req.headers.k_id;
    var bas_tarihi = req.headers.bas_tarihi;
    var bitis_tarihi = req.headers.bit_tarihi;
    var program = req.headers.program;
    var date = moment().format('YYYY-MM-DD HH:mm:ss.SS');
    connection.query('insert into diyet_kullanici_kayit (k_id,bas_tarihi,bitis_tarihi,diyet_temp_id,eklenis_tarihi) values (?,?,?,?,?)', [user_id, bas_tarihi, bitis_tarihi, program, date], function (err, cevap) {
        if (err) throw err;
        res.json({
            'response': cevap
        });
    });
});

/*
 POST
 diyet template'i kayıt eder
 @requestParams    :
 */
router.post('/saveDiyetTemplate', function (req, res) {
    var salon_id = req.user_id;
    var icerik = req.body.icerik;
    var tempname = req.body.temp_name;
    connection.query("insert into diyettemplate (temp_adi, salon_id, icerik) values (?,?,?)", [tempname, salon_id, icerik], function (err, cevap) {
        if (err) throw err;
        var id = cevap.insertId;
        res.json({
            'insertId': id
        });
    });
});

/*
 POST
 diyet template'i update eder
 @requestParams    :
 */
router.post('/updateDiyetTemplate', function (req, res) {
    var salon_id = req.user_id;
    var icerik = req.body.icerik;
    var temp_id = req.body.temp_id;
    connection.query("update diyettemplate set icerik = ? where temp_id = ?", [icerik, temp_id], function (err, cevap) {
        if (err) throw err;
        res.json({
            'durum': "success"
        });
    });
});

/*
 GET
 spor salonu bilgilerini getirir
 @requestParams    : salon_id
 */
router.get('/sporSalonuHomepage', function (req, res) {
    var salon_id = req.user_id;
    connection.query("select * from kullanici where salon_id = ?", [salon_id], function (err, users) {
        if (err) throw err;
        var aktifSporcusayisi = 0;
        var pasifSporcuSayisi = 0;
        for (var i = 0; i < users.length; i++) {
            if (users[i].yetki == 0) {
                pasifSporcuSayisi++;
            } else if (users[i].yetki == 1) {
                aktifSporcusayisi++;
            }
        }
        res.json({
            'users': users,
            'aktifSayisi': aktifSporcusayisi,
            'pasifSayisi': pasifSporcuSayisi
        });
    });
});


module.exports = router;
