var mailer = require('express-mailer');
var app = require('../app');

mailer.extend(app, {
    from: 'kadir@google.com.tr',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: 'kalorimerkezi@gmail.com',
        pass: '00125658'
    }
});

module.exports = {

    send : function(to, subject, name, activationKey) {
        app.mailer.send('email',{
            to: to, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: subject, // REQUIRED.
            name : name,
            activationKey : activationKey
        }, function (err) {
            if (err) {
                // handle error
                console.log("hata oluştu : " + err);
                return;
            }
        });
        console.log("baiarıyla gitmiş olması lazım")
    },

    passwordChange : function(to, subject, name, sifreKodu) {
        app.mailer.send('passChange',{
            to: to, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: subject, // REQUIRED.
            name : name,
            activationKey : sifreKodu
        }, function (err) {
            if (err) {
                // handle error
                console.log("hata oluştu : " + err);
                return;
            }
        });
        console.log("baiarıyla gitmiş olması lazım")
    }
}

