define(['lib/js/event-handler'], function(EH) {


    var REQUIRED_PERMISSIONS = {
        permissions: [ 'topSites', 'tabs' ]
    };


    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request.module !== 'most-visited') {
            return;
        }

        if(request.action === 'topSites') {
            chrome.topSites.get(sendResponse);
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
                } else {
                    responses = {
                        error: false,
                        response: true
                    };
                    sendResponse(responses);
                }

            });
            return true;
        }



        if(request.action === 'request') {
           chrome.permissions.request(REQUIRED_PERMISSIONS, function(granted) {
                if(!granted) {
                    responses = {
                        error: false,
                        response: false
                    };
                    sendResponse(responses);
                } else {
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
});
