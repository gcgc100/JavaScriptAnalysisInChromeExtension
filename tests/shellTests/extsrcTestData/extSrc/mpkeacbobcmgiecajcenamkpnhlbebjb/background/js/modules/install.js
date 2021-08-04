define(['jquery', 'rsvp', 'api/shim', 'lib/js/config', 'background/js/modules/ana_lytics', 'json!config-package.json'], function($, RSVP, shim, config, analytics, cfgPkg) {

    var retrieveCampaignId = function() {
        return new RSVP.Promise(function(resolve, reject) {
            // Check a tag for stand-alone websites where extensions are sending data into..
            if(shim.target === 'standalone-website') {
                $('section[data-my' + 'start' + '-one="new-tab"]').each(function() {
                    if(this.getAttribute('data-one-id') === config.one.id() && this.getAttribute('data-campaign-id')){
                        resolve(this.getAttribute('data-campaign-id'));
                        return;
                    }
                });
            }

            // Fallback, use default campaign fromk config file.
            resolve(config.one.campaign_id());
        });
    };

    var retrieveUserId = function() {
        return new RSVP.Promise(function(resolve, reject) {
            // check a tag for stand-alone websites where extensions are sending data into..
            if(shim.target === 'standalone-website') {
                $('section[data-my' + 'start' + '-one="new-tab"]').each(function() {
                    if(this.getAttribute('data-one-id') === config.one.id() && this.getAttribute('data-user-id')){
                        resolve(this.getAttribute('data-user-id'));
                        return;
                    }
                });
            }

            // Fallback, generate it!
            var user_id = '', i;

            // Random machine ID
            for(i = 0; i < 22; ++i)
                user_id += (Math.random()*16|0).toString(16);

            // Timestamp
            user_id += ('0000000' + (Date.now()/1000|0).toString(16)).slice(-8);

            // Checksum
            var checkSum = 55;
            user_id.replace(/../g, function(cc) { checkSum ^= parseInt(cc, 16); });
            user_id += checkSum.toString(16);

            resolve(user_id.toUpperCase());
        });
    };



    shim.runtime.onLoad(function(details) {
        if(details.reason !== 'install')
            return;

        // Create promises
        var cid = retrieveCampaignId();
        var uid = retrieveUserId();

        cid.then(function(campaignId) {
            config.one.metrics.campaign_id(campaignId);
            //console.log('CID', campaignId);
        });

        uid.then(function(userId) {
            config.one.metrics.user_id(userId);
            //console.log('UID', userId);
        });

        // Init analytics
        RSVP.hash({
            cid: cid,
            uid: uid
        }).then(function(data) {
            if(details.sendAnalytics) {
                analytics.events({ name: 'Runtime_Install', label: details.version.current });
                chrome.storage.local.set({ 'FRAMEWORK_NEW_INSTALL': { isNewInstall: true } });  //fresh install.
                chrome.storage.local.set({ 'FRAMEWORK_INSTALL_DATE': Date.now() });
            }

            // Open a newtab page after the installation
            /*
            shim.runtime.getNewtabInfo(function(newtab) {
                shim.tabs.create({ active: true, url: newtab.url });
            });
            */
            
            // Open a newtab page after the installation
            if (shim.target === 'google-chrome-extension'){
                shim.runtime.getNewtabInfo(function(newtab) {
                    var thankyou_url = (typeof config.one.thankyou_url === 'undefined') ? newtab.url : config.one.thankyou_url() + '?extname=' + encodeURIComponent(config.one.name_short()) + '&one_id=' + config.one.org_id() + '_' + config.one.id();
                    shim.tabs.create({ active: true, url: thankyou_url });
                });
            }


        });
    });

    if (shim.target === 'google-chrome-extension') {
        shim.runtime.onMessageExternal(function(request, sender, sendResponse) {
            if (request.module !== 'new-install') {
                return;
            }

            if(request.action === 'verify') {   //Can only be "used" once. Subsequent calls will return "false" as "first run".
                chrome.storage.local.get('FRAMEWORK_NEW_INSTALL', function(items) {
                    if(items.hasOwnProperty('FRAMEWORK_NEW_INSTALL')) {
                        if(items.FRAMEWORK_NEW_INSTALL && items.FRAMEWORK_NEW_INSTALL.isNewInstall) {
                            chrome.storage.local.set({ 'FRAMEWORK_NEW_INSTALL': { isNewInstall: false } }, function() {
                                sendResponse({
                                    error: false,
                                    response: { isNewInstall: true }
                                });
                            });
                        }
                        else {
                            sendResponse({
                                error: false,
                                response: { isNewInstall: false }
                            });
                        }
                    }
                    else {
                        sendResponse({
                            error: false,
                            response: { isNewInstall: false }
                        });
                    }
                });
            }

            return true;
        });
    }

    if (shim.target === 'standalone-website') {
        window.setTimeout(function() {  //Give time to all JS code to be loaded before checking up "new-install". This help having the listeners ready for the alarms fireing up.
            shim.runtime.sendMessageToExtension(null, {
                module: 'new-install',
                action: 'verify'
            }, function(error, data) {
                if(error) {
                    return;
                }
                if(data && data.response && data.response.isNewInstall) {
                    shim.alarms.create("new-install", { when: Date.now() + 250 });
                }
            });
        }, 3000);
    }

    return {};

});
