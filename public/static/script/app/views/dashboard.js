define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/dashboard.html',
        'text!template/table.html',
        'text!template/user-edit.html',
        'util/constants'],
    function ($, Backbone, _, i18n, User, dashboardTemplate, tableTemplate, userEditTemplate, constants) {

        var checkControl = true;

        $("#diyalog").dialog({
            autoOpen: false,//otomatik açılmayı iptal ediyor
            title: "Kullanıcı Düzenleme",//başlık
            buttons: [
                { text: "Kaydet", click: function() {
                    var name = $("#edit-name").val().trim();
                    var surname = $("#edit-surname").val().trim();
                    var tel = $('#edit-tel').val().trim();
                    var k_id = $('#edit-mail').attr('data-value');
                    if (name == "" || surname == "" || tel == ""
                        || name == undefined || surname == undefined || tel == undefined) {
                        $("#feedback-panel-edit").text("Lütfen bilgileri eksiksiz giriniz").hide().show(300).css("color", "red");
                    } else {
                        $.ajax({
                            type: 'POST',
                            url: '/api/services/editUser',
                            data: {'name': name, 'surname' : surname, 'tel' : tel},
                            headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': k_id},
                            dataType: 'json',
                            success: function (result) {
                                if (result.durum == "success") {
                                    $("#feedback-panel").text("Kullanıcı bilgileri başarıyla değiştirildi").css("color", "green").hide().show(300);
                                } else {
                                    $("#feedback-panel").text("Tamamlanamadı, Hata oluştu").css("color", "red").hide().show(300);
                                }
                            },
                            error: function () {
                                $("#feedback-panel").text("Tamamlanamadı, Hata oluştu").css("color", "red").hide().show(300);
                            }
                        });
                        $(this).dialog("close");
                    }
                }}  ,
                { text: "Kapat", click: function() {
                    $( this ).dialog("close");
                }}],
            draggable: false,//diyalog kutusu taşına bilirliği
            hide: "clip",
            show: "clip",
            /*fold-blind-bounce-clip-drop-explode-fade-highlight-puff-pulsate-scale-shake-slide-size-transfer*/
            resizable: false,//boyutlandırmayı burdan açıp kapata biliriz
            modal: true//arka planı kitler tıklanmaz yapar
        });

        //check tiki değiştirildiğinde tetiklenir
        $('body').on('click', '#checkControl', function () {
            if (checkControl) {
                checkControl = false;
            } else {
                checkControl = true;
            }
        });

        //aktif pasif değiştiğinde tetiklenir
        $('body').on('change', '#durum_combobox', function () {
            var val = $(this).val();
            var k_id = $(this).attr('veri-id');
            $.ajax({
                type: 'POST',
                url: '/api/user/durumuDegistir',
                data: {'durum': val},
                headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': k_id},
                dataType: 'json',
                success: function (veri) {
                    $("#feedback-panel").text("Kullanıcı durumu başarıyla değiştirildi").css("color", "green").hide().show(300);
                },
                error: function () {
                    alert("bir hata oluştu");
                }
            });
        });

        //arama inputundayken entera basılması
        $('body').on('keyup', '#ara_input', function (e) {
            if (e.keyCode == 13) {
                sporcuAra();
            }
        });

        //sayfalama da tıklanıldığı zaman
        $('body').on('click', '.sayfalama-a', function () {
            var pageCount = $(this).attr('data-page');
            var kriter = null;
            var ad = $("#ara_input").val();
            if (ad == undefined || ad == null || ad == "") {
                //
            } else {
                kriter = ad;
            }
            $.ajax({
                type: 'POST',
                url: '/api/user/getUserListForPage/' + pageCount,
                headers: {'kalori_token': $.cookie(constants.token_name)},
                data: {'ad': kriter, 'checkControl': checkControl},
                success: function (response) {
                    var page = 0;
                    var userSize = constants.page_size;
                    if (response.sayi == 0) {
                        userSize = 0;
                    }
                    else if (response.sayi <= constants.page_size) {
                        page = 1;
                        userSize = response.result.length;
                    }
                    else {
                        page = Math.ceil((response.sayi / constants.page_size));
                    }

                    var data = {
                        users: response.result,
                        salon: $.cookie(constants.cookie_username),
                        page: page,
                        userSize: userSize,
                        currentPage: pageCount,
                        totalUser: response.sayi
                    };
                    $(".content").html(_.template(tableTemplate, data));
                }
            });

        });

        //kullanıcı seçildiği zaman
        $('body').on('click', '#users-table tr td', function (e) {
            var id = $(this).attr('data-id');
            if (id == undefined || id == "-1") {

            } else {
                $.cookie(constants.user, id);
                window.location = constants.hash + constants.user + "/profile";
            }
        });

        //dashboard açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                $("#error-div").hide();
                if ($.cookie(constants.token_name)) {
                    $.ajax({
                        type: 'POST',
                        url: '/api/user/getUserList',
                        headers: {'kalori_token': $.cookie(constants.token_name)},
                        data: {'checkControl': checkControl},
                        success: function (response) {
                            var page = 0;
                            var userSize = constants.page_size;
                            if (response.sayi == 0) {
                                userSize = 0;
                            }
                            else if (response.sayi <= constants.page_size) {
                                page = 1;
                                userSize = response.result.length;
                            } else {
                                page = Math.ceil((response.sayi / constants.page_size));
                                console.log("page : " + page + "page : " + response.sayi);
                            }

                            var data = {
                                users: response.result,
                                salon: $.cookie(constants.cookie_username),
                                page: page,
                                userSize: userSize,
                                currentPage: 1,
                                totalUser: response.sayi
                            };
                            $('.container').show(0);
                            $(".icerik").html(_.template(dashboardTemplate, data));
                            $(".login").html("");
                        }
                    });

                } else {
                    window.location = constants.hash;
                }
            },
            events: {
                "click #sporcu_ara": "sporcu_ara",
                "click tr #edit-button": "kullanici_duzenle"
            },
            sporcu_ara: function () {
                sporcuAra();
            },
            kullanici_duzenle: function (e) {
                var k_id = $(e.currentTarget).attr('veri-id');
                $.ajax({
                    type: 'GET',
                    url: '/api/services/userinformationforUser',
                    headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': k_id},
                    success: function (data) {
                        $("#diyalog").html(userEditTemplate);
                        document.getElementById('edit-name').value = data.user[0].isim;
                        document.getElementById('edit-surname').value = data.user[0].soyisim;
                        document.getElementById("edit-mail").value = data.user[0].mail;
                        document.getElementById("edit-mail").setAttribute("data-value", k_id);
                        document.getElementById("edit-tel").value = data.user[0].tel;
                        $("#diyalog").dialog("open");
                    },
                    error: function() {
                        alert("bir hata oluştu");
                    }
                });

            }
        });

        function sporcuAra() {
            var ad = $("#ara_input").val();
            $.ajax({
                type: 'POST',
                url: '/api/user/getUserListForSearch',
                headers: {'kalori_token': $.cookie(constants.token_name)},
                data: {'ad': ad, 'checkControl': checkControl},
                success: function (response) {
                    var page = 0;
                    var userSize = constants.page_size;
                    console.log("response.sayi = " + response.sayi);
                    console.log("islem = " + Math.ceil((response.sayi / constants.page_size)));
                    if (response.sayi == 0) {
                        userSize = 0;
                    } else if (response.sayi <= constants.page_size) {
                        page = 1;
                        userSize = response.result.length;
                    }
                    else {
                        page = Math.ceil((response.sayi / constants.page_size));
                    }

                    var data = {
                        users: response.result,
                        salon: $.cookie(constants.cookie_username),
                        page: page,
                        userSize: userSize,
                        currentPage: 1,
                        totalUser: response.sayi
                    };
                    console.log(response.result);
                    $(".content").html(_.template(tableTemplate, data));
                }
            });
        }
    }
);