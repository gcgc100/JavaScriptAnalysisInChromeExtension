chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.module !== 'recently-closed-handler')
            return;

        if (request.update)
            window.postMessage({
                module: 'recently-closed-handler',
                type: 'update'
            }, "*");
    });



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.module !== 'bookmarks-handler')
            return;

        if (request.update)
            window.postMessage({
                module: 'bookmarks-handler',
                type: 'update'
            }, "*");
    });



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.module !== 'apps-handler')
            return;

        if (request.update) {
            window.postMessage({
                module: 'apps-handler',
                type: 'update'
            }, "*");
        }
    });