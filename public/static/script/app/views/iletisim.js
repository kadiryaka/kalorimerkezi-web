define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/iletisim/iletisim.html',
        'util/constants',
        'model/logout',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, iletisimTemplate, constants) {

        return Backbone.View.extend({
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                $("#error-div").hide();
                if ($.cookie(constants.token_name)) {
                    $('.container').show(0);
                    $(".icerik").html(_.template(iletisimTemplate));
                } else {
                    window.location = constants.hash;
                }

            },
            events: {}
        });

    }
);