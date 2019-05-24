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
            var height = control.childrenByPropertyId["SurveyGizmo Reader Poll"] && control.childrenByPropertyId["SurveyGizmo Reader Poll"].getValue()["height"] ?
                control.childrenByPropertyId["SurveyGizmo Reader Poll"].getValue()["height"] : "";

            el.attr("src", "https://www.surveygizmo.com/s3/" + mediaId);
            el.attr("width", "550");
            el.attr("height", height);
            el.attr("frameborder", "0");

            callback(null, el);
        },

        /**
         * @override
         */
        canHandle: function (mediaType) {
            return mediaType == "surveygizmo";
        }

    }));

});