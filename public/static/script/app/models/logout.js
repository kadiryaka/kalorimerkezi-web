define(['backbone',
    'util/constants'],
    function(Backbone,constants) {

        var Logout = Backbone.Model.extend({
            urlRoot: constants.logout_res
        })

        return {
            Logout: Logout
        };
    }

);