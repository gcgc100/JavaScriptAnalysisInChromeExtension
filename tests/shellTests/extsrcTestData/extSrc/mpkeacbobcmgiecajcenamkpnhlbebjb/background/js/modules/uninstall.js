define(['knockout', 'api/shim', 'lib/js/config'], function(ko, shim, config) {

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request.module !== 'uninstall') {
            return;
        }

        if(request.action === 'checkAvailable') {
            sendResponse('true');
        }

        if(request.action === 'uninstall') {
            chrome.management.uninstallSelf({'showConfirmDialog': true});
            return true;
        }

    });

    var uninstallWatcher = ko.computed(function() {

        var uninstallUrl = (config.one.uninstall_url() || null);
        if(uninstallUrl) {
            var gaId = null;
            var piwikAction = null;
            var targets = ko.unwrap(config.one.analytics), target;
            for(var i = 0; i < targets.length; ++i) {
                target = ko.unwrap(targets[i]);
                if(target.type === 'google')
                    gaId = target.id;
                else if(target.type === 'piwik')
                    piwikAction = target.action;
            }

            uninstallUrl += (uninstallUrl.indexOf('?') == -1 ? '?' : ':');
            uninstallUrl += 'uuid=' + config.one.metrics.user_id() + '&';
            uninstallUrl += 'one_id=' + piwikAction + '&';
            uninstallUrl += 'cid=' + config.one.metrics.campaign_id() + '&';
            uninstallUrl += 'GA_account=' + gaId + '&';
            uninstallUrl += 'version=' + config.one.version() + '&';
             //The parameter name is not used anymore in the uninstall page
            //Also the key name is reserved in wordpress site
            //uninstallUrl += 'name=' + encodeURIComponent(config.one.name()) + '&';
            uninstallUrl += 'idsite=2';
        }
        shim.runtime.setUninstallURL(uninstallUrl);
    });



    return {};

});

