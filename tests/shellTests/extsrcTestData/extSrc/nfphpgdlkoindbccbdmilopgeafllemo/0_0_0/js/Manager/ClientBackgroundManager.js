var isProduction = true;

ClientBackgroundManager = (function () {
    
    var mv_services_url = !isProduction
    ? 'http://bg-itw-vs-dev-lb-1710602598.eu-west-1.elb.amazonaws.com'
    : 'https://online.intowords.com';

	var uniqueInstance;
    var serviceErrorCallback = function (error) {
        console.log(error);
    };
    
    function constructor() {
        // private methods and fields
        var predictionClient = PredictionCachedClient(new JSONWSPClient());
        var speachClient = new JSONWSPClient();
        var settingClient = SettingsCachedClient(new JSONWSPClient());
        var permissionClient = PermissionCachedClient(new JSONWSPClient());
        var dictionaryClient = DictionaryCachedClient(new JSONWSPClient());
        var dictionarySpeachClient = new JSONWSPClient();
        settingClient.setViaProxy(true);
        speachClient.setViaProxy(true);
        predictionClient.setViaProxy(true);
        permissionClient.setViaProxy(true);
        dictionaryClient.setViaProxy(true);
        dictionarySpeachClient.setViaProxy(true);

        var predictionDescriptionUrl = "https://online.intowords.com/service/prediction/jsonwsp/description";//(!isProduction)?mv_services_url + "/service/prediction/jsonwsp/description" : mv_services_url + "/service/prediction/jsonwsp/description";
		
        var settingDescriptionUrl = mv_services_url + (isProduction
            ? '/intowords-v3/IntowordsSettingsService/jsonwsp/description'
            : '/service/v3/IntowordsSettingsService/jsonwsp/description');

        var speachDescriptionUrl = mv_services_url + (isProduction
            ? '/intowords-v3/tts/jsonwsp/description'
            : '/service/v3/tts/jsonwsp/description');

        var permissionDescriptionUrl = 'https://mvid-services.mv-nordic.com/v2/UserService/jsonwsp/description';

        var isLoaded = false;

		
        speachClient.loadDescription(speachDescriptionUrl, null, serviceErrorCallback);  // for devintowords service
        dictionarySpeachClient.loadDescription('https://dictionary.intowords.com/IaaS-vs/IntoWordsVS/jsonwsp/description');
        permissionClient.loadDescription(permissionDescriptionUrl, null, serviceErrorCallback);
                
        function loadDescriptions(callback) {
            if (!isLoaded) {
                predictionClient.loadDescription(predictionDescriptionUrl, function () {
                    settingClient.loadDescription(settingDescriptionUrl, function () {
                        dictionaryClient.loadDescription("https://dictionary.intowords.com/dictservice/DictionaryService/jsonwsp/description", function() {
                        //dictionaryClient.loadDescription("https://devdictionary.mv-nordic.com/dictservice/DictionaryService/jsonwsp/description", function () {
                            isLoaded = true;
                            callback();
                        });
                    }, serviceErrorCallback);
                }, serviceErrorCallback);
            }
            else {
                callback();
            }
        };

        return {
            predictionClient,
            dictionaryClient,
            speachClient,
            dictionarySpeachClient,
            settingClient,
            permissionClient,

            loadDescrioptions: function (callback) {
				loadDescriptions(callback);
            },

            dump() {
                predictionClient.dump();
                settingClient.dump();
                permissionClient.dump();
            }
        };
    };

    return {
        loadScript: function(url, callback) {
            var head = document.getElementsByTagName('body')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onload = callback;
            head.appendChild(script);
        },

        getInstance: function (mv_session_id) {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
                //setInterval(function () { uniqueInstance.session.keepAlive(); }, 600000);
                if(mv_session_id && mv_session_id != '' && mv_session_id != 'null')
                    ClientBackgroundManager.loadScript('https://signon.mv-nordic.com/sp-tools/keep_alive?mimetype=js&mv_session_id='+mv_session_id, function() {});
                
                setInterval(function() {
                    if(mv_session_id && mv_session_id != '' && mv_session_id != 'null')
                        ClientBackgroundManager.loadScript('https://signon.mv-nordic.com/sp-tools/keep_alive?mimetype=js&mv_session_id='+mv_session_id, function() {});
                } ,5*60*1000);
            }
            return uniqueInstance;
        },
		
		getMVServicesUrl: function() {
			return mv_services_url;
		},

        commaSuggestionsAccessIdentifier: 'product.web.da.commasuggestions.release',
        daGrammateketAccessIdentifier: 'product.web.da.grammarsuggestions.release',
        daMivoAccessIdentifier: 'product.web.da.mivo.release',
        svMivoAccessIdentifier: 'product.web.sv.mivo.release',
        nbMivoAccessIdentifier: 'product.web.nb.mivo.release',
        enMivoAccessIdentifier: 'product.web.en.mivo.release'
    };
})();