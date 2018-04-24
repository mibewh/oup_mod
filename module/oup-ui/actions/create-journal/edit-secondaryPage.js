define(function (require, exports, module) {

    var Ratchet = require("ratchet/ratchet");
    var UI = require("ui");
    var $ = require("jquery");

    return Ratchet.Actions.register("edit-secondaryPage", UI.AbstractIFrameAction.extend({

        defaultConfiguration: function () {
            var config = this.base();

            config.title = "Edit Secondary Page";
            config.iconClass = "glyphicon glyphicon-pencil";
            
            // the location of the "overlay app"
            config.src = "https://alb.primary.dev.gcms.the-infra.com/app/edit-page?doc_id=0b81195bbc1450a34d1d";

            // specify iframe width and height
            config.iframeWidth = "640px";
            config.iframeHeight = "512px";

            return config;
        }

    }));
});





