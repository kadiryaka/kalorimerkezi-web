define(['jquery',
        'backbone',
        'i18next',
        'text!template/sifredegistir/sifre.html',
        'text!template/sporcular/dashboard.html',
        'util/constants',],
    function ($, Backbone, i18n, sifreTemplate, dashboardTemplate, constants) {

        return Backbone.View.extend({
            el: $('.login'),
            initialize: function () {

            },
            render: function () {
                $('.container').hide(0);
                $(".login").html();
                $("html").i18n();
            },
            events: {}
        });

    }
);