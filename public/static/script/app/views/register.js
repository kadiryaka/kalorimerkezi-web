define(['jquery',
        'backbone',
        'i18next',
        'text!template/sporcukayit/register.html',
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
                    $("#feedback-panel").text("Lütfen bilgileri eksiksiz ve doğru giriniz").css("color", "red").hide().show(300);
                } else {

                    if (!isValidEmailAddress(mail)) {
                        $("#feedback-panel").text("Geçersiz mail adresi").css("color", "red").hide().show(300);
                    } else if (password != password2) {
                        $("#feedback-panel").text("Şifre uyuşmuyor").css("color", "red").hide().show(300);
                    } else {
                        $("#feedback-panel").text("").css("color", "red").hide().show(300);
                        var datas = {'name': name, 'surname': surname, 'mail': mail, 'tel': tel, 'password': password};

                        $.ajax({
                            type: 'GET',
                            url: 'api/user/kullaniciKontrol/' + mail,
                            headers: {'kalori_token': $.cookie("kalori_token")},
                            success: function (data) {
                                if (data.durum == "success") {
                                    var url = "";
                                    if (data.update == "yes")
                                        url = "api/user/userUpdateForRegister";
                                    else
                                        url = "api/user/register";

                                    $.ajax({
                                        type: 'POST',
                                        url: url,
                                        headers: {'kalori_token': $.cookie(constants.token_name)},
                                        data: datas,
                                        dataType: 'json',
                                        success: function (veri) {
                                            $("#feedback-panel").text("Kayıt Başarılı").css("color", "green").hide().show(300);
                                            $("#name").val("");
                                            $("#surname").val("");
                                            $("#mail").val("");
                                            $("#tel").val("");
                                            $("#password").val("");
                                            $("#password2").val("");
                                            console.log(veri);
                                            console.log("veri  : " + veri);
                                            console.log("data.update  : " + data.update);
                                            setTimeout(function () {
                                                if (data.update == "yes")
                                                    $.cookie(constants.user, veri[0].k_id);
                                                else
                                                    $.cookie(constants.user, veri.insertId);

                                                window.location = constants.hash + constants.user + "/profile";
                                            }, 2000);
                                        },
                                        error: function () {
                                            $("#feedback-panel").text("Kayıt Başarısız!").css("color", "red").hide().show(300);
                                        }
                                    });
                                } else {
                                    $("#feedback-panel").text("Mail adresi kullanılmaktadır").css("color", "red").hide().show(300);
                                }
                            },
                            error: function () {
                                $("#feedback-panel").text("Bir hata oluştu :(").css("color", "red").hide().show(300);
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