define(['api/shim', 'lib/js/config', 'background/js/modules/ana_lytics'], function(shim, config, analytics) {


    // Heartbeat
    shim.alarms.onAlarm(function(alarmInfo) {
        if(alarmInfo.name !== 'Heartbeat')
            return;

        var today    = new Date();
        var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 1); // Next day at 00:01

        var tag = [ today.getFullYear(), (101 + today.getMonth() + '').substr(1), (100 + today.getDate() + '').substr(1) ].join('/');

        // Reset alarm
        shim.alarms.create('Heartbeat', { when: tomorrow.getTime() });

        shim.pstorage.get('HeartbeatTag', function(error, storage) {
            if(error)
                return;

            // Once every day
            if(typeof storage.HeartbeatTag === 'string' && storage.HeartbeatTag >= tag)
                return;

            shim.pstorage.set({ HeartbeatTag: tag });

            var events = [
                { passive: true, name: 'Heartbeat_DailyUser',              label: config.one.version() }
            ];
            
            analytics.events(events);

        });

    });

    // First heartbeat pulse (sometime in the next minute)...
    shim.alarms.create('Heartbeat', { when: Date.now() + Math.floor(Math.random() * 60000) });


    return {};

});
