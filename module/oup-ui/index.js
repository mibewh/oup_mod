define(function(require) {

    // Instanciate Actions
    require("./actions/create-journal/create-secondaryPage.js");
    require("./actions/create-journal/create-secondaryPage-dev.js");
    require("./actions/create-journal/create-secondaryPage-test.js");
    require("./actions/create-journal/create-secondaryPage-uat.js");
    require("./actions/create-journal/create-secondaryPage-prod.js");
    
    require("./actions/create-journal/edit-secondaryPage.js");
    require("./actions/create-journal/delete-secondaryPage.js");

    // new pages
    require("./gadgets/all-journals-list.js");
    require("./gadgets/secondary-pages-list.js");
    
    // use this to globally control the position of helper text
    Alpaca.defaultHelpersPosition = "above";  
      
      
});
