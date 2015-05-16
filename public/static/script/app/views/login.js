define(['jquery',
        'backbone',
        'i18next',
        'text!template/login.html',
        'text!template/dashboard.html',
        'util/constants',
        'model/login',
        'jquery.cookie',
        'jquery.ui',
        'jquery.easing',
        'notify'],
    function($,Backbone,i18n,loginTemplate,dashboardTemplate,constants,loginModel) {

        return Backbone.View.extend({
            el: $('.login'),
            initialize: function(){
            },
            render: function(){
                if($.cookie(constants.token_name)) {
                    window.location = constants.base_link + "/#dashboard";
                } else {
                    $('.container').hide(0);
                    $(".login").html(loginTemplate);
                    $("html").i18n();
                }
            },
            events: {
                "click #login_giris": "loginSend"
            },
            /**
             *girişe basılınca mail ve şifreyi kontrol eder ve kullanıcı varsa cookie'e değer atar
             */
            loginSend: function() {
                var mail = $('#mail').val();
                var pass = $('#password').val();
                if(!isValidEmailAddress(mail)) {
                    $("#feedback-panel").text("Mail adresini doğru giriniz").css("color", "red");
                    return false;
                }
                if (pass.trim() == "") {
                    $("#feedback-panel").text("Şifreyi boş girmeyiniz").css("color", "red");
                    return false;
                }

                $.ajax({
                    type: 'POST',
                    url: '/token/login',
                    dataType : 'json',
                    data: {'username' : mail, 'password' : pass},
                    success: function (response) {
                        console.log(response);
                        if(response.result == "success") {
                            console.log("cookie atıycak username : " +response.username)
                            $.cookie(constants.token_name, response.data);
                            $.cookie(constants.cookie_username, response.username);
                            console.log("cookie at")
                            window.location = constants.hash + 'dashboard';
                        } else if (response.result == "error") {
                            $("#feedback-panel").text("Kullanıcı adı veya şifre yanlış").css("color", "red");
                        }
                    },
                    error: function(response) {
                        console.log(response);
                        alert("bir hata oluştu");
                    }
                });
            }
        });

    }
);

function isValidEmailAddress(emailAddress) {
    return /^[\w_.]+@[\w_.]+\.[\w_.]+$/.test(emailAddress);
}