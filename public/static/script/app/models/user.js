define(['backbone',
    'util/constants'],
    function(Backbone,constants) {

        var User = Backbone.Model.extend({
            idAttribute: "username",
            urlRoot: constants.user_res
        })

        return {
            User: User
        };

    }
);