/**
 *  This is a script to customize the order of elements in the Journal Site Folder
 *
 */

define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");
    var OneTeam = require("oneteam");

    var TemplateHelperFactory = require("template-helper");

    return Ratchet.GadgetRegistry.register("journal-site-folder", DocumentsList.extend({

        setup: function()
        {

            this.get("/projects/{projectId}/documents/{documentId}/browse", this.index);
        },

        configureDefault: function()
        {
            this.base();

            this.config({
                "columns": [{
                "key": "titleDescription",
                "title": "Document"
                }],
                "loader": "remote",
                "checkbox": true,
                "actions": true
            });
        },

        doRemoteQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title", "description"]);
            }

            if (!query)
            {
                query = {};
            }
            var config = {
                "type": "a:child",
                "direction": "OUTGOING"
            };

            var settings = self.observable("oneteamUserSettings").get();
            if (settings)
            {
                var hideSystemFolders = settings["hideSystemFolders"];
                if (hideSystemFolders)
                {
                    // filter out any nodes that are tagged as system folders
                    query = {
                        "$and": [query, {
                            "_features.f:system-folder.enabled": {
                                "$ne": true
                            }
                        }]
                    };

                    // if we're at root node, also filter out "System" and "Templates" and "Definitions" folders
                    var rootNode = self.observable("rootNode").get();
                    if (rootNode && rootNode.getId() === node.getId())
                    {
                        query["$and"].push({
                            "title": {
                                "$ne": "System"
                            }
                        });
                        query["$and"].push({
                            "title": {
                                "$ne": "Templates"
                            }
                        });
                        query["$and"].push({
                            "title": {
                                "$ne": "Definitions"
                            }
                        });
                    }
                }
            }

            var node = model.node;

            var homePageList = [];
            var secondaryPageList = [];
            var containerItemsList = [];
            var imageLibraryList = [];
            var documentLibraryList = [];

            Chain(node).queryRelatives(query, config, pagination).each(function() {

                if(this.getTypeQName() == "type:journalhomepage0")
                {
                    homePageList.push(this);
                }
                if (this.getTypeQName() == "type:secondarypagesfolder0")
                {
                    secondaryPageList.push(this);
                }
                if (this.getTypeQName() == "type:containeritemsfolder0")
                {
                    containerItemsList.push(this);
                }
                if (this.getTypeQName() == "type:imagelibraryfolder0")
                {
                    imageLibraryList.push(this);
                }
                if (this.getTypeQName() == "type:documentlibraryfolder0")
                {
                    documentLibraryList.push(this);
                }

            }).then(function() {
                var list =[];

                var result = {
                    "rows": []
                };
                list.push(homePageList, secondaryPageList, containerItemsList, imageLibraryList, documentLibraryList);

                for( var i =0; i <list.length; i++)
                {
                    result.rows.push(list[i][0]);
                }
                callback(result);
            });

        },

        columnValue: function(row, item, model, context)
        {
            var self = this;

            var project = self.observable("project").get();

            var value = this.base(row, item, model, context);

            row.pagination = model.pagination;

            if (item.key === "titleDescription")
            {
                value = model.renderTemplate(row);
            }
            else if (item.key === "indicators")
            {
                value = OneTeam.buildNodeIndicators(row, definition, project, self);
            }

            return value;
        },

        linkUri: function(row, model, context)
        {
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

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                // allow for some buttons to be filtered out using "remove"
                var document = self.observable("document").get();
                if (document) {
                    var configuredButtons = OneTeam.configEvalArray(document, "documents-list-buttons", self, true);
                    self.spliceRemovedButtons(model.buttons, configuredButtons);
                }

                // make sure this is loaded
                OneTeam.project2ContentTypes(self, false, function(contentTypeEntries, definitionsMap) {

                    model.definitions = {};
                    for (var qname in definitionsMap) {
                        model.definitions[qname] = definitionsMap[qname];
                    }

                    model.path = self.observable("path").get();

                    OneTeam.projectNode(self, "root", model.path, function() {

                        model.node = this;

                        // adjust the "Rules" button (if it is there) so that it shows the # of rules wired to the folder
                        // only if the # of rules > 0
                        var stats = model.node.stats();
                        if (stats)
                        {
                            var ruleCount = stats["a:has_behavior_OUTGOING"];
                            if (ruleCount > 0)
                            {
                                for (var i = 0; i < model.buttons.length; i++)
                                {
                                    if (model.buttons[i].key === "view_rules")
                                    {
                                        model.buttons[i].title += " (" + ruleCount + ")";
                                    }
                                }
                            }
                        }

                        TemplateHelperFactory.create(self, "documents-page", function(err, renderTemplate) {


                            model.renderTemplate = renderTemplate;

                            callback();
                        });

                    });
                });
            });
        }
    }));

});