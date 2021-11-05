
define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");
    var OneTeam = require("oneteam");
    var Actions = require("ratchet/actions");

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
                    "key": "modifiedOn",
                    "title": "Last Modified On",
                    "sort": true,
                    "sortProperty": "_system.modified_on.ms"
                }],
                "loader": "gitana",
                "checkbox": true,
                "actions": true,
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

        populateSingleDocumentActions: function(row, item, model, context, selectorGroup)
        {
            var self = this;

            var thing = Chain(row);

            // evaluate the config space against the current row so that per-row action buttons customize per document
            var itemActions = OneTeam.configEvalArray(thing, "documents-list-item-actions", self, null, null, true);

            if (itemActions && itemActions.length > 0)
            {
                for (var z = 0; z < itemActions.length; z++)
                {
                    if(itemActions[z].key != "view-json" && itemActions[z].key != "locked" && itemActions[z].key != "edit-document")
                    {
                        selectorGroup.actions.push(itemActions[z]);
                    }
                }
            }

            // TODO: can't do this yet, need ACLs for every document?
            //selectorGroup.actions = self.filterAccessRights(self, thing, model.buttons);
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

            pagination.paths = true;

            
            if (this.searchState() === "children")
            {
                query._type = "type:journalsitefolder0";
    
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
            }
            else
            {
                this.base(context, model, searchTerm, query, pagination, callback);
            }
        },

        iconUri: function(row, model, context)
        {
            return null;
        },

        columnValue: function(row, item, model, context)
        {

            var self = this;

            
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

            if (item.key === "modifiedOn") {
                return row.getSystemMetadata().getModifiedOn().getTimestamp();
            }

            if (item.key == "actions") {

                var id = "list-button-single-document-select-" + row._doc;

                // action drop down
                var MODAL_TEMPLATE = ' \
                    <div class="single-document-action-holder">\
                        <ul role="menu" aria-labelledby="' + id + '"> \
                        </ul> \
                    </div> \
                ';

                var template = $(MODAL_TEMPLATE);

                // load actions from the "single-document-action-selector-group" configuration
                var selectorGroup = model["selectorGroups"]["single-document-action-selector-group"];

                if (!selectorGroup) {
                    selectorGroup = {};
                }
                if (!selectorGroup.actions) {
                    selectorGroup.actions = [];
                }
                selectorGroup = JSON.parse(JSON.stringify(selectorGroup));
                self.populateSingleDocumentActions(row, item, model, context, selectorGroup);

                $.each(selectorGroup.actions, function(index, selectorGroupItem) {

                    var link = selectorGroupItem.link;
                    var actionId = selectorGroupItem.action;
                    var iconClass = selectorGroupItem.iconClass;
                    //var order = selectorGroupItem.order;

                    var id = row.id;
                    if (!id && row._doc) {
                        id = row._doc;
                    }
                    if (!id && row.getId) {
                        id = row.getId();
                    }

                    var html = null;

                    if (link)
                    {
                        if (window.Handlebars)
                        {
                            var linkModel = {
                                "document": row,
                                "project": project
                            };

                            var templateFunction = Handlebars.compile(link);
                            link = templateFunction(linkModel);
                        }

                        html = "<a href='" + link + "' list-row-id='" + id + "'>";
                        html += "<i class='action-icon " + iconClass + "'></i>";
                        html += "</a>";
                    }
                    else if (actionId)
                    {
                        // retrieve the action configuration
                        var actionConfig = Actions.config(actionId);
                        if (!actionConfig)
                        {
                            // skip this one
                            Ratchet.logWarn("The action: " + actionId + " could not be found in actions config for selector group: single-document-action-selector-group");
                        }
                        else
                        {
                            html = "<a href='#' class='list-button-action list-button-action-" + actionId + "' list-action-id='" + actionId + "' list-row-id='" + id + "'>";
                            html += "<i class='action-icon " + iconClass + "'></i>";
                            html += "</a>";
                        }
                    }

                    if (html)
                    {
                        $(template).find("ul").append("<li>" + html + "</li>");
                    }

                });

                return $(template).outerHTML();
            }

            return value;
        }

        

    }));

});