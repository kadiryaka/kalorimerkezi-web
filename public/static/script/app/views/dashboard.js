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
    function($,Backbone,_,i18n,User,dashboardTemplate,tableTemplate, constants,logoutMdl) {

        //saydalama da tıklanıldığı zaman
        $('body').on('click','.sayfalama-a', function() {
            console.log("sayfalama çalıştı");
            var pageCount = $(this).attr('data-page');
            $.ajax({
                type: 'GET',
                url: '/api/user/userList/'+pageCount,
                headers: { 'kalori_token' : $.cookie(constants.token_name)},
                success: function(response) {
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
                        users : response.result,
                        salon : $.cookie(constants.cookie_username),
                        page  : page,
                        userSize : userSize,
                        currentPage : pageCount,
                        totalUser : response.sayi
                    };
                    $('.content').empty();
                    $(".content").html(_.template(tableTemplate , data));
                }
            });

        });

        //kullanıcı seçildiği zaman
        $('body').on('click','#users-table tr', function (e) {
            console.log("kullanıcıya basıldı");
            var id = $(this).attr('data-id');
            console.log(id);
            $.cookie(constants.user, id);
            window.location = constants.hash+constants.user+"/profile";
        });

        //dashboard açılırken burası çalışıyor
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function(){
            },
            render: function(){
                $("#error-div").hide();
                if($.cookie(constants.token_name)) {
                    $.ajax({
                        type: 'GET',
                        url:  '/api/user/userList',
                        headers: { 'kalori_token' : $.cookie(constants.token_name)},
                        success: function(response) {
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
                                console.log("page : " +page + "page : " + response.sayi) ;
                            }

                            var data = {
                                users : response.result,
                                salon : $.cookie(constants.cookie_username),
                                page  : page,
                                userSize : userSize,
                                currentPage : 1,
                                totalUser : response.sayi
                            };

                            console.log("çalıştım lan işte");
                            $('.container').show(0);
                            $(".icerik").html(_.template(dashboardTemplate , data));
                            $(".login").html("");
                        }
                    });

                } else {
                    window.location = constants.hash;
                }
            },
            events: {
                "click #egzersiz_ara_buton" : "egzersiz_ara"
            },
            egzersiz_ara : function() {

            }

        });

    }
);