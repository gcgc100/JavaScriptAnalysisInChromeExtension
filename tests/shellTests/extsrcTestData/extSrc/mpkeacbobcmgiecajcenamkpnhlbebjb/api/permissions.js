define(['lib/js/event-handler'], function(EH) {

    var REQUIRED_PERMISSIONS = {
        permissions: [ 'bookmarks', 'management', 'tabs', 'topSites' ],
        origins: [ 'chrome://favicon/' ]
    };



    var permissions = {

        REQUIRED_PERMISSIONS: REQUIRED_PERMISSIONS,

        hasAll: function(callback) {
            chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result) {
                EH.safe(callback)(false, result);
            });
        },

        request: function(callback, noReload) {
            permissions.hasAll(function(error, result) {
                if(error || result) {
                    EH.safe(callback)(error, result);
                    return;
                }

                chrome.permissions.request(REQUIRED_PERMISSIONS, function(granted) {
                    if(noReload)
                        EH.safe(callback)(false, granted);

                    if(granted)
                        chrome.runtime.reload();
                });
            });
        },

        onAdded: EH(),
        onRemoved: EH()

    };



    chrome.permissions.onAdded.addListener(function(changes) {
        permissions.onAdded.fire(changes);
    });

    chrome.permissions.onRemoved.addListener(function(changes) {
        permissions.onRemoved.fire(changes);
    });



    return permissions;

});
