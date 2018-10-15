define(function (require, exports, module) {

    var Registry = require("medialink-builder/medialink-registry");
    var MediaLinkBuilder = require("medialink-builder/medialink-builder");

    return Registry.registerMediaLinkClass(MediaLinkBuilder.extend({

        /**
         * @override
         */
        getSchema: function () {
            return {};
        },

        /**
         * @override
         */
        getOptions: function () {
            return {};
        },

        /**
         * @override
         */
        generateLink: function (control, template, callback) {
            var el = MediaLinkBuilder.prototype.generateLink(control, template, callback);
            el.attr("src", "https://players.brightcove.net/1611106596001/default_default/index.html?videoId=" + control.childrenByPropertyId["mediaId"].getValue());
            el.attr("allowfullscreen", "");
            el.attr("webkitallowfullscreen", "");
            el.attr("mozallowfullscreen", "");
            el.attr("frameBorder", "0");
            el.attr("allow", "encrypted-media");

            var wrap = $("<div/>");
            wrap.attr("class", "videoContainer");
            wrap.append(el);

            callback(null, wrap);
        },

        /**
         * @override
         */
        canHandle: function (mediaType) {
            return mediaType == "brightcove";
        }

    }));

});