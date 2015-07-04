define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/anasayfa/homepage.html',
        'util/constants',
        'socket.io',
        'model/logout',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, homePageTemplate, constants, io) {


        //dashboard açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                $("#error-div").hide();
                $('.container').show(0);
                $.ajax({
                    type: 'GET',
                    url: '/api/services/sporSalonuHomepage',
                    headers: {'kalori_token': $.cookie(constants.token_name)},
                    dataType: 'json',
                    success: function (liste) {
                        var data = {
                            kullanici_sayisi: liste.users.length,
                            aktif: liste.aktifSayisi,
                            pasif: liste.pasifSayisi,
                            aktif_yuzde: Math.floor(((liste.aktifSayisi) / (liste.users.length)) * 100)
                        }
                        $(".icerik").html(_.template(homePageTemplate, data));
                    }
                });
            },
            events: {}

        });

    }
);
