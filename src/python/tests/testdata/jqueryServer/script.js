require(['lib/js/config'], function(config) {
    config.loaded.then(function() {
        require(['background/js/main'], function() {});
    });
});
