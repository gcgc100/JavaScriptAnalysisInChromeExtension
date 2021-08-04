define(['knockout', 'piwik', 'api/shim', 'lib/js/config', 'lib/js/g_a', 'lib/js/tools'], function(ko, PiwikAnalytics, shim, config, GoogleAnalytics, tools) {

    var SERVICES = {

        google: function(siteId) {
            return GoogleAnalytics.getTracker('https://ssl.google-analytics.com/collect', siteId);
        },

        piwik: function(siteId) {
            return PiwikAnalytics.getTracker('https://analytics.vmn.net/piwik.php', siteId);
        },

    };



    var trackers = [];

    (function() {
        var targets = ko.unwrap(config.one.analytics), target;
        for(var i = 0; i < targets.length; ++i) {
            target = ko.unwrap(targets[i]);

            if(target.type in SERVICES) {
                target.obj = SERVICES[target.type](target.id);

                target.obj.setDocumentTitle(target.action);
                target.obj.disableCookies();
                target.obj.deleteCookies();

                // Temp... @BUG@
                target.obj.setCustomVariable(1, 'org_id',     config.one.org_id(),  'visit');
                target.obj.setCustomVariable(2, 'project_id', config.one.id(),      'visit');
                target.obj.setCustomVariable(3, 'version',    config.one.version(), 'visit');

                target.obj.setCustomVariable(1, 'org_id',     config.one.org_id(),  'page');
                target.obj.setCustomVariable(2, 'project_id', config.one.id(),      'page');
                target.obj.setCustomVariable(3, 'version',    config.one.version(), 'page');

                target.obj.setCustomVariable(1, 'org_id',     config.one.org_id(),  'event');
                target.obj.setCustomVariable(2, 'project_id', config.one.id(),      'event');
                target.obj.setCustomVariable(3, 'version',    config.one.version(), 'event');

                trackers.push(target);
            }
        }
    })();



    var metricsWatcher = ko.computed(function() {
        var cid = config.one.metrics.campaign_id();
        cid = cid ? cid.toString() : null;

        var uid = config.one.metrics.user_id();
        uid = uid ? uid.toString() : Date.now().toString();

        for(var t = 0; t < trackers.length; ++t) {
            if(trackers[t].type === 'google')
                trackers[t].obj.setCampaignNameKey(cid);

            trackers[t].obj.setUserId(uid);
        }
    });



    var queue = {
        _timer: null,
        _stack: [],

        _send: function(ev, cb) {
            var cid = config.one.metrics.campaign_id();
            cid = cid ? cid.toString() : null;

            var label = '';
            switch(typeof ev.label) {
                case 'string':
                    label = ev.label;
                    break;
                case 'number':
                    label = ev.label.toString();
                    break;
                case 'boolean':
                    label = ev.label ? 'true' : 'false';
                    break;
            }

            for(var t = 0; t < trackers.length; ++t) {
                var url = 'http://one.my' + 'start' + '.com/my' + 'start' + '-one://' + config.ext.id + '/background/?' + trackers[t].action;

                // Piwik Campaign Tracker
                if(trackers[t].type === 'piwik' && cid)
                    url += '&pk_campaign=' + cid;

                trackers[t].obj.setCustomUrl(url);
                trackers[t].obj.trackEvent(
                    ev.name,
                    trackers[t].action,
                    label,
                    typeof ev.value === 'number' ? Math.floor(ev.value) : 0
                );
            }

            if(typeof cb === 'function')
                cb();
        },

        _cron: function() {
            var data = queue._stack.shift();

            // Nothing left, kill cron
            if(!data) {
                queue._timer = null;
                return;
            }

            // Send data and keep the cron alive
            queue._send(data.event, data.cb);
            queue._timer = setTimeout(queue._cron, 1000);
        },

        push: function(event, cb) {
            // The cron is already running, get in line!
            if(queue._timer !== null) {
                queue._stack.push({ event: event, cb: cb });
                return;
            }

            // No cron active, send right now and start the cron
            queue._send(event, cb);
            queue._timer = setTimeout(queue._cron, 1000);
        }

    };



    shim.runtime.onMessage(function(request, sender, sendResponse) {
        // Only accept message for this module
        if(request.module !== 'analytics')
            return;

        if(request.action === 'page-view') {
            analytics.pageView(request.data, sendResponse);
            return true; // Async
        }
        else if(request.action === 'events') {
            analytics.events(request.data, sendResponse);
            return true; // Async
        }
    });



    var analytics = {

        // Do pageviews right away
        pageView: function(page, cb) {
            var cid = config.one.metrics.campaign_id();
            cid = cid ? cid.toString() : null;

            for(var t = 0; t < trackers.length; ++t) {
                var url = 'http://one.my' + 'start' + '.com/my' + 'start' + '-one://' + config.ext.id + '/' + page + '/?' + trackers[t].action;

                // Piwik Campaign Tracker
                if(trackers[t].type === 'piwik' && cid)
                    url += '&pk_campaign=' + cid;

                trackers[t].obj.setCustomUrl(url);
                trackers[t].obj.trackPageView();
            }

            if(typeof cb === 'function')
                cb();
        },

        // Throttle events
        events: function(events, cb) {
            if(tools.isArray(events)) {
                for(var i = 0; i < events.length; ++i)
                    queue.push(events[i], cb);

                return true; // Async
            }
            else if(tools.isJson(events)) {
                queue.push(events, cb);
                return true; // Async
            }
            else {
                cb();
                return false;
            }
        }

    };



    return analytics;

});
