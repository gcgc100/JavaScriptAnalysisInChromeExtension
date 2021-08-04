define(['lib/js/event-handler', 'lib/js/constants', 'json!manifest.json'], function(EH, constants, manifest) {


    var REQUIRED_PERMISSIONS = {
        permissions: [ 'tabs' ]
    };
    var closedUrls = null;

    var queryUrl = manifest.externally_connectable ? manifest.externally_connectable.matches : null;

    var isArray = function(value) {
        return value !== null && typeof value === 'object' && value.constructor === [].constructor;
    };

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request.module !== 'recently-closed') {
            return;
        }

        if(request.action === 'get-recently-closed') {
            chrome.storage.local.get('FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE', function(items){
                chrome.storage.local.set({ 'FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE': [] }, function() {
                    sendResponse(items);
                });
            });
            return true;
        }

        if(request.action === 'permissions') {
            chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result){
                if(!result) {
                    responses = {
                        error: false,
                        response: false
                    };
                    sendResponse(responses);
                }else {
                    responses = {
                        error: false,
                        response: true
                    };
                    sendResponse(responses);
                }

            });
            return true;
        }
    });

    // Track tab events
    var trackClosedUrls = function() {
        var knownTabs = {};

        var pushTab = function(tab) {
            if(tab.status !== 'complete' || tab.incognito)
                return;

            if(tab.url.match(/^chrome:/i))
                return;

            if(tab.title.match(/New Tab/i))
                return;

            knownTabs[ tab.id ] = {
                title: tab.title,
                url:   tab.url,
                icon:  'https://www.google.com/s2/favicons?domain=' + tab.url
            };
        };

        var fetchKnownTabs = function() {
            chrome.tabs.query({}, function(tabs) {
                for(var i = 0; i < tabs.length; ++i)
                    pushTab(tabs[i]);
            });
        };

        var onCreated  = function(tab) {
            pushTab(tab);
        };

        var onUpdated  = function(id, changes, tab) {
            pushTab(tab);
        };

        var onRemoved  = function(id, removeInfo) {
            if(!knownTabs.hasOwnProperty(id))
                return;

            var tab = knownTabs[id];
            delete knownTabs[id];

            var process = function() {
                // Truncate array
                var tempUrls = closedUrls.slice(0, constants.recently_closed.max_items - 1);

                // Prepend new tab
                tempUrls.unshift(tab);

                // Save changes
                chrome.storage.local.set({ 'FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE': tempUrls }, function() {});
            };

            if(closedUrls !== null)
                process();
            else {
                chrome.storage.local.get('FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE', function(items) {
                    if(chrome.runtime.lastError)
                        return;

                    closedUrls = items.hasOwnProperty('FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE') && isArray(items.FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE) ? items.FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE : [];
                    process();
                });
            }
        };

        var updateEvents = function() {
            chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result) {
                if(result) {
                    if(!chrome.tabs.onCreated.hasListener(onCreated))
                        chrome.tabs.onCreated.addListener(onCreated);

                    if(!chrome.tabs.onUpdated.hasListener(onUpdated))
                        chrome.tabs.onUpdated.addListener(onUpdated);

                    if(!chrome.tabs.onRemoved.hasListener(onRemoved))
                        chrome.tabs.onRemoved.addListener(onRemoved);

                    fetchKnownTabs();
                }
                else {
                    if(chrome.tabs && chrome.tabs.onCreated && chrome.tabs.onCreated.hasListener(onCreated))
                        chrome.tabs.onCreated.removeListener(onCreated);

                    if(chrome.tabs && chrome.tabs.onUpdated && chrome.tabs.onUpdated.hasListener(onUpdated))
                        chrome.tabs.onUpdated.removeListener(onUpdated);

                    if(chrome.tabs && chrome.tabs.onRemoved && chrome.tabs.onRemoved.hasListener(onRemoved))
                        chrome.tabs.onRemoved.removeListener(onRemoved);
                }
            });
        };

        chrome.permissions.onAdded.addListener(updateEvents);
        chrome.permissions.onRemoved.addListener(updateEvents);
        updateEvents();
    };

    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if(!queryUrl)
            return;

        if(areaName !== 'local')
            return;

        if(!changes.hasOwnProperty('FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE'))
            return;

        if(changes.FRAMEWORK_RECENTLY_CLOSED_URLS_CACHE.newValue.length === 0)
            return;

        chrome.tabs.query({url: queryUrl}, function(tabs) {

            if(tabs.length === 0)
                return;

            chrome.tabs.sendMessage(tabs[tabs.length-1].id, {
                module: 'recently-closed-handler',
                update: true
            }, function() {});
        });
    });

    chrome.runtime.getBackgroundPage(function(bgPage) {
        if(bgPage === window)
            trackClosedUrls();
    });

});
