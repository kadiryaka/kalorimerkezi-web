var mailer = require('express-mailer');
var app = require('../app');

mailer.extend(app, {
    from: 'kadir@google.com.tr',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
        user: 'yakakadir@gmail.com',
        pass: '00125658oguz'
    }
});

module.exports = {

    send : function(to, subject, other) {
        app.mailer.send('mailer', {
            to: to, // REQUIRED. This can be a comma delimited string just like a normal email to field.
            subject: subject, // REQUIRED.
            otherProperty: other // All additional properties are also passed to the template as local variables.
        }, function (err) {
            if (err) {
                // handle error
                //console.log(err);
                return;
            }
        });
    }
}

