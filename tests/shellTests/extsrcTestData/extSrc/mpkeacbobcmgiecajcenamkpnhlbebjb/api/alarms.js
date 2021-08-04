define(['lib/js/event-handler'], function(EH) {

    /**
     * API to schedule code to run at a specified time in the future.
     * @exports gcshim/alarms
     */
    var alarms = {
        /**
         * Creates an alarm. Near the time(s) specified by alarmInfo, the onAlarm event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.
         * @function
         * @param {String} name Name to identify this alarm with.
         * @param {Object} alarmInfo Describes when the alarm should fire (attributes `when` XOR `delay` must be set).
         * @param {(Number|Object)} [alarmInfo.when] Javascript timestamp or Date object.
         * @param {Number} [alarmInfo.delay] Delay in milliseconds
         */
        create: function(name, alarmInfo) {
            var when;

            if(Object.prototype.toString.call(alarmInfo.when) === '[object Date]')
                when = alarmInfo.when.getTime();

            else if(typeof alarmInfo.when === 'number')
                when = Math.floor(alarmInfo.when);

            else if(typeof alarmInfo.delay === 'number')
                when = Date.now() + Math.floor(alarmInfo.delay);

            else
                return;

            chrome.alarms.create(name, { when: when });
        },

        /**
         * Fired when an alarm has elapsed. Useful for event pages.
         * @function
         * @param {gcshim/alarms~onAlarmCallback} callback The callback function to call.
         */
        onAlarm: EH()

        /**
         * @callback gcshim/alarms~onAlarmCallback
         * @param {Boolean} err Always set to false.
         * @param {Object} alarmInfo Describes the alarm that has elapsed.
         * @param {String} alarmInfo.name Name of this alarm.
         * @param {Number} alarmInfo.scheduledWhen Time at which this alarm was scheduled to fire, in milliseconds past the epoch.
         */
    };



    chrome.alarms.onAlarm.addListener(function(alarmInfo) {
        alarms.onAlarm.fire({
            name: alarmInfo.name,
            when: alarmInfo.scheduledTime
        });
    });



    return alarms;

});
