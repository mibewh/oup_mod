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
                "loader": "gitana",
                "checkbox": true,
                "actions": true
            });
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
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

            self.base(context, model, searchTerm, query, pagination, function(queryResult) {
                Chain(queryResult).then(function() {

                    this.each(function() {

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
        
                        if(homePageList.length > 0)
                        {
                            list.push(homePageList);
                        }
        
                        if(secondaryPageList.length > 0)
                        {
                            list.push(secondaryPageList);
                        }
        
                        if(containerItemsList.length > 0)
                        {
                            list.push(containerItemsList);
                        }
        
                        if(imageLibraryList.length > 0)
                        {
                            list.push(imageLibraryList);
                        }
        
                        if(documentLibraryList.length > 0)
                        {
                            list.push(documentLibraryList);
                        }
        
                        for( var i =0; i <list.length; i++)
                        {
                            result.rows.push(list[i][0]);
                        }

                        var branch = node.getBranch();
                        var map = branch.getFactory().nodeMap(branch, {});
                        map.handleResponse(result);

                        callback(map);
                    });
                });
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
            this.base(el, model, callback);
        }
    }));

});