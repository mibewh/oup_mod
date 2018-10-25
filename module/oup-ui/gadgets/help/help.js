define(function (require, exports, module) {

    var html = require("text!./help.html");
    var Empty = require("ratchet/dynamic/empty");

    var UI = require("ui");

    return UI.registerGadget("help", Empty.extend({

        TEMPLATE: html,

        setup: function () {
            this.get("/help", this.index);
        },

        prepareModel: function (el, model, callback) {

            this.base(el, model, function () {
                model.title = "Hello World!";
                callback();
            });

        },

        afterSwap: function (el, model, context, callback) {
            var self = this;
            this.base(el, model, context, function () {
                callback();
            });
        }

    }));

});