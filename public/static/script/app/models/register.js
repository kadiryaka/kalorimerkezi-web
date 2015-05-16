define(['backbone',
    'util/constants'],
    function(Backbone,constants) {

        var Register = Backbone.Model.extend({
            urlRoot: constants.register_res
        })

        return {
            Register: Register
        };

    }
);