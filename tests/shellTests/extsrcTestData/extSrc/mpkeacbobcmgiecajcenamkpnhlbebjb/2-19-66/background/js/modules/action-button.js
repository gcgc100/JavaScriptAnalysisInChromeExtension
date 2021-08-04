define(['api/shim', 'lib/js/config', 'background/js/modules/ana_lytics'], function(shim, config, analytics) {

    var launch = function(behavior, url) {
        analytics.events({ name: 'Action_ButtonClick', label: behavior });
        shim.tabs.create({ active: true, url: url });
    };



    shim.browser.button.onClick(function() {
        shim.runtime.getNewtabInfo(function(newtab) {
            var behavior    = config.one.action_button.defaults.behavior();
            var website_url = config.one.website();

            // Check if curator wants to open their website
            if(newtab.opted_in && behavior === 'website' && typeof website_url === 'string')
                launch('website', website_url);
            // Default behavior
            else
                launch('newtab', newtab.url);
        });
    });

});
