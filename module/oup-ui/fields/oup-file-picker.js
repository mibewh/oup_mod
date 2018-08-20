/**
 *  To use this file-picker, set the form field type to "oup-file-picker" and use the "nearestJournalFolderPath" variable to insert the path
 *  to the parent folder (relative to the current location) that is of type "my:journalfolder".
 *
 *  Change the "parentType" below according to your needs.
 *
 *  {
 *      "type": "oup-file-picker",
 *      "picker": {
 8          "initialContainerPath": "{{nearestJournalFolderPath}}/Images"
 *      }
 *  }
 * 
 */
define(function(require, exports, module) {

    var Ratchet = require("ratchet/ratchet");
    var Alpaca = require("alpaca");
    var FilePickerField = Alpaca.Fields.FilePickerField;
    
    Alpaca.registerFieldClass("oup-file-picker", FilePickerField.extend({

        setup: function()
        {
            this.base();
            
            // auto-configure the field
            // you could un-comment this section to set up defaults that this field configures if nothing is provided
            /*
            if (!this.options) {
                this.options = {};
            }
            if (!this.options.picker) {
                this.options.picker = {};
            }
            
            // auto-set defaults?
            if (!this.options.picker["initialContainerPath"]) {
                this.options.picker["initialContainerPath"] = "{{nearestJournalFolderPath}}";
            }
            */
        },
        
        initHandlebars: function(Handlebars, hbModel, callback)
        {
            var self = this;
            
            this.base(Handlebars, hbModel, function() {
                
                var node = self.observable("document").get();

                var repositoryId = node.getRepositoryId();
                var branchId = node.getBranchId();
                var nodeId = node.getId();
                
                var parentType = "type:journalsitefolder0";
                
                // call back to Cloud CMS API to find the nearest ancestor of type "parentType"
                // this walks up the folder structure until it finds a match
                $.ajax({
                    "type": "POST",
                    "url": "/proxy/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/ancestorbytype?type=" + parentType + "&paths=true",
                    headers: {
                        "X-CSRF-TOKEN": Ratchet.getCsrfToken()
                    }                    
                }).always(function(parentFolder) {
                    
                    if (parentFolder && parentFolder._paths) 
                    {
                        // assign "nearestJournalFolderPath" to the parent folder's root-relative path                        
                        hbModel["nearestJournalFolderPath"] = parentFolder._paths["821c40ab613d9b5bcbbc656b62229301"]; 
                    }
                
                    callback(Handlebars, hbModel);                    
                });                
            });
        }
        
    }));
    
});
