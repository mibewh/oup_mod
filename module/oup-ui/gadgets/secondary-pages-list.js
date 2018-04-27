
define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");
    var OneTeam = require("oneteam");

    return Ratchet.GadgetRegistry.register("secondary-pages-list", DocumentsList.extend({

        setup: function()
        {

            this.get("/projects/{projectId}/documents/{documentId}/browse", this.index);
        },

        doclistDefaultConfig: function()
        {
            var config = this.base();
            config.columns = [];

            return config;
        },

        configureDefault: function()
        {
            this.base();

            this.config({
                "columns": [{
                    "key": "pageName",
                    "title": "Page Name"
                }, {
                    "title": "URL Path",
                    "key": "path"
                }, {
                    "key": "modifiedOn",
                    "title": "Last Modified On"
                }, {
                    "key": "modifiedBy",
                    "title": "Modified By"
                }],
                "loader": "gitana",
                "checkbox": false
            });
        },

        entityTypes: function()
        {
            return {
                "plural": "secondary-pages",
                "singular": "secondary-page"
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
                query = OneTeam.searchQuery(searchTerm, ["title"]);
            }

            if (!query)
            {
                query = {};
            }
            query._type = "type:secondarypage0";

            pagination.paths = true;

            var branch = self.observable("branch").get();
            Chain(branch).queryNodes(query, pagination).then(function(){
                callback(this);
            });
            
            // Do this if you want to only show journals inside of this folder            
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

            if (item.key === "pageName") {
                var project = self.observable("project").get();
                value += "<a href='#/projects/" + project._doc + "/documents/" + row._doc + "'>";
                value += row.title;
                value += "</a>";
                return value;
            }

            if (item.key === "modifiedOn") {
                return row.getSystemMetadata().getModifiedOn().getTimestamp();
            }                

            if (item.key === "modifiedBy") {
                return row.getSystemMetadata().modified_by;
            }                

            if (item.key === "path") {
                return row.scURL;
            }

            return value;
        }

    }));

});