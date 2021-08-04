define(['lib/js/event-handler'], function(EH) {

    var windows = {

        create: function(createData, callback) {
            chrome.windows.create(createData, function(wd) {
                EH.safe(callback)(false, wd);
            });
        },

        remove: function(windowId, callback) {
            chrome.windows.remove(windowId, function(wd) {
                EH.safe(callback)(false, windowId);
            });
        },

        update: function(windowId, updateInfo, callback) {
            chrome.windows.update(windowId, updateInfo, function(wd) {
                EH.safe(callback)(false, wd);
            });
        },

        onRemove: EH(),

        onClassChange: EH()

    };



    chrome.windows.onRemoved.addListener(function(windowId) {
        windows.onRemove.fire(windowId);
    });



    return windows;

});

/*
####  CHROME.WINDOWS  ####

Notes:
  - Used by the Music Player only, but it could be useful elsewhere (Privacy Policy, etc)

Methods:
  chrome.windows.create(object createData, function callback)
  chrome.windows.remove(integer windowId, function callback)
  chrome.windows.update(integer windowId, object updateInfo, function callback)

Events:
  chrome.windows.onRemoved.addListener(function callback(integer windowId) )
*/
