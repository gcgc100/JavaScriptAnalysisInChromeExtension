define(['jquery', 'api/shim', 'lib/js/config'], function($, shim, config) {

    var visible = config.one.newtab.hasOwnProperty('launcher') && config.one.newtab.launcher.hasOwnProperty('visible') ?
                    config.one.newtab.launcher.visible() : false,
        defaultsettings = { display: visible };

    function update(callback) {
        shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
            var data = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                       storage.FRAMEWORK_LAUNCHER.data :
                       [];
            var settings = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.settings :
                           defaultsettings;

            var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];

            save(data, settings, deleted, callback);
        });
    }

    function save(data, settings, deleted, callback) {
        // fix user link bug
        var values = [];
        $.each(data, function(idx, item) {
            if (!(typeof item === 'string' && item.indexOf('userdefined') === 0))
                values.push(item);
        });

        shim.storage.set( { 'FRAMEWORK_LAUNCHER': {
            data: values,
            date: Date.now(),
            settings: settings || defaultsettings,
            deleted: deleted || []
        }}, function() {
            if (callback)
                callback({
                    data: values,
                    settings: settings || defaultsettings,
                    deleted: deleted || []
                });
        });
    }

    function getItemIndex(id, items) {
        var index = -1;

        $.each(items, function(idx, item) {
            if ((item.hasOwnProperty('id') && item.id === id) || item === id) {
                index = idx;
                return false;
            }
        });

        return index;
    }

    shim.runtime.onMessage(function(request, sender, sendResponse) {
        // Only accept message for this module
        if(request.module !== 'launcher') {
            return;
        }


        if(request.action === 'loading') {
            update(function(data) {
                sendResponse(data);
            });
            return;
        }

        if(request.action === 'settings') {
            shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
                if(error)
                    return;

                var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];

                storage.FRAMEWORK_LAUNCHER.settings = $.extend(storage.FRAMEWORK_LAUNCHER.settings, request.settings);
                save(storage.FRAMEWORK_LAUNCHER.data, storage.FRAMEWORK_LAUNCHER.settings, deleted, sendResponse);
            });
            return;
        }

        if(request.action === 'sortlist') {
            shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
                if(error)
                    return;

                var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];

                save(request.data, request.settings || storage.FRAMEWORK_LAUNCHER.settings, request.deleted || deleted, sendResponse);
            });
            return;
        }

        if(request.action === 'settings') {
            shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
                if(error)
                    return;

                var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];

                storage.FRAMEWORK_LAUNCHER.settings = $.extend(storage.FRAMEWORK_LAUNCHER.settings, request.settings);
                save(storage.FRAMEWORK_LAUNCHER.data, storage.FRAMEWORK_LAUNCHER.settings, request.deleted || deleted, sendResponse);
            });
            return;
        }

        if(request.action === 'add') {
            shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
                if(error)
                    return;

                var id = request.data.id || request.data;
                var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];
                var idx = deleted.indexOf(id);

                if (idx !== -1) {
                    deleted.splice(idx, 1);
                }

                storage.FRAMEWORK_LAUNCHER.data.push(request.data);
                storage.FRAMEWORK_LAUNCHER.settings = $.extend(storage.FRAMEWORK_LAUNCHER.settings, request.settings);
                save(storage.FRAMEWORK_LAUNCHER.data, storage.FRAMEWORK_LAUNCHER.settings, deleted, sendResponse);
            });
            return;
        }

        if(request.action === 'remove') {
            shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
                if(error)
                    return;

                var id = request.data.id || request.data;
                var idx = getItemIndex(id, storage.FRAMEWORK_LAUNCHER.data);
                var isMainItem = !(request.data.id || request.data.suggestable);
                var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];

                if (idx < 0) return;

                if (isMainItem && deleted.indexOf(id) === -1) {
                    deleted.push(id);
                }
                storage.FRAMEWORK_LAUNCHER.data.splice(idx, 1);
                storage.FRAMEWORK_LAUNCHER.settings = $.extend(storage.FRAMEWORK_LAUNCHER.settings, request.settings);
                save(storage.FRAMEWORK_LAUNCHER.data, storage.FRAMEWORK_LAUNCHER.settings, deleted, sendResponse);
            });
            return;
        }

        if(request.action === 'modify') {
            shim.storage.get('FRAMEWORK_LAUNCHER', function(error, storage) {
                if(error)
                    return;

                var id = request.data.id || '',
                    idx = getItemIndex(id, storage.FRAMEWORK_LAUNCHER.data);

                var deleted = storage.hasOwnProperty('FRAMEWORK_LAUNCHER') ?
                           storage.FRAMEWORK_LAUNCHER.deleted || [] :
                           [];

                if (idx < 0) return;

                storage.FRAMEWORK_LAUNCHER.data[idx] = request.data;
                save(storage.FRAMEWORK_LAUNCHER.data, storage.FRAMEWORK_LAUNCHER.settings, deleted, sendResponse);
            });
            return;
        }

    });

    return {};
});
