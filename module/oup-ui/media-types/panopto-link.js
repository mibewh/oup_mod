define(function (require, exports, module) {

    var Registry = require("medialink-builder/medialink-registry");
    var MediaLinkBuilder = require("medialink-builder/medialink-builder");

    return Registry.registerMediaLinkClass(MediaLinkBuilder.extend({

        /**
         * @override
         */
        getSchema: function () {
            return {
                "width": {
                    "type": "string"
                },
                "height": {
                    "type": "string"
                },
                "frameborder": {
                    "type": "string",
                    "enum": ["0", "1", "2"]
                }
            };
        },

        /**
         * @override
         */
        getOptions: function () {
            return {
                "width": {
                    "type": "text",
                    "label": "Width",
                    "default": "640"
                },
                "height": {
                    "type": "text",
                    "label": "Height",
                    "default": "360"
                },
                "frameborder": {
                    "type": "select",
                    "label": "Frame Border"
                }
            };
        },

        /**
         * @override
         */
        generateLink: function (control, template, callback) {

            var el = MediaLinkBuilder.prototype.generateLink(control, template, callback);
            var mediaId = control.childrenByPropertyId["mediaId"].getValue();

            el[0].src = "https://oup.cloud.panopto.eu/Panopto/Pages/EmbeddedList.aspx?embedded=1&folderID=" + mediaId;
            
            callback(null, el);
        },

        /**
         * @override
         */
        canHandle: function (mediaType) {
            return mediaType == "panopto";
        }

    }));

});