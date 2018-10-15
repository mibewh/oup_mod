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
            var dataIframeTitle = control.childrenByPropertyId["Qzzr"] && control.childrenByPropertyId["Qzzr"].getValue()["data-iframe-title"] ?
                control.childrenByPropertyId["Qzzr"].getValue()["data-iframe-title"] : "";

            el.attr("class", "quizz-container");
            el.attr("data-width", "100%");
            el.attr("data-height", "auto");
            el.attr("data-iframe-title", dataIframeTitle);
            el.attr("data-quiz", mediaId);

            var script = document.createElement('script');
            script.setAttribute("src", "//dcc4iyjchzom0.cloudfront.net/widget/loader.js");
            script.async = "async";
            el.push(script);

            callback(null, el);
        },

        /**
         * @override
         */
        canHandle: function (mediaType) {
            return mediaType == "qzzr";
        }

    }));

});