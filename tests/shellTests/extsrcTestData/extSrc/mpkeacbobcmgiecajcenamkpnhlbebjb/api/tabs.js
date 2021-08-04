define(['lib/js/event-handler', './runtime'], function(EH, runtime) {

    var REQUIRED_PERMISSIONS = {
        permissions: [ 'tabs' ],
        origins: [ 'chrome://favicon/' ]
    };



    var tabs = {

        REQUIRED_PERMISSIONS: REQUIRED_PERMISSIONS,

        // Convert all default newtabs to the new one
        refreshNewtab: function() {
            //2016-03-11 : This code was causing problem starting up with Google Chrome 49. All tabs were converted to newtab, no matter which urls they were. Removingg code for now.
        },

        create: function(properties, callback) {
            chrome.tabs.create(properties, function(tab) {
                EH.safe(callback)(false, tab);
            });
        },

        query: function(query, callback) {
            chrome.tabs.query(query, function(tabs) {
                EH.safe(callback)(false, tabs);
            });
        },

        remove: function(id, callback) {
            chrome.tabs.remove(id, function() {
                EH.safe(callback)(false);
            });
        },

        update: function(id, properties, callback) {
            chrome.tabs.update(id, properties, function(tab) {
                EH.safe(callback)(false, tab);
            });
        },

        onUpdate: EH()

    };



    return tabs;

});
