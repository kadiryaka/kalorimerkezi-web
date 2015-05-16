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
    function($,Backbone,_,i18n,User,egzHazTemplate,yeniEgzDataListTemplate,excersizeTable, constants,logoutMdl) {

        var temp_id = 0;
        //açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function(){
            },
            render: function(){
                $("#error-div").hide();
                if($.cookie(constants.token_name)) {
                    $('.container').show(0);
                    //egzersizler getirilecek
                    $.ajax({
                        type : 'GET',
                        url  : '/api/services/getAllExcersizeTemplate',
                        headers: { 'kalori_token' : $.cookie(constants.token_name)},
                        dataType : 'json',
                        success : function(liste) {
                            $.ajax({
                                type : 'GET',
                                url  : '/api/services/getAllExcersize',
                                headers: { 'kalori_token' : $.cookie(constants.token_name)},
                                dataType : 'json',
                                success : function(egz) {
                                    var data = {
                                        veri : liste.excersizeTemplateList,
                                        egz_data : egz.egzersizList
                                    }
                                    $(".icerik").html(_.template(egzHazTemplate,data));
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
                "click #egzersiz-template-eski" : "showDropdown",
                "click #egzersiz-template-yeni" : "showBaslik",
                "click #egzersiz-baslik-button" : "yeniEgzListButton",
                "click #egz-kaydet-button"      : "egzIcerikKaydet",
                "click #template-getir"         : "templateGetir",
                "click #egz-sil"                : "egzSil"
            },
            showBaslik : function() {
                $(".tercih-butonlari").hide();
                $("#yeni-sablon-baslik").show();
            },
            showDropdown : function() {
                $(".tercih-butonlari").hide();
                $("#eski-sablonlar").show();
            },
            yeniEgzListButton : function() {
                var tempName = $("#template_baslik").val();
                console.log(tempName)
                if (tempName == undefined || tempName == null || tempName == "") {
                } else {
                    $.ajax({
                        type : 'GET',
                        url  : '/api/services/saveExersizeTemplateName',
                        headers: { 'kalori_token' : $.cookie(constants.token_name), 'temp_name' : tempName},
                        dataType : 'json',
                        success : function(liste) {
                            temp_id = liste.insertId;
                            $.ajax({
                                type : 'GET',
                                url  : '/api/services/getExcersizeByExcersizeTemplate',
                                headers: { 'kalori_token' : $.cookie(constants.token_name), 'temp_id' : liste.insertId},
                                dataType : 'json',
                                success : function(listeler) {
                                    var data = {
                                        veri : listeler.excersizeList
                                    }
                                    $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate,data));
                                    $("#yeni-sablon-baslik").hide();
                                    $("#ekleme-listesi").show();
                                }
                            });
                        },
                        error : function() {
                            alert("Bir hata oluştu");
                        }
                    });

                }
            },
            egzIcerikKaydet : function() {

                    var egz_id = $('#egz-dropdown option:selected').attr('data-dgr');
                    var set = $("#egz-set").val();
                    console.log("set : " + set);
                    var agirlik = $("#egz-agirlik").val();
                    var makina = $("#egz-makina").val();
                    if (set == null || set == "")
                        set = "-";
                console.log("set : " + set);
                    if (makina == null || makina == "")
                        makina = "-";
                    if (agirlik == null || agirlik == "")
                        agirlik = "0";
                    var datas = {"egz_id" : egz_id, "set" : set, "agirlik" : agirlik, "makina" : makina, "temp_id" : temp_id};
                    console.log(datas);
                    $.ajax({
                        type : 'POST',
                        url  : '/api/services/saveExersizeTemplateContent',
                        headers: { 'kalori_token' : $.cookie(constants.token_name)},
                        dataType : 'json',
                        data : datas,
                        success : function(listeler) {
                            //datalistesi yenileniyor
                            console.log("saveExersizeTemplateContent temp_id : " + temp_id);
                            $.ajax({
                                type : 'GET',
                                url  : '/api/services/getExcersizeByExcersizeTemplate',
                                headers: { 'kalori_token' : $.cookie(constants.token_name), "temp_id" : temp_id},
                                dataType : 'json',
                                success : function(egzListesi) {
                                    var data = {
                                        veri : egzListesi.excersizeList
                                    }
                                    $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate,data));
                                },
                                error : function(err) {
                                    alert("bir hata oluştu");
                                }
                            });
                            //alttaki egzersiz listesi yenilenecek

                        },
                        error : function(err) {
                            alert("bir hata oluştu");
                        }
                    });

            },
            templateGetir : function() {
                temp_id = $('#egz-temp-list option:selected').attr('data-dgr');
                console.log("template id : " + temp_id);
                $.ajax({
                    type : 'GET',
                    url  : '/api/services/getExcersizeByExcersizeTemplate',
                    headers: { 'kalori_token' : $.cookie(constants.token_name), "temp_id" : temp_id},
                    dataType : 'json',
                    success : function(egzListesi) {
                        var data = {
                            veri : egzListesi.excersizeList
                        }
                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate,data));
                        $("#ekleme-listesi").show();
                    },
                    error : function(err) {
                        alert("bir hata oluştu");
                    }
                });
            },
            egzSil : function(e) {
                var silId =  $(e.currentTarget).attr('data-dgr');
                $.ajax({
                    type : 'GET',
                    url  : '/api/services/deleteExersizeById',
                    headers: { 'kalori_token' : $.cookie(constants.token_name), "temp_id" : temp_id, "egz_id" : silId},
                    dataType : 'json',
                    success : function(egzListesi) {
                        var data = {
                            veri : egzListesi.excersizeList
                        }
                        $("#yeni-egz-list").html(_.template(yeniEgzDataListTemplate,data));
                        $("#ekleme-listesi").show();
                    },
                    error : function(err) {
                        alert("silerken bir hata oluştu");
                    }
                });
            }


        });

    }
);