define(function (require, exports, module) {

    var Ratchet = require("ratchet/ratchet");
    var UI = require("ui");
    var $ = require("jquery");

    return Ratchet.Actions.register("create-secondaryPage", UI.AbstractIFrameAction.extend({

        defaultConfiguration: function () {
            var config = this.base();

            config.title = "Create Secondary Page";
            config.iconClass = "glyphicon glyphicon-pencil";
            
            // the location of the "overlay app"
            config.src = "http://gcms-editorial-overlay.ii3uwzqhe6.eu-west-1.elasticbeanstalk.com/app/create-page?loc=%2FAll%20Journals%2FTest%20Journal%20Folder%2FSecondary%20Pages%2F";

            return config;
        }

    }));
});

