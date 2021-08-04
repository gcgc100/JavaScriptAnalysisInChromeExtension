define(['jquery', 'api/shim'], function($, shim) {

    var defaultsettings = {left:-1 , top:-1, width:720, height:450, lwidth: 260, rwidth: 455, display: false, collapsed: false, firstuse: true, isNew: true, endNew: null, selected: -1};

    function update(callback) {
        shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
            var data = storage.hasOwnProperty('FRAMEWORK_NOTEPAD') ?
                       storage.FRAMEWORK_NOTEPAD.data :
                       [];
            var settings = storage.hasOwnProperty('FRAMEWORK_NOTEPAD') ?
                           storage.FRAMEWORK_NOTEPAD.settings :
                           defaultsettings;

            save(data, settings, callback, storage.hasOwnProperty('FRAMEWORK_NOTEPAD') ? false : true);
        });
    }

    function save(data, settings, callback, forced) {
        if(!forced && !document.hasFocus()) {
            return;
        }

        if (!settings.endNew) {
            settings.endNew = new Date().addHours(12).getTime();
            settings.isNew = true;
        } else if (settings.isNew) {
            settings.isNew = Date.now() < settings.endNew;
        }
        if (!settings.collapsed && !settings.lwidth) {
            settings.rwidth = 455;
            settings.lwidth = 260;
        }
        shim.storage.set( { 'FRAMEWORK_NOTEPAD': {
            data: data,
            date: Date.now(),
            settings: settings || defaultsettings
        }}, callback);
    }

    function sortNotesList(initPos, endPos, callback) {
        shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
            var data = storage.hasOwnProperty('FRAMEWORK_NOTEPAD') ?
                       storage.FRAMEWORK_NOTEPAD.data :
                       [];
            var settings = storage.hasOwnProperty('FRAMEWORK_NOTEPAD') ?
                           storage.FRAMEWORK_NOTEPAD.settings :
                           defaultsettings;

            if (!data.length || !data[initPos] || !data[endPos]) {
                return;
            }

            // We swap values
            var tmpData = data[initPos];
            data.splice(initPos, 1);
            data.splice(endPos, 0, tmpData);

            save(data, settings, callback, false);
        });
    }

    shim.runtime.onMessage(function(request, sender, sendResponse) {
        // Only accept message for this module
        if(request.module !== 'note-pad') {
            return;
        }

        if(request.action === 'getall') {
            update(sendResponse);
            return;
        }

        if(request.action === 'removeall') {
            shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
                if(error || !storage.FRAMEWORK_NOTEPAD) {
                    update(sendResponse);
                    return;
                }
                save([], storage.FRAMEWORK_NOTEPAD.settings, sendResponse, false);
            });
            return;
        }

        if(request.action === 'add') {
            shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
                if(error)
                    return;

                storage.FRAMEWORK_NOTEPAD.data.sort(function(a, b) {
                    return b.date - a.date;
                });
                storage.FRAMEWORK_NOTEPAD.data.unshift(request.data);
                storage.FRAMEWORK_NOTEPAD.settings = $.extend(storage.FRAMEWORK_NOTEPAD.settings, request.settings);
                save(storage.FRAMEWORK_NOTEPAD.data, storage.FRAMEWORK_NOTEPAD.settings, sendResponse, false);
            });
            return;
        }

        if(request.action === 'remove') {
            shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
                if(error)
                    return;

                storage.FRAMEWORK_NOTEPAD.data.sort(function(a, b) {
                    return b.date - a.date;
                });
                storage.FRAMEWORK_NOTEPAD.data.splice(request.index, 1);
                storage.FRAMEWORK_NOTEPAD.settings = $.extend(storage.FRAMEWORK_NOTEPAD.settings, request.settings);
                save(storage.FRAMEWORK_NOTEPAD.data, storage.FRAMEWORK_NOTEPAD.settings, sendResponse, false);
            });
            return;
        }

        if(request.action === 'modify') {
            shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
                if(error)
                    return;

                storage.FRAMEWORK_NOTEPAD.data.sort(function(a, b) {
                    return b.date - a.date;
                });
                storage.FRAMEWORK_NOTEPAD.data[request.index] = request.data;
                storage.FRAMEWORK_NOTEPAD.settings = $.extend(storage.FRAMEWORK_NOTEPAD.settings, request.settings);
                save(storage.FRAMEWORK_NOTEPAD.data, storage.FRAMEWORK_NOTEPAD.settings, sendResponse, false);
            });
            return;
        }


        if(request.action === 'settings') {
            shim.storage.get('FRAMEWORK_NOTEPAD', function(error, storage) {
                if(error || !storage.FRAMEWORK_NOTEPAD) {
                    update(sendResponse);
                    return;
                }

                storage.FRAMEWORK_NOTEPAD.settings = $.extend(storage.FRAMEWORK_NOTEPAD.settings, request.settings);
                save(storage.FRAMEWORK_NOTEPAD.data, storage.FRAMEWORK_NOTEPAD.settings, sendResponse, false);
            });
            return;
        }

        if(request.action === 'sortlist') {
            sortNotesList(request.data.start, request.data.end, sendResponse);
            return;
        }

    });

    return {};
});
