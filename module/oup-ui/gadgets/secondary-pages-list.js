define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");
    var OneTeam = require("oneteam");
    var Actions = require("ratchet/actions");
    return Ratchet.GadgetRegistry.register("secondary-pages-list", DocumentsList.extend({

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

            return config;
        },

        configureDefault: function()
        {
            this.base();

            this.config({
                "columns": [{
                    "key": "pageName",
                    "title": "Page Name",
                    "sort": true,
                    "sortProperty": "title"
                }, {
                    "title": "URL Path",
                    "key": "path",
                    "sort": true,
                    "sortProperty": "scUrl"
                }, {
                    "key": "modifiedOn",
                    "title": "Last Modified On",
                    "sort": true,
                    "sortProperty": "_system.modified_on.ms"
                }, {
                    "key": "modifiedBy",
                    "title": "Modified By",
                    "sort": true,
                    "sortProperty": "_system.modified_by"
                }],
                "loader": "gitana",
                "actions": true,
                "checkbox": true,
                "icon": true
            });
        },

        entityTypes: function()
        {
            return {
                "plural": "secondary pages",
                "singular": "secondary page"
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


            if (this.searchState() === "children")
            {
                if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
                {
                    query = OneTeam.searchQuery(searchTerm, ["title"]);
                }
    
                if (!query)
                {
                    query = {};
                }
                
                query._type = {"$in":["type:secondarypage0","type:genericform"]};
    
                pagination.paths = true;
    
                var folder = self.observable("document").get();            
                Chain(folder).queryRelatives(query, {
                    "type": "a:child"
                }, pagination).then(function() {
                    callback(this);
                });            
            }
            else
            {
                this.base(context, model, searchTerm, query, pagination, callback)
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
                    if(itemActions[z].key != "view-json" && itemActions[z].key != "locked")
                    {
                        selectorGroup.actions.push(itemActions[z]);
                    }
                }
            }

            // TODO: can't do this yet, need ACLs for every document?
            //selectorGroup.actions = self.filterAccessRights(self, thing, model.buttons);
        },

        handleRowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {
            this.base(el, model, table, nRow, aData, iDisplayIndex);

            $(el).find('.list-row-info-summary-block').hide();

            var row = model.rows[iDisplayIndex];

            if (model.maxDepth && (typeof(row._depth) !== "undefined"))
            {
                var spacerWidth = 80;
                var spacerWidth = 80;

                if (row._depth > 0)
                {
                    var leftMarginPx = row._depth * spacerWidth;

                    $(".list-icon-column", nRow).find(".list-icon-hierarchy-spacer").remove();
                    $(".list-icon-column", nRow).prepend("<span class='list-icon-hierarchy-spacer' style='padding-left: " + leftMarginPx + "px'></span>");

                    $(".list-icon-column").css("text-align", "left");
                }

                var pullPx = (model.maxDepth - row._depth) * spacerWidth;
                $($(nRow).children()[2]).css("display", "block");
                $($(nRow).children()[2]).css("margin-left", "-" + pullPx + "px");

            }
        },


        columnValue: function(row, item, model, context) {

            var self = this;

            var project = self.observable("project").get();

            var value = "";

            if (item.key === "pageName") {

                value = model.renderTemplate(row);

                return value;
            }

            if (item.key === "modifiedOn") {
                return row.getSystemMetadata().getModifiedOn().getTimestamp();
            }

            if (item.key === "modifiedBy") {
                return row.getSystemMetadata().modified_by;
            }

            if (item.key === "path") {
                return row.scUrl;
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