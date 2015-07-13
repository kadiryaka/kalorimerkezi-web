define(['jquery',
        'backbone',
        'i18next',
        'text!template/login/login.html',
        'text!template/sporcular/dashboard.html',
        'text!template/dialog/mail.html',
        'util/constants',
        'model/login',
        'jquery.cookie',
        'jquery.ui',
        'jquery.easing',
        'notify'],
    function ($, Backbone, i18n, loginTemplate, dashboardTemplate, mailDialogTemplate, constants, loginModel) {

        $("#dialogMail").dialog({
            autoOpen: false,//otomatik açılmayı iptal ediyor
            title: "Şifre Değişikliği",//başlık
            buttons: [
                { text: "İPTAL", click: function() {
                    $( this ).dialog("close");
                }},
                { text: "GÖNDER", click: function() {
                    var mail = $("#unut-mail").val();
                    if (!isValidEmailAddress(mail)) {
                        $("#feedback-panel-edit").text("Geçerli bir mail adresi giriniz").css("color", "red").hide().show(300);
                        return false;
                    } else {
                        $.ajax({
                            type: 'POST',
                            url: '/token/sendMailForPasswordChange',
                            data: {"mail" : mail},
                            success: function (data) {
                                if (data.result == "success") {
                                    $("#feedback-panel").text("İşlem başlatıldı, Lütfen mailinizi kontrol ediniz").css("color", "green").hide().show(300);
                                } else if (data.result == "failed") {
                                    $("#feedback-panel").text("Maile ait kullanıcı bulunamadı").css("color", "red").hide().show(300);
                                } else {
                                    $("#feedback-panel").text("Teknik bir hata oluştu").css("color", "red").hide().show(300);
                                }
                            },
                            error: function() {
                                $( this ).dialog("close");
                                $("#feedback-panel").text("Teknik bir hata oluştu").css("color", "red").hide().show(300);
                            }
                        });
                        $( this ).dialog("close");
                    }
                }}
            ],
            draggable: false,//diyalog kutusu taşına bilirliği
            hide: "clip",
            show: "clip",
            /*fold-blind-bounce-clip-drop-explode-fade-highlight-puff-pulsate-scale-shake-slide-size-transfer*/
            resizable: false,//boyutlandırmayı burdan açıp kapata biliriz
            modal: true//arka planı kitler tıklanmaz yapar
        });

        return Backbone.View.extend({
            el: $('.login'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                if ($.cookie(constants.token_name)) {
                    window.location = constants.base_link + "/#dashboard";
                } else {
                    $('.container').hide(0);
                    $(".login").html(loginTemplate);
                    $("html").i18n();
                }
            },
            events: {
                "click #login_giris": "loginSend",
                "click #sifre_unuttum": "sifreUnutuldu"
            },
            /**
             *girişe basılınca mail ve şifreyi kontrol eder ve kullanıcı varsa cookie'e değer atar
             */
            loginSend: function () {
                var mail = $('#mail').val();
                var pass = $('#password').val();
                if (!isValidEmailAddress(mail)) {
                    $("#feedback-panel").text("Mail adresini doğru giriniz").css("color", "red").hide().show(300);
                    return false;
                }
                if (pass.trim() == "") {
                    $("#feedback-panel").text("Şifreyi boş girmeyiniz").css("color", "red").hide().show(300);
                    return false;
                }

                $.ajax({
                    type: 'POST',
                    url: '/token/login',
                    dataType: 'json',
                    headers: {'platform': "2"},
                    data: {'username': mail, 'password': pass},
                    success: function (response) {
                        if (response.result == "success") {
                            $.cookie(constants.token_name, response.data);
                            $.cookie(constants.cookie_username, response.username);
                            window.location = constants.hash + 'dashboard';
                        } else if (response.data == "user_not_found") {
                            $("#feedback-panel").text("Kullanıcı adı veya şifre yanlış").css("color", "red").hide().show(300);
                        } else if (response.data == "unauthorized_login") {
                            $("#feedback-panel").text("Yetkisiz giriş engellendi").css("color", "red").hide().show(300);
                        }
                    },
                    error: function (response) {
                        console.log(response);
                        alert("bir hata oluştu");
                    }
                });
            },
            sifreUnutuldu : function () {
                $("#dialogMail").html(mailDialogTemplate);
                $("#dialogMail").dialog("open");
            }
        });

    }
);

function isValidEmailAddress(emailAddress) {
    return /^[\w_.]+@[\w_.]+\.[\w_.]+$/.test(emailAddress);
}