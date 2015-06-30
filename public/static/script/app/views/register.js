define(['jquery',
        'backbone',
        'i18next',
        'text!template/register.html',
        'util/constants',
        'model/register',
        'jquery.cookie'],
    function ($, Backbone, i18n, registerTemplate, constants, registerModel) {

        return Backbone.View.extend({
            el: $('.container'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                $("#error-div").hide();
                if ($.cookie(constants.token_name)) {
                    $.ajax({
                        type: 'GET',
                        url: '/api/user/userName',
                        headers: {'kalori_token': $.cookie(constants.token_name)},
                        success: function (e) {
                            $('.container').show(0);
                            $(".icerik").empty().html(registerTemplate);
                            $("html").i18n();
                        },
                        error: function (e) {
                            window.location = constants.hash + "login";
                        }
                    })
                } else {
                    window.location = constants.hash + "login";
                }
            },
            events: {
                "click #register_ok": "register_ok"
            },
            register_ok: function () {

                var password = $("#password").val().trim();
                var password2 = $("#password2").val().trim();
                var name = $("#name").val().trim();
                var surname = $("#surname").val().trim();
                var mail = $("#mail").val().trim();
                var tel = $('#tel').val().trim();

                if (name == "" || surname == "" || mail == "" || password == "" || password2 == "" || tel == ""
                    || name == undefined || surname == undefined || mail == undefined || password == undefined || password2 == undefined || tel == undefined
                ) {
                    $("#feedback-panel").text("Lütfen bilgileri eksiksiz ve doğru giriniz").show(500).css("color", "red");
                } else {

                    if (!isValidEmailAddress(mail)) {
                        $("#feedback-panel").text("Geçersiz mail adresi").show(500).css("color", "red");
                    } else if (password != password2) {
                        $("#feedback-panel").text("Şifre uyuşmuyor").show(500).css("color", "red");
                    } else {
                        $("#feedback-panel").text("").show(0).css("color", "red");
                        var datas = {'name': name, 'surname': surname, 'mail': mail, 'tel': tel, 'password': password};

                        $.ajax({
                            type: 'GET',
                            url: 'api/user/kullaniciKontrol/' + mail,
                            headers: {'kalori_token': $.cookie("kalori_token")},
                            success: function (data) {
                                if (data.durum == "success") {
                                    $.ajax({
                                        type: 'POST',
                                        url: 'api/user/register',
                                        headers: {'kalori_token': $.cookie(constants.token_name)},
                                        data: datas,
                                        dataType: 'json',
                                        success: function (data) {
                                            $("#feedback-panel").text("Kayıt Başarılı").show(0).css("color", "green");
                                            $("#name").val("");
                                            $("#surname").val("");
                                            $("#mail").val("");
                                            $("#tel").val("");
                                            $("#password").val("");
                                            $("#password2").val("");
                                            setTimeout(function () {
                                                $.cookie(constants.user, data.insertId);
                                                window.location = constants.hash + constants.user + "/profile";
                                            }, 2000);
                                        },
                                        error: function () {
                                            $("#feedback-panel").text("Kayıt Başarısız!").show(0).css("color", "red");
                                        }
                                    });
                                } else {
                                    $("#feedback-panel").text("Mail adresi kullanılmaktadır").show(500).css("color", "red");
                                }
                            },
                            error: function () {
                                $("#feedback-panel").text("Bir hata oluştu :(").show(500).css("color", "red");
                            }
                        });

                    }
                }

            }
        });

    }
);

//mail geçerlilik kontrolü
function isValidEmailAddress(emailAddress) {
    return /^[\w_.]+@[\w_.]+\.[\w_.]+$/.test(emailAddress);
}