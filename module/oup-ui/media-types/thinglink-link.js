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

            var img = document.createElement('img');
            img.src = "//cdn.thinglink.me/api/image/" + mediaId + "/1024/10/scaletowidth#tl-" + mediaId + ";";
            img.alt = "";
            img.style = "max-width: 100%;";
            img.className = "alwaysThinglink";
            
            var div = document.createElement('div');
            div.innerHTML = "<script async charset=\"utf-8\" src=\"//cdn.thinglink.me/jse/embed.js\"></script>";
            
            img.appendChild(div);
            el[0] = img;
            el.push(div);

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