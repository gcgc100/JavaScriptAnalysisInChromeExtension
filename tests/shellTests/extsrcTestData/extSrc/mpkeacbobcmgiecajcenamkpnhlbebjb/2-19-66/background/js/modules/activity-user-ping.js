define(['api/shim', 'lib/js/config', 'background/js/modules/ana_lytics'],
  function(shim, config, analytics) {

    var activity = config.one.newtab.user_activity_ping;

    if (typeof activity === 'undefined')
      return;

    if (!activity.active())
      return;

    if (shim.target !== 'google-chrome-extension') {
      return;
    }

    var pings = (typeof activity.pings !== 'undefined') ? activity.pings() : "undefined";

    if (pings === "undefined") {
      return;
    }

    function checkPings() {
      var getItems = ['FRAMEWORK_PING_START'];
      for (var i = 0; i < pings.length; i++) {
        getItems.push('FRAMEWORK_PING_LABEL_' + pings[i].label);
      }
      chrome.storage.local.get(getItems, function(items) {
        if (!items.hasOwnProperty('FRAMEWORK_PING_START')) {
          return false; // This is very important. For old installation that have doesn't have "FRAMEWORK_PING_START" scheduled at that time, we should not start sending pings after an extnesion's update.
        } else {
          var diff = parseInt((Date.now() - items.FRAMEWORK_PING_START.date) / 1000);
          //console.log(diff + ' seconds have passed');

          for (var i = 0; i < pings.length; i++) {
            if (diff >= pings[i].time) {
              if (!items.hasOwnProperty('FRAMEWORK_PING_LABEL_' + pings[i].label)) {
                //console.log('Time to send a ping...');
                chrome.storage.local.set({
                  ['FRAMEWORK_PING_LABEL_' + pings[i].label]: {
                    done: 'true'
                  }
                });
                sendPing(pings[i].label, pings[i].time);
              }
            }
          }
        }
      });
    }

    function sendPing(label, time) {
      /*
      console.log({
        name: 'Runtime_2_' + label,
        label: 'Duration',
        value: time
      });
      */
      analytics.events({
        name: 'Runtime_2_' + label,
        label: 'Duration',
        value: time
      });
    }

    function intervalPing() {
      //console.log("Started setInterval for checkPings();");
      window.setInterval(function() {
        checkPings();
      }, 60000);
      checkPings();
    }

    function init() {
      chrome.storage.local.get(['FRAMEWORK_INSTALL_DATE', 'FRAMEWORK_PING_START'], function(items) {
        if (items.hasOwnProperty('FRAMEWORK_INSTALL_DATE')) {
          if (!items.hasOwnProperty('FRAMEWORK_PING_START')) {
            chrome.storage.local.set({
              'FRAMEWORK_PING_START': {
                date: Date.now()
              }
            }, function() {
              //console.log("FRAMEWORK_PING_START has been set to " + Date.now());
              intervalPing();
            });
          }
          else {
            intervalPing();
          }
        }
      });
    }

    window.setTimeout(init, 500);

    return {};
  });