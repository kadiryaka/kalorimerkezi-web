define(['jquery',
        'backbone',
        'util/constants',
        'jquery.cookie'],
    function($,Backbone,constants) {

        //çıkışa basıldığı zaman
        var logout = function() {
            console.log("logout'a basıldı");
            $.ajax({
                type : 'GET',
                url  : 'token/logout',
                headers: { 'kalori_token' : $.cookie(constants.token_name)},
                success : function(res) {
                    console.log("logout success döndü");
                    $.removeCookie(constants.token_name);
                    $.removeCookie(constants.cookie_username);
                    window.location.href = constants.hash + constants.login;
                    //window.location.assign(constants.hash);
                }
            });
            //window.location = constants.hash;
        }

        return Backbone.View.extend({
            el: $('.container'),
            initialize: function(){
            },
            render: function(){
                $("#error-div").hide();
                if($.cookie(constants.token_name)) {
                    window.location = constants.hash+"dashboard";
                } else {
                    window.location = constants.hash+"login";
                }
            },
            events: {
                "click #dashboard_logout" : "logout"

            },
            logout: logout
        });

    }
);