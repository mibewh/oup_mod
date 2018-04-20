define(function(require) {

    // action: "create-journal"
    require("./actions/create-journal/create-secondaryPage.js");
    
    // action: "edit-journal"
    require("./actions/create-journal/edit-secondaryPage.js");
    
    // action: "open-oup"
    //require("./actions/open-oup/open-oup.js");

    // new pages
    require("./gadgets/all-journals-list.js");
    require("./gadgets/secondary-pages-list.js");
    
    // use this to globally control the position of helper text
    Alpaca.defaultHelpersPosition = "above";    
});
