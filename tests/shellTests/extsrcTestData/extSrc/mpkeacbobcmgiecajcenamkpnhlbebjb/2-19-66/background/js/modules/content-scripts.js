define(['api/shim', 'lib/js/config'], function(shim, config) {

    var configUserLocal, configTodoList, configWallpapers, configWeather;

    shim.runtime.onMessage(function(request, sender, sendResponse) {
        // Only accept message for this module
        if(request.module === 'content-scripts' && request.action === 'installed'){
            if(configUserLocal) {
                sendResponseToSender(sendResponse);
                return;
            }
            
            shim.storage.get('FRAMEWORK_TODOLIST', function(error, storage) {
                if(storage.hasOwnProperty('FRAMEWORK_TODOLIST'))
                    configTodoList = storage.FRAMEWORK_TODOLIST;
                    
                shim.storage.get('FRAMEWORK_USER_WALLPAPERS', function(error, storage) {
                    if(storage.hasOwnProperty('FRAMEWORK_USER_WALLPAPERS'))
                        configWallpapers = storage.FRAMEWORK_USER_WALLPAPERS;
                    
                    shim.storage.get('FRAMEWORK_WEATHER_CITIES_DATA', function(error, storage) {
                        if(storage.hasOwnProperty('FRAMEWORK_WEATHER_CITIES_DATA'))
                            configWeather = storage.FRAMEWORK_WEATHER_CITIES_DATA;
                        
                        shim.pstorage.get('FRAMEWORK_CONFIG_USER_LOCAL', function(error, storage) {
                            if(storage.hasOwnProperty('FRAMEWORK_CONFIG_USER_LOCAL'))
                                configUserLocal = storage.FRAMEWORK_CONFIG_USER_LOCAL;
                        });
                    });
                });
            });

            sendResponse();
        } else if (request.module === 'Keep-changes-banner') {
            document.getElementsByTagName("BODY")[0].className += ' new-install';
            setTimeout(function() {
                var bodyClass = document.getElementsByTagName("BODY")[0].className;
                bodyClass = bodyClass.replace(' new-install', '');
                document.getElementsByTagName("BODY")[0].className = bodyClass;
            }, 5000);
        }
    });

    function sendResponseToSender(sendResponse){
        sendResponse({
            configTodoList:     configTodoList,
            configWallpapers:   configWallpapers,
            configWeather:      configWeather,
            domInfo: {
                ext_id:      config.ext.id,
                one_id:      config.one.id(),
                version:     config.one.version(),
                name:        config.one.name(),
                campaign_id: config.one.metrics.campaign_id(),
                user_id:     config.one.metrics.user_id()
            }
        });
    }
    
    return {};
    
});
