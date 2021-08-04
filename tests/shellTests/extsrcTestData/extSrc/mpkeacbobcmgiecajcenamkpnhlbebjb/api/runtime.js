define(['rsvp', 'lib/js/event-handler'], function(RSVP, EH) {

    var runtime = {

        getInfo: new RSVP.Promise(function(resolve, reject) {
            resolve({
                id:         chrome.runtime.id,
                newtab_url: chrome.extension.getURL('newtab/index.html')
            });
        }),

        getNewtabInfo: function(callback) {
            EH.safeCall(callback, {
                url:      chrome.extension.getURL('newtab/index.html'),
                opted_in: true
            });
        },

        reload: chrome.runtime.reload,

        sendMessage: function(message, callback) {
            chrome.runtime.sendMessage(message, function() {
                if(arguments.length === 0)
                    EH.safe(callback)(chrome.runtime.lastError);
                else
                    EH.safe(callback)(false, arguments[0]);
            });
        },

        sendMessageToExtension: function(extId, message, callback) {
            chrome.runtime.sendMessage(extId, message, function() {
                if(arguments.length === 0)
                    EH.safe(callback)(chrome.runtime.lastError);
                else
                    EH.safe(callback)(false, arguments[0]);
            });
        },

        setUninstallURL: function(url) {
            if(typeof url !== 'string')
                url = '';

            if(chrome.runtime.setUninstallURL)
                chrome.runtime.setUninstallURL(url);
        },

        onLoad: EH(),

        onUnload: EH(),

        onMessage: EH(),

        onMessageExternal: EH()

    };



    // We're using the following code instead of "chrome.runtime.onInstalled" for 2 reasons:
    //   - It must be called synchronously and won't work with an async module loader
    //   - It doesn't work when installing from the registry
    chrome.storage.local.get('FRAMEWORK_CURRENTVERSION', function(items) {
        if(chrome.runtime.lastError)
            return;

        var currentVersion = chrome.runtime.getManifest().version;

        var setDetails = function(reason, previousVersion) {
            if(currentVersion !== previousVersion)
                chrome.storage.local.set({ 'FRAMEWORK_CURRENTVERSION': currentVersion });

            runtime.onLoad.autoFire({
                reason: reason,
                sendAnalytics: true,
                version: {
                    previous: previousVersion,
                    current:  currentVersion
                }
            });
        };

        // Install
        if(!items.hasOwnProperty('FRAMEWORK_CURRENTVERSION'))
            setDetails('install', null);

        // Update
        else if(items.FRAMEWORK_CURRENTVERSION !== currentVersion)
            setDetails('update', items.FRAMEWORK_CURRENTVERSION);

        // Normal startup
        else
            setDetails('startup', items.FRAMEWORK_CURRENTVERSION);
    });



    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        runtime.onMessage.fire(message, sender, sendResponse);
        return true;
    });

    chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
        runtime.onMessageExternal.fire(message, sender, sendResponse);
        return true;
    });



    return runtime;

});
