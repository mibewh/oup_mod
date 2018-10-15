define(function(require, exports, module) {

    require("css!./documents-list.css");

    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");
    var TemplateHelperFactory = require("template-helper");
    var DocLib = require("doclib-helper");

    return Ratchet.GadgetRegistry.register("documents-list", DocList.extend({

        configureDefault: function()
        {
            this.base();

            this.config({
                "observables": {
                    "query": this.getGadgetId() + "-list_query",
                    "sort": this.getGadgetId() + "-list_sort",
                    "sortDirection": this.getGadgetId() + "-list_sortDirection",
                    "searchTerm": this.getGadgetId() + "-list_searchTerm",
                    "selectedItems": this.getGadgetId() + "-list_selectedItems"
                },
                "navbox": true
            });

            this.OBSERVABLE_SEARCH_STATE_NAME = this.getGadgetId() + "-state";
        },

        setup: function()
        {
            this.base();

            this.get("/projects/{projectId}/documents", this.index);
            this.get("/projects/{projectId}/documents/browse", this.index);
            this.get("/projects/{projectId}/documents/{documentId}", this.index);
            this.get("/projects/{projectId}/documents/{documentId}/browse", this.index);
        },

        entityTypes: function()
        {
            return {
                "plural": "items",
                "singular": "item"
            }
        },

        searchState: function(state)
        {
            var self = this;

            if (state) {
                self.observable(self.OBSERVABLE_SEARCH_STATE_NAME).set(state);
            }

            return self.observable(self.OBSERVABLE_SEARCH_STATE_NAME).get();
        },

        /**
         * Loads dynamic/configuration driven portions of the list into the model.
         *
         * @param model
         */
        applyDynamicConfiguration: function(model)
        {
            var self = this;

            var document = this.observable("document").get();
            if (document)
            {
                // "documents-list-buttons"
                var buttons = OneTeam.configEvalArray(document, "documents-list-buttons", self);
                if (buttons && buttons.length > 0)
                {
                    for (var i = 0; i < buttons.length; i++)
                    {
                        model.buttons.push(buttons[i]);
                    }
                }

                // "documents-list-sort-fields"
                var sortFields = OneTeam.configEvalArray(document, "documents-list-sort-fields", self);
                if (sortFields && sortFields.length > 0)
                {
                    if (!model["selectorGroups"]) {
                        model["selectorGroups"] = {};
                    }
                    if (!model["selectorGroups"]["sort-selector-group"])
                    {
                        model["selectorGroups"]["sort-selector-group"] = {};
                    }
                    if (!model["selectorGroups"]["sort-selector-group"]["fields"])
                    {
                        model["selectorGroups"]["sort-selector-group"]["fields"] = [];
                    }

                    for (var i = 0; i < sortFields.length; i++)
                    {
                        model["selectorGroups"]["sort-selector-group"]["fields"].push(sortFields[i]);
                    }
                }

                // "documents-list-selected-actions"
                var selectedActions = OneTeam.configEvalArray(document, "documents-list-selected-actions", self);
                if (selectedActions && selectedActions.length > 0)
                {
                    if (!model["selectorGroups"]) {
                        model["selectorGroups"] = {};
                    }
                    if (!model["selectorGroups"]["multi-documents-action-selector-group"])
                    {
                        model["selectorGroups"]["multi-documents-action-selector-group"] = {};
                    }
                    if (!model["selectorGroups"]["multi-documents-action-selector-group"]["actions"])
                    {
                        model["selectorGroups"]["multi-documents-action-selector-group"]["actions"] = [];
                    }

                    for (var i = 0; i < selectedActions.length; i++)
                    {
                        model["selectorGroups"]["multi-documents-action-selector-group"]["actions"].push(selectedActions[i]);
                    }
                }
            }
        },

        spliceRemovedButtons: function(buttons, configuredButtons)
        {
            var removedButtonKeys = {};

            for (var i = 0; i < configuredButtons.length; i++)
            {
                if (configuredButtons[i].remove) {
                    removedButtonKeys[configuredButtons[i].key] = true;
                }
            }

            var i = 0;
            do
            {
                if (i < buttons.length)
                {
                    var shouldRemove = removedButtonKeys[buttons[i].key];
                    if (shouldRemove)
                    {
                        buttons.splice(i, 1);
                    }
                    else
                    {
                        i++;
                    }
                }
            }
            while (i < buttons.length);
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

                        TemplateHelperFactory.create(self, "documents-list", function(err, renderTemplate) {

                            model.renderTemplate = renderTemplate;

                            callback();
                        });

                    });
                });
            });
        },

        beforeSwap: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                var refreshHandler = self.refreshHandler(el);

                // disable any currently registered event handlers
                self.off();

                // refresh on "refresh_document_list"
                self.on("refresh_document_list", refreshHandler);

                callback();

            });
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            pagination.paths = true;

            pagination.limit = 999999;

            model.pagination = pagination;

            // var path = model.path;
            var node = model.node;

            if (!pagination.sort)
            {
                pagination.sort = {};
                pagination.sort["title"] = 1;
                pagination.sort["_features.f:container.enabled"] = 1;
            }

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

            var childQuery = query;

            var childSearch = null;
            if (searchTerm) {
                childSearch = OneTeam.buildSearchBlock(searchTerm, ["title", "description", "__type"]);
            }

            var path = self.observable("path").get();

            var searchState = self.searchState();
            if (!searchState || searchState === "children")
            {
                DocLib.handleFindChildNodes(node, path, childQuery, childSearch, pagination, function(err, result, map) {
                    callback(map);
                });
            }
            else if (searchState === "ancestors")
            {
                DocLib.handleFindAncestralNodes(node, path, childQuery, childSearch, pagination, function(err, map, maxDepth, result, result2) {
                    callback(map);
                });
            }
            else if (searchState === "all")
            {
                DocLib.handleFindNodes(node.getBranch(), childQuery, childSearch, pagination, function(err, result, map) {
                    callback(map);
                });
            }
        },

        afterSwap: function(el, model, originalContext, callback)
        {
            var self = this;

            this.base(el, model, originalContext, function() {

                TemplateHelperFactory.afterRender(self, el);

                self.renderSearchBar(el, model, function() {
                    callback();
                });
            });
        },

        iconClass: function(row)
        {
            return null;
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

        afterActionCompleteSuccess: function(actionId, actionContext)
        {
            var self = this;

            // refresh
            OneTeam.faultContext.call(self, actionContext.model.tokens, actionContext.model.uri, function () {

                // trigger
                self.trigger("refresh-documents-tree");
                self.trigger("refresh_document_list");
            });
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
                    selectorGroup.actions.push(itemActions[z]);
                }
            }

            // TODO: can't do this yet, need ACLs for every document?
            //selectorGroup.actions = self.filterAccessRights(self, thing, model.buttons);
        },

        handleRowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {
            this.base(el, model, table, nRow, aData, iDisplayIndex);

            var row = model.rows[iDisplayIndex];

            if (model.maxDepth && (typeof(row._depth) !== "undefined"))
            {
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

        refresh: function(model)
        {
            var self = this;

            self.trigger("refresh_document_list");
        },

        renderSearchBar: function(el, model, callback)
        {
            var self = this;

            DocLib.renderSearchBar.call(self, el, model, function() {
                self.reloadDataTable();
            }, function(err, filterDiv) {
                callback(err);
            });
        }

    }));

});