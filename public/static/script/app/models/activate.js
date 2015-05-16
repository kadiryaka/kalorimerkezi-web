define(['backbone',
        'util/constants'],
    function(Backbone,constants) {

        var Activate = Backbone.Model.extend({
            urlRoot: constants.activate_res
        })

        return {
            Activate: Activate
        };

    }
);