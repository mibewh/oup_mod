define(function (require, exports, module) {

    var Registry = require("medialink-builder/medialink-registry");
    var MediaLinkBuilder = require("medialink-builder/medialink-builder");

    return Registry.registerMediaLinkClass(MediaLinkBuilder.extend({

        /**
         * @override
         */
        getSchema: function () {
            return {

            };
        },

        /**
         * @override
         */
        getOptions: function () {
            return {

            };
        },

        /**
         * @override
         */
        generateLink: function (control, template, callback) {
            var el = MediaLinkBuilder.prototype.generateLink(control, template, callback);
            var mediaId = control.childrenByPropertyId["mediaId"].getValue();

            el[0].className = "alwaysThinglink";
            el.attr("src", "//cdn.thinglink.me/api/image/" + mediaId + "/1024/10/scaletowidth#tl-" + mediaId + ";");
            el.attr("alt", "");
            el.attr("style", "max-width: 100%;");
            

            var script = document.createElement('script');
            script.src = "//cdn.thinglink.me/jse/embed.js";
            script.charset = "utf-8";
            script.async = "async";
            el.push(script);

            callback(null, el);
        },

        /**
         * @override
         */
        canHandle: function (mediaType) {
            return mediaType == "thinglink";
        }

    }));

});