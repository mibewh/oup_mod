define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var Actions = require("ratchet/actions");
    var $ = require("jquery");

    var OneTeam = require("oneteam");

    return Actions.register("add-attachment", Ratchet.AbstractAction.extend({

        defaultConfiguration: function()
        {
            var config = this.base();

            config.title = "Add Attachment";
            config.iconClass = "glyphicon glyphicon-upload";

            return config;
        },

        execute: function(config, actionContext, callback)
        {
            var self = this;
            var ratchet = actionContext.ratchet;

            var project = actionContext.observable("project").get();
            var document = actionContext.observable("document").get();
            actionContext.listOfAttachmentIds = [];

            var actionsConfig = OneTeam.configEvalArray(actionContext, "actions", actionContext);
            actionContext.idReadonly = actionsConfig["add-attachment"].idReadonly;
            actionContext.helperText = actionsConfig["add-attachment"].helperText;

            Chain(document).listAttachments().each(function() {
                actionContext.listOfAttachmentIds.push(this.getId());
            }).then(function() {
                self.doAction(actionContext, project, document, ratchet, function(err, result) {
                    callback(err, result);
                });    
            });
        },

        doAction: function(actionContext, project, document, ratchet, callback)
        {
            var self = this;

            OneTeam.projectBranch(actionContext, function() {

                var branch = this;

                // modal dialog
                Ratchet.fadeModal({
                    "title": "Add Attachment",
                    "cancel": false
                }, function(div, renderCallback) {

                    // append the "Create" button
                    $(div).find('.modal-footer').append("<button class='btn btn-primary pull-right done'>Done</button>");

                    // body
                    $(div).find(".modal-body").html("");
                    $(div).find(".modal-body").append("<div class='form'></div>");

                    var _form = $(div).find(".form");

                    self.renderAttachmentIdControl(branch, _form, actionContext, function(attachmentControl) {
                        actionContext.attachmentControl = attachmentControl;

                        self.renderUploadControl(branch, _form, actionContext, function(uploadControl) {
                            actionContext.uploadControl = uploadControl;

                            // done button
                            $(div).find(".done").click(function() 
                            {
                                var attachmentId = actionContext.attachmentControl.getValue();
                                var attachmentIdExists = actionContext.listOfAttachmentIds.includes(attachmentId);

                                if (attachmentIdExists) {

                                    var cbProceed = function() {
                                        $(div).on("hidden.bs.modal", function() {
                                            callback();
                                        });
                                        $(div).modal('hide');
                                        return;
                                    };

                                    var showMessageModalConfig = {
                                        "message": "Another attachment of the same ID already exists."
                                    };

                                    OneTeam.showMessageAdvanced(showMessageModalConfig, cbProceed);

                                    return;
                                }

                                $(div).on("hidden.bs.modal", function() {
                                    callback();
                                });
                                $(div).modal('hide');
                            });

                            var onChangeAttachmentId = function() {

                                var attachmentId = actionContext.attachmentControl.getValue();
                                if (attachmentId)
                                {
                                    actionContext.uploadControl.hide();
                                    actionContext.uploadControl.destroy();

                                    self.renderUploadControl(branch, _form, actionContext, function(control) {
                                        actionContext.uploadControl = control;
                                    });
                                }
                            };

                            actionContext.attachmentControl.on("change", onChangeAttachmentId);
                            actionContext.attachmentControl.focus();

                            renderCallback(function() {});
                        });
                    });
                });
            });
        },

        renderAttachmentIdControl: function(branch, div, actionContext, cb)
        {
            var document = actionContext.observable("document").get();

            // form definition
            var c = {
                "schema": {
                    "type": "string",
                    "default": "default"
                },
                "options": {
                    "type": "text",
                    "label": "Attachment ID",
                    "readonly": actionContext.idReadonly
                }
            };

            if (actionContext.attachmentId) {
                c.schema.default = actionContext.attachmentId;
            }

            c.postRender = function(control)
            {
                cb(control);
            };

            var attachmentContainer = $(".attachment-container", div);
            if ($(attachmentContainer).length === 0)
            {
                attachmentContainer = $("<div class='attachment-container'></div>");
                $(div).append(attachmentContainer);
            }

            OneTeam.formCreate(attachmentContainer, c);
        },

        renderUploadControl: function(branch, div, actionContext, cb)
        {
            var attachmentId = actionContext.attachmentControl.getValue().trim();
            var document = actionContext.observable("document").get();

            var nodeUri = "/proxy" + branch.getUri() + "/nodes/" + document.getId();
            var resourceUri = "/proxy" + branch.getUri() + "/nodes/" + document.getId() + "/attachments/" + attachmentId;

            var enhanceFiles = function(fileUploadConfig, data)
            {
                var files = [];

                $.each(data.result.rows, function(index, gitanaResult) {

                    var file = data.files[index];

                    files.push({
                        "name": file.name,
                        "size": file.size,
                        "type": file.type,
                        "url": resourceUri,
                        "thumbnailUrl": nodeUri + "/preview/icon64?attachment=" + attachmentId + "&size=64&mimetype=image/png&force=true",
                        "deleteUrl": resourceUri,
                        "deleteType": "DELETE"
                    });
                });

                data.result.files = files;
            };

            // form definition
            var c = {
                "schema": {
                    "type": "string"
                },
                "options": {
                    "label": "Upload File...",
                    "type": "upload",
                    "multiple": false,
                    "upload": {
                        "url": resourceUri,
                        "method": "POST",
                        "autoUpload": true,
                        "maxFileSize": OneTeam.MAX_UPLOAD_FILE_SIZE,
                        "maxNumberOfFiles": 1,
                        "showSubmitButton": false,
                        "processQueue": []
                    },
                    "enhanceFiles": enhanceFiles,
                    "showUploadPreview": false,
                    "helper": actionContext.helperText
                }
            };

            c.postRender = function(control)
            {
                control.disable();

                if (actionContext.attachmentControl.getValue())
                {
                    control.enable();
                }

                cb(control);
            };

            var filesContainer = $(".files-container", div);
            if ($(filesContainer).length === 0)
            {
                filesContainer = $("<div class='files-container'></div>");
                $(div).append(filesContainer);
            }

            OneTeam.formCreate(filesContainer, c);
        }

    }));

});
