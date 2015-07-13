define(['jquery',
        'backbone',
        'i18next',
        'text!template/sifredegistir/sifre.html',
        'text!template/sporcular/dashboard.html',
        'util/constants',
        'model/login',
        'jquery.cookie',
        'jquery.ui',
        'jquery.easing',
        'notify'],
    function ($, Backbone, i18n, sifreTemplate, dashboardTemplate, constants, loginModel) {

        var sifreKodu = "";

        return Backbone.View.extend({
            el: $('.login'),
            initialize: function () {

            },
            render: function (code) {
                if ($.cookie(constants.token_name)) {
                    window.location = constants.base_link + "/#dashboard";
                } else {
                    sifreKodu = code;
                    $('.container').hide(0);
                    $(".login").html(sifreTemplate);
                    $("html").i18n();
                }
            },
            events: {
                "click #sifre_degistir": "passwordChange"
            },
            passwordChange : function() {
                var pass = $("#password").val();
                var pass2 = $("#password2").val();

                if (pass == undefined || pass.trim() == "" || pass != pass2) {
                    $("#feedback-panel").text("Lütfen aynı şifre giriniz").css("color", "red").hide().show(300);
                } else {
                    $("#sifre_degistir").prop('disabled',true);
                    $.ajax({
                        type: 'POST',
                        url: '/token/changePassword',
                        dataType: 'json',
                        headers: {'kod': sifreKodu},
                        data: {'password': pass},
                        success: function (response) {
                            if (response.result == "success") {
                                $("#feedback-panel").text("Şifreniz başarıyla değiştirildi").css("color", "green").hide().show(300);
                                setTimeout(function () {
                                    window.location = constants.hash + "login";
                                }, 2000);
                            } else {
                                $("#feedback-panel").text("Sistemde teknik bir arızadan dolayı işlem gerçekleştirilemedi").css("color", "red").hide().show(300);
                                setTimeout(function () {
                                    window.location = constants.hash + "login";
                                }, 2000);
                            }
                        },
                        error: function (response) {
                            console.log(response);
                            alert("bir hata oluştu");
                        }
                    });
                }


            }
        });

    }
);