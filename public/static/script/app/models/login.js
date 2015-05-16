define(['backbone',
    'util/constants'],
    function(Backbone,constants) {

        var Login = Backbone.Model.extend({
            urlRoot: constants.login_res
        })

        return {
            Login: Login
        };

    }
);