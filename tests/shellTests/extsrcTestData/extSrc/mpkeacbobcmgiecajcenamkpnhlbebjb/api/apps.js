define(['lib/js/event-handler', './tabs', 'json!manifest.json'], function(EH, tabs, manifest) {

    var REQUIRED_PERMISSIONS = {
        permissions: [ 'management', 'tabs' ],
        origins: []
    };

    var queryUrl = manifest.externally_connectable ? manifest.externally_connectable.matches : null;

    var makeIcons = function(app) {
        toDataUrl('chrome://extension-icon/' + app.id + '/128/0', function(base64URL) {
            app.icons = [
                { size: 128, url: base64URL }
            ];
        });
        return app;
    };



    var userAgent = window.navigator.userAgent.toLowerCase();
    var CUSTOM_APPS = [
        makeIcons({
            is_custom : true,
            id        : 'ahfgeienlihckogmohjhadlkjgocpleb',
            name      : 'Web Store',
            // 'edg' matches chromium based edge (dev or canary) while 'edge' matches the release version.
            url       : userAgent.indexOf("edg") !== -1 ? 'https://microsoftedge.microsoft.com/addons/category/Edge-Extensions' : 'https://chrome.google.com/webstore',
            enabled   : true
        })
    ];
    var app_list = CUSTOM_APPS.concat();

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request.module !== 'apps') {
            return;
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

        if(request.action === 'getall') {
            getAll(sendResponse);
            return true;
        }

        if(request.action === 'launch') {
            apps.launch(request.id);
            return;
        }
        if(request.action === 'checkUi') {
            getAppList();
            sendResponse(true);
            return true;
        }
        if(request.action === 'openPage') {
            chrome.tabs.create({url : 'chrome://apps'}, function(tab) { });
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


    function toDataUrl(src, callback, outputFormat) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
        };
        img.src = src;
        if (img.complete || img.complete === undefined) {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            img.src = src;
        }
    }

    var getAppList = function() {
        app_list = CUSTOM_APPS.concat();
        chrome.management.getAll(function (results) {

            for (var i = 0; i < results.length; i++) {
                if (!results[i].isApp)
                    continue;

                app_list.push(makeIcons(results[i]));

            }
        });
    };
    var getAll = function(callback) {

            EH.safe(callback)(app_list);

    };

    var findOne = function(id, callback) {
        getAll(function(apps) {
            for(var i = 0; i < apps.length; ++i) {
                if(apps[i].id === id) {
                    callback(false, apps[i]);
                    return;
                }
            }

            // Not found
            callback('NOT_FOUND', null);
        });
    };



    var apps = {

        launch: function(id, callback) {
            findOne(id, function(error, app) {
                if(error) {
                    EH.safe(callback)(error, id);
                    return;
                }

                if(app.is_custom) {
                    tabs.create({ url: app.url, active: true }, function(error, tab) {
                        EH.safe(callback)(error, id);
                    });
                    return;
                }

                chrome.management.setEnabled(id, true, function() {
                    if(chrome.runtime.lastError) {
                        EH.safe(callback)(chrome.runtime.lastError, id);
                        return;
                    }

                    chrome.management.launchApp(id, function() {
                        EH.safe(callback)(chrome.runtime.lastError || false, id);
                    });
                });
            });
        },

        setEnabled: function(id, enabled, callback) {
            findOne(id, function(error, app) {
                if(error || app.is_custom) {
                    EH.safe(callback)(error, id);
                    return;
                }

                chrome.management.setEnabled(id, enabled, function() {
                    EH.safe(callback)(chrome.runtime.lastError || false, id);
                });
            });
        },

        uninstall: function(id, options, callback) {
            findOne(id, function(error, app) {
                if(error || app.is_custom) {
                    EH.safe(callback)(error, id);
                    return;
                }

                options = options || {};
                chrome.management.uninstall(id, options, function() {
                    EH.safe(callback)(chrome.runtime.lastError || false, id);
                });
            });
        },

        onChange: EH()

    };

    var update = function() {
        getAppList();

        if(!queryUrl)
            return;

        setTimeout(function() {
            chrome.tabs.query({url: queryUrl}, function(tabs) {

                if(tabs.length === 0)
                    return;

                for(var i = 0; i < tabs.length; i++)
                    chrome.tabs.sendMessage(tabs[i].id, {
                        module: 'apps-handler',
                        update: true
                    }, function() {});
            });
        }, 1000);


    };

    var updateEvents = function() {

        if( !chrome.management.onInstalled.hasListener(update))
            chrome.management.onInstalled.addListener(update);

        if( !chrome.management.onUninstalled.hasListener(update))
            chrome.management.onUninstalled.addListener(update);

    };

    updateEvents();



    return apps;

});
