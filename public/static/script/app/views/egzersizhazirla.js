define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/egzersizhazirla/egzersiz-hazirla.html',
        'text!template/egzersizhazirla/yeni-egz-data-list.html',
        'text!template/profile/excersize-table.html',
        'text!template/dialog/yeni-egz-kaydet.html',
        'text!template/dialog/editEgzersiz.html',
        'util/constants',
        'model/logout',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, egzHazTemplate, yeniEgzDataListTemplate, excersizeTable, yeniEgzkaydetTemplate, editEgzersizTemplate, constants, logoutMdl) {

        var temp_id = 0;
        var temp_day_id = 1;
        var tempName = "";
        var editMenuAcilmaliMi = 0;
        var days = [{"gun": "Pazartesi", "dgr": "1"}, {"gun": "Salı", "dgr": "2"}, {
            "gun": "Çarşamba",
            "dgr": "3"
        }, {"gun": "Perşembe", "dgr": "4"}, {"gun": "Cuma", "dgr": "5"}, {
            "gun": "Cumartesi",
            "dgr": "6"
        }, {"gun": "Pazar", "dgr": "7"}, {"gun": "adsada", "dgr": "8"}]

        $("#dialogNewExcersize").dialog({
            autoOpen: false,//otomatik açılmayı iptal ediyor
            title: "BAŞLIK",//başlık
            buttons: [
                {
                    text: "İPTAL", click: function () {
                    $(this).dialog("close");
                }
                },
                {
                    text: "EKLE", click: function () {
                    tempName = $("#template_baslik").val();
                    console.log("temp adi : " + tempName);
                    yeniEgzTempKaydet();
                }
                }
            ],
            draggable: false,//diyalog kutusu taşına bilirliği
            hide: "clip",
            show: "clip",
            /*fold-blind-bounce-clip-drop-explode-fade-highlight-puff-pulsate-scale-shake-slide-size-transfer*/
            resizable: false,//boyutlandırmayı burdan açıp kapata biliriz
            modal: true//arka planı kitler tıklanmaz yapar
        });

        $("#dialogEditExcersize").dialog({
            autoOpen: false,//otomatik açılmayı iptal ediyor
            title: "SEÇ",//başlık
            buttons: [
                {
                    text: "İPTAL", click: function () {
                    $(this).dialog("close");
                }
                },
                {
                    text: "SEÇ", click: function () {
                    tempGetir();
                }
                }
            ],
            draggable: false,//diyalog kutusu taşına bilirliği
            hide: "clip",
            show: "clip",
            /*fold-blind-bounce-clip-drop-explode-fade-highlight-puff-pulsate-scale-shake-slide-size-transfer*/
            resizable: false,//boyutlandırmayı burdan açıp kapata biliriz
            modal: true//arka planı kitler tıklanmaz yapar
        });

        //açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
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
                                        egz_data: egz.egzersizList
                                    }
                                    var data2 = {
                                        veri: liste.excersizeTemplateList
                                    }
                                    if (liste.excersizeTemplateList.length > 0) {
                                        editMenuAcilmaliMi = 1;
                                    }
                                    $(".icerik").html(_.template(egzHazTemplate, data));
                                    $("#dialogEditExcersize").html(_.template(editEgzersizTemplate, data2));
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
                "click #egz-kaydet-button": "egzIcerikKaydet",
                "click #template-getir": "templateGetir",
                "click #egz-sil": "egzSil",
                "change #egz-temp-list": "templateGetir",
                "change #dayList": "gunDataGetir"
            },
            showBaslik: function () {
                //$("#yeni-sablon-baslik").show();
                $("#dialogNewExcersize").html(yeniEgzkaydetTemplate);
                $("#dialogNewExcersize").dialog("open");
            },
            showDropdown: function () {
                //$("#eski-sablonlar").show();
                if (editMenuAcilmaliMi == 1) {
                    $("#dialogEditExcersize").dialog("open");
                } else {
                    alert("Öncelikle Yeni Egzersiz Program Ekleyiniz")
                }
            },
            egzIcerikKaydet: function () {

                var agirlik = $("#egz-agirlik").val();
                if (isInt(agirlik)) {
                    $("#feedback-panel").text("");
                    var egz_id = $('#egz-dropdown option:selected').attr('data-dgr');
                    var set = $("#egz-set").val();

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
                    $.ajax({
                        type: 'POST',
                        url: '/api/services/saveExersizeTemplateContent',
                        headers: {'kalori_token': $.cookie(constants.token_name)},
                        dataType: 'json',
                        data: datas,
                        success: function (listeler) {
                            //datalistesi yenileniyor
                            if (listeler.result == "success") {
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
                                            selected_day: temp_day_id,
                                            days: days
                                        }
                                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                                    },
                                    error: function (err) {
                                        alert("bir hata oluştu");
                                    }
                                });
                                //alttaki egzersiz listesi yenilenecek
                            } else if (listeler.result == "failed") {
                                $("#feedback-panel").text(listeler.message).css("color", "red").hide().show(300);
                            }
                        },
                        error: function (err) {
                            alert("bir hata oluştu");
                        }
                    });
                } else {
                    $("#feedback-panel").text("Lütfen ağırlık değerini rakam giriniz").css("color", "red").hide().show(300);
                }
            },
            templateGetir: function () {

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
                            selected_day: temp_day_id,
                            days: days
                        }
                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                        $("#ekleme-listesi").show();
                    },
                    error: function (err) {
                        alert("silerken bir hata oluştu");
                    }
                });
            },
            gunDataGetir: function () {
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
                            selected_day: temp_day_id,
                            days: days
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

        function yeniEgzTempKaydet() {

            if (tempName == undefined || tempName == null || tempName == "") {
                $("#feedback-panel-edit").text("Lütfen başlık ismi giriniz").css("color", "red").hide().show(300);
            } else {
                $("#feedback-panel-edit").text("");
                $.ajax({
                    type: 'POST',
                    url: '/api/services/saveExersizeTemplateName',
                    headers: {'kalori_token': $.cookie(constants.token_name)},
                    dataType: 'json',
                    data : {
                        "temp_name" : tempName
                    },
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
                                    selected_day: temp_day_id,
                                    days: days
                                }
                                console.log("birazdan template yükletçek")
                                $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                                $("#yeni-sablon-baslik").hide();
                                $(".tercih-butonlari").hide();
                                $("#ekleme-listesi").show();
                                $("#dialogNewExcersize").dialog("close");
                            }
                        });
                    },
                    error: function () {
                        alert("Bir hata oluştu");
                    }
                });
            }
        }

        function tempGetir() {
            temp_id = $('#egz-temp-list option:selected').attr('data-dgr');
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
                        selected_day: 1,
                        days: days
                    }
                    $(".tercih-butonlari").hide();
                    $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate, data));
                    $("#ekleme-listesi").show();
                    $("#dialogEditExcersize").dialog("close");
                },
                error: function (err) {
                    alert("bir hata oluştu");
                    $("#feedback-panel-edit").text("Bir hata oluştu").css("color", "red").hide().show(300);
                }
            });
        }

    }
);