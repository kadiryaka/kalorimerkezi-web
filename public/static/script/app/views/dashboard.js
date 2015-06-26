define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/dashboard.html',
        'text!template/table.html',
        'util/constants',
        'model/logout',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, dashboardTemplate, tableTemplate, constants, logoutMdl) {

        var checkControl = true;
        var k_id = -1;

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
                data: {'durum' : val},
                headers: {'kalori_token': $.cookie(constants.token_name), 'k_id': k_id},
                dataType: 'json',
                success: function (veri) {
                    $("#feedback-panel").text("Kullanıcı durumu başarıyla değiştirildi").css("color", "green").toggle(1000).toggle(1000);
                },
                error: function () {
                    alert("bir hata oluştu");
                }
            });
        });

        //arama inputundayken entera basılması
        $('body').on('keyup','#ara_input', function (e) {
            if(e.keyCode == 13)
            {
                sporcuAra();
            }
        });

        //saydalama da tıklanıldığı zaman
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
                data: {'ad': kriter, 'checkControl' : checkControl},
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
            if(id == undefined || id == "-1") {

            } else {
                $.cookie(constants.user, id);
                window.location = constants.hash + constants.user + "/profile";
            }
        });

        //dashboard açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function () {
                $("#user_name_index").text(" "+$.cookie(constants.cookie_username));
            },
            render: function () {
                $("#error-div").hide();
                if ($.cookie(constants.token_name)) {
                    $.ajax({
                        type: 'POST',
                        url: '/api/user/getUserList',
                        headers: {'kalori_token': $.cookie(constants.token_name)},
                        data : {'checkControl' : checkControl},
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
                "click #sporcu_ara": "sporcu_ara"
            },
            sporcu_ara: function () {
                sporcuAra();
            }
        });

        function sporcuAra () {
            var ad = $("#ara_input").val();
            $.ajax({
                type: 'POST',
                url: '/api/user/getUserListForSearch',
                headers: {'kalori_token': $.cookie(constants.token_name)},
                data: {'ad': ad, 'checkControl' : checkControl},
                success: function (response) {
                    var page = 0;
                    var userSize = constants.page_size;
                    console.log("response.sayi = " + response.sayi);
                    console.log ("islem = " + Math.ceil((response.sayi / constants.page_size)));
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