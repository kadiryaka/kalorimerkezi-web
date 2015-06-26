define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/diyet-hazirla.html',
        'util/constants',
        'model/logout',
        'jquery.cookie'],
    function($,Backbone,_,i18n,User,diyetHazTemplate, constants,logoutMdl) {

        var temp_id = 0;
        //tikKontrol eskiyi edit mi yoksa yeni mi template oluşturulacağının kontrolünü tutuyor
        var tikKontrol = true;
        //açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function(){
                $("#user_name_index").text(" "+$.cookie(constants.cookie_username));
            },
            render: function(){
                $("#error-div").hide();
                if($.cookie(constants.token_name)) {
                    $('.container').show(0);
                    //egzersizler getirilecek
                    $.ajax({
                        type : 'GET',
                        url  : '/api/services/getAllDiyetTemplate',
                        headers: { 'kalori_token' : $.cookie(constants.token_name)},
                        dataType : 'json',
                        success : function(liste) {
                            var data = {
                                veri : liste.diyetTemplateList
                            }
                            $(".icerik").html(_.template(diyetHazTemplate,data));
                            $("#yeni-sablon-baslik").hide();
                            $("#eski-sablonlar").hide();
                            $("#diyet-ekleme-listesi").hide();
                        }
                    });
                } else {
                    window.location = constants.hash;
                }
            },
            events: {
                "click #diyet-template-eski" : "showDropdown",
                "click #diyet-template-yeni" : "showBaslik",
                "click #diyet-kaydet-button" : "yeniDiyetListButton",
                "click #diyet-template-getir": "templateGetir"
            },
            showBaslik : function() {
                tikKontrol = true;
                $(".tercih-butonlari").hide();
                $("#yeni-sablon-baslik").show();
                $("#diyet-ekleme-listesi").show();
            },
            showDropdown : function() {
                tikKontrol = false;
                $(".tercih-butonlari").hide();
                $("#eski-sablonlar").show();
            },
            yeniDiyetListButton : function() {
                var tempname = $("#template_baslik").val();
                var icerik = $("#diyet-text-area").val();
                if (tikKontrol) {
                    if (tempname == undefined || tempname == null || tempname == "" || tempname.trim() == "") {
                        $("#diyet-feedback-panel").text("Lütfen başlık giriniz").css("color" , "red");
                    } else {
                        var datas = {"icerik" : icerik, 'temp_name' : tempname};
                        $.ajax({
                            type : 'POST',
                            url  : '/api/services/saveDiyetTemplate ',
                            headers: { 'kalori_token' : $.cookie(constants.token_name)},
                            dataType : 'json',
                            data : datas,
                            success : function(liste) {
                                $("#diyet-feedback-panel").text("Kayıt Başarılı").css("color" , "green");
                                $("#template_baslik").val("");
                            },
                            error : function() {
                                alert("Bir hata oluştu");
                            }
                        });
                    }
                } else {
                    console.log("false a girdi istek yapacak");
                    var datas = {"icerik" : icerik, 'temp_id' : temp_id};
                    $.ajax({
                        type : 'POST',
                        url  : '/api/services/updateDiyetTemplate',
                        headers: { 'kalori_token' : $.cookie(constants.token_name)},
                        dataType : 'json',
                        data : datas,
                        success : function() {
                            $("#diyet-feedback-panel").text("Kayıt Başarılı").css("color" , "green");
                        },
                        error : function() {
                            alert("Bir hata oluştu");
                        }
                    });
                }
            },
            templateGetir : function() {
                temp_id = $('#diyet-temp-list option:selected').attr('data-dgr');
                console.log("template id : " + temp_id);
                $.ajax({
                    type : 'GET',
                    url  : '/api/services/getDiyetByDiyetTemplate',
                    headers: { 'kalori_token' : $.cookie(constants.token_name), "temp_id" : temp_id},
                    dataType : 'json',
                    success : function(diyetListesi) {
                        $("#diyet-ekleme-listesi").show();
                        $("#diyet-text-area").text(diyetListesi.diyetList[0].icerik);
                    },
                    error : function(err) {
                        alert("bir hata oluştu");
                    }
                });
            }

        });

    }
);