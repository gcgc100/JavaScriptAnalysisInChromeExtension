define(['api/shim', 'background/js/modules/ana_lytics'], function(shim, analytics) {

    // Extension has changed
    shim.runtime.onLoad(function(details) {
        if(details.reason !== 'update')
            return;

        analytics.events({ name: 'Runtime_Update', label: details.version.current });
    });



    return {};

});
