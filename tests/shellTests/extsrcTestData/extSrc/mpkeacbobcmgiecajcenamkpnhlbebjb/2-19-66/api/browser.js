define(['lib/js/event-handler'], function(EH) {

    var browser = {

        button: {

            setText: function(text, callback) {
                if(chrome.browserAction)
                    chrome.browserAction.setBadgeText({ text: text });
                EH.safe(callback)(false);
            },

            setBgColor: function(color, callback) {
                if(chrome.browserAction)
                    chrome.browserAction.setBadgeBackgroundColor({ color: color });
                EH.safe(callback)(false);
            },

            onClick: EH()

        }

    };


    if(chrome.browserAction){
        chrome.browserAction.onClicked.addListener(function(e) {
            browser.button.onClick.fire();
        });
    }



    return browser;

});
