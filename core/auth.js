var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'kadir',
    password: '00125658',
    database: 'kalorimerkezi3'
});

connection.connect();

module.exports = {
    /**
     token kontrolü yapar
     params : req.headers.kalori_token
     */
    "secure": function (req, res, next) {
        var token = req.headers.kalori_token;
        console.log("secureye girdi token : " + token);
        connection.query('SELECT * from tokens t inner join kullanici k ON t.user_id = k.k_id where t.token = ? ', [token], function (err, result) {
            if (result.length === 0) {
                //token var mı yok mu kontrolü
                res.status(401).send({
                    "status": "error",
                    "message": "not_authorized"
                });
            } else if (result[0].yetki == 0) {
                //aktif mi değil mi kontrolü (0'sa aktif değil)
                console.log("HTTP isteği alındı, istekle eşleşen token var ama kullanıcı aktif degil.");
                res.status(401).send({
                    "status": "error",
                    "message": "inactive_user"
                });
            } else if (result[0].yetki == 1) {
                //hem kullanıcı, hem token var, kendisi aktif.
                //bağlı bulunduğus salon aktif mi pasif mi kontrolü yapılacak
                connection.query('SELECT * FROM kullanici WHERE k_id = ?', [12], function (err, salon) {
                    if (salon.yetki == 0) {
                        res.status(401).send({
                            "status": "error",
                            "message": "inactive_sport_center"
                        });
                    } else {
                        console.log("456HTTP isteği alındı, istekle eşleşen token var yetki ve kullanici adi atandi");
                        req.user_id = result[0].user_id;
                        req.auth = result[0].yetki;
                        next();
                    }
                });
            } else if (result[0].yetki == 2) {
                req.user_id = result[0].user_id;
                req.auth = result[0].yetki;
                next();
            }
        });
    },

    /**
     kullanıcı admin mi kontrol eder.
     */
    "isAdmin": function (req, res, next) {
        connection.query('SELECT yetki FROM kullanici WHERE k_id = ?', [req.user_id], function (err, result) {
            console.log("admin misin kontrol ediyoruz xDXD");
            if (result[0].yetki == 2) next();
            else {
                res.status(401).send({"status": "error", "message": "unauthorized_connection"});
            }
        });
    },

    "haveUser": function (req, res, next) {
        var salon_id = req.user_id;
        var user_id = req.headers.k_id;
        connection.query('SELECT salon_id FROM kullanici WHERE k_id = ?', [user_id], function (err, result) {
            console.log(result);
            if (result[0].salon_id != null && result[0].salon_id == salon_id) {
                next();
            } else {
                res.status(401).send({"status": "error", "message": "unauthorized_connection"});
            }

        });
    }


}

