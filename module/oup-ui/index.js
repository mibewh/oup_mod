define(function(require) {

    // action: "create-journal"
    //require("./actions/create-journal/create-journal.js");
    require("./actions/create-journal/edit-secondaryPage.js");
    require("./actions/create-journal/create-secondaryPage.js");
    
    // use this to globally control the position of helper text
    Alpaca.defaultHelpersPosition = "above";
    
});
