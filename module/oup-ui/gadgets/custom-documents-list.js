define(function(require, exports, module) {

    var Ratchet = require("ratchet/web");
    var DocumentsList = require("app/gadgets/project/documents/documents-list");

    return Ratchet.GadgetRegistry.register("documents-list", DocumentsList.extend({

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            if (!pagination) { 
                pagination = {}; 
            }

            self.base(context, model, searchTerm, query, pagination, callback);
        },

        handleRowCallback: function(el, model, table, nRow, aData, iDisplayIndex)
        {

            this.base(el, model, table, nRow, aData, iDisplayIndex);

            $(el).find('.dataTables_length').hide();

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
        }
    }));

});