define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/profile/profile.html',
        'text!template/profile/excersize.html',
        'text!template/profile/excersize-table.html',
        'text!template/profile/egzersiz-gir.html',
        'text!template/profile/olcu-gir.html',
        'text!template/profile/olculer.html',
        'text!template/profile/yap-egz-listele.html',
        'text!template/profile/yap-egz-data-list.html',
        'text!template/profile/diyetler.html',
        'text!template/profile/diyetler-table.html',
        'text!template/profile/diyet-ata.html',
        'util/constants',
        'model/logout',
        'moment',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, profileTemplate, excersizeTemplate, excersizeTable, egzersizGir, olcuGirTemplate, olcuTemplate, yapEgzLisTemplate, yapEgzDataList, diyetlerTemplate, diyetTableTemplate, diyetAtaTemplate, constants, logoutMdl, moment) {

        var days = [{"gun": "Pazartesi", "dgr": "0"}, {"gun": "Salı", "dgr": "1"}, {
            "gun": "Çarşamba",
            "dgr": "2"
        }, {"gun": "Perşembe", "dgr": "3"}, {"gun": "Cuma", "dgr": "4"}, {
            "gun": "Cumartesi",
            "dgr": "5"
        }, {"gun": "Pazar", "dgr": "6"}];
        var day_id = 0;
        return Backbone.View.extend({
            el: $('.container'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                $("#error-div").hide();
                //egzersizProgramiGir();
                excersizeProgram();
            },
            events: {
                "click .egzersiz-kayit-table": "egzTemplateIciniGetir",
                "click .diyet-kayit-table": "diyetTemplateIciniGetir",
                "click #egz_pro_gir": "egz_pro_gir",
                "click #egz_pro_gir_kaydet": "egz_pro_gir_kaydet",
                "click #egz_pro": excersizeProgram,
                "click #sporcu_olcu_gir": "sporcuOlcuGir",
                "click #olcu_gir_kaydet": "olcu_gir_kaydet",
                "click #sporcu_olcu_listele": "sporcu_olcu_listele",
                "click #yap_egz": "yap_egz_listele",
                "click #yap-egz-button": "yap_egz_data_list",
                "click #diyet_pro_listele": diyetProgramiGetir,
                "click #diyet_pro_ata": "diyet_prog_ata",
                "click #diyet_pro_gir_kaydet": "diyet_temp_kaydet",
                "click #olcu-sil": "olcu_sil",
                "change .egz-dropdown": "gun_degisti"
            },
            egzTemplateIciniGetir: function (e) {
                var temp_id = $(e.currentTarget).attr('data-dgr');
                var temp_index = $(e.currentTarget).attr('data-index');
                if (!$("#dinamik-alan" + temp_index).is(":visible")) {
                    if ($("#dinamik-alan" + temp_index).html() == "") {
                        $(e.currentTarget).css('background-color', '#bdc3c7');
                        $.ajax({
                            type: 'GET',
                            url: '/api/services/getExcersizeByExcersizeTemplateAndDayId',
                            headers: {'kalori_token': $.cookie(constants.token_name), 'temp_id': temp_id, 'day_id': 1},
                            dataType: 'json',
                            success: function (liste) {
                                var data = {
                                    veri: liste.excersizeList,
                                    temp_id: temp_id,
                                    temp_index: temp_index,
                                    day_id: day_id,
                                    days: days
                                }
                                $("#dinamik-alan" + temp_index).toggle();
                                $("#dinamik-alan" + temp_index).html(_.template(excersizeTable, data));
                            }
                        });
                    } else {
                        $("#dinamik-alan" + temp_index).toggle();
                        $(e.currentTarget).css('background-color', '#bdc3c7');
                    }
                } else {
                    $("#dinamik-alan" + temp_index).toggle();
                    $(e.currentTarget).css('background-color', 'white');
                }
            },
            diyetTemplateIciniGetir: function (e) {
                var temp_id = $(e.currentTarget).attr('data-dgr');
                var temp_index = $(e.currentTarget).attr('data-index');
                if (!$("#dinamik-alan" + temp_index).is(":visible")) {
                    if ($("#dinamik-alan" + temp_index).html() == "") {
                        $(e.currentTarget).css('background-color', '#bdc3c7');
                        $.ajax({
                            type: 'GET',
                            url: '/api/services/getDiyetByDiyetTemplate',
                            headers: {'kalori_token': $.cookie(constants.token_name), 'temp_id': temp_id},
                            dataType: 'json',
                            success: function (liste) {
                                console.log(liste.diyetList[0].icerik);
                                liste.diyetList[0].icerik = liste.diyetList[0].icerik.replace(/\n/g, "<br />")
                                var data = {
                                    b: liste.diyetList
                                }
                                $("#dinamik-alan" + temp_index).toggle();
                                $("#dinamik-alan" + temp_index).html(_.template(diyetTableTemplate, data));
                            }
                        });
                    } else {
                        $("#dinamik-alan" + temp_index).toggle();
                        $(e.currentTarget).css('background-color', '#bdc3c7');
                    }
                } else {
                    $("#dinamik-alan" + temp_index).toggle();
                    $(e.currentTarget).css('background-color', 'white');
                }
            },
            egz_pro_gir: function () {
                egzersizProgramiGir();
            },
            egz_pro_gir_kaydet: function () {
                kullaniciyaTemplateAta("setTemplateForUser");
            },
            sporcuOlcuGir: function () {
                $("#dinamik-icerik").html(_.template(olcuGirTemplate));
            },
            olcu_gir_kaydet: function () {
                //checkValidity fonksiyonun amacı seçilen form html5 teki bütün required ları yerine getirdiği zaman true döner
                if (true) {
                    var baslik = $("#olcu_baslik").val();
                    if (baslik.trim() == "") {
                        $("#feedback-panel").text("Başlık Giriniz").css("color", "red").hide().show(300);
                        return false;
                    }
                    var kilo = $("#olcu_kilo").val();
                    var omuz = $("#olcu_omuz").val();
                    var sag_pazu = $("#olcu_sag_pazu").val();
                    var sol_pazu = $("#olcu_sol_pazu").val();
                    var gogus = $("#olcu_gogus").val();
                    var karin = $("#olcu_karin").val();
                    var bel = $("#olcu_bel").val();
                    var kalca = $("#olcu_kalca").val();
                    var sag_bacak = $("#olcu_sag_bacak").val();
                    var sol_bacak = $("#olcu_sol_bacak").val();
                    var k_id = $.cookie(constants.user);

                    var veri = {
                        'kalori_token': $.cookie(constants.token_name),
                        "baslik": baslik,
                        "kilo": kilo,
                        "omuz": omuz,
                        "sag_pazu": sag_pazu,
                        "sol_pazu": sol_pazu,
                        "gogus": gogus,
                        "karin": karin,
                        "bel": bel,
                        "kalca": kalca,
                        "sag_bacak": sag_bacak,
                        "sol_bacak": sol_bacak,
                        "k_id": k_id
                    }
                    var veri2 = ["baslik", "kilo", "omuz", "sag_pazu", "sol_pazu", "gogus", "karin", "bel", "kalca", "sag_bacak", "sol_bacak"];

                    console.log(veri[veri2[1]])
                    console.log(veri[veri2[2]])
                    if (!isIntAndIsNotNull(veri, veri2)) {
                        $("#feedback-panel").text("Lütfen sayıyla doldurunuz").css("color", "red").hide().show(300);
                    } else {

                        $.ajax({
                            type: 'GET',
                            url: '/api/services/sporcuOlcuKayit',
                            headers: veri,
                            dataType: 'json',
                            success: function (liste) {
                                $("#feedback-panel").text("Kayıt Başarılı").css("color", "green").hide().show(300);
                                veri2.forEach(function (deger) {
                                    $("#olcu_" + deger).val("");
                                });
                            },
                            error: function (error) {
                                $("#feedback-panel").text("Bir Hata oluştu").css("color", "red").hide().show(300);
                            }
                        });
                    }

                }
            },
            sporcu_olcu_listele: function () {
                var id = $.cookie(constants.user);
                $.ajax({
                    type: 'GET',
                    url: '/api/services/getUserSize',
                    headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id},
                    dataType: 'json',
                    success: function (liste) {
                        var data = {
                            liste: liste.sizeList
                        };
                        $("#dinamik-icerik").html(_.template(olcuTemplate, data));
                    },
                    error: function (error) {
                        alert("hata oluştu");
                    }
                });
            },
            yap_egz_listele: function () {
                var id = $.cookie(constants.user);
                $.ajax({
                    type: 'GET',
                    url: '/api/services/getUserExersizeDateList',
                    headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id},
                    dataType: 'json',
                    success: function (liste) {
                        var data = {
                            date: liste.dateList,
                            liste: liste.normalDateList
                        };
                        $("#dinamik-icerik").html(_.template(yapEgzLisTemplate, data));
                        var tarih = moment($('#dateList option:selected').attr('data-dgr')).format('YYYY-MM-DD');
                        getEgzersizByDateOnlyData(tarih);

                    },
                    error: function (error) {
                        alert("hata oluştudwewwe");
                    }
                });
            },
            yap_egz_data_list: function () {
                var tarih = moment($('#dateList option:selected').attr('data-dgr')).format('YYYY-MM-DD');
                getEgzersizByDateOnlyData(tarih);
            },
            diyet_prog_ata: function () {
                $("#dinamik-icerik").html("");
                $.ajax({
                    type: 'GET',
                    url: '/api/services/getAllDiyetTemplate',
                    headers: {'kalori_token': $.cookie(constants.token_name)},
                    dataType: 'json',
                    success: function (liste) {
                        var data = {
                            veri: liste.diyetTemplateList
                        }
                        $("#dinamik-icerik").html(_.template(diyetAtaTemplate, data));
                    }
                });
            },
            diyet_temp_kaydet: function () {
                kullaniciyaTemplateAta("setDiyetTemplateForUser")
            },
            gun_degisti: function (e) {
                var id_name = $(e.currentTarget).attr('id');
                var temp = id_name.split("-");
                //0 ismi, 1 id si, 2 indexi (0,1,2,3)
                var day_id = e.target.selectedIndex;
                $.ajax({
                    type: 'GET',
                    url: '/api/services/getExcersizeByExcersizeTemplateAndDayId',
                    headers: {
                        'kalori_token': $.cookie(constants.token_name),
                        'temp_id': temp[1],
                        'day_id': (day_id + 1)
                    },
                    dataType: 'json',
                    success: function (liste) {
                        var data = {
                            veri: liste.excersizeList,
                            temp_index: temp[2],
                            temp_id: temp[1],
                            day_id: day_id,
                            days: days
                        }
                        $("#dinamik-alan" + temp[2]).html(_.template(excersizeTable, data));
                    }
                });
            },
            olcu_sil: function (e) {
                var olcu_id = $(e.currentTarget).attr('data-dgr');
                var id = $.cookie(constants.user);
                $.ajax({
                    type: 'GET',
                    url: '/api/services/deleteUserSizeById',
                    headers: {
                        'kalori_token': $.cookie(constants.token_name),
                        'olcu_id': olcu_id,
                        'k_id': id
                    },
                    dataType: 'json',
                    success: function (liste) {
                        $("#" + olcu_id).remove();
                    }
                });
            }
        });

        function excersizeProgram() {
            if ($.cookie(constants.kalori_token) && ($.cookie(constants.user))) {
                var id = $.cookie(constants.user);
                $.ajax({
                    type: 'GET',
                    url: '/api/services/userinformation',
                    headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id},
                    success: function (data) {

                        var isim = data.user[0].isim;
                        var soyisim = data.user[0].soyisim;
                        var salon_adi = data.salon[0].isim;
                        var veri = {
                            isim_soyisim: isim + " " + soyisim,
                            salon_adi: salon_adi
                        };
                        $('.container').show(0);
                        $(".icerik").html(_.template(profileTemplate, veri));
                        //egzersiz templateleri getiriliyor
                        $.ajax({
                            type: 'GET',
                            url: '/api/services/getExcersizeListByUser',
                            headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id, "user_id": id},
                            dataType: 'json',
                            success: function (liste) {
                                var data = {
                                    liste: liste.excersizeList,
                                    currentExcersize: liste.currentExcersize
                                };
                                $("#dinamik-icerik").html(_.template(excersizeTemplate, data));
                            }
                        });
                    }
                });

            } else {
                window.location = constants.hash;
            }
        }

        function egzersizProgramiGir() {
            $("#dinamik-icerik").html("");
            $.ajax({
                type: 'GET',
                url: '/api/services/getAllExcersizeTemplate',
                headers: {'kalori_token': $.cookie(constants.token_name)},
                dataType: 'json',
                success: function (liste) {
                    var data = {
                        veri: liste.excersizeTemplateList
                    }
                    $("#dinamik-icerik").html(_.template(egzersizGir, data));
                }
            });
        }

        function getEgzersizByDate(tarih, liste) {
            var id = $.cookie(constants.user);
            $.ajax({
                type: 'POST',
                url: '/api/services/getEgzersizByDate',
                data: {'tarih': tarih},
                headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id, "user_id": id},
                dataType: 'json',
                success: function (veri) {
                    var data = {
                        liste: liste.dateList,
                        veri: veri
                    };
                    $("#dinamik-icerik").html(_.template(yapEgzLisTemplate, data));
                },
                error: function () {
                    alert("bir hata oluştu");
                }
            });
        }

        //başka tarihteki data istenince sadece geçerli divdeki datalar değişecek
        function getEgzersizByDateOnlyData(tarih) {
            var id = $.cookie(constants.user);
            $.ajax({
                type: 'POST',
                url: '/api/services/getEgzersizByDate',
                data: {'tarih': tarih},
                headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id, "user_id": id},
                dataType: 'json',
                success: function (veri) {
                    var data = {
                        veri: veri.egzersizList
                    };
                    $("#yap-egz-data-list").html(_.template(yapEgzDataList, data));
                },
                error: function () {
                    alert("bir hata oluştu");
                }
            });
        }

        //kullanıcı için girilmiş diyet programlarını listeler
        function diyetProgramiGetir() {
            if ($.cookie(constants.kalori_token) && ($.cookie(constants.user))) {
                var id = $.cookie(constants.user);
                $.ajax({
                    success: function (data) {
                        //diyet templateleri getiriliyor
                        $.ajax({
                            type: 'GET',
                            url: '/api/services/getDiyetListByUser',
                            headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': id, "user_id": id},
                            dataType: 'json',
                            success: function (liste) {
                                var data = {
                                    liste: liste.diyetList,
                                    currentDiyet: liste.currentDiyet
                                };
                                $("#dinamik-icerik").html(_.template(diyetlerTemplate, data));
                            }
                        });
                    }
                });

            } else {
                window.location = constants.hash;
            }
        }

        function kullaniciyaTemplateAta(api) {
            var bas_tarihi = $("#inputBasTarihi").val();
            var bit_tarihi = $("#inputBitTarihi").val();
            var program = $(":selected").attr('data-dgr');
            var user_id = $.cookie(constants.user);

            if (bas_tarihi < moment().format('YYYY-MM-DD')) {
                $("#feedback-panel").text("Başlangıç tarihi bugünden itibaren başlayabilir").css("color", "red").hide().show(300);
            } else if (bit_tarihi < bas_tarihi) {
                $("#feedback-panel").text("Bitiş tarihi başlangıç tarihinden sonra olmalıdır...").css("color", "red").hide().show(300);
            } else if (program == null || program == "") {
                $("#feedback-panel").text("Lütfen program seçiniz").css("color", "red").hide().show(300);
            } else {
                $.ajax({
                    type: 'GET',
                    url: '/api/services/' + api,
                    headers: {
                        'kalori_token': $.cookie(constants.token_name),
                        "bas_tarihi": bas_tarihi,
                        "bit_tarihi": bit_tarihi,
                        "program": program,
                        "k_id": user_id
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res) {
                            $("#feedback-panel").text("Kayıt işlemi başarılı").css("color", "green").hide().show(300);
                            $("#inputBasTarihi").val(moment().subtract(1, 'days').format('YYYY-MM-DD'));
                            $("#inputBitTarihi").val(moment().format('YYYY-MM-DD'));
                        } else {
                            $("#feedback-panel").text("Bir hata oluştu").css("color", "red").hide().show(300);
                        }
                    }
                });
            }
        }

        function isIntAndIsNotNull(dizi, dizi2) {

            var er = /^-?[0-9]+$/;

            for (var i = 1; i < dizi.length + 1; i++) {
                console.log(dizi[dizi2[i]]);
                if (dizi[dizi2[i]]) {
                    console.log("1")
                    return false;
                }
                if (dizi[dizi2[i]] == "") {
                    console.log("2")
                    return false;
                }
                if (!er.test(dizi[dizi2[i]])) {
                    console.log("3")
                    return false;
                }
                if (dizi[dizi2[i]] == null) {
                    console.log("4")
                    return false;
                }
            }
            console.log("true ya girdi")
            return true;
        }
    }
);