// Hard coupled dependencies
// CryptoJS.HmacSHA256, CryptoJS.enc.Base64

function SignonService(
    clientID = 'chromeex',
    apiURL = 'https://mvidsignonapi.vitec-mv.com',
) {
    var _cache = {};
    var _isReady = false;
    var _sessionID = '';
    var _secret = '';
    var _path = {
        users: {
            whoami: '/users/whoami',
            generateTempSecret: '/users/GenerateTempSecret'
        }
    };

    function getHeaders(sessionID, clientID, authorizationHash, requestTimestamp) {
        return {
            'Accept': 'application/json',
            'AuthorizationHashed': clientID + ':' + authorizationHash,
            'Content-Type': 'application/json',
            'RequestDateTime': requestTimestamp,
            'SessionID': sessionID
        };
    }

    function createAuthHash(body, verb, url, timestamp, secret) {
        var hash = CryptoJS.HmacSHA256(body + verb + url + timestamp, secret);
        return CryptoJS.enc.Base64.stringify(hash);
    }

    var _request = function(verb, path, onSuccess, onError) {
        var timestamp = Math.floor(Date.now() / 1000);
        var url = apiURL + path;
        var authorizationHash = createAuthHash('', verb, url, timestamp, _secret);
        var headers = getHeaders(_sessionID, clientID, authorizationHash, timestamp);
        var req = new XMLHttpRequest();

        req.addEventListener("error", onError);
        req.onreadystatechange = function() {
            if (req.readyState === 4) { // 4 === DONE - The operation is complete.
              try {
                  var response = JSON.parse(req.response);
                  if(response.error) {
                    throw response;
                  }
                  onSuccess(response);
              } catch(error) {
                  onError(error);
              }
            }
        };
        try {
            req.open(verb, apiURL + path);
            for(var header in headers) {
                req.setRequestHeader(header, headers[header]);
            }
            CountlyLog.logEvent("Signon: " + apiURL);
            req.send();
            return req;
        } catch (e) {
            onError(e);
        }
    };
    
    var _generateTempSecret = function(onSuccess, onError) {
        return _request("GET", _path.users.generateTempSecret + '?serviceName=' + clientID, onSuccess, onError);
    };

    var setup = function(sessionID, onSuccess, onError) {
        _sessionID = sessionID;
        _generateTempSecret(function(generateTempSecretResponse) {
            if(generateTempSecretResponse.error) {
                onError(generateTempSecretResponse);
                _isReady = false;
                return;
            }
            _secret = generateTempSecretResponse;
            _isReady = true; 
            onSuccess(_secret);
        }, function(error) {
            _secret = '';
            _isReady = false;
            console.error(error);
        });
    }
    
    var whoami = function(onSuccess, onError) {
        if(!_isReady) {
            throw new Error('Signon service not ready. Call setup() first.');
        }

        let key = CryptoJS.MD5(_sessionID);
        let cached = _cache[key];

        if (cached) {
            onSuccess(cached);
            return;
        }

        _request("GET", _path.users.whoami, function(whoamiResponse) {
            if(whoamiResponse.error) {
                onError(whoamiResponse);
                return;
            }
            _cache[key] = Object.assign({}, whoamiResponse);
            onSuccess(whoamiResponse);
        }, onError);
        
    }

    return {
        whoami: whoami,
        setup: setup
    };
}