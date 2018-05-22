
define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");
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
                "loader": "gitana",
                "actions": true
            });
        },

        entityTypes: function()
        {
            return {
                "plural": "journals",
                "singular": "journal"
            }
        },
        
        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {
                model.project = self.observable("project").get();
                callback();
            });
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
            query._type = "type:journalsitefolder0";

            if (!pagination){
                pagination = {};
            }

            if (!pagination.sort){
                pagination.sort = {};
            }

            pagination.sort = {};
            pagination.sort.siteParent = 1;
            // pagination.sort.title = 1; // sort by title secondarily

            pagination.paths = true;

            model.sitesByRouteName = {};
            
            var loadParentSites = function(branch, siteParentIdentifiers, model, done) {
                
                Chain(branch).queryNodes({
                    "siteRouteName": {
                        "$in": siteParentIdentifiers
                    }
                }).each(function() {
                    if (this.siteRouteName) {
                        model.sitesByRouteName[this.siteRouteName] = this;
                    }
                }).then(function() {
                    done();
                });
                
            };
            
            var siteParentIdentifiers = [];

            var branch = self.observable("branch").get();
            Chain(branch).queryNodes(query, pagination).each(function() {
                if (this.siteParent && !siteParentIdentifiers.contains(this.siteParent)) {
                    siteParentIdentifiers.push(this.siteParent);
                }
                if (this.siteRouteName) {
                    model.sitesByRouteName[this.siteRouteName] = this;
                }                
            }).then(function(){
                
                var resultMap = this;
                
                // load any site parents?
                loadParentSites(branch, siteParentIdentifiers, model, function() {
                    callback(resultMap);                    
                });                

            });
        },

        handleDrawCallback: function(el, model, table, settings) {

            var api = table.api();
            var last = null;
            for (var i = 0; i < model.rows.length; i++)
            {
                var siteParentIdentifier = model.rows[i].siteParent;
                if( last !== siteParentIdentifier) 
                {
                    var rows = api.rows( {page:'current'} ).nodes();
                    
                    var siteParentTitle = "Ungrouped";
                    
                    var parentSite = model.sitesByRouteName[siteParentIdentifier];
                    if (parentSite)
                    {
                        siteParentTitle = "<a href='/#/projects/" + model.project._doc + "/documents/" + parentSite._doc + "/browse'>" + parentSite.title + "</a>";
                    }
                    
                    var insertEl = $('<tr class="group"><td colspan="4"><strong>' + siteParentTitle + '</strong></td></tr>');
                    $(rows).eq(i).before(insertEl);

                    last = siteParentIdentifier;
                }
            }
            
            return null;
        }

    }));

});

