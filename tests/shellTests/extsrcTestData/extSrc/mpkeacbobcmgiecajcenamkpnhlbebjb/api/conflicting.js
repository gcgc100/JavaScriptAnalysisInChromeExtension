define(['lib/js/event-handler'], function(EH) {

    var makeIcons = function(app) {
        toDataUrl('chrome://extension-icon/' + app.id + '/128/0', function(base64URL) {
            app.icons = [
                { size: 128, url: base64URL }
            ];
        });
        return app;
    };

    var CUSTOM_APPS = [];
    var app_list;

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request.module !== 'conflicting') {
            return;
        }

        if(request.action === 'allExtensions') {
            getAll(sendResponse);
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

    var getAppList = function(callback) {
        app_list = CUSTOM_APPS.concat();
        chrome.management.getAll(function (results) {
            for (var i = 0; i < results.length; i++) {
                if (!results[i].enabled)
                    continue;
                app_list.push(makeIcons(results[i]));
            }
        });
    };

    var getAll = function(callback) {
        EH.safe(callback)(app_list);
    };

    getAppList();
});
