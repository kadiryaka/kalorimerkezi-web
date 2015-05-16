require(['jquery',
        'backbone',
        'app/router',
        'i18next',
        'view/language',
        'util/constants',
        'text!template/common/error.html',
        'jquery.cookie',
        'moment',
        'jquery.ui',
        'jquery.easing',
        'notify'],
    function ($, Backbone, Router,i18n,language,constants,errorTemplate) {

        Backbone.View.prototype.close = function() {
            this.undelegateEvents();
        };

        var options = {
            resGetPath  : "static/langs/__lng__.json",
            preload     : ["tr","en"],
            fallbackLng : false
        };

        if(!$.cookie("i18next")) {
            i18n.setLng('tr', {fixLng:true}, function(tr) {});
        }

        new language(); // langView Init

        i18n.init(options, function(t){
            $("html").i18n();
        });

        moment.lang(options.lng);

        /*

         for@pushState

         -----------------

         $("body").on("click","a:not(a[data-bypass])",function(e){
         e.preventDefault();
         var href = $(this).attr("href");
         Backbone.history.navigate(href,true);
         });

         */

        var router = new Router();

        // "boktan token" protect system
        var customSync = function(method, model, options) {
            var success = options.success;
            var error   = options.error;

            options.success = function(resp, status, xhr) {
                if(resp.message=="yanlış token") {
                    $.removeCookie(constants.token_name);
                    window.location = "#";
                }
                success(resp, status, xhr);
            };

            options.beforeSend = function(xhr) {
                var token = $.cookie(constants.token_name);
                if (token) {
                    xhr.setRequestHeader(constants.token_name, token);
                }
            };

            Backbone.sync(method, model, options);
        };

        Backbone.Model.prototype.sync = customSync;

        Backbone.history.start();
        // Backbone.history.start({root: "/", pushState: true});

    }
);