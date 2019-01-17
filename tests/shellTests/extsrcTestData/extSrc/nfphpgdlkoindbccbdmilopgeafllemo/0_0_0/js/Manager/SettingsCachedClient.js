var SettingsCachedClient = function (client) {
    let cache = {
        version: null,
        descriptionLoaded: false,
        checkAccess: {},
        getCurrentSettings: {},
        getProfiles: {},
        Settings: {},
        getSupportedValues: {},
    }

    return {
        setViaProxy: function (payload, lol, success, error) {
            client.setViaProxy(payload, lol, success, error);
        },
        version: function (payload, lol, success, error) {
            let cachedResult = cache.version;
            
            cachedResult ? success(cachedResult) : client.version(payload, lol, function (result) {
                cache.version = Object.assign({}, result);
                success(result);
            }, error);
        },
        loadDescription: function (payload, success, error) {
            let cachedResult = cache.descriptionLoaded;
            success = success ? success : () => {};

            cachedResult ? success() : client.loadDescription(payload, function () {
                cache.descriptionLoaded = true;
                success();
            }, error);
        },
        restoreSettings: function (payload, lol, success, error) {
            client.restoreSettings(payload, lol, success, error);
        },

        // Not sure if this can be cached on a session basis.
        // The service backend might check against some other criteria.
        // Worst case, hardcode this to true to allow everything.
        checkAccess: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id);
            let cachedResult = cache.checkAccess[key];
            
            cachedResult ? success(cachedResult) : client.checkAccess(payload, lol, function (result) {
                cache.checkAccess[key] = Object.assign({}, result);
                success(result);
            }, error);
        },
        getCurrentSettings: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id + "-" + payload.application);
            let cachedResult = cache.getCurrentSettings[key];
            
            cachedResult ? success(cachedResult) : client.getCurrentSettings(payload, lol, function (result) {
                cache.getCurrentSettings[key] = Object.assign({}, result);
                success(result);
            }, error);
        },
        getProfiles: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id + "-" + payload.application);
            let cachedResult = cache.getProfiles[key];
            
            cachedResult ? success(cachedResult) : client.getProfiles(payload, lol, function (result) {
                cache.getProfiles[key] = Object.assign({}, result);
                success(result);
            }, error);
        },
        setProfiles: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id + "-" + payload.application);

            client.setProfiles(payload, lol, function (result) {
                cache.getProfiles[key].value.current_profile_id = payload.profile_info.current_profile_id;
                success(result);
            }, error);
        },
        getSettings: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id + "-" + payload.application);

            if (cache.Settings[payload.profile_id] === undefined) {
                cache.Settings[payload.profile_id] = {};
            }

            let cachedResult = cache.Settings[payload.profile_id][key];

            cachedResult ? success(cachedResult) : client.getSettings(payload, lol, function (result) {
                cache.Settings[payload.profile_id][key] = Object.assign({}, result);
                success(result);
            }, error);
        },
        saveSettings: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id + "-" + payload.application);
            client.saveSettings(payload, lol, function (result) {
                if (cache.Settings[payload.profile_id] === undefined) {
                    cache.Settings[payload.profile_id] = {value: {}};
                }

                cache.Settings[payload.profile_id][key].value = Object.assign({}, payload.settings);
                success(result);
            }, error);
        },
        getSupportedValues: function (payload, lol, success, error) {
            let key = CryptoJS.MD5(payload.session_id);
            let cachedResult = cache.getSupportedValues[key];
            
            cachedResult ? success(cachedResult) : client.getSupportedValues(payload, lol, function (result) {
                cache.getSupportedValues[key] = Object.assign({}, result);
                success(result);
            }, error);
        },
        dump: function () {
            console.log(cache);
        }
    };
}
