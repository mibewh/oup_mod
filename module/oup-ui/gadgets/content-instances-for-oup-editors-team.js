define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var ContentInstancesList = require("app/gadgets/project/content/content-instances");
    var OneTeam = require("oneteam");
    var TemplateHelperFactory = require("template-helper");

    return Ratchet.GadgetRegistry.register("content-instances-for-oup-editors-team", ContentInstancesList.extend({

        configureDefault: function()
        {
            this.base();

            this.config({

                //to include the checkbox in the content by page you could remove the below line
                "checkbox": false,
                "actions" : true,
                "selectorGroups": {
                    "multi-documents-action-selector-group": {
                        "actions": [{
                            "action": "delete-content",
                            "order": 100,
                            "_allowPermission": [
                                "delete"
                            ]
                        }, {
                            "action": "edit-content",
                            "order": 200,
                            "_allowPermission": [
                                "update"
                            ]
                        }, {
                            "action": "start-workflow",
                            "order": 300,
                            "_allowAuthority": [
                                "collaborator",
                                "contributor",
                                "editor",
                                "manager"
                            ]
                        }]
                    },
                    "sort-selector-group": {
                        "fields": [{
                            "key": "title",
                            "title": "Title",
                            "field": "title"
                        }, {
                            "key": "description",
                            "title": "Description",
                            "field": "description"
                        }, {
                            "key": "createdOn",
                            "title": "Created On",
                            "field": "_system.created_on.ms"
                        }, {
                            "key": "createdBy",
                            "title": "Created By",
                            "field": "_system.created_by"
                        }, {
                            "key": "modifiedOn",
                            "title": "Modified On",
                            "field": "_system.modified_on.ms"
                        }, {
                            "key": "modifiedBy",
                            "title": "Modified By",
                            "field": "_system.modified_by"
                        }, {
                            "key": "size",
                            "title": "Size",
                            "field": "_system.attachments.default.length"
                        }]
                    },
                    "single-document-action-selector-group": {
                        "actions": []
                    }
                },
                "loader": "gitana",

                //to include the selected dropdown, you could remove the following line
                "removeSelectedButton": true
            });
        },

        setup: function()
        {
            this.get("/projects/{projectId}/content", this.index);
            this.get("/projects/{projectId}/content/{qname}", this.index);
        },

        entityTypes: function()
        {
            return {
                "plural": "content instances",
                "singular": "content instance"
            }
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                TemplateHelperFactory.create(self, "content-instances", function(err, renderTemplate) {

                    model.renderTemplate = renderTemplate;

                    callback();
                });
            });
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // set up observables
                var refreshHandler = self.refreshHandler(el);

                // when the selected content type changes, we refresh
                self.subscribe("selected-content-type", refreshHandler);

                callback();

            });
        },

        checkPermission: function(observableHolder, permissionedId, permissionId, item)
        {
            var result = this.base(observableHolder, permissionedId, permissionId, item);

            // should we do a capabilities check?
            if (item.category === "capabilities-check")
            {
                result = false;

                var descriptor = observableHolder.observable("selected-content-type").get();
                if (descriptor && descriptor.capabilities)
                {
                    if (permissionId === "create_subobjects")
                    {
                        permissionId = "create";
                    }

                    result = descriptor.capabilities.contains(permissionId);
                }
            }

            return result;
        },

        afterSwap: function(el, model, originalContext, callback)
        {
            var self = this;

            this.base(el, model, originalContext, function() {

                TemplateHelperFactory.afterRender(self, el);

                // hide create button if nothing selected
                var descriptor = self.observable("selected-content-type").get();
                if (!descriptor)
                {
                    $(".btn.list-button-create-content").hide();
                }

                callback();
            });
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            pagination.paths = true;

            model.pagination = pagination;

            var project = self.observable("project").get();

            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title", "description"]);
            }

            if (!query)
            {
                query = {};
            }

            OneTeam.projectBranch(self, function() {

                // selected content type
                var selectedContentTypeDescriptor = self.observable("selected-content-type").get();
                if (!selectedContentTypeDescriptor)
                {
                    // produce an empty node map
                    return callback(new Gitana.NodeMap(this));
                }

                query._type = selectedContentTypeDescriptor.definition.getQName();

                this.queryNodes(query, pagination).then(function() {
                    callback(this);
                });
            });
        },

        linkUri: function(row, model, context)
        {
            // var projectId = context.tokens["projectId"];

            // return "#/projects/" + projectId + "/documents/" + row["_doc"];

            var uri = null;

            if (row.isContainer())
            {
                // folder
                uri = OneTeam.linkUri(this, row, "browse");
            }
            else
            {
                // file
                uri = OneTeam.linkUri(this, row);
            }

            return uri;
        },

        iconUri: function(row, model, context)
        {
            return OneTeam.iconUriForNode(row);
        },

        columnValue: function(row, item, model, context)
        {
            var self = this;

            var project = self.observable("project").get();

            var value = this.base(row, item, model, context);

            row.pagination = model.pagination;

            if (item.key === "titleDescription") {

                value = model.renderTemplate(row);
            }

            return value;
        }

    }));

});