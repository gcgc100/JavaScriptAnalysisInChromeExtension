define(['jquery', 'api/shim'], function($, shim) {

    function update(appsData) {
        shim.storage.get('FRAMEWORK_APPS_MAPPING', function(error, storage) {
            var data = storage.hasOwnProperty('FRAMEWORK_APPS_MAPPING') ?
                       storage.FRAMEWORK_APPS_MAPPING.data :
                       [];
            if (appsData && appsData.length) {
                data = appsData;
            }

            save(data);
        });
    }

    function save(data) {
        shim.storage.set( { 'FRAMEWORK_APPS_MAPPING': {
            data: data,
            date: Date.now()
        }});
    }

    function sortAppsList(initPos, endPos) {
        shim.storage.get('FRAMEWORK_APPS_MAPPING', function(error, storage) {
            var data = storage.hasOwnProperty('FRAMEWORK_APPS_MAPPING') ?
                       storage.FRAMEWORK_APPS_MAPPING.data :
                       [];

            if (!data.length || !data[initPos] || !data[endPos]) {
                return;
            }

            // We swap values
            var tmpData = data[initPos];
            data.splice(initPos, 1);
            data.splice(endPos, 0, tmpData);

            save(data);
        });
    }

    shim.runtime.onMessageExternal(function(request, sender, sendResponse) {
        if(request.module !== 'apps') {
                return;
        }
        if(request.action === 'uninstall') {
            var id = request.data;
            shim.apps.uninstall(id, null, function() {
                sendResponse(id);
            });
            return;
        }

        return true;
    });

    shim.runtime.onMessage(function(request, sender, sendResponse) {
        // Only accept message for this module
        if(request.module !== 'apps') {
            return;
        }

        if(request.action === 'init') {
            update(request.data);
            return;
        }

        if(request.action === 'getall') {
            update();
            return;
        }

        if(request.action === 'add') {
            shim.storage.get('FRAMEWORK_APPS_MAPPING', function(error, storage) {
                if(error)
                    return;

                storage.FRAMEWORK_APPS_MAPPING.data.push(request.data);
                save(storage.FRAMEWORK_APPS_MAPPING.data);
            });
            return;
        }

        if(request.action === 'sortlist') {
            sortAppsList(request.data.start, request.data.end);
            return;
        }

        if(request.action === 'uninstall') {
            shim.storage.get('FRAMEWORK_APPS_MAPPING', function(error, storage) {
                if(error)
                    return;
                var data = storage.FRAMEWORK_APPS_MAPPING.data;
                for (var i = 0; i < data.length; i++) {
                    if(data[i].id === request.data) {
                        data.splice(i, 1);
                        break;
                    }
                }
                save(data);
            });
            return;
        }
    });

    return {};
});
