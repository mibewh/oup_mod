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
            el[0].className = "videoContainer";
            
            var iframe = document.createElement('iframe');
            iframe.setAttribute("src", "https://players.brightcove.net/1611106596001/default_default/index.html?videoId=" + control.childrenByPropertyId["mediaId"].getValue());
            iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("webkitallowfullscreen", "");
            iframe.setAttribute("mozallowfullscreen", "");
            iframe.frameBorder = 0;
            iframe.setAttribute("allow", "encrypted-media");
            el[0].innerHTML = iframe.outerHTML;

            callback(null, el);
        },

        /**
         * @override
         */
        canHandle: function (mediaType) {
            return mediaType == "brightcove";
        }

    }));

});