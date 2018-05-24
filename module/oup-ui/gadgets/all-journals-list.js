
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

            config.removeSortButtons = true;
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
                "icon": true
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

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title", "siteRouteName", "siteName", "templateType", "issn", "description", "raw"]);
            }

            if (!query)
            {
                query = {};
            }
            query._type = "type:journalsitefolder0";

            pagination.paths = true;

             var folder = self.observable("document").get();            
             Chain(folder).queryRelatives(query, {
                 "type": "a:child"
             }, pagination).then(function() {
                 callback(this);
             });            
        },

        columnValue: function(row, item, model, context) {
            var self = this;

            var value = "";

            if (item.key === "siteSortname") {
                var project = self.observable("project").get();
                value += "<a href='#/projects/" + project._doc + "/documents/" + row._doc + "'>";
                value += row.siteSortname;
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
        }

    }));

});