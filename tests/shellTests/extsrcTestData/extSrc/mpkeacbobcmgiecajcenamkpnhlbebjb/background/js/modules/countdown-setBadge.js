define(['jquery', 'api/shim', 'lib/js/config'], function($, shim, config) {


    if(typeof config.one.newtab.countdown === 'undefined') {
        return {};
    }

    if(typeof config.one.newtab.countdown.active === 'undefined') {
        return {};
    }

    if (shim.target === 'google-chrome-extension'){
         window.setInterval(setBadge, 1000*60);
         setBadge();
    }

    function setBadge() {
        if(config.one.newtab.countdown.badge() !== true) {
            return;
        }

        var today = new Date();
        var newYear = new Date('2018-12-31');
        var timeDiff = newYear.getTime() - today.getTime();
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if(diffDays >= 0 && diffDays <= 15)
            chrome.browserAction.setIcon({ path: 'https://www.mystart.com/browser-extensions/chrome/countdown/' + diffDays + '.png' });
    }

    return {};
});
