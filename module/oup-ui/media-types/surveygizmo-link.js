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

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = "document.write(\"<scr\"+\"ipt type=\\\"text/javascript\\\" src=\\\"//www.surveygizmo.com/s3/polljs/" + mediaId + "-FO03Z66RCRN2MA8KS90KT8I9KL9IBK?cookie=\"+document.cookie.match(/sg-response-" + mediaId + "/gi)+\"\\\"></scr\"+\"ipt>\")";
            el[0] = script;

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