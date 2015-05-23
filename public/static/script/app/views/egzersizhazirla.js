define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/egzersiz-hazirla.html',
        'text!template/yeni-egz-data-list.html',
        'text!template/excersize-table.html',
        'util/constants',
        'model/logout',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, egzHazTemplate, yeniEgzDataListTemplate, excersizeTable, constants, logoutMdl) {

        var temp_id = 0;
        var temp_day_id = 1;
        var tempName = "";
        var days = [{"gun" : "Pazartesi", "dgr" : "1"},{"gun" : "Salı", "dgr" : "2"},{"gun" : "Çarşamba", "dgr" : "3"},{"gun" : "Perşembe", "dgr" : "4"}, {"gun" : "Cuma", "dgr" : "5"}, {"gun" : "Cumartesi", "dgr" : "6"}, {"gun" : "Pazar", "dgr" : "7"}, {"gun" : "adsada", "dgr" : "8"}]


        //açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function () {

            },
            render: function () {
                $("#error-div").hide();
                if ($.cookie(constants.token_name)) {
                    $('.container').show(0);
                    //egzersizler getirilecek
                    $.ajax({
                        type: 'GET',
                        url: '/api/services/getAllExcersizeTemplate',
                        headers: {'kalori_token': $.cookie(constants.token_name)},
                        dataType: 'json',
                        success: function (liste) {
                            $.ajax({
                                type: 'GET',
                                url: '/api/services/getAllExcersize',
                                headers: {'kalori_token': $.cookie(constants.token_name)},
                                dataType: 'json',
                                success: function (egz) {
                                    var data = {
                                        veri: liste.excersizeTemplateList,
                                        egz_data: egz.egzersizList
                                    }
                                    $(".icerik").html(_.template(egzHazTemplate, data));
                                    $("#yeni-sablon-baslik").hide();
                                    $("#eski-sablonlar").hide();
                                    $("#ekleme-listesi").hide();
                                }
                            });
                        }
                    });
                } else {
                    window.location = constants.hash;
                }
            },
            events: {
                "click #egzersiz-template-eski": "showDropdown",
                "click #egzersiz-template-yeni": "showBaslik",
                "click #egzersiz-baslik-button": "yeniEgzListButton",
                "click #egz-kaydet-button": "egzIcerikKaydet",
                "click #template-getir": "templateGetir",
                "click #egz-sil": "egzSil",
                "change #egz-temp-list" : "templateGetir",
                "change #dayList" : "gunDataGetir"
            },
            showBaslik: function () {
                $(".tercih-butonlari").hide();
                $("#yeni-sablon-baslik").show();
            },
            showDropdown: function () {
                $(".tercih-butonlari").hide();
                $("#eski-sablonlar").show();
            },
            yeniEgzListButton: function () {
                tempName = $("#template_baslik").val();
                console.log(tempName)
                if (tempName == undefined || tempName == null || tempName == "") {
                } else {
                    $.ajax({
                        type: 'GET',
                        url: '/api/services/saveExersizeTemplateName',
                        headers: {'kalori_token': $.cookie(constants.token_name), 'temp_name': tempName},
                        dataType: 'json',
                        success: function (liste) {
                            temp_id = liste.insertId;
                            $.ajax({
                                type: 'GET',
                                url: '/api/services/getExcersizeByExcersizeTemplateAndDayId',
                                headers: {
                                    'kalori_token': $.cookie(constants.token_name),
                                    'temp_id': liste.insertId,
                                    'day_id': temp_day_id
                                },
                                dataType: 'json',
                                success: function (listeler) {
                                    var data = {
                                        veri: listeler.excersizeList,
                                        egz_ad: tempName,
                                        selected_day : temp_day_id,
                                        days : days
                                    }
                                    console.log("birazdan template yükletçek")
                                    $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                                    $("#yeni-sablon-baslik").hide();
                                    $("#ekleme-listesi").show();
                                }
                            });
                        },
                        error: function () {
                            alert("Bir hata oluştu");
                        }
                    });

                }
            },
            egzIcerikKaydet: function () {

                var agirlik = $("#egz-agirlik").val();
                console.log("agirlik : " + agirlik);
                if (isInt(agirlik)) {
                    console.log("if içine girdi ");
                    $("#feedback-panel").text("");
                    var egz_id = $('#egz-dropdown option:selected').attr('data-dgr');
                    var set = $("#egz-set").val();
                    console.log("set : " + set);

                    var makina = $("#egz-makina").val();
                    if (set == null || set == "")
                        set = "-";
                    console.log(agirlik);
                    if (makina == null || makina == "")
                        makina = "-";
                    if (agirlik == null || agirlik == "")
                        agirlik = "0";
                    var datas = {
                        "egz_id": egz_id,
                        "set": set,
                        "agirlik": agirlik,
                        "makina": makina,
                        "temp_id": temp_id,
                        "day_id": temp_day_id
                    };
                    console.log(datas);
                    $.ajax({
                        type: 'POST',
                        url: '/api/services/saveExersizeTemplateContent',
                        headers: {'kalori_token': $.cookie(constants.token_name)},
                        dataType: 'json',
                        data: datas,
                        success: function (listeler) {
                            //datalistesi yenileniyor
                            console.log("saveExersizeTemplateContent temp_id : " + temp_id);
                            $.ajax({
                                type: 'GET',
                                url: '/api/services/getExcersizeByExcersizeTemplateAndDayId',
                                headers: {
                                    'kalori_token': $.cookie(constants.token_name),
                                    "temp_id": temp_id,
                                    'day_id': temp_day_id
                                },
                                dataType: 'json',
                                success: function (egzListesi) {
                                    var data = {
                                        veri: egzListesi.excersizeList,
                                        egz_ad: tempName,
                                        selected_day : temp_day_id,
                                        days : days
                                    }
                                    $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                                },
                                error: function (err) {
                                    alert("bir hata oluştu");
                                }
                            });
                            //alttaki egzersiz listesi yenilenecek

                        },
                        error: function (err) {
                            alert("bir hata oluştu");
                        }
                    });
                } else {
                    $("#feedback-panel").text("Lütfen ağırlık değerini rakam giriniz").css("color", "red");
                }
            },
            templateGetir: function () {
                temp_id = $('#egz-temp-list option:selected').attr('data-dgr');
                console.log("template id : " + temp_id);
                tempName = $('#egz-temp-list option:selected').val();
                $.ajax({
                    type: 'GET',
                    url: '/api/services/getExcersizeByExcersizeTemplateAndDayId',
                    headers: {
                        'kalori_token': $.cookie(constants.token_name),
                        "temp_id": temp_id,
                        'day_id': 1
                    },
                    dataType: 'json',
                    success: function (egzListesi) {
                        var data = {
                            veri: egzListesi.excersizeList,
                            egz_ad: tempName,
                            selected_day : 1,
                            days : days
                        }
                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                        $("#ekleme-listesi").show();
                    },
                    error: function (err) {
                        alert("bir hata oluştu");
                    }
                });
            },
            egzSil: function (e) {
                var silId = $(e.currentTarget).attr('data-dgr');
                $.ajax({
                    type: 'GET',
                    url: '/api/services/deleteExersizeById',
                    headers: {
                        'kalori_token': $.cookie(constants.token_name),
                        "temp_id": temp_id,
                        "egz_id": silId,
                        'day_id': temp_day_id
                    },
                    dataType: 'json',
                    success: function (egzListesi) {
                        var data = {
                            veri: egzListesi.excersizeList,
                            egz_ad: tempName,
                            selected_day : temp_day_id,
                            days : days
                        }
                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                        $("#ekleme-listesi").show();
                    },
                    error: function (err) {
                        alert("silerken bir hata oluştu");
                    }
                });
            },
            gunDataGetir : function() {
                temp_day_id = $('#dayList option:selected').attr('data-dgr');
                $.ajax({
                    type: 'GET',
                    url: '/api/services/getExcersizeByExcersizeTemplateAndDayId',
                    headers: {
                        'kalori_token': $.cookie(constants.token_name),
                        "temp_id": temp_id,
                        'day_id': temp_day_id
                    },
                    dataType: 'json',
                    success: function (egzListesi) {
                        var data = {
                            veri: egzListesi.excersizeList,
                            egz_ad: tempName,
                            selected_day : temp_day_id,
                            days : days
                        }
                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                    },
                    error: function (err) {
                        alert("bir hata oluştu");
                    }
                });
            }


        });

        function isInt(value) {

            var er = /^-?[0-9]+$/;

            return er.test(value);
        }

    }
);