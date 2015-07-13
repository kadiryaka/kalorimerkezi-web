define(['jquery',
        'backbone',
        'underscore',
        'i18next',
        'model/user',
        'text!template/common/error.html',
        'util/constants',
        'model/logout',
        'jquery.cookie'],
    function ($, Backbone, _, i18n, User, errorTemplate, constants) {
        return Backbone.View.extend({
            el: $('.icerik'),
            initialize: function () {
                $("#user_name_index").text(" " + $.cookie(constants.cookie_username));
            },
            render: function () {
                $('.container').hide(0);
                $("#error-div").show();
                $('#error-div').html(_.template(errorTemplate));
            },
            events: {}

        });

    }
);
