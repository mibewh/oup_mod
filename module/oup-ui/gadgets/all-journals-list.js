
define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("/oneteam/modules/app/gadgets/project/documents/documents-list.js");
    var OneTeam = require("oneteam");

    return Ratchet.GadgetRegistry.register("all-journals-list", DocumentsList.extend({

        setup: function()
        {

            this.get("/projects/{projectId}/documents/{documentId}/browse", this.index);
        },

        configureDefault: function()
        {
            this.base();

            this.config({
                "observables": {
                    "query": "all-journals-list_query",
                    "searchTerm": "all-journals-list_searchTerm",
                    "selectedItems": "all-journals-list_selectedItems"
                },
                "loader": "gitana"
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
            var branch = self.observable("branch").get();


            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title"]);
            }

            if (!query)
            {
                query = {};
            }
            query._type = "custom:journa0";

            if(!pagination){
                pagination = {};
            }

            if(!pagination.sort){
                pagination.sort = {};
            }

            pagination.sort = {};

            pagination.sort.family = 1;

            pagination.paths=true;

            Chain(branch).queryNodes(query,pagination).then(function(){
                callback(this);
            });

        },

        handleDrawCallback: function(el, model, table, settings) {

            var api = table.api();
            var last=null;
            for (var i = 0; i < model.rows.length; i++)
            {
                var family = model.rows[i].family;
                if( last!== family){
                    var rows = api.rows( {page:'current'} ).nodes();
                    $(rows).eq( i ).before(
                        '<tr class="group"><td colspan="5">'+ '<strong>' + family + '</strong>'+ '</td></tr>'
                    );

                    last = family;
                }
            }
            return null;

        }

    }));

});

