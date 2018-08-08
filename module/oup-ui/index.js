define(function(require) {

    // Instanciate Actions
    require("./actions/create-journal/create-secondaryPage.js");
    require("./actions/create-journal/edit-secondaryPage.js");
    require("./actions/create-journal/delete-secondaryPage.js");

    // new pages
    require("./gadgets/all-journals-list.js");
    require("./gadgets/content-instances-for-oup-editors-team.js");
    require("./gadgets/journal-site-folder.js");
    require("./gadgets/secondary-pages-list.js");
    
    // new fields
    require("./fields/oup-file-picker.js");
    
    // use this to globally control the position of helper text
    Alpaca.defaultHelpersPosition = "above";  
      
      
});
