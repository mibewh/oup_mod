
define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");
    var OneTeam = require("oneteam");

    return Ratchet.GadgetRegistry.register("all-journals-list", DocumentsList.extend({

        setup: function()
        {

            this.get("/projects/{projectId}/documents/{documentId}/browse", this.index);
        },

        doclistDefaultConfig: function()
        {
            var config = this.base();
            config.columns = [];
            config.chrome = false;
            config.loader = "gitana";

            config.removeSelectedButton = true;

            return config;
        },

        configureDefault: function()
        {
            this.base();

            this.config({
                "columns": [{
                    "key": "siteSortname",
                    "title": "Site Name",
                    "sort": true,
                    "sortProperty": "siteSortname"
                }, {
                    "title": "Journal Code",
                    "key": "journalCode",
                    "sort": true,
                    "sortProperty": "siteRouteName"
                }, {
                    "key": "status",
                    "title": "Status",
                    "sort": true,
                    "sortProperty": "sitePublishStatus"
                }, {
                    "key": "modifiedOn",
                    "title": "Last Modified On",
                    "sort": true,
                    "sortProperty": "_system.modified_on.ms"
                }],
                "loader": "gitana",
                "checkbox": true,
                "actions": false,
                "icon": false
            });
        },

        entityTypes: function()
        {
            return {
                "plural": "journals",
                "singular": "journal"
            }
        },

        afterSwap: function(el, model, context, callback)
        {
            var self = this;
            this.base(el, model, context, function() {
                callback();
            });
        },

        getDefaultSortField: function(model)
        {
            return "sortOrder";
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, [
                    "siteRouteName",
                    "siteName"
                ]);
            }

            if (!query)
            {
                query = {};
            }
            query._type = "type:journalsitefolder0";

            pagination.paths = true;

            var branch = self.observable("branch").get();

            Chain(branch).queryNodes(query, pagination).each(function() {

                if(pagination.sort["sortOrder"] != null) {
                    if(this.siteParent!= "Journals") {
                        if(!this.familySite || this.familySite === "N") {
                            this.indent = true;
                        }
                        else {
                            this.indent = false;
                        }
                    }
                    else {
                        this.indent = false;
                    }
                }
            }).then(function () {
                callback(this);
            });

        },

        iconUri: function(row, model, context)
        {
            return null;
        },

        columnValue: function(row, item, model, context)
        {
            var value = "";
            if (item.key === "siteSortname") {
                var project = this.observable("project").get();

                if (row.indent) {
                    value += "<div style= 'padding-left:30px'>";
                }

                value += "<a href='#/projects/" + project._doc + "/documents/" + row._doc + "/browse'>";
                value += "<img src='" + "/oneteam/modules/app/images/doclib/folder-32.png" + "'>" + "</a>";
                value += "<a href='#/projects/" + project._doc + "/documents/" + row._doc + "/browse'>";
                value +=  row.siteSortname;
                value += "</a>";

                return value;
            }

            if (item.key === "journalCode") {
                return row.siteRouteName;
            }

            if (item.key === "status") {
                return row.sitePublishStatus;
            }

            if (item.key === "modifiedOn") {
                return row.getSystemMetadata().getModifiedOn().getTimestamp();
            }

            return value;
        },

        populateSingleDocumentActions: function(row, item, model, context, selectorGroup)
        {
            var self = this;

            /** Include the same actions as the document-list **/
            /*
            var thing = Chain(row);
            var itemActions = OneTeam.configEvalArray(thing, "documents-list-item-actions", self);
            if (itemActions && itemActions.length > 0)
            {
                for (var z = 0; z < itemActions.length; z++)
                {
                    selectorGroup.actions.push(itemActions[z]);
                }
            }
            */

            /** OR... override completely... */
            selectorGroup.actions.length = 0; // clears the array
            selectorGroup.actions.push({
                "key": "edit-document",
                "link": "/#/projects/{{project._doc}}/documents/{{document._doc}}/properties",
                "iconClass": "fa fa-pencil",
                "order": 1000
            });
        }

    }));

});