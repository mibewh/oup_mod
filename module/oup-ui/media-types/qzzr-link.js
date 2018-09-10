define(function (require, exports, module) {

    var Registry = require("medialink-builder/medialink-registry");
    var MediaLinkBuilder = require("medialink-builder/medialink-builder");

    return Registry.registerMediaLinkClass(MediaLinkBuilder.extend({

        /**
         * @override
         */
        getSchema: function () {
            return {
                "data-iframe-title": {
                    "type": "string"
                }
            };
        },

        /**
         * @override
         */
        getOptions: function () {
            return {
                "data-iframe-title": {
                    "type": "text",
                    "label": "Title",
                    "default": ""
                }
            };
        },

        /**
         * @override
         */
        generateLink: function (control, template, callback) {
            var el = MediaLinkBuilder.prototype.generateLink(control, template, callback);
            var mediaId = control.childrenByPropertyId["mediaId"].getValue();
            var iframeTitle = el[0].dataset.iframeTitle ? el[0].dataset.iframeTitle : "";

            var div = document.createElement('div');
            div.className = "quizz-container";
            div.setAttribute("data-width", "100%");
            div.setAttribute("data-height", "auto");
            div.setAttribute("data-iframe-title", iframeTitle);
            div.setAttribute("data-quiz", mediaId);
            el[0] = div;

            var div2 = document.createElement('div');
            div2.className = "quizz-script";
            div2.innerHTML = "<script src=\"//dcc4iyjchzom0.cloudfront.net/widget/loader.js\" async></script>";
            el.push(div2);

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