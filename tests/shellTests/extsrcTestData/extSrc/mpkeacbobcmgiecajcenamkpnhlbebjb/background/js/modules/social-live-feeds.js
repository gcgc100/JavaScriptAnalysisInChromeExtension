define(['jquery', 'api/shim', 'lib/js/constants', 'lib/js/ajax', 'lib/js/config'], function($, shim, constants, ajax, config) {

    var defaultsettings = {left:null , top:null, width:250, height:415, display: false, defaultfeed: 'facebook', etag: null, mtime: null, refreshdate: null, btns_left:null, btns_top:null};

    var ALARM_NAME = 'alarm-social-live-feeds';
    var feeds_datas = null;
    var settings = defaultsettings;

    function updateSettings() {

        shim.pstorage.get('FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS', function(error, storage) {
            if(error)
                return;

            settings = defaultsettings;
            if(storage.hasOwnProperty('FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS'))
                settings = storage.FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS.settings;

            savefeedsettings(settings);
        });
    }


    function savefeedsettings(settings) {
        var feeds_datas = {
            date: Date.now(),
            settings: settings || defaultsettings
        };
        shim.pstorage.set( { 'FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS': feeds_datas});
    }

    shim.runtime.onMessage(function(request, sender, sendResponse) {
        // Only accept message for this module
        if(request.module !== 'social-live-feeds') {
            return;
        }
        var storageKey,
            storeddatas = {};

        if(request.action === 'get') {
            updateSettings();
            storageKey = 'FRAMEWORK_' + settings.defaultfeed.toUpperCase() + '_FEEDS_DATA';
            shim.pstorage.get(storageKey, function(error, storage) {
                if(error)
                    return;

                feeds_datas = storage[storageKey];
            });


            storeddatas[settings.defaultfeed] = feeds_datas;
            sendResponse({settings: settings, datas: storeddatas});

            return;
        }

        if(request.action === 'settings') {
            shim.pstorage.get('FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS', function(error, storage) {
                if(error)
                    return;

                storage.FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS.settings = $.extend(storage.FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS.settings, request.settings);
                savefeedsettings(storage.FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS.settings);
                sendResponse();
            });
            return;
        }

        if(request.action === 'newtab') {
            storageKey = 'FRAMEWORK_' + request.settings.defaultfeed.toUpperCase() + '_FEEDS_DATA';

            shim.pstorage.get(storageKey, function(error, storage) {
                if(error)
                    return;
                if(storage.hasOwnProperty(storageKey))  {
                    feeds_datas = storage[storageKey];
                    shim.pstorage.get('FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS', function(error, storage) {
                        if(error)
                            return;

                        settings = $.extend(storage.FRAMEWORK_SOCIAL_LIVE_FEEDS_SETTINGS.settings, request.settings);
                        savefeedsettings(settings);
                        storeddatas[request.settings.defaultfeed] = feeds_datas;
                        sendResponse({settings: settings, datas: storeddatas});
                    });
                }
            });

            return;
        }
    });

    return {};
});
