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
            config.src = "https://alb.primary.dev.gcms.the-infra.com/app/create-page";
            
            // specify iframe width and height
            config.iframeWidth = "100%";
            config.iframeHeight = "800px";

            return config;
        },
        
        /* This method is called every time the action runs and can customize the config per invocation */
        beforeExecute: function(config, actionContext)
        {
            // always call the base method
            this.base(config, actionContext);
            
            // add parameters to query string
            var parameters = {};
            parameters["username"] = actionContext.observable("user").get().name;
            
            this.appendToQueryString(config, parameters);
        }         

    }));
});

