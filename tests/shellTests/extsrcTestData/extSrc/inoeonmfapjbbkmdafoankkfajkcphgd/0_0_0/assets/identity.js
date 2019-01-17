/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _GoogleServices = __webpack_require__(4);

var _GoogleServices2 = _interopRequireDefault(_GoogleServices);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GoogleAuthenticator extends _GoogleServices2.default {
    constructor() {
        super();

        this.scopes = {};
        this.scopes[texthelp.RW4GC.enums.AccessType.IDENTITY] = ['https://www.googleapis.com/auth/userinfo.email'];

        this.scopes[texthelp.RW4GC.enums.AccessType.HIGHLIGHTS] = ["https://www.googleapis.com/auth/drive.apps.readonly", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.appdata"];

        this.scopes[texthelp.RW4GC.enums.AccessType.VOCAB] = ["https://www.googleapis.com/auth/drive.apps.readonly", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.appdata"];

        this.scopes[texthelp.RW4GC.enums.AccessType.VOICENOTES] = ["https://www.googleapis.com/auth/drive.apps.readonly", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.appdata"];

        this.scopes[texthelp.RW4GC.enums.AccessType.CHECKITDICTIONARY] = ["https://www.googleapis.com/auth/drive.apps.readonly", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.appdata"];

        this.scopes[texthelp.RW4GC.enums.AccessType.DRIVEINSTALL] = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.install"];

        this._interactive = false;
    }

    authenticate(interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        this._interactive = interactive;

        if (retry === undefined) {
            retry = true;
        }

        chrome.identity.getAuthToken({ "interactive": interactive, "scopes": scopes }, function (token) {

            if (chrome.runtime.lastError !== undefined) {};

            // set any responses that are not tokens eg undefined, null to an empty token.
            token = this.getDefaultValue(token, '');

            // if the getAuthToken was interactive and no token was returned then 
            // the user has clicked on the deny button. So set retry to false so we don't
            // pop up the dialog again.
            if (interactive && token.length === 0) {
                retry = false;

                return this.onFuncResponse(null);
            }

            funcToOAuth.bind(this)(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
        }.bind(this));
    }

    _handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token) {

        // if not error just pass the response to the next promise.
        if (response.ok) {
            this._token = token;
            return response.json();
        }

        // if the request is unauthorised it could be that the token in Chromes cache has expired.
        // So removed the potentially expired token and try again.
        // When we try again we set the retry to false to insure we don't get into an authorise dialog
        // loop if they have hit the deny button,
        if (response.status == 401 && retry) {
            retry = false;
            // A 401 percould be 
            // the token has expired, however it could be that the user has hit deny. We 
            this._revokeCachedToken(token, interactive, scopes, funcToOAuth, onFuncResponse, params);
            return null;
        }

        response.token = token;
        response.email = '';
        return response;
    }

    get id() {
        return this._id;
    }

    /**
    * gets the current users id which likely will be an email address. This version is specific
    * to Google and 
    * @param {boolean} interactive false stops any authentication dialogs being displayed.
    * @param {function} callback callback with the users id. If its an empty string authentication was not given.
    */
    _getID(interactive, callback) {

        // the authenticator has a getID and authenticate method. The getID method will attempt to get some custom 
        // method of getting the users ID/email. Otherwise we goto OAuth. 
        this.getLocalID(id => {

            // if getID returns an ID/Email then return it.
            if (id.length > 0) {

                callback(id);

                if (!this._authenticated && interactive) {
                    // otherwise authenticate and get the ID using OAuth,
                    this.authenticate(interactive, this.driveInstallScopes, () => {}, {}, {}, true);

                    this._authenticated = true;
                }

                return;
            }

            // otherwise authenticate and get the ID using OAuth,
            this.authenticate(interactive, this.idScopes.concat(this.driveInstallScopes), this.getAuthenticatedID, id => {
                // return if we get null as we didn't get authenticated. 
                callback(id);
            });
        });
    }

    /*
    *   Gets the type of authenticator
    */
    get licenseType() {
        return "Google";
    }

    _onBarShown() {
        texthelp.RW4GC.IdentityManagerInstance.getId(true, id => {});
    }

}
exports.default = GoogleAuthenticator;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseAuthenticator = __webpack_require__(5);

var _BaseAuthenticator2 = _interopRequireDefault(_BaseAuthenticator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TexthelpServices extends _BaseAuthenticator2.default {

    constructor() {
        super();

        this.details = {};
        this.details.license = null;
        this.details.id = null;
    }

    // do a Texthelp license check
    _doTexthelpLicenseCheck(id, onLicenseResponse, productCode) {
        var options = {
            user: id,
            loginType: 'google',
            product: 'rw4gc'
        };

        if (this.licenseType == texthelp.RW4GC.enums.AccountType.MICROSOFTSHAREPOINT) {
            options.loginType = 'microsoft';
        }
        if (productCode !== undefined) {
            options.authCode = productCode;
        }

        thAuth.licenseCheck(options, (error, licence) => {});
    }

    _getLicense(id, onLicenseResponse, productCode) {
        try {
            if (onLicenseResponse == undefined) {
                onLicenseResponse = null;
            }
            if (id == undefined) {
                onLicenseResponse({ 'error': 'No id to license' });
                return;
            }
            if (id == null) {
                onLicenseResponse({ 'error': 'No id to license' });
                return;
            }
            if (id.length == 0) {
                onLicenseResponse({ 'error': 'No id to license' });
                return;
            }

            // if we have a license return it. If a product code is passed in then we
            // are attaching the license to an account carryon.
            //          if (id == this.details.id && this.details.license !== null && productCode == undefined){
            //         onLicenseResponse(this.details.license);
            //           return;
            //        }

            if (onLicenseResponse == undefined) {
                onLicenseResponse = null;
            }

            // if (this._lastLicenseDate == null) {
            //      this._lastLicenseDate = new Date();
            //  }

            this.onLicenseResponse = onLicenseResponse;

            var options = {
                user: id,
                loginType: 'google',
                product: 'rw4gc'
            };

            if (this.licenseType == texthelp.RW4GC.enums.AccountType.MICROSOFTSHAREPOINT) {
                options.loginType = 'microsoft';
            }
            if (productCode !== undefined) {
                options.authCode = productCode;
            }

            try {

                thAuth.licenseCheck(options, (error, licence) => {
                    licence.lType = this.licenseType;
                    licence.interactive = this._interactive;
                    licence.Email = id;

                    var d = new Date();
                    licence.stamp = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

                    this.details.license = licence;
                    this.details.id = id;
                    this.onLicenseResponse(licence);
                });
            } catch (err) {}

            // get any stored license
            /*      chrome.storage.sync.get({
                      // this is the default license if one isn't loaded.
                      thpl: {daysleft:-1}
                  }, (storage)=>{
                        this.licenseJSON = licence;
                        var trial = false;
                      if (this.licenseJSON.trial !== undefined){
                          trial = this.licenseJSON.trial;
                      }
                        // if a timeout occured.
                      if (this.licenseJSON.lt !== undefined){
                            if (storage.thpl.daysleft > 0){
                                // if the stored license is still premium use it
                              this.licenseJSON = storage.thpl;
                          }
                          else{
                                // otherwise create a freemium
                              this.licenseJSON.daysleft = 0;
                              this.licenseJSON.lType = this.licenseType;
                              this.licenseJSON.interactive = this._interactive;
                              this.licenseJSON.Email = id;
                              this.licenseJSON.features = JSON.parse('{"Audio Maker":false,"Calculator":false,"Daisy Reader":false,"Dictionary":false,"Erase Highlights":false,"Fact Mapper":false,"Handwriting":false,"Highlights":false,"Hover Speech":true,"Pause":true,"PDF Reader":false,"Picture Dictionary":false,"Play":true,"Practice Reading Aloud":false,"Predict Ahead":false,"Prediction":false,"Pronunciation Tutor":false,"Research Folder":false,"Scan":false,"Screen Masking":false,"Screenshot Reader":false,"Similar Word Checker":false,"Simplify Page":false,"Spell Check":false,"Stop":true,"Talk&Type":false,"Toolbar Icon sets - Clear":false,"Toolbar Icon sets - Color":false,"Toolkit":false,"Translator":true,"Verb Checker":false,"Vocabulary List":false,"Voice Note":true,"Web Search":false,"Word Cloud":false,"Word Wizard":false}');                          
                          }
                            this.details.license = JSON.stringify(this.licenseJSON);
                          this.details.id = id;
                      }
                          // if the license is premium then just return it and no timeout
                      else if (this.licenseJSON.daysleft > 0 && !trial){
                            this.licenseJSON.lType = this.licenseType;
                          this.licenseJSON.interactive = this._interactive;
                          this.licenseJSON.Email = id;
                          this.details.license = this.licenseJSON;
                          this.details.id = id;
                          this.onLicenseResponse(this.licenseJSON);
                            // store the license incase of server outage. 
                          chrome.storage.sync.set({
                              thpl: this.licenseJSON
                          });
                            return;
                      }
                     
                      // other wise just check the old POS to see if thats 
                /*      let encryptedId = thHash.hashEmail(id);
                      var profileURL = 'https://rw.texthelp.com/access/access/getaccess?id=' + id + '&type=0&test=' + Math.random();
                          // get the links from S3
                      var xhr = new XMLHttpRequest();
                      xhr.open("GET", profileURL, true);
                      xhr.onreadystatechange = function () {
                          var contentType = '';
                          if (xhr.readyState == 4) {
                              if (xhr.status == 200) {
                                    var license = this.licenseJSON;
                                  var data = JSON.parse(xhr.responseText);
                                  // if premium
                                  if (data.Valid && !data.Trial) {
                                      license = this._copyOldLicenseToNew(data, license);
                                      license.trial = false;
                                      var parameters = [];
                                      parameters.push('missing in family');
                                      parameters.push(id);
                                      parameters.push(id['split']('@')[1]);
                                        window.thFunctions.onSendEvent(parameters);
                                  }
                                  // a user not in the group though a group domain
                                  // we do not display the message and expire imediately
                                  else if (data.UserType == 'Group' && !data.Valid && data.Trial) {
                                      license = this._copyOldLicenseToNew(data, license);
                                      license.dply = false;
                                  }
                                    license.lType = this.licenseType;
                                  license.interactive = this._interactive;
                                  license.Email = id;
                                  this.details.license = license;
                                  this.details.id = id;
                                  this.onLicenseResponse(license);
                                }
                          }
                      }.bind(this);
                      xhr.ontimeout = function (e) {
                            var license = this.licenseJSON;
                          license.lType = this.licenseType;
                          license.interactive = this._interactive;
                          license.Email = id;
                          license.trial = false;
                          license.daysleft = 30;
                          this.details.license = license;
                          this.details.id = id;
                          this.onLicenseResponse(license);
                        }.bind(this);
                      xhr.timeout = 5000;
                      xhr.send();*/
            /*   fetch(profileURL, {
                   method: 'get'
               }).then((response)=>{
                   return response.json();
               }).then((data) => {
                     var license = this.licenseJSON;
                   // if premium
                   if (data.Valid && !data.Trial ){
                       license = this._copyOldLicenseToNew(data, license);
                       license.trial = false;
                       var parameters = [];
                       parameters.push('missing in family');
                       parameters.push(id);
                       parameters.push(id['split']('@')[1]);
                         window.thFunctions.onSendEvent(parameters);
                       // notify the toolbar has been opened. 
                       /*     window.postMessage({
                                "type": "1757FROM_PAGERW4G",
                                "key": "function",
                                "method": "SendEvent",
                                "parameters": parameters
                            }, '*');*/
            /*        }
                    // a user not in the group though a group domain
                    // we do not display the message and expire imediately
                    else if (data.UserType == 'Group' && !data.Valid && data.Trial) {
                        license = this._copyOldLicenseToNew(data, license);
                        license.dply = false;
                    }
                      license.lType = this.licenseType;
                    license.interactive = this._interactive;
                    license.Email = id;
                    this.details.license = license;
                    this.details.id = id;
                    this.onLicenseResponse(license);
                        /*     data.lType = this.licenseType;
                         data.interactive = this._interactive;
                         this.details.license = data;
                         this.details.id = id;
                         this.onLicenseResponse(data);*/
            /*       }).catch((err) => {
                         this.onLicenseResponse(license);
                       console.log(err);
                   });*/

            //         });
            //       });
            /*         let encryptedId = thHash.hashEmail(id);
                     var profileURL = 'https://rw.texthelp.com/access/access/getaccess?id=' + id + '&type=0';
                       fetch(profileURL, {
                         method: 'get'
                     }).then((response)=>{
                         return response.json();
                     }).then((data) => {
                         data.lType = this.licenseType;
                         data.interactive = this._interactive;
                         this.details.license = data;
                         this.details.id = id;
                         this.onLicenseResponse(data);
                     }).catch((err) => {
                         console.log(err);
                     });*/
        } catch (err) {}
    }

    _copyOldLicenseToNew(oldLicense, license) {

        var newLicense = license;

        newLicense.daysleft = oldLicense.DaysLeft;
        newLicense.expiry = oldLicense.Expiry.split('T')[0];

        var features = oldLicense['Features'];

        for (var i = 0; i < features.length; i++) {
            if (features[i]['FeatureName'] == "Dictionary") {
                newLicense.features['Dictionary'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "PictureDictionary") {
                newLicense.features['Picture Dictionary'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "Speech") {
                newLicense.features['Play'] = features[i]['Enabled'];
                newLicense.features['Hover Speech'] = features[i]['Enabled'];
                newLicense.features['Pause'] = features[i]['Enabled'];
                newLicense.features['Stop'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "FactFinder") {
                newLicense.features['Web Search'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "Translator") {
                newLicense.features['Translator'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "StudySkills") {
                newLicense.features['Highlights'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "Vocab") {
                newLicense.features['Vocabulary List'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "Simplify") {
                newLicense.features['Simplify Page'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "Prediction") {
                newLicense.features['Prediction'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "Prediction-PredictAhead") {
                newLicense.features['Predict Ahead'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "SSR") {
                newLicense.features['Screenshot Reader'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "SpeechInput") {
                newLicense.features['Talk&Type'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "VoiceNotes") {
                newLicense.features['Voice Note'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "SpeechMaker") {
                newLicense.features['Audio Maker'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "ScreenMasking") {
                newLicense.features['Screen Masking'] = features[i]['Enabled'];
            } else if (features[i]['FeatureName'] == "PracticeReadingAloud") {
                newLicense.features['Practice Reading Aloud'] = features[i]['Enabled'];
            }
        }

        return newLicense;
    }

    writeVocabDocument(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var url = 'https://rwgoogle-webservices-7.texthelp.com/v1.11.0/vocab?json=';
        if (params.locale == 'fr' || params.locale == 'pt' || params.locale == 'es' || params.locale == 'nl') {
            url = 'https://rwgoogle-webservices-7.texthelp.com/v1.11.0/vocabHTML?json=';
        }

        var parameters = '{"t":"5","i":"f","g":"t","u":"' + params.user + '","e":"n4T7Y2AjS4","b":[';

        for (var i = 0; i < params.words.length; i++) {
            parameters += '"' + params.words[i].trim() + '"';
            if (i < params.words.length - 1) {
                parameters += ', ';
            }
        }

        parameters += '],"l":"' + params.locale + '"}';

        url += encodeURIComponent(parameters);

        fetch(url, {
            method: 'POST'
        }).then(response => {
            return this._handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token);
        }).then(data => {

            params.vocab = data;

            if (data.service !== undefined) {

                this.writeVocabHTMLResponse(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
                return;
            }

            this.writeVocabResponse(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
        }).catch(err => {
            console.log(err);
        });
    }

};
exports.default = TexthelpServices;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _IdentityManager = __webpack_require__(3);

var _IdentityManager2 = _interopRequireDefault(_IdentityManager);

var _MessagingManager = __webpack_require__(10);

var _MessagingManager2 = _interopRequireDefault(_MessagingManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.texthelp = window.texthelp || {};
window.texthelp.RW4GC = window.texthelp.RW4GC || {};
window.texthelp.RW4GC.enums = window.texthelp.RW4GC.enums || {};

// Enums

/* Types of access lets the authenticator decide what
   scopes they require for the AccessType
*/
window.texthelp.RW4GC.enums.AccessType = Object.freeze({
    "IDENTITY": 1,
    "HIGHLIGHTS": 2,
    "VOCAB": 3,
    "VOICENOTES": 4,
    "CHECKITDICTIONARY": 5
});

/* Types accounts supported.
*/
window.texthelp.RW4GC.enums.AccountType = Object.freeze({
    "GOOGLE": "Google",
    "MICROSOFTSHAREPOINT": "MicrosoftSharepoint"
});

/* Messaging services supported.
*/
window.texthelp.RW4GC.enums.MessagingType = Object.freeze({
    "COUCHDB": "CouchDb",
    "GCM": "GCM"
});

/* Exported classes
*/
window.texthelp.RW4GC.IdentityManager = _IdentityManager2.default;
window.texthelp.RW4GC.MessagingManager = _MessagingManager2.default;

window.texthelp.RW4GC.promiseTimeout = function (ms, promise) {

    return new Promise(function (resolve, reject) {

        // create a timeout to reject promise if not resolved
        var timer = setTimeout(function () {
            reject(new Error("promise timeout"));
        }, ms);

        promise.then(function (res) {
            clearTimeout(timer);
            resolve(res);
        }).catch(function (err) {
            clearTimeout(timer);
            reject(err);
        });
    });
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _GoogleAuthenticator = __webpack_require__(0);

var _GoogleAuthenticator2 = _interopRequireDefault(_GoogleAuthenticator);

var _AuthenticatorFactory = __webpack_require__(7);

var _AuthenticatorFactory2 = _interopRequireDefault(_AuthenticatorFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Manages the the current users identity 
class IdentityManager {

    // Constructor
    constructor(accountType) {

        this._id = '';
        this._license = null;
        this._productCode = '';
        this._backupLicence = null;
        this._barshown = false;

        // In the constructor we will attempt to get the users id and license 
        // without prompting them.

        // default to a Google account if no account type is set.
        if (accountType === undefined) {
            accountType = texthelp.RW4GC.enums.AccountType.GOOGLE;
            //         accountType = texthelp.RW4GC.enums.AccountType.MICROSOFTSHAREPOINT;
        }

        // create the authenticator for the current account type and get the users id. As we are in the constructor
        // and don't want any OAuth dialogs on a Chrome start set Interactive here to false. 
        this._authenticator = new _AuthenticatorFactory2.default(accountType).authenticator;

        this.getLicense(false);
    }

    /**
    * Returns a license stored in memory if its from today otherwise null.
    * If null we need to get another license another way.
    * @return {object} a license if we have a license < a day old in memory
    */
    _getDailyInMemoryLicense() {
        // get the current date stamp
        var d = new Date();
        var dateStamp = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

        if (this._license == null) {
            this._id = '';
            this._license = null;

            return null;
        };

        if (this._license.stamp == undefined) {

            this._id = '';
            this._license = null;

            return null;
        }

        // if the date stamp has changed a different day. Rest the current users id 
        // meaning we will get a new license for the user.
        if (dateStamp !== this._license.stamp) {
            this._id = '';
            this._license = null;

            return null;
        }

        if (this._license !== null && this._license.error === undefined) {

            return this._license;
        }

        return null;
    }

    /**
    * Returns a license stored in chrome.sync if its from today otherwise null.
    * If null we need to get another license another way.
    * @return {object} a license if we have a license < a day old in memory
    */
    _getDailyChromeSyncLicense(callback) {

        if (callback == undefined) {
            return;
        }

        if (callback == null) {
            return;
        }

        // get the current date stamp
        var d = new Date();
        var dateStamp = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

        // get any stored license from chrome sync
        chrome.storage.sync.get({
            // this is the default license if one isn't loaded.
            thpl2: { daysleft: -1, noLicense: true }
        }, storage => {

            if (storage.thpl2.stamp == undefined) {
                // no date stamp so license is considered out of date.
                // returning null means get the license another way 
                callback(null, dateStamp);

                this._id = '';
                this._license = null;

                return;
            }

            if (dateStamp !== storage.thpl2.stamp) {
                // if the date stamp has changed to a different day. Its out of date.
                // returning null means get the license another way 

                this._id = '';
                this._license = null;

                callback(null, dateStamp);
                return;
            }

            // else license in chrome sync is valid. Return it. 
            callback(storage.thpl2, dateStamp);
        });
    }

    /**
     * Gets the users license asynchronously. This forces a request to get a new license and updates the cache. 
     * @param {boolean} interactive false stops any authentication dialogs being displayed.
     * @param {function} callback with the users id. If its an empty string authentication was not given.
     * @param {string} license product code if we have one 
     */
    getLicenseNoCache(interactive, callback, productCode) {

        if (callback == undefined) {
            callback = null;
        }

        // otherwise we need to hit the licensing serivce.
        this._authenticator._getID(interactive, id => {

            if (id == null) {
                if (callback !== null) {
                    callback({ "error": "No id to license" });
                }
                return;
            }

            if (id.length == 0) {
                if (callback !== null) {
                    callback({ "error": "No id to license" });
                }
                return;
            }

            this._authenticator._getLicense(id, license => {

                // if the new license is temp just return 
                if (license.lt !== undefined) {

                    // no caching here but lets check if there is an old license
                    this._getDailyChromeSyncLicense((licenseCache, dateStamp) => {

                        // check if there is an old license in the cache set it as temp and return it.
                        if (licenseCache !== null) {

                            // store the license in memory
                            licenseCache.lt = license.lt;

                            if (callback !== null) {
                                callback(licenseCache);
                            }

                            // if the temp license is 5 days or older send an analytics event notifying 
                            // us of the fact.
                            var days = moment(dateStamp) - moment(licenseCache.stamp);
                            if (days > 5) {

                                var id = licenseCache.Email;
                                var parameters = [];
                                parameters.push('temp license extended use');
                                parameters.push(id);
                                parameters.push(id['split']('@')[1]);

                                window.thFunctions.onSendEvent(parameters);
                            }

                            return;
                        }
                    });

                    // if no license cached just return the temp one without any caching.
                    if (callback !== null) {
                        callback(license);
                    }

                    return;
                }

                if (license.lt == undefined) {
                    this._license = license;
                    chrome.storage.sync.set({
                        thpl2: license
                    });
                }

                //     this._license.stamp = dateStamp;
                if (callback !== null) {
                    callback(license);
                }
            }, productCode);
        });
    }

    /**
    * Gets the users license asynchronously. The license may be retieve from memory or 
    * chrome sync if its from today otherwise does a license check.  
    * @param {boolean} interactive false stops any authentication dialogs being displayed.
    * @param {function} callback with the users id. If its an empty string authentication was not given.
    * @param {string} license product code if we have one 
    */
    getLicense(interactive, callback, productCode) {
        if (callback == undefined) {
            callback = null;
        }

        var topic = '';

        // get any stored policy license features from chrome sync
        chrome.storage.managed.get('features', function (policy) {

            // create empty object if no policy license features defined 
            if (policy.features == undefined) {
                policy.features = {};
            }

            // return the in memory daily license
            var inMemoryLicense = this._getDailyInMemoryLicense();
            if (callback !== null && inMemoryLicense !== null) {
                // return the in memory daily license. No need to do a license check
                // to the licensing service.
                if (this._backupLicence == null) {
                    this._backupLicence = inMemoryLicense;
                }

                var checkMessage = !this.isTrialOrFreemiumLicence(inMemoryLicense);
                if (checkMessage && this._barshown) {

                    topic = thHash.hashEmail(inMemoryLicense.Email);
                    texthelp.RW4GC.MessagingManagerInstance.getLastMessage(topic, true, lastMessage => {
                        if (lastMessage !== undefined) {

                            inMemoryLicense.thdd = lastMessage;
                        }

                        inMemoryLicense.pfs = policy.features;

                        callback(inMemoryLicense);
                    });

                    texthelp.RW4GC.MessagingManagerInstance.waitForNextMessage(topic, lastMessage => {
                        if (lastMessage !== undefined) {

                            inMemoryLicense.thdd = lastMessage;
                        }

                        inMemoryLicense.pfs = policy.features;

                        callback(inMemoryLicense);
                    });
                } else {
                    inMemoryLicense.pfs = policy.features;

                    if (callback !== null) {
                        callback(inMemoryLicense);
                    }
                }

                return;
            }

            // no in memory license get one from chrome sync
            this._getDailyChromeSyncLicense((license, dateStamp) => {
                // if we get the license in chrome sync store it in memory for 
                // next time.
                if (license !== null) {
                    // store the license in memory
                    this._license = license;

                    if (this._backupLicence == null) {
                        this._backupLicence = license;
                    }

                    // Pass this parsed message back to the background
                    // script. This is used by the messaging service as
                    // the "base" license before message rules ar applied.
                    // window['thPostMessage']({ type: '1757FROM_PAGERW4G', 'method': 'thMsgBaseLicense', 'license': licenseObject['features']}, '*');

                    var _checkMessage = !this.isTrialOrFreemiumLicence(license);
                    if (_checkMessage && this._barshown) {

                        topic = thHash.hashEmail(license.Email);
                        texthelp.RW4GC.MessagingManagerInstance.getLastMessage(topic, false, lastMessage => {
                            if (lastMessage !== undefined) {
                                license.thdd = lastMessage;
                            }

                            if (callback !== null) {
                                license.pfs = policy.features;
                                callback(license);
                            }
                        });

                        texthelp.RW4GC.MessagingManagerInstance.waitForNextMessage(topic, lastMessage => {
                            if (lastMessage !== undefined) {
                                license.thdd = lastMessage;
                            }

                            if (callback !== null) {
                                license.pfs = policy.features;
                                callback(license);
                            }
                        });
                    } else {
                        license.pfs = policy.features;

                        if (callback !== null) {
                            callback(license);
                        }
                    }
                    return;
                }

                // otherwise we need to hit the licensing service. First get teh users id
                this._authenticator._getID(interactive, id => {

                    if (id == null) {
                        if (callback !== null) {
                            callback({ "error": "No id to license" });
                        }
                        return;
                    }

                    if (id.length == 0) {
                        if (callback !== null) {
                            callback({ "error": "No id to license" });
                        }
                        return;
                    }

                    // get the license for that id
                    this._authenticator._getLicense(id, license => {
                        if (this._backupLicence == null) {
                            this._backupLicence = license;
                        }

                        var checkMessage = !this.isTrialOrFreemiumLicence(license);
                        if (checkMessage && this._barshown) {

                            topic = thHash.hashEmail(license.Email);
                            texthelp.RW4GC.MessagingManagerInstance.getLastMessage(topic, false, lastMessage => {
                                if (lastMessage !== undefined) {
                                    license.thdd = lastMessage;
                                }

                                // if we currently have a license in the cache and the new license is temp just return 
                                // the old license 
                                if (this._license !== null && license.lt !== undefined) {

                                    this._license.lt = licence.lt;
                                    this._license.thdd = license.thdd;

                                    if (callback !== null) {
                                        var tempLicense = this._license;
                                        tempLicense.pfs = policy.features;
                                        callback(tempLicense);
                                    }

                                    return;
                                }

                                // only cache the license if its not lt.
                                if (license.lt == undefined) {
                                    // else cache the licese and then return it.
                                    this._license = license;
                                    chrome.storage.sync.set({
                                        thpl2: license
                                    });
                                }

                                if (callback !== null) {
                                    license.pfs = policy.features;
                                    callback(license);
                                }
                            });

                            texthelp.RW4GC.MessagingManagerInstance.waitForNextMessage(topic, lastMessage => {
                                if (lastMessage !== undefined) {
                                    license.thdd = lastMessage;
                                }

                                // if we currently have a license in the cache and the new license is temp just return 
                                // the old license 
                                if (this._license !== null && license.lt !== undefined) {

                                    this._license.lt = licence.lt;
                                    this._license.thdd = license.thdd;

                                    if (callback !== null) {
                                        var tempLicense = this._license;
                                        tempLicense.pfs = policy.features;
                                        callback(tempLicense);
                                    }

                                    return;
                                }

                                /*
                                // only cache the license if its not lt.
                                if (license.lt == undefined) {
                                    // else cache the licese and then return it.
                                    this._license = license;
                                    chrome.storage.sync.set({
                                        thpl2: license
                                    });
                                }
                                */

                                if (callback !== null) {
                                    license.pfs = policy.features;
                                    callback(license);
                                }
                            });
                        } else {
                            // if we currently have a license in the cache and the new license is temp just return 
                            // the old license 
                            if (this._license !== null && license.lt !== undefined) {

                                this._license.lt = licence.lt;

                                if (callback !== null) {
                                    var tempLicense = this._license;
                                    tempLicense.pfs = policy.features;
                                    callback(tempLicense);
                                }

                                return;
                            }

                            // only cache the license if its not lt.
                            if (license.lt == undefined) {
                                // else cache the licese and then return it.
                                this._license = license;
                                chrome.storage.sync.set({
                                    thpl2: license
                                });
                            }

                            if (callback !== null) {
                                license.pfs = policy.features;
                                callback(license);
                            }
                        }
                    }, productCode);
                });
            });
        }.bind(this));
    }

    getId(interactive, callback) {
        this._authenticator._getID(interactive, callback);
    }

    collectHighlights(documentHighlights, callback) {
        this._authenticator._collectHighlights(documentHighlights, callback);
    }

    vocab(params, callback) {
        this._authenticator._vocab(params, callback);
    }

    getVoiceNoteOAuthToken(params, callback) {
        this._authenticator._getVoiceNoteOAuthToken(params, callback);
    }

    setproductCode(productCode, callback) {

        this._productCode = productCode;

        this.getLicenseNoCache(true, callback, productCode);
    }

    get id() {
        return this._authenticator._id;
    }

    onBarVisible() {
        this._barshown = true;
    }

    onBarShown() {
        this._authenticator._onBarShown();
    }

    getBackupFeatures() {
        if (this._backupLicence !== null) {
            return this._backupLicence.features;
        } else {
            return undefined;
        }
    }

    /**
     * Updates the dictionary for the checkit spelling service.
     * 
     * @param {object} updatedDictionary json object that is just a list 
     *     of words to ignore.
     */
    updateCheckItDictionary(updatedDictionary) {}

    /**
     * Check if the license is a trial licence
     */
    isTrialOrFreemiumLicence(licence) {

        var trial = false;
        if (licence.trial !== undefined) {
            trial = licence.trial;
        }

        if (licence.daysleft > 0 && !trial) {
            // premium
            return false;
        } else if (licence.daysleft > 0 && trial) {
            // trial
            return true;
        } else {
            // freemium
            return true;
        }
    }

}
//import MicrosoftSharepointAuthenticator from './MicrosoftSharepointAuthenticator.js';
;
exports.default = IdentityManager;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TexthelpServices = __webpack_require__(1);

var _TexthelpServices2 = _interopRequireDefault(_TexthelpServices);

var _TexthelpFolderManagerInGoogleDrive = __webpack_require__(6);

var _TexthelpFolderManagerInGoogleDrive2 = _interopRequireDefault(_TexthelpFolderManagerInGoogleDrive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
*   Class where calls to Google services are implemented. 
*/
class GoogleServices extends _TexthelpServices2.default {

    // Constructor
    constructor() {
        super();

        this._id = '';
        this._name = '';
        this.driveFolder = new _TexthelpFolderManagerInGoogleDrive2.default();
    }

    /*
    *   Gets the scopes required to retrieve a Google id via oAuth
    *   @return {Array} array of the scopes required.
    */
    get idScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.IDENTITY];
    }

    /*
    *   Gets the scopes required to create highlights.
    *   @return {Array} array of the scopes required.
    */
    get collectHighlightsScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.HIGHLIGHTS];
    }

    /*
    *   Gets the scopes required to create a vocab document.
    *   @return {Array} array of the scopes required.
    */
    get vocabScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.VOCAB];
    }

    /*
    *   Gets the scopes required to create voice notes.
    *   @return {Array} array of the scopes required.
    */
    get voiceNoteScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.VOICENOTES];
    }

    /*
    *   Gets the scopes required add ignore all words to the dictionary.
    *   @return {Array} array of the scopes required.
    */
    get checkitDictionaryScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.CHECKITDICTIONARY];
    }

    /*
    *   Gets the scopes required to install the ePub and PDF viewers to drive.
    *   @return {Array} array of the scopes required.
    */
    get driveInstallScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.DRIVEINSTALL];
    }

    /*
    *   Gets the ID from Chrome if the users is signed in. 
    *   @return {Function} callback  of the scopes required.
    */
    getLocalID(callback) {
        // get the user profile info from chrome
        chrome.identity.getProfileUserInfo(userInfo => {

            if (this._id.length > 0) {
                callback(this._id);
                return;
            }

            // if there is an email address
            if (userInfo.email.length > 0) {
                this._id = userInfo.email;
                callback(userInfo.email);
                return;
            }

            callback('');
            return;
        });
    }

    /*
    *   Gets any license stored in your Google account 
    *   @return {Function} returns the stored license or null if non exist
    */
    getStoredLicense(callback) {

        callback(null);
    }

    /*
    *   Gets the ID via oauth if the user is not signed into chrome
    *   @return {Function} callback  of the scopes required.
    */
    getAuthenticatedID(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var profileURL = 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' + token;
        try {
            fetch(profileURL, {
                method: 'get'
            }).then(response => {
                return this._handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token);
            }).then(data => {
                if (data === null) {
                    return;
                }

                this._id = data.email;

                onFuncResponse(this._id);
            });
        } catch (err) {}
    }

    /*
    *   Writes the highlights object to a Google doc.
    */
    writeCollectHighlightsDoc(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var documentHighlights = params;

        var documentHTML = '<!DOCTYPE html><html><head><style>';
        documentHTML += 'p{padding-bottom:10px}.blue{background-color:#0ff}.pink{background-color:#f0f}.green{background-color:#adff2f}.yellow{background-color:#ff0}.boldText{font-weight:700}';
        documentHTML += '</style></head><body>';

        var i = 0;
        for (i = 0; i < documentHighlights.highlights.length; i++) {
            if (documentHighlights.highlights[i].color == "#FFFF00") {
                documentHTML += '<p><span class="yellow">';
            }
            if (documentHighlights.highlights[i].color == "#ADFF2F") {
                documentHTML += '<p><span class="green">';
            }
            if (documentHighlights.highlights[i].color == "#00FFFF") {
                documentHTML += '<p><span class="blue">';
            }
            if (documentHighlights.highlights[i].color == "#FF00FF") {
                documentHTML += '<p><span class="pink">';
            }

            documentHTML += documentHighlights.highlights[i].text + '</span></p>';
        }

        documentHTML += '<br><p><span class="boldText"><a href="' + documentHighlights.url;
        documentHTML += '">' + documentHighlights.title + '</a></span></p>';
        documentHTML += '<p><span class="user">' + this._name + '<br>' + this._id + '</span></p>';

        documentHTML += '</body></html>';

        var requestBody = '--rw4g\n' + 'Content-Type: application/json; charset=UTF-8\n\n' + '{"title": "' + documentHighlights.docTitle + '", "description": "Read&Write for Google Chrome\u2122"}\n' + '--rw4g\n' + 'Content-Type: text/html\n\n' + documentHTML + '\n' + '--rw4g--\n';

        var url = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true';
        fetch(url, {
            headers: {
                'Content-Type': 'multipart/related; boundary="rw4g"',
                "Authorization": 'Bearer ' + token
            },
            method: 'POST',
            body: requestBody
        }).then(response => {
            return this._handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token);
        }).then(data => {
            onFuncResponse(data.alternateLink);
        }).catch(err => {
            console.log(err);
        });
    }

    writeVocabResponse(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var words = params['vocab']['words'];
        var translations = params['translations'];

        var documentHTML = '<!DOCTYPE html><html><head><style>';
        documentHTML += 'p {padding-top: 10px;}\r\nh1,th {font-family: "Open Sans", sans-serif; font-size: 1em;}\r\ntable {width: 100%;}\r\n.oddrow {background-color: #99ccff;}\r\n.evenrow {background-color: #ffffff;}\r\nh1 {text-align:center;}\r\n.VocabWord {font-family: "Open Sans", sans-serif; width:17%;}\r\n.VocabMeaning {font-family: "Open Sans", sans-serif; width:35%;}\r\n.VocabSymbol {font-family: "Open Sans", sans-serif; width:16%;}\r\n.VocabNotes {font-family: "Open Sans", sans-serif; width:32%;}\r\nth,td {font-family: "Open Sans", sans-serif; padding:5px;}\r\n.wordContainer,.BoldText {font-weight:bold; font-family: "Open Sans", sans-serif;}';
        documentHTML += '</style></head><body>';

        documentHTML += '<h1 class=\"vocabTitle\">' + translations['title'] + '</h1><table id=\"vocabTable\">';
        documentHTML += '<tr>';
        documentHTML += '  <th class=\"VocabWord\">' + translations['heading'] + '</th>';
        documentHTML += '  <th class=\"VocabMeaning\">' + translations['meaning'] + '</th>';
        documentHTML += '  <th class=\"VocabSymbol\">' + translations['symbol'] + '</th>';
        documentHTML += '  <th class=\"VocabNotes\">' + translations['notes'] + '</th>';
        documentHTML += '</tr>';

        for (var i = 0; i < words.length; i++) {
            documentHTML += '<tr class=\"' + oddOrEven(i + 1) + 'row\">';
            documentHTML += '   <td class=\"wordContainer\">' + words[i]['word'] + '</td>';
            documentHTML += '   <td class=\"meaningContainer\">';
            for (var j = 0; j < words[i]['inflections'].length; j++) {
                for (var k = 0; k < words[i]['inflections'][j]['definitions'].length; k++) {
                    documentHTML += words[i]['inflections'][j]['definitions'][k]['definition'] + '<br><br>';
                }
            }

            documentHTML += '   </td>';
            documentHTML += '   <td class=\"picContainer\">';
            for (var j = 0; j < words[i]['inflections'].length; j++) {
                for (var k = 0; k < words[i]['inflections'][j]['symbols'].length; k++) {
                    documentHTML += '<img src=\"' + words[i]['inflections'][j]['symbols'][k] + '" /><br />';
                }
            }
            documentHTML += '   </td>';

            documentHTML += '   <td class=\"notesContainer\">&nbsp;</td>';
            documentHTML += '</tr>';
        }

        documentHTML += '</body></html>';

        var requestBody = '--rw4g\n' + 'Content-Type: application/json; charset=UTF-8\n\n' + '{"title": "' + translations['docTitle'] + '", "description": "Read&Write for Google Chrome\u2122"}\n' + '--rw4g\n' + 'Content-Type: text/html\n\n' + documentHTML + '\n' + '--rw4g--\n';

        /*      var xhr = new XMLHttpRequest();
              xhr.open("POST", "https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true", true);
              xhr.setRequestHeader("Content-type", 'multipart/related; boundary="rw4g"');
              xhr.setRequestHeader("Authorization", 'Bearer ' + token);
              xhr.sendResponse = params[1];
              xhr.onreadystatechange = function () {
                  var contentType = '';
                  if (this.readyState == 4) {
                      if (this.status == 200) {
                          this.sendResponse({
                              'method': 'onVocabWeb',
                              'type': '1757FROM_BGRW4G',
                              'payload': JSON.parse(this.response).alternateLink
                          });
                      }
                  }
              }
              xhr.send(requestBody);*/

        var url = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true';
        fetch(url, {
            headers: {
                'Content-Type': 'multipart/related; boundary="rw4g"',
                "Authorization": 'Bearer ' + token
            },
            method: 'POST',
            body: requestBody
        }).then(response => {
            return this._handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token);
        }).then(data => {
            onFuncResponse(data.alternateLink);
        }).catch(err => {
            console.log(err);
        });
    }

    writeVocabHTMLResponse(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var words = params['vocab']['words'];
        var translations = params['translations'];

        var documentHTML = '<!DOCTYPE html><html><head><style>';
        documentHTML += 'p {padding-top: 10px;}\r\nh1,th {font-family: "Open Sans", sans-serif; font-size: 1em;}\r\ntable {width: 100%;}\r\n.oddrow {background-color: #99ccff;}\r\n.evenrow {background-color: #ffffff;}\r\nh1 {text-align:center;}\r\n.VocabWord {font-family: "Open Sans", sans-serif; width:17%;}\r\n.VocabMeaning {font-family: "Open Sans", sans-serif; width:35%;}\r\n.VocabSymbol {font-family: "Open Sans", sans-serif; width:16%;}\r\n.VocabNotes {font-family: "Open Sans", sans-serif; width:32%;}\r\nth,td {font-family: "Open Sans", sans-serif; padding:5px;}\r\n.wordContainer,.BoldText {font-weight:bold; font-family: "Open Sans", sans-serif;}';
        documentHTML += '</style></head><body>';

        documentHTML += '<h1 class=\"vocabTitle\">' + translations['title'] + '</h1><table id=\"vocabTable\">';
        documentHTML += '<tr>';
        documentHTML += '  <th class=\"VocabWord\">' + translations['heading'] + '</th>';
        documentHTML += '  <th class=\"VocabMeaning\">' + translations['meaning'] + '</th>';
        documentHTML += '  <th class=\"VocabSymbol\">' + translations['symbol'] + '</th>';
        documentHTML += '  <th class=\"VocabNotes\">' + translations['notes'] + '</th>';
        documentHTML += '</tr>';

        for (var i = 0; i < words.length; i++) {
            documentHTML += '<tr class=\"' + oddOrEven(i + 1) + 'row\">';
            documentHTML += '   <td class=\"wordContainer\">' + words[i]['word'] + '</td>';
            documentHTML += '   <td class=\"meaningContainer\">';
            documentHTML += words[i]['definition'];
            /*     for (var j = 0; j < words[i]['inflections'].length; j++) {
                     for (var k = 0; k < words[i]['inflections'][j]['definitions'].length; k++) {
                         documentHTML += words[i]['inflections'][j]['definitions'][k]['definition'] + '<br><br>';
                     }
                 }     */

            documentHTML += '   </td>';
            documentHTML += '   <td class=\"picContainer\">';
            for (var k = 0; k < words[i]['symbols'].length; k++) {
                documentHTML += '<img src=\"' + words[i]['symbols'][k] + '" /><br />';
            }
            documentHTML += '   </td>';

            documentHTML += '   <td class=\"notesContainer\">&nbsp;</td>';
            documentHTML += '</tr>';
        }

        documentHTML += '</body></html>';

        var requestBody = '--rw4g\n' + 'Content-Type: application/json; charset=UTF-8\n\n' + '{"title": "' + translations['docTitle'] + '", "description": "Read&Write for Google Chrome\u2122"}\n' + '--rw4g\n' + 'Content-Type: text/html\n\n' + documentHTML + '\n' + '--rw4g--\n';

        var url = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true';
        fetch(url, {
            headers: {
                'Content-Type': 'multipart/related; boundary="rw4g"',
                "Authorization": 'Bearer ' + token
            },
            method: 'POST',
            body: requestBody
        }).then(response => {
            return response.json();
        }).then(data => {
            onFuncResponse(data.alternateLink);
        }).catch(err => {
            console.log(err);
        });
    }

    getVoiceNoteToken(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {
        var url = 'https://www.googleapis.com/drive/v2/files';
        try {
            fetch(url, {
                method: 'get',
                headers: {
                    "Authorization": 'Bearer ' + token
                }
            }).then(response => {
                return this._handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token);
            }).then(data => {
                onFuncResponse(this._token);
            });
        } catch (err) {}
    }
};
exports.default = GoogleServices;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

class BaseAuthenticator {

    constructor() {
        this._authenticated = false;
    }

    /* Convenience function that returns a default value if its 
       undefined, null or an empty string. Otherwise returns 
       the passed in value
    */
    getDefaultValue(varValue, defaultValue) {

        if (varValue === undefined) {
            return defaultValue;
        }

        if (varValue === null) {
            return defaultValue;
        }

        if (varValue.length === 0) {
            return defaultValue;
        }

        return varValue;
    }

    /**
    * gets the current users id which likely will be an email address.
    * @param {boolean} interactive false stops any authentication dialogs being displayed.
    * @param {function} callback callback with the users id. If its an empty string authentication was not given.
    */
    _getID(interactive, callback) {
        // authenticate and get the ID using OAuth,
        this.authenticate(interactive, this.idScopes, this.getAuthenticatedID, id => {
            // return if we get null as we didn't get authenticated. 
            callback(id);
        });
    }

    _collectHighlights(documenthighlights, callback) {
        // make an authenticated write highlights to docs call.
        this.authenticate(true, this.collectHighlightsScopes, this.writeCollectHighlightsDoc, resultUrl => {
            // return if we get null as we didn't get authenticated. 
            callback(resultUrl);
        }, documenthighlights);
    }

    _vocab(params, callback) {

        // make an authenticated vocab to docs call.
        this.authenticate(true, this.vocabScopes, this.writeVocabDocument, resultUrl => {
            // return if we get null as we didn't get authenticated. 
            callback(resultUrl);
        }, params);
    }

    _getVoiceNoteOAuthToken(params, callback) {
        // make an authenticated vocab to docs call.
        this.authenticate(true, this.voiceNoteScopes, this.getVoiceNoteToken, token => {
            // return if we get null as we didn't get authenticated. 
            callback(token);
        }, {});
    }

    _revokeCachedToken(token, interactive, scopes, funcToOAuth, onFuncResponse, params) {
        // revoke the cached token and authenticate the call again. 
        // if the token has expired this will get a new one and the call
        // will work. If not then permission hasn't been granted. 
        // Retry is set to false so this is only done one. 
        chrome.identity.removeCachedAuthToken({ token: token }, () => {
            this.authenticate(interactive, scopes, funcToOAuth, onFuncResponse, params, false);
        });
    }

    _onBarShown() {}

};
exports.default = BaseAuthenticator;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});


/*
*   Creates and tracks folders created in your drive.
*/
class TexthelpFolderManagerInGoogleDrive {

    // Constructor
    constructor() {}

    getStoredLicense(accessToken) {}

    getDriveFileListFromFolder(folderID, fileName, accessToken) {

        var requestUrl = "https://www.googleapis.com/drive/v3/files?q=name%3D'" + fileName + "'&spaces=" + folderID;

        texthelp.RW4GC.promiseTimeout(5000, fetch(requestUrl, {
            method: 'get',
            headers: new Headers({
                'Authorization': 'Bearer ' + accessToken
            })
        })).then(function (response) {
            var contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            throw new TypeError("Oops, we haven't got JSON!");
        }).then(function (jsonResponse) {
            console.log(jsonResponse);
        }).catch(function (error) {
            console.log(error);
        });
    }
};
exports.default = TexthelpFolderManagerInGoogleDrive;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _GoogleAuthenticator = __webpack_require__(0);

var _GoogleAuthenticator2 = _interopRequireDefault(_GoogleAuthenticator);

var _MicrosoftSharepointAuthenticator = __webpack_require__(8);

var _MicrosoftSharepointAuthenticator2 = _interopRequireDefault(_MicrosoftSharepointAuthenticator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creates the right type of authenticator based on the the account type
// If the account type is Google it will try to create an instance of
// GoogleAuthenticator, if the class does not exist it will return
// an empty object.  
class AuthenticatorFactory {

    /**
     * @constructor
     * @param {string} accountType to create.
     */
    constructor(accountType) {
        try {
            if (accountType == texthelp.RW4GC.enums.AccountType.GOOGLE) {
                this._authenticator = new _GoogleAuthenticator2.default();
            } else if (accountType == texthelp.RW4GC.enums.AccountType.MICROSOFTSHAREPOINT) {
                this._authenticator = new _MicrosoftSharepointAuthenticator2.default();
            } else {
                this._authenticator = {};
            }
            //   this._authenticator = new [accountType + 'Authenticator']();
        } catch (ex) {
            console.log(ex);
            this._authenticator = {};
        }
    }

    /**
     * Read only property to get the correct authenticator instance
     * @constructor
     * @return {object} instance of the created authenticator.
     */
    get authenticator() {
        return this._authenticator;
    }
}
exports.default = AuthenticatorFactory;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MicrosoftSharepointServices = __webpack_require__(9);

var _MicrosoftSharepointServices2 = _interopRequireDefault(_MicrosoftSharepointServices);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MicrosoftSharepointAuthenticator extends _MicrosoftSharepointServices2.default {
    constructor() {
        super();

        this.scopes = {};
        this.scopes[texthelp.RW4GC.enums.AccessType.IDENTITY] = [];

        this.scopes[texthelp.RW4GC.enums.AccessType.HIGHLIGHTS] = [];

        this.scopes[texthelp.RW4GC.enums.AccessType.VOCAB] = [];

        this.scopes[texthelp.RW4GC.enums.AccessType.VOICENOTES] = [];

        this.scopes[texthelp.RW4GC.enums.AccessType.CHECKITDICTIONARY] = [];

        this._interactive = false;
    }

    authenticate(interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        this._interactive = interactive;

        if (retry === undefined) {
            retry = true;
        }

        var CLIENT_ID = '1a406439-3b21-4c7b-b654-8885aadbdc81';
        var REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');

        var GRAPHRESOURCE = 'https://graph.microsoft.com/';
        var GRAPHSCOPES = 'https://graph.microsoft.com/user.read';

        var options = {
            'interactive': interactive,
            'url': 'https://login.windows.net/common/oauth2/authorize?client_id=' + CLIENT_ID + '&response_type=token&resource=' + GRAPHRESOURCE + '&redirect_uri=' + REDIRECTURI + '&scope=email'
        };

        chrome.identity.launchWebAuthFlow(options, response => {

            if (chrome.runtime.lastError !== undefined) {};

            if (response == undefined) {
                retry = false;
                return onFuncResponse(null);
            }

            var tokensplit = response.split('access_token=');
            if (tokensplit.length < 2) {
                retry = false;
                return onFuncResponse(null);
            }
            var token = tokensplit[1].split('&')[0];

            funcToOAuth.bind(this)(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
        });
    }

    _handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token) {

        // if not error just pass the response to the next promise.
        if (response.ok) {
            this._token = token;
            return response.json();
        }

        // if the request is unauthorised it could be that the token in Chromes cache has expired.
        // So removed the potentially expired token and try again.
        // When we try again we set the retry to false to insure we don't get into an authorise dialog
        // loop if they have hit the deny button,
        if (response.status == 401 && retry) {
            retry = false;
            // A 401 percould be 
            // the token has expired, however it could be that the user has hit deny. We 
            this._revokeCachedToken(token, interactive, scopes, funcToOAuth, onFuncResponse, params);
            return null;
        }

        response.token = token;
        response.email = '';
        return response;
    }

    get id() {
        return this._id;
    }

    authenticateDirectory(interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var CLIENT_ID = '1a406439-3b21-4c7b-b654-8885aadbdc81';
        var REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');

        var DISCOVERYRESOURCE = 'https://api.office.com/discovery/';
        var DISCOVERYSCOPES = '';

        //   this._directoryCallback = callback;

        /*    var options = {
                'interactive': interactive,
                'url': 'https://login.windows.net/common/oauth2/authorize?client_id=' + CLIENT_ID + '&response_type=code&resource=' +
                  DISCOVERYRESOURCE + '&redirect_uri=' + REDIRECTURI
            }*/

        var options = {
            'interactive': interactive,
            'url': 'https://login.windows.net/common/oauth2/authorize?client_id=' + CLIENT_ID + '&response_type=token&resource=' + GRAPHRESOURCE + '&redirect_uri=' + REDIRECTURI + '&scope=email'

            /*     chrome.identity.launchWebAuthFlow(options, (response) => {
                       if (chrome.runtime.lastError !== undefined) {};
                       // didn't authenticate, eg the refused authorisation or interactive was false.
                     if (response == undefined) {
                         retry = false;
                         return onFuncResponse(null);
                     }
                       var response_code = response.split('code=')[1].split('&')[0];
                     var response_sessionState = response.split('session_state=')[1];
                       this.o365AccessCode = response_code;
                     this.o365Session = response_sessionState;
                       this.getRemoteAccessToken(response_code, '2', DISCOVERYRESOURCE, REDIRECTURI, CLIENT_ID, response_sessionState, DISCOVERYSCOPES, onFuncResponse);
                     //         this.getAccessToken(response_code, '2', DISCOVERYRESOURCE, REDIRECTURI, CLIENT_ID, response_sessionState, DISCOVERYRESOURCE, this.getOfficeServices);
                   });*/

        };
    }

    getRemoteAccessToken(requestCode, requestAccountType, requestResource, requestRedirectURI, requestClientID, requestSessionState, requestScopes, callback) {

        var url = 'https://rwedge.texthelp.com/thOffice365Service.asmx/generateAccessToken';

        var options = JSON.stringify({
            code: requestCode,
            account_type: requestAccountType,
            resource: requestResource,
            redirect_uri: requestRedirectURI,
            client_id: requestClientID,
            session_state: requestSessionState,
            scope: requestScopes
        });

        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: options
        }).then(response => {
            return response.json();
        }).then(data => {
            this._directoryAccessToken = data.d;
            callback(this._directoryAccessToken);
        }).catch(err => {
            console.log(err);
        });
    }

    /*
    *   Gets the type of authenticator
    */
    get licenseType() {
        return "MicrosoftSharepoint";
    }

}
exports.default = MicrosoftSharepointAuthenticator;

/*texthelp.RW4GC.MicrosoftSharepointAuthenticator = class MicrosoftSharepointAuthenticator extends texthelp.RW4GC.BaseAuthenticator {
    
    constructor() {
        super();
        this._directoryCallback = null;
        this._directoryAccessToken = null;
        this.imageProcessed = true;
        this.base64ImagesArray = [];
    }

    onGetAccessToken(interactive) {
        this.getAccessTokenForGraph(interactive);
     //   getAccessTokenForDirectory(interactive);
    }

    getAccessTokenForGraph(interactive) {
        
        const CLIENT_ID = '0c83ac77-768d-478d-ab44-b3ff4c8b38dc';
        const REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');

        const GRAPHRESOURCE = 'https://graph.microsoft.com/';
        const GRAPHSCOPES = 'https://graph.microsoft.com/user.read';

        this.o365AccessCode;
        this.o365DiscoveryAccessToken;
        this.o365DiscoveryRefreshToken;
        this.o365FilesAccessToken;
        this.o365FilesRefreshToken;
        this.o365ServiceEndpointURI;
        this.o365ServiceResourceId;
        this.o365Session;

        this.documentOpened = false; //needed because of https://karinebosch.wordpress.com/my-articles/improving-performance-of-sharepoint-sites/part-13-etag-header/ 
        this.blankDocument = "UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC0" +
        "lMtuwjAQRfeV+g+Rt1Vi6KKqKgKLPpYtUukHGHsCVv2Sx7z+vhMCUVUBkQpsIiUz994zVsaD0dqa" +
        "bAkRtXcl6xc9loGTXmk3K9nX5C1/ZBkm4ZQw3kHJNoBsNLy9GUw2ATAjtcOSzVMKT5yjnIMVWPgA" +
        "jiqVj1Ykeo0zHoT8FjPg973eA5feJXApT7UHGw5eoBILk7LXNX1uSCIYZNlz01hnlUyEYLQUiep8" +
        "6dSflHyXUJBy24NzHfCOGhg/mFBXjgfsdB90NFEryMYipndhqYuvfFRcebmwpCxO2xzg9FWlJbT6" +
        "2i1ELwGRztyaoq1Yod2e/ygHpo0BvDxF49sdDymR4BoAO+dOhBVMP69G8cu8E6Si3ImYGrg8Rmvd" +
        "CZFoA6F59s/m2NqciqTOcfQBaaPjP8ber2ytzmngADHp039dm0jWZ88H9W2gQB3I5tv7bfgDAAD/" +
        "/wMAUEsDBBQABgAIAAAAIQAekRq37wAAAE4CAAALAAgCX3JlbHMvLnJlbHMgogQCKKAAAgAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArJLBasMw" +
        "DEDvg/2D0b1R2sEYo04vY9DbGNkHCFtJTBPb2GrX/v082NgCXelhR8vS05PQenOcRnXglF3wGpZV" +
        "DYq9Cdb5XsNb+7x4AJWFvKUxeNZw4gyb5vZm/cojSSnKg4tZFYrPGgaR+IiYzcAT5SpE9uWnC2ki" +
        "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" +
        "AAALAAsAwQIAAFArAAAAAA==";

        var options = {
            'interactive': interactive,
            'url': 'https://login.windows.net/common/oauth2/authorize?client_id=' + CLIENT_ID + '&response_type=token&resource=' +
              GRAPHRESOURCE + '&redirect_uri=' + REDIRECTURI
        }

        chrome.identity.launchWebAuthFlow(options, (response) => {
            if (response == undefined) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                }

                // access is not valid so reset everything.
                this._accessToken = null;
                this._email = '';
                this._license = null;

                this.onAccessToken();

                return;
            }
                
            this._accessToken = response.split('access_token=')[1].split('&')[0];
            this.onAccessToken();
   //         this.getProfile(this._accessToken);
 
        });
    }

    getAccessTokenForDirectory(interactive, callback) {
        
        const CLIENT_ID = '0c83ac77-768d-478d-ab44-b3ff4c8b38dc';
        const REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');

        const DISCOVERYRESOURCE = 'https://api.office.com/discovery/';
        const DISCOVERYSCOPES = '';

        this._directoryCallback = callback;

        var options = {
            'interactive': interactive,
            'url': 'https://login.windows.net/common/oauth2/authorize?client_id=' + CLIENT_ID + '&response_type=code&resource=' +
              DISCOVERYRESOURCE + '&redirect_uri=' + REDIRECTURI
        }

        chrome.identity.launchWebAuthFlow(options, (response) => {

            // didn't authenticate, eg the refused authorisation or interactive was false.
            if (response == undefined) {

                this._directoryAccessToken = null;
                this._directoryCallback = null;

                return;
            }

            var response_code = response.split('code=')[1].split('&')[0];
            var response_sessionState = response.split('session_state=')[1];

            this.o365AccessCode = response_code;
            this.o365Session = response_sessionState;

            this.getRemoteAccessToken(response_code, '2', DISCOVERYRESOURCE, REDIRECTURI, CLIENT_ID, response_sessionState, DISCOVERYSCOPES, callback);
   //         this.getAccessToken(response_code, '2', DISCOVERYRESOURCE, REDIRECTURI, CLIENT_ID, response_sessionState, DISCOVERYRESOURCE, this.getOfficeServices);

        });
    }

    getRemoteAccessToken(requestCode, requestAccountType, requestResource, requestRedirectURI,
        requestClientID, requestSessionState, requestScopes, callback) {

        var url = 'https://rwedge.texthelp.com/thOffice365Service.asmx/generateAccessToken';

        var options = JSON.stringify({
            code: requestCode,
            account_type: requestAccountType,
            resource: requestResource,
            redirect_uri: requestRedirectURI,
            client_id: requestClientID,
            session_state: requestSessionState,
            scope: requestScopes
        })

        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body:options
        }).then((response) => {
            return response.json();
        }).then((data) => {
            this._directoryAccessToken = data.d;
            callback(this._directoryAccessToken);
        }).catch((err) => {
            console.log(err);
        });

    }

    getAuthenticatedEmail() {

        var url = 'https://graph.microsoft.com/v1.0/me';

        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + this._accessToken
            },
            method: 'GET'
        }).then(function(response){
            return response.json();
        }.bind(this)).then(function (data) {

            if (data.error == undefined) {
                this._email = data.mail
                if (this._emailCallback !== null) {
                    this._emailCallback(data.mail);
                }

                return;
            }

            if (!this._interactive) {
                if (this._emailCallback !== null) {
                    this._emailCallback(this._email);
                }

                return;
            }

            // if an error occurred with the token revoke it fromt he cache and 
            // then we should be avle to try again.
            chrome.identity.removeCachedAuthToken({ token: this._accessToken }, function () {
                this._accessToken = null;
                texthelp.RW4GC.authenticator.getEmail(true, this._emailCallback);
            }.bind(this))

        }.bind(this)).catch((err) => {
            console.log(err);
        });
    }


    getOfficeServices(accessToken) {

        this._accessToken = accessToken;

        var url = 'https://api.office.com/discovery/me/services';

        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + this._accessToken,
                'Content-Type': 'application/json;odata=verbose',
                'Accept': 'application/json;odata=verbose'
            },
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
      //      console.log('getOfficeServices = ' + JSON.stringify(data.d));
        }).catch((err) => {
            console.log(err);
        });
    }

    getLicenseType() {
        return 'MicrosoftSharepoint';
    }

   


    writeHighlightsDocument(documentHighlights, sendResponse) {

   //     this.getAccessTokenForDirectory(false, (accessToken) => {
            var filename;
            var sort = 1;
            var openedDoc = new openXml.OpenXmlPackage(this.blankDocument);

            var body = openedDoc.mainDocumentPart().getXDocument().root.element(openXml.W.body);
            if (sort === 1) {
                var index = 0;
                for (index = 0; index < documentHighlights.highlights.length; ++index) {
                    var highlightColor;
                    if (documentHighlights.highlights[index].color === "yellow" ||
                        documentHighlights.highlights[index].color === "#FFFF00")//yellow
                    {
                        highlightColor = "yellow";
                    }
                    else if (documentHighlights.highlights[index].color === "magenta" ||
                        documentHighlights.highlights[index].color === "#FF00FF")//magenta
                    {
                        highlightColor = "magenta";
                    }
                    else if (documentHighlights.highlights[index].color === "green" ||
                        documentHighlights.highlights[index].color === "#ADFF2F")//green
                    {
                        highlightColor = "green";
                    }
                    else if (documentHighlights.highlights[index].color === "blue" ||
                        documentHighlights.highlights[index].color === "#00FFFF") //cyan
                    {
                        highlightColor = "cyan";
                    }
                    var byPositionPara = new Ltxml.XElement(openXml.W.p,
                        new Ltxml.XElement(openXml.W.r,
                            new Ltxml.XElement(openXml.W.rPr,
                              new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")),
                              new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")),
                              new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                              new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, highlightColor))
                            ),
                            new Ltxml.XElement(openXml.W.t, documentHighlights.highlights[index].text)
                        )
                    );

                    var lastPara = body.elements(openXml.W.p).lastOrDefault();
                    if (lastPara !== null) {
                        lastPara.addAfterSelf(byPositionPara);

                    }
                }
            }
            else {
                for (var index = 0; index < yellowHighlights.length; ++index) {
                    var byPositionPara = new Ltxml.XElement(openXml.W.p,
                    new Ltxml.XElement(openXml.W.r,
                        new Ltxml.XElement(openXml.W.rPr,
                              new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")),
                              new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")),
                              new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                              new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "yellow"))),
                            new Ltxml.XElement(openXml.W.t, yellowHighlights[index])));

                    lastPara = body.elements(openXml.W.p).lastOrDefault();
                    if (lastPara !== null) {
                        lastPara.addAfterSelf(byPositionPara);

                    }
                }
                for (var index = 0; index < cyanHighlights.length; ++index) {
                    var byPositionPara = new Ltxml.XElement(openXml.W.p,
                    new Ltxml.XElement(openXml.W.r,
                        new Ltxml.XElement(openXml.W.rPr,
                              new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")),
                              new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")),
                              new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                              new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "cyan"))),
                            new Ltxml.XElement(openXml.W.t, cyanHighlights[index])));

                    lastPara = body.elements(openXml.W.p).lastOrDefault();
                    if (lastPara !== null) {
                        lastPara.addAfterSelf(byPositionPara);

                    }
                }
                for (var index = 0; index < greenHighlights.length; ++index) {
                    var byPositionPara = new Ltxml.XElement(openXml.W.p,
                    new Ltxml.XElement(openXml.W.r,
                        new Ltxml.XElement(openXml.W.rPr,
                              new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")),
                              new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")),
                              new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                              new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "green"))),
                            new Ltxml.XElement(openXml.W.t, greenHighlights[index])));

                    lastPara = body.elements(openXml.W.p).lastOrDefault();
                    if (lastPara !== null) {
                        lastPara.addAfterSelf(byPositionPara);

                    }
                }
                for (var index = 0; index < magentaHighlights.length; ++index) {
                    var byPositionPara = new Ltxml.XElement(openXml.W.p,
                    new Ltxml.XElement(openXml.W.r,
                        new Ltxml.XElement(openXml.W.rPr,
                              new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")),
                              new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")),
                              new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                              new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "magenta"))),
                            new Ltxml.XElement(openXml.W.t, greenHighlights[index])));

                    lastPara = body.elements(openXml.W.p).lastOrDefault();
                    if (lastPara !== null) {
                        lastPara.addAfterSelf(byPositionPara);

                    }
                }
            }

            var pDocTitle = new Ltxml.XElement(openXml.W.p,
 //               new Ltxml.XElement(openXml.W.pPr,
 //                    new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "16"))),

                new Ltxml.XElement(openXml.W.pPr,
                     new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")),
                     new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))
                ),

                new Ltxml.XElement(openXml.W.r,
                    new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))
                    ),
                    new Ltxml.XElement(openXml.W.t, documentHighlights.title),
                    new Ltxml.XElement(openXml.W.br)
                ),

                new Ltxml.XElement(openXml.W.r,
                    new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))
                    ),
                    new Ltxml.XElement(openXml.W.t, this._email),
                    new Ltxml.XElement(openXml.W.br)
                ),

                new Ltxml.XElement(openXml.W.r,
                    new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))
                    ),
                    new Ltxml.XElement(openXml.W.t, documentHighlights.url)
                )
            );

            lastPara = body.elements(openXml.W.p).lastOrDefault();
            if (lastPara !== null) {
                lastPara.addAfterSelf(pDocTitle);
            }


        //  new Ltxml.XElement(openXml.W.b)

        /*  new Ltxml.XElement(openXml.W.p,
          new Ltxml.XElement(openXml.W.pPr,
              new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
              i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
              new Ltxml.XElement(openXml.W.rPr,
                  new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                  new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                  i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
          new Ltxml.XElement(openXml.W.r,
              new Ltxml.XElement(openXml.W.rPr,
                  new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                  new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                  i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
              new Ltxml.XElement(openXml.W.t, "Word"))));*/

//var mainXDoc = new Ltxml.XElement(openXml.W.document, new Ltxml.XElement(openXml.W.body, p1, p2, p3, p4));

//var xd = openedDoc.mainDocumentPart().getXDocument();
//xd.root.replaceWith(mainXDoc);

//added some text now save to 64 bit string
/*           var saveToBase64 = openedDoc.saveToBase64();
           var savetoBlob = openedDoc.saveToBlob();

           var arrayBuffer;
           var fileReader = new FileReader();
           fileReader.onload = (function (event) {
               arrayBuffer = event.target.result;

               var binary = '';
               var bytes = new Uint8Array(arrayBuffer);
               var len = bytes.byteLength;
               for (var i = 0; i < len; i++) {
                   binary += String.fromCharCode(bytes[i]);
               }
               // if(window.location.ancestorOrigins[0].indexOf("sharepoint.com") > 0) // We are dealing with Sharepoint so use the sharepoint urls to get access code and tokens
               // {        
               //     // window.postMessage(
               //     // {
               //     //     'method': 'collectHighlightsO365Request',
               //     //     'type': '1757FROM_PAGERW4G',
               //     //     'filename': filename,
               //     //     'filedata': window.btoa( binary )
               //     // }, '*'); 
               var filename = documentHighlights.docTitle + " " + new Date().getTime();
               var binary_string = window.atob(window.btoa(binary));
               var len = binary_string.length;
               var bytes = new Uint8Array(len);
               for (var i = 0; i < len; i++) {
                   bytes[i] = binary_string.charCodeAt(i);
               }
               var filedata = bytes.buffer;
               this.upload0365SharepointDocument(filename, filedata);
               // }
               // else
               // {
               // window.postMessage(
               // {
               //     'method': 'collectHighlightsO365LiveRequest',
               //     'type': '1757FROM_PAGERW4G',
               //     'filename': filename,
               //     'filedata': window.btoa( binary )
               // }, '*');         
               // var filename = 'speechstreamhl';
               // var binary_string =  window.atob(window.btoa( binary ));
               // var len = binary_string.length;
               // var bytes = new Uint8Array( len );
               // for (var i = 0; i < len; i++)        {
               //     bytes[i] = binary_string.charCodeAt(i);
               // }
               // var filedata = bytes.buffer;
               // upload0365LiveDocument(filename, filedata);                        
               //}

               //reinitialise the arrays
               magentaHighlights = [];
               yellowHighlights = [];
               greenHighlights = [];
               cyanHighlights = [];
               byPositionHighlights = [];

           }.bind(this));

           fileReader.readAsArrayBuffer(savetoBlob);

   //    });
   }


   wait(url, callback, count, filename) {
       if (!this.imageProcessed) {
           setTimeout(this.wait, 100, url, callback, count, filename);
       } else {
           this.imageProcessed = false;
           this.convertImgToBase64URL(url, callback, count, filename);
       }
   }

   createvocabdoc(filename, vocabStandardisedData, base64ImagesArray) {
       var symbolCounter = 0;
       var openedDoc = new openXml.OpenXmlPackage(this.blankDocument);

       // Append the paragraphs to the document.
       var body = openedDoc.mainDocumentPart().getXDocument().root.element(openXml.W.body);

       var p1 = new Ltxml.XElement(openXml.W.p,
           new Ltxml.XElement(openXml.W.pPr,
               new Ltxml.XElement(openXml.W.pStyle, new Ltxml.XAttribute(openXml.W.val, "Title")), new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center"))),
           new Ltxml.XElement(openXml.W.r,
               new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.title)));

       var p4 = new Ltxml.XElement(openXml.W.p,
           new Ltxml.XElement(openXml.W.pPr,
               new Ltxml.XElement(openXml.W.pStyle, new Ltxml.XAttribute(openXml.W.val, "Heading1"))),
           new Ltxml.XElement(openXml.W.r,
               new Ltxml.XElement(openXml.W.t, "")));

       var imageElements = [];
       for (var imageIndex = 0; imageIndex < base64ImagesArray.length; imageIndex++) {
           var imageIcon = base64ImagesArray[imageIndex][0];

           var relidHelper = "rId" + (openedDoc.mainDocumentPart().getRelationships().length + 1);

           var imageElement = new Ltxml.XElement(openXml.W.drawing,
               new Ltxml.XElement(openXml.WP.inline,
                   new Ltxml.XElement(openXml.WP.extent, new Ltxml.XAttribute(openXml.NoNamespace.cx, "457200"), new Ltxml.XAttribute(openXml.NoNamespace.cy, "457200")),
                   new Ltxml.XElement(openXml.WP.docPr, new Ltxml.XAttribute(openXml.NoNamespace.id, imageIndex), new Ltxml.XAttribute(openXml.NoNamespace.name, "Pic" + imageIndex), new Ltxml.XAttribute(openXml.NoNamespace.descr, "thlogo.png")),
                   new Ltxml.XElement(openXml.A.graphic,
                       new Ltxml.XElement(openXml.A.graphicData, new Ltxml.XAttribute(openXml.NoNamespace.uri, "http://schemas.openxmlformats.org/drawingml/2006/picture"),
                           new Ltxml.XElement(openXml.Pic._pic,
                               new Ltxml.XElement(openXml.Pic.nvPicPr,
                                   new Ltxml.XElement(openXml.Pic.cNvPr, new Ltxml.XAttribute(openXml.NoNamespace.id, imageIndex), new Ltxml.XAttribute(openXml.NoNamespace.name, "thlogo.png")),
                                   new Ltxml.XElement(openXml.Pic.cNvPicPr)),
                               new Ltxml.XElement(openXml.Pic.blipFill,
                                   new Ltxml.XElement(openXml.A.blip, new Ltxml.XAttribute(openXml.R.embed, relidHelper)),
                                   new Ltxml.XElement(openXml.A.stretch,
                                       new Ltxml.XElement(openXml.A.fillRect))),
                               new Ltxml.XElement(openXml.Pic.spPr,
                                   new Ltxml.XElement(openXml.A.xfrm,
                                       new Ltxml.XElement(openXml.A.ext, new Ltxml.XAttribute(openXml.NoNamespace.cx, "457200"), new Ltxml.XAttribute(openXml.NoNamespace.cy, "457200"))),
                                   new Ltxml.XElement(openXml.A.prstGeom, new Ltxml.XAttribute(openXml.NoNamespace.prst, "rect"))))))));

           var partPath = "/word/media/image" + imageIndex + ".png";
           var relPath = "media/image" + imageIndex + ".png";
           openedDoc.addPart(partPath, openXml.contentTypes.png, "base64", imageIcon); // add Image Part to doc
           openedDoc.mainDocumentPart().addRelationship(relidHelper, openXml.relationshipTypes.image, relPath, "Internal"); // add relationship to image  
           imageElements.push(imageElement);
       }

       var tblPr = new Ltxml.XElement(openXml.W.tblPr,
           new Ltxml.XElement(openXml.W.tblStyle, new Ltxml.XAttribute(openXml.W.val, "TableGrid")),
           new Ltxml.XElement(openXml.W.tblW, new Ltxml.XAttribute(openXml.W._w, 0), new Ltxml.XAttribute(openXml.W.type, "dxa")),
           new Ltxml.XElement(openXml.W.tblLook,
               new Ltxml.XAttribute(openXml.W.val, "04A0"),
               new Ltxml.XAttribute(openXml.W.firstRow, 1),
               new Ltxml.XAttribute(openXml.W.lastRow, 0),
               new Ltxml.XAttribute(openXml.W.firstColumn, 1),
               new Ltxml.XAttribute(openXml.W.lastColumn, 0),
               new Ltxml.XAttribute(openXml.W.noHBand, 0),
               new Ltxml.XAttribute(openXml.W.noVBand, 1)));

       var tblGrid = new Ltxml.XElement(openXml.W.tblGrid,
           new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 1326)),
           new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 5355)),
           new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 1575)),
           new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 1200)));

       //var dataArray = allData[dataSet];
       var rows = [];
       //Heading rows
       var headingColor = "E7E6E6";
       var c1 = new Ltxml.XElement(openXml.W.tc,
           new Ltxml.XElement(openXml.W.tcPr,
               new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1326), new Ltxml.XAttribute(openXml.W.type, "dxa")),
               new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))),
           new Ltxml.XElement(openXml.W.p,
               new Ltxml.XElement(openXml.W.pPr,
                   new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                   i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
               new Ltxml.XElement(openXml.W.r,
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                   new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.heading))));

       var c2 = new Ltxml.XElement(openXml.W.tc,
           new Ltxml.XElement(openXml.W.tcPr,
               new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 5355), new Ltxml.XAttribute(openXml.W.type, "dxa")),
               new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))),
           new Ltxml.XElement(openXml.W.p,
               new Ltxml.XElement(openXml.W.pPr,
                   new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                   i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
               new Ltxml.XElement(openXml.W.r,
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                   new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.meaning))));
       var c3 = new Ltxml.XElement(openXml.W.tc,
           new Ltxml.XElement(openXml.W.tcPr,
               new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1575), new Ltxml.XAttribute(openXml.W.type, "dxa")),
               new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))),
           new Ltxml.XElement(openXml.W.p,
               new Ltxml.XElement(openXml.W.pPr,
                   new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                   i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
               new Ltxml.XElement(openXml.W.r,
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                   new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.symbol))));

       var c4 = new Ltxml.XElement(openXml.W.tc,
           new Ltxml.XElement(openXml.W.tcPr,
               new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1200), new Ltxml.XAttribute(openXml.W.type, "dxa")),
               new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))),
           new Ltxml.XElement(openXml.W.p,
               new Ltxml.XElement(openXml.W.pPr,
                   new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                   i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
               new Ltxml.XElement(openXml.W.r,
                   new Ltxml.XElement(openXml.W.rPr,
                       new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                       new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                       i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                   new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.notes))));

       var row = new Ltxml.XElement(openXml.W.tr, c1, c2, c3, c4);

       rows.push(row);

       for (var i = 0; i < vocabStandardisedData.words.length; i++) {

           var isShade = (i % 2) === 0;
           var evenRowColor = "99CDFF";
           var goodColor = "C5E0B3";
           var poorColor = "FF7D7D";

           var c1 = new Ltxml.XElement(openXml.W.tc,
               new Ltxml.XElement(openXml.W.tcPr,
                   new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1326), new Ltxml.XAttribute(openXml.W.type, "dxa")),
                   (isShade ?
                       new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null)),
               new Ltxml.XElement(openXml.W.p,
                   new Ltxml.XElement(openXml.W.pPr,
                       new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                       i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
                   new Ltxml.XElement(openXml.W.r,
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                       new Ltxml.XElement(openXml.W.t, vocabWords[i]['word']))));

  
           var definitions = vocabStandardisedData.words[i].definitions;
           var combinedDefinitions = "";
           if (definitions.length > 0) {
               for (var j = 0; j < definitions.length; j++) {
                   combinedDefinitions = (combinedDefinitions + definitions[j]).trim();
                   if (j < definitions.length - 1) {
                       combinedDefinitions  += "\n\n";
                   }
               }
           }

           if (combinedDefinitions === "") {
    //           combinedDefinitions = "No meaning found."
           }

           var c2 = new Ltxml.XElement(openXml.W.tc,
               new Ltxml.XElement(openXml.W.tcPr,
                   new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 5355), new Ltxml.XAttribute(openXml.W.type, "dxa")),
                   (isShade ?
                       new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null)),
               new Ltxml.XElement(openXml.W.p,
                   new Ltxml.XElement(openXml.W.pPr,
                       new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                       i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
                   new Ltxml.XElement(openXml.W.r,
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                       new Ltxml.XElement(openXml.W.t, combinedDefinitions))));

           var c3 = new Ltxml.XElement(openXml.W.tc,
               new Ltxml.XElement(openXml.W.tcPr,
                   new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1575), new Ltxml.XAttribute(openXml.W.type, "dxa")),
                   (isShade ?
                       new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null)));

           var symbols = vocabStandardisedData.words[i].symbols
           var vocabDescriptions = vocabWords[i]['inflections'];
           if (symbols.length > 0) {
               for (var s = symbolCounter; s < symbols.length + symbolCounter; s++) {
                   var parg = new Ltxml.XElement(openXml.W.p,
                       new Ltxml.XElement(openXml.W.pPr,
                           new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                           i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                           new Ltxml.XElement(openXml.W.rPr,
                               new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                               i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
                       new Ltxml.XElement(openXml.W.r, imageElements[s]));

                   c3.add(parg);
                   //imageElements.splice(0, 1);
               }
               symbolCounter = parseInt(symbolCounter) + parseInt(symbols.length);
           } else {
               var parg = new Ltxml.XElement(openXml.W.p,
                   new Ltxml.XElement(openXml.W.pPr,
                       new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
                   new Ltxml.XElement(openXml.W.r, "No Symbols"));

               c3.add(parg);
           }


           var c4 = new Ltxml.XElement(openXml.W.tc,
               new Ltxml.XElement(openXml.W.tcPr,
                   new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1200), new Ltxml.XAttribute(openXml.W.type, "dxa")),
                   (isShade ?
                       new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null)),
               new Ltxml.XElement(openXml.W.p,
                   new Ltxml.XElement(openXml.W.pPr,
                       new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
                       i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
                   new Ltxml.XElement(openXml.W.r,
                       new Ltxml.XElement(openXml.W.rPr,
                           new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                           new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                           i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
                       new Ltxml.XElement(openXml.W.t, ""))));


           var row = new Ltxml.XElement(openXml.W.tr, c1, c2, c3, c4);

           rows.push(row);
       }

       var tbl = new Ltxml.XElement(openXml.W.tbl, tblPr, tblGrid, rows);
       var testImage = this.createAndUploadVocab('', openedDoc, p1, p4, tbl, filename);
   }

   /**
* Convert an image 
* to a base64 url
* @param  {String}   url         
* @param  {Function} callback    
* @param  {String}   [outputFormat=image/png]           
*/
/*   convertImgToBase64URL(url, callback, serviceArrayLength, filename) {
       var img = new Image();
       img.crossOrigin = 'Anonymous';
       img.onload = function (event) {

           var canvas = document.createElement('CANVAS'),
           ctx = canvas.getContext('2d'), dataURL;
           canvas.height = event.target.height;
           canvas.width = event.target.width;
           ctx.drawImage(event.target, 0, 0);
           dataURL = canvas.toDataURL('image/png');
           //console.log(dataURL);
           //data:image/png;base64,  need to remove these 22 chars from start of base64 string returned
           this.base64ImagesArray.push(dataURL.slice(22));
           this.imageProcessed = true;
           if (this.base64ImagesArray.length === serviceArrayLength) {
               callback(filename, this.base64ImagesArray);
           }
           canvas = null;
       }.bind(this);
       img.src = url;
   }

   writeVocabResponse(params) {

       this.imageProcessed = true;
       this.base64ImagesArray = [];

       var definitions = [];
       var allsymbols = [];
       var json = params;
       vocabWords = params['vocab']['words'];
       var symbols;


       var vocabStandardisedData = {};
       vocabStandardisedData.words = [];
       vocabStandardisedData.translations = params.translations;
       vocabStandardisedData.locale = params.locale;
       vocabStandardisedData.user = params.user;
       vocabStandardisedData.sendResponse = params.sendResponse;

       var filename = vocabStandardisedData.translations.docTitle + new Date().getTime();
       for (var i = 0; i < vocabWords.length; i++) {
           var vocabWord = {};
           vocabWord.word = vocabWords[i].word;
           vocabWord.definitions = [];
           vocabWord.symbols = [];
           var vocabDescriptions = vocabWords[i]['inflections'];
           if (vocabDescriptions.length > 0) {
               for (var j = 0; j < vocabDescriptions.length; j++) {
                   for (var l = 0; l < vocabDescriptions[j]['definitions'].length; l++) {
                       vocabWord.definitions.push(vocabDescriptions[j]['definitions'][l].definition);
                   }
                   symbols = vocabDescriptions[j]['symbols'];
                   for (l = 0; l < symbols.length; l++) {
                       vocabWord.symbols.push(symbols[l]);
                       allsymbols.push(symbols[l]);
                   }
               }
           }

           vocabStandardisedData.words.push(vocabWord);
       }

   /*    if (allsymbols.length > 0) {
           for (var m = 0; m < allsymbols.length; m++) {
               this.wait(allsymbols[m], this.createvocabdoc.bind(this), allsymbols.length, filename);
           }
       }
       else {
           this.createvocabdoc(filename, this.base64ImagesArray);
       }*/

/*       var symbolpromises = allsymbols.map(this.convertImgToBase64URLP);
       Promise.all(symbolpromises).then(function (images) {
           this.createvocabdoc(filename, vocabStandardisedData, images);
       }.bind(this)).catch(function (urls) {
           console.log("Error fetching some images: " + urls)
       }.bind(this))


   }

   convertImgToBase64URLP(url) {
       return new Promise(function (resolve, reject) {
           var img = new Image();
           img.crossOrigin = 'Anonymous';
           img.onload = function (event) {

               var canvas = document.createElement('CANVAS'),
               ctx = canvas.getContext('2d'), dataURL;
               canvas.height = event.target.height;
               canvas.width = event.target.width;
               ctx.drawImage(event.target, 0, 0);
               dataURL = canvas.toDataURL('image/png');

               base64ImagesArray = [];
               base64ImagesArray.push(dataURL.slice(22));
               canvas = null;

               resolve(base64ImagesArray);
           }.bind(this);
           img.onerror = function () {
               reject(url)
           }.bind(this);
           img.src = url
       })

   }

   writeVocabHTMLResponse(params) {

       this.imageProcessed = true;
       this.base64ImagesArray = [];

       var allsymbols = [];
       var json = params;
       vocabWords = params['vocab']['words'];
       var symbols;
       
       var vocabStandardisedData = {};
       vocabStandardisedData.words = [];
       vocabStandardisedData.translations = params.translations;
       vocabStandardisedData.locale = params.locale;
       vocabStandardisedData.user = params.user;
       vocabStandardisedData.sendResponse = params.sendResponse;

       var filename = vocabStandardisedData.translations.docTitle + new Date().getTime();

       for (var i = 0; i < vocabWords.length; i++) {
           var vocabWord = {};
           vocabWord.word = vocabWords[i].word;
           vocabWord.definitions = [];
           vocabWord.symbols = [];

           vocabWord.definitions.push(vocabWords[i]['definitionText']);

           symbols = vocabWords[i]['symbols'];
           for (var l = 0; l < symbols.length; l++) {
               vocabWord.symbols.push(symbols[l]);
               allsymbols.push(symbols[l]);
           }


           vocabStandardisedData.words.push(vocabWord);
       }
  /*     if (allsymbols.length > 0) {
           for (var m = 0; m < allsymbols.length; m++) {
               wait(allsymbols[m], this.createvocabdoc, allsymbols.length, filename);
           }
       }
       else {
           this.createvocabdoc(filename, this.base64ImagesArray);
       }*/

/*     var symbolpromises = allsymbols.map(this.convertImgToBase64URLP);
     Promise.all(symbolpromises).then(function (images) {
         this.createvocabdoc(filename, vocabStandardisedData, images);
     }.bind(this)).catch(function (urls) {
         console.log("Error fetching some images: " + urls)
     }.bind(this))
 
 }
   
 createAndUploadVocab(url, doc, paramp1, paramp4, paramtbl, filename) {
     var canvas = document.createElement('CANVAS');
     var ctx = canvas.getContext('2d');
     var img = new Image;
     var p1 = paramp1;
     var p4 = paramp4;
     var tbl = paramtbl;
       var openedDoc = doc;
     img.crossOrigin = 'Anonymous';

     var mainXDoc = new Ltxml.XElement(openXml.W.document, new Ltxml.XElement(openXml.W.body, p1, p4, tbl));
       var xd = openedDoc.mainDocumentPart().getXDocument();
     xd.root.replaceWith(mainXDoc);

     //added some text now save to 64 bit string
     var saveToBase64 = openedDoc.saveToBase64();
     var saveToOPC = openedDoc.saveToFlatOpc();
     var savetoBlob = openedDoc.saveToBlob();
       var arrayBuffer;
     var fileReader = new FileReader();
     fileReader.onload = (function (event) {
         arrayBuffer = event.target.result;
           var formData = new FormData();
         formData.append('file', savetoBlob, "VocabularyList.docx");
           var binary = '';
         var bytes = new Uint8Array(arrayBuffer);
         var len = bytes.byteLength;
         for (var i = 0; i < len; i++) {
             binary += String.fromCharCode(bytes[i]);
         }
         // if(window.location.ancestorOrigins[0].indexOf("sharepoint.com") > 0) // We are dealing with Sharepoint so use the sharepoint urls to get access code and tokens
         // { 
         //     window.postMessage(
         //     {
         //         'method': 'vocabO365WordsRequest',
         //         'type': '1757FROM_PAGERW4G',
         //         'filename' : filename,
         //         'filedata': window.btoa( binary )
         //     }, '*');
         var binary_string = window.atob(window.btoa(binary));
         var len = binary_string.length;
         var bytes = new Uint8Array(len);
         for (var i = 0; i < len; i++) {
             bytes[i] = binary_string.charCodeAt(i);
         }
         var filedata = bytes.buffer;
         this.upload0365SharepointDocument(filename, filedata);
         // }
         // else
         // {
         // window.postMessage(
         // {
         //     'method': 'vocabO365WordsLiveRequest',
         //     'type': '1757FROM_PAGERW4G',
         //     'filename' : filename,
         //     'filedata': window.btoa( binary )
         // }, '*'); 
           /** var binary_string =  window.atob(window.btoa( binary ));
         var len = binary_string.length;
         var bytes = new Uint8Array( len );
         for (var i = 0; i < len; i++)        {
             bytes[i] = binary_string.charCodeAt(i);
         }
         var filedata = bytes.buffer;  
         upload0365LiveDocument(filename, filedata);**/
//    }           

/*     }.bind(this));
       fileReader.readAsArrayBuffer(savetoBlob);
 };
  upload0365SharepointDocument(filename, filedata) {
    var documentOpened = false;
      this.getAccessTokenForDirectory(false, (accessToken) => {
             
        this.o365DiscoveryAccessToken = accessToken;
        var endPointRequest = new XMLHttpRequest();
        endPointRequest.open("GET", "https://api.office.com/discovery/me/services", true);
        endPointRequest.setRequestHeader("Authorization", 'Bearer ' + this.o365DiscoveryAccessToken);
        endPointRequest.setRequestHeader("Accept", 'application/json;odata=verbose');
        endPointRequest.onreadystatechange = function (response) {
            var contentType = '';
            if (response.target.readyState == 4) {
                if (response.target.status == 200) {
                    contentType = response.target.getResponseHeader("Content-Type");
                    if (contentType.substr(0, 16) == 'application/json') {
                        var json = JSON.parse(response.target.response);
                        this.o365ServiceEndpointURI = json.d.results[0].ServiceEndpointUri;
                        this.o365ServiceResourceId = json.d.results[0].ServiceResourceId;
                          const CLIENT_ID = '0c83ac77-768d-478d-ab44-b3ff4c8b38dc';
                        const REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');
                          const DISCOVERYRESOURCE = 'https://api.office.com/discovery/';
                        const DISCOVERYSCOPES = '';
                          this.getRemoteAccessToken(this.o365AccessCode, '2', this.o365ServiceResourceId, REDIRECTURI, CLIENT_ID, this.o365Session, DISCOVERYSCOPES, function (accessToken) {
                              this.o365FilesAccessToken = accessToken;
                              var uploadDocumentRequest = new XMLHttpRequest();
                              uploadDocumentRequest.open("PUT", this.o365ServiceEndpointURI + "/v1.0/files/root/children/" + filename + ".docx/content?nameConflict=overwrite");
                            uploadDocumentRequest.setRequestHeader("Authorization", 'Bearer ' + this.o365FilesAccessToken);
                            uploadDocumentRequest.setRequestHeader("Accept", 'application/json');
                            uploadDocumentRequest.setRequestHeader("Content-Type", 'application/octet-stream');
                            uploadDocumentRequest.onreadystatechange = function (event) {
                                if (event.target.status === 201 && event.target.readyState === 3 && event.target.statusText === 'Created') {
                                    if (!documentOpened) {
                                        documentOpened = true;
                                        var jsonA = JSON.stringify(event.target.response);
                                        var etagIndex = jsonA.indexOf("eTag");
                                        var firstBracketIndex = jsonA.indexOf('{', etagIndex);
                                        var lastBracketIndex = jsonA.indexOf("}", firstBracketIndex) + 1;
                                        var eTag = jsonA.substring(firstBracketIndex, lastBracketIndex);
                                        var serviceEndpointUri = this.o365ServiceEndpointURI;
                                        var baseUrl = serviceEndpointUri.substring(0, serviceEndpointUri.indexOf("_api"));
                                        var newWindowURL = baseUrl + "_layouts/15/WopiFrame.aspx?sourcedoc=" + eTag + "&action=edit";
                                        var win = window.open(newWindowURL);
                                    }
                                }
                            }.bind(this);
                            uploadDocumentRequest.send(filedata);

                          }.bind(this));
                      }
                }
            }
        }.bind(this);
        endPointRequest.send();
      });
 }
}
*/

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TexthelpServices = __webpack_require__(1);

var _TexthelpServices2 = _interopRequireDefault(_TexthelpServices);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
*   Class where calls to Microsoft Sharepoint services are implemented. 
*/
class MicrosoftSharepointServices extends _TexthelpServices2.default {

    // Constructor
    constructor() {
        super();

        this._id = '';
        this._name = '';

        this.o365AccessCode;
        this.o365DiscoveryAccessToken;
        this.o365DiscoveryRefreshToken;
        this.o365FilesAccessToken;
        this.o365FilesRefreshToken;
        this.o365ServiceEndpointURI;
        this.o365ServiceResourceId;
        this.o365Session;

        this.documentOpened = false; //needed because of https://karinebosch.wordpress.com/my-articles/improving-performance-of-sharepoint-sites/part-13-etag-header/ 
        this.blankDocument = "UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC0" + "lMtuwjAQRfeV+g+Rt1Vi6KKqKgKLPpYtUukHGHsCVv2Sx7z+vhMCUVUBkQpsIiUz994zVsaD0dqa" + "bAkRtXcl6xc9loGTXmk3K9nX5C1/ZBkm4ZQw3kHJNoBsNLy9GUw2ATAjtcOSzVMKT5yjnIMVWPgA" + "jiqVj1Ykeo0zHoT8FjPg973eA5feJXApT7UHGw5eoBILk7LXNX1uSCIYZNlz01hnlUyEYLQUiep8" + "6dSflHyXUJBy24NzHfCOGhg/mFBXjgfsdB90NFEryMYipndhqYuvfFRcebmwpCxO2xzg9FWlJbT6" + "2i1ELwGRztyaoq1Yod2e/ygHpo0BvDxF49sdDymR4BoAO+dOhBVMP69G8cu8E6Si3ImYGrg8Rmvd" + "CZFoA6F59s/m2NqciqTOcfQBaaPjP8ber2ytzmngADHp039dm0jWZ88H9W2gQB3I5tv7bfgDAAD/" + "/wMAUEsDBBQABgAIAAAAIQAekRq37wAAAE4CAAALAAgCX3JlbHMvLnJlbHMgogQCKKAAAgAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArJLBasMw" + "DEDvg/2D0b1R2sEYo04vY9DbGNkHCFtJTBPb2GrX/v082NgCXelhR8vS05PQenOcRnXglF3wGpZV" + "DYq9Cdb5XsNb+7x4AJWFvKUxeNZw4gyb5vZm/cojSSnKg4tZFYrPGgaR+IiYzcAT5SpE9uWnC2ki" + "Kc/UYySzo55xVdf3mH4zoJkx1dZqSFt7B6o9Rb6GHbrOGX4KZj+xlzMtkI/C3rJdxFTqk7gyjWop" + "9SwabDAvJZyRYqwKGvC80ep6o7+nxYmFLAmhCYkv+3xmXBJa/ueK5hk/Nu8hWbRf4W8bnF1B8wEA" + "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" + "AAALAAsAwQIAAFArAAAAAA==";
    }

    /*
    *   Gets the scopes required to retrieve a Google id via oAuth
    *   @return {Array} array of the scopes required.
    */
    get idScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.IDENTITY];
    }

    /*
    *   Gets the scopes required to highlights on Google id via oAuth
    *   @return {Array} array of the scopes required.
    */
    get collectHighlightsScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.HIGHLIGHTS];
    }

    /*
    *   Gets the scopes required to vocab Google id via oAuth
    *   @return {Array} array of the scopes required.
    */
    get vocabScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.VOCAB];
    }

    /*
    *   Gets the scopes required to vocab Google id via oAuth
    *   @return {Array} array of the scopes required.
    */
    get voiceNoteScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.VOICENOTES];
    }

    /*
    *   Gets the scopes required add ignore all words to the dictionary.
    *   @return {Array} array of the scopes required.
    */
    get checkitDictionaryScopes() {
        return this.scopes[texthelp.RW4GC.enums.AccessType.CHECKITDICTIONARY];
    }

    /*
    *   Gets the ID from Microsoft if the users is signed in. 
    *   @return {Function} callback  of the scopes required.
    */
    getLocalID(callback) {
        // only option is oauth so do nothing.
        callback('');
    }

    /*
    *   Gets any license stored in your Microsoft account 
    *   @return {Function} always null as no license is stored in MS
    */
    getStoredLicense(callback) {
        callback(null);
    }

    /*
    *   Gets the ID via oauth
    *   @return {Function} callback  of the scopes required.
    */
    getAuthenticatedID(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        var profileURL = 'https://graph.microsoft.com/v1.0/me';
        try {
            fetch(profileURL, {
                method: 'get',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }).then(response => {
                return this._handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params, token);
            }).then(data => {

                if (data === null) {
                    return;
                }

                this._id = data.mail;

                onFuncResponse(this._id);
            });
        } catch (err) {}
    }

    convertImgToBase64URLP(url) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function (event) {

                var canvas = document.createElement('CANVAS'),
                    ctx = canvas.getContext('2d'),
                    dataURL;
                canvas.height = event.target.height;
                canvas.width = event.target.width;
                ctx.drawImage(event.target, 0, 0);
                dataURL = canvas.toDataURL('image/png');

                var base64ImagesArray = [];
                base64ImagesArray.push(dataURL.slice(22));
                canvas = null;

                resolve(base64ImagesArray);
            }.bind(this);
            img.onerror = function () {
                reject(url);
            }.bind(this);
            img.src = url;
        });
    }

    getODforBusinessURI(access_token, callback) {

        var url = 'https://api.office.com/discovery/v2.0/me/services';

        texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
            headers: {
                'Authorization': "Bearer " + access_token
            },
            method: 'get'
        }).then(function (response) {
            return response.json();
        }.bind(this)).then(function (data) {

            //   callback(data.d);
            // this._directoryAccessToken = data.d;
            //         callback(this._directoryAccessToken);

            var serviceResourceId = null;
            if (data.value == undefined) {
                return;
            }

            for (var i = 0; i < data.value.length; i++) {
                if (data.value[i].serviceApiVersion !== undefined) {
                    if (data.value[i].serviceApiVersion == "v2.0") {
                        callback(data.value[i]);
                        i = data.value.length;
                    }
                }
            }

            //     this.getAccessTokenForMS(token, interactive, scopes, filename, filedata, funcToOAuth, params, retry, response_sessionState, CLIENT_ID, REDIRECTURI, serviceResourceId, '3', null)*/
        }.bind(this)).catch(err => {
            console.log(err);
        }));
    }

    getAccessTokenForMS(token, interactive, scopes, filename, filedata, funcToOAuth, params, retry, response_sessionState, CLIENT_ID, REDIRECTURI, resource, REQUESTACCOUNTTYPE, callback) {

        var DISCOVERYSCOPES = '';

        var url = 'http://localhost:60771/thOffice365Service.asmx/generateAccessToken';

        var options = JSON.stringify({
            code: token,
            account_type: REQUESTACCOUNTTYPE,
            resource: resource,
            redirect_uri: REDIRECTURI,
            client_id: CLIENT_ID
        });

        texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: options
        }).then(function (response) {
            return response.json();
        }.bind(this)).then(function (data) {
            this._directoryAccessToken = data.d;

            if (callback == null) {
                return;
            }

            callback(data.d, interactive, scopes, filename, filedata, funcToOAuth, params, retry, response_sessionState, CLIENT_ID, REDIRECTURI);
            //         callback(this._directoryAccessToken);
        }.bind(this)).catch(err => {
            console.log(err);
        }));
    }

    redeemRefreshTokenForCallToOneDrive(client_id, redirect_uri, refresh_token, resource, callback) {
        var url = 'http://localhost:60771/thOffice365Service.asmx/redeemRefreshTokenForCallToOneDrive';

        var options = JSON.stringify({
            client_id: client_id,
            redirect_uri: redirect_uri,
            refresh_token: refresh_token,
            resource: resource
        });

        texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: options
        }).then(function (response) {
            return response.json();
        }.bind(this)).then(function (data) {
            callback(JSON.parse(data.d));
        }.bind(this)).catch(err => {
            console.log(err);
        }));
    }

    redeemAuthCodeForTokens(client_id, redirect_uri, code, resource, callback) {
        var url = 'http://localhost:60771/thOffice365Service.asmx/redeemAuthCodeForTokens';

        var options = JSON.stringify({
            client_id: client_id,
            redirect_uri: redirect_uri,
            code: code,
            resource: resource
        });

        texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: options
        }).then(function (response) {
            return response.json();
        }.bind(this)).then(function (data) {
            callback(JSON.parse(data.d));
        }.bind(this)).catch(err => {
            console.log(err);
        }));
    }

    uploadFileToOneDrive(filename, filedata, access_token) {

        //     var url = 'https://graph.microsoft.com/v1.0/me/drive/root/' + filename + ".docx/content?nameConflict=overwrite";
        var url = "https://graph.microsoft.com/v1.0/me/drive/root";

        texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
            headers: {
                'Authorization': "Bearer " + access_token
            },
            method: 'GET'
        }).then(function (response) {
            return response.json();
        }.bind(this)).then(function (data) {
            callback(JSON.parse(data.d));
        }.bind(this)).catch(err => {
            console.log(err);
        }));
    }

    upload0365SharepointDocument(token, interactive, scopes, filename, filedata, funcToOAuth, params, retry) {

        var url = "https://graph.microsoft.com/v1.0/me/drive/root/children/" + filename + '.docx/content';

        texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
            headers: {
                'Content-type': 'application/octet-stream',
                'Authorization': "Bearer " + token
            },
            method: 'PUT',
            body: filedata
        }).then(function (response) {
            return response.json();
        }.bind(this)).then(function (data) {
            if (data.webUrl == null) {
                return;
            }

            window.open(data.webUrl, "_thNewDocument");
        }.bind(this)).catch(err => {
            console.log(err);
        }));

        /*     var options = JSON.stringify({
                 client_id: client_id,
                 redirect_uri: redirect_uri,
                 code: code,
                 resource: resource
             })
               texthelp.RW4GC.promiseTimeout(5000, fetch(url, {
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 method: 'POST',
                 body: options
             }).then(function (response) {
                 return response.json();
             }.bind(this)).then(function (data) {
                 callback(JSON.parse(data.d));
             }.bind(this)).catch((err) => {
                 console.log(err);
             }));
          /*     this.authenticate(true, this.collectHighlightsScopes, this.writeCollectHighlightsDoc, (resultUrl) => {
                 // return if we get null as we didn't get authenticated. 
                 callback(resultUrl);
             }, documenthighlights);
           //  const CLIENT_ID = '1a406439-3b21-4c7b-b654-8885aadbdc81';
           //  const REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');
             //   this._directoryCallback = callback;
          /*     var options = {
                 'interactive': interactive,
                 'url': 'https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECTURI
             }
               chrome.identity.launchWebAuthFlow(options, (response) => {
                   if (chrome.runtime.lastError !== undefined) { };
                   // didn't authenticate, eg the refused authorisation or interactive was false.
                 if (response == undefined) {
                     retry = false;
                     return onFuncResponse(null);
                 }
                   var response_code = response.split('code=')[1].split('&')[0];
                 var response_sessionState = response.split('session_state=')[1];
                 var requestScopes = '';
                 var authForTokens = null;
                 var sharepointDetails = null;
                   const DISCOVERYRESOURCE = 'https://api.office.com/discovery/';
                 this.redeemAuthCodeForTokens(CLIENT_ID, REDIRECTURI, response_code, DISCOVERYRESOURCE, function (response){ 
                     authForTokens = response;
                     console.log(authForTokens);
                     this.getODforBusinessURI(response.access_token, function (response) {
                         sharepointDetails = response;
                         console.log(sharepointDetails);
                         this.redeemRefreshTokenForCallToOneDrive(CLIENT_ID, REDIRECTURI, authForTokens.refresh_token, sharepointDetails.serviceResourceId, function (response) {
                             this.uploadFileToOneDrive(filename, filedata, response.access_token);
                         }.bind(this));
                     }.bind(this));
                 }.bind(this));
          //       this.redeemAuthCodeForTokens(response_code, interactive, scopes, filename, filedata, funcToOAuth, params, retry, response_sessionState, CLIENT_ID, REDIRECTURI, DISCOVERYRESOURCE, '2', this.getODforBusinessURI.bind(this));
             });*/
    }

    upload0365SharepointDocument2(token, interactive, scopes, filename, filedata, funcToOAuth, params, retry) {
        var documentOpened = false;

        this.authenticateDirectory(interactive, scopes, funcToOAuth, function (accessToken) {
            //     this.getAccessTokenForDirectory(false, (accessToken) => {

            this.o365DiscoveryAccessToken = accessToken;
            var endPointRequest = new XMLHttpRequest();
            endPointRequest.open("GET", "https://api.office.com/discovery/me/services", true);
            endPointRequest.setRequestHeader("Authorization", 'Bearer ' + this.o365DiscoveryAccessToken);
            endPointRequest.setRequestHeader("Accept", 'application/json;odata=verbose');
            endPointRequest.onreadystatechange = function (response) {
                var contentType = '';
                if (response.target.readyState == 4) {
                    if (response.target.status == 200) {
                        contentType = response.target.getResponseHeader("Content-Type");
                        if (contentType.substr(0, 16) == 'application/json') {
                            var json = JSON.parse(response.target.response);
                            this.o365ServiceEndpointURI = json.d.results[0].ServiceEndpointUri;
                            this.o365ServiceResourceId = json.d.results[0].ServiceResourceId;

                            var CLIENT_ID = '0c83ac77-768d-478d-ab44-b3ff4c8b38dc';
                            var REDIRECTURI = chrome.identity.getRedirectURL('provider_cb');

                            var DISCOVERYRESOURCE = 'https://api.office.com/discovery/';
                            var DISCOVERYSCOPES = '';

                            this.getRemoteAccessToken(this.o365AccessCode, '2', this.o365ServiceResourceId, REDIRECTURI, CLIENT_ID, this.o365Session, DISCOVERYSCOPES, function (accessToken) {

                                this.o365FilesAccessToken = accessToken;

                                var uploadDocumentRequest = new XMLHttpRequest();

                                uploadDocumentRequest.open("PUT", this.o365ServiceEndpointURI + "/v1.0/files/root/children/" + filename + ".docx/content?nameConflict=overwrite");
                                uploadDocumentRequest.setRequestHeader("Authorization", 'Bearer ' + this.o365FilesAccessToken);
                                uploadDocumentRequest.setRequestHeader("Accept", 'application/json');
                                uploadDocumentRequest.setRequestHeader("Content-Type", 'application/octet-stream');
                                uploadDocumentRequest.onreadystatechange = function (event) {
                                    if (event.target.status === 201 && event.target.readyState === 3 && event.target.statusText === 'Created') {
                                        if (!documentOpened) {
                                            documentOpened = true;
                                            var jsonA = JSON.stringify(event.target.response);
                                            var etagIndex = jsonA.indexOf("eTag");
                                            var firstBracketIndex = jsonA.indexOf('{', etagIndex);
                                            var lastBracketIndex = jsonA.indexOf("}", firstBracketIndex) + 1;
                                            var eTag = jsonA.substring(firstBracketIndex, lastBracketIndex);
                                            var serviceEndpointUri = this.o365ServiceEndpointURI;
                                            var baseUrl = serviceEndpointUri.substring(0, serviceEndpointUri.indexOf("_api"));
                                            var newWindowURL = baseUrl + "_layouts/15/WopiFrame.aspx?sourcedoc=" + eTag + "&action=edit";
                                            var win = window.open(newWindowURL);
                                        }
                                    }
                                }.bind(this);
                                uploadDocumentRequest.send(filedata);
                            }.bind(this));
                        }
                    }
                }
            }.bind(this);
            endPointRequest.send();
        }, params, retry);
    }

    /*
    *   Writes the highlights object to a Google doc.
    */
    writeCollectHighlightsDoc(token, interactive, scopes, funcToOAuth, onFuncResponse, documentHighlights, retry) {

        // otherwise authenticate and get the ID using OAuth,
        //    this.authenticateDirectory(interactive, scopes, funcToOAuth, (id) => {

        // return if we get null as we didn't get authenticated. 
        //callback(id);

        var filename;
        var sort = 1;
        var openedDoc = new openXml.OpenXmlPackage(this.blankDocument);

        var body = openedDoc.mainDocumentPart().getXDocument().root.element(openXml.W.body);
        if (sort === 1) {
            var index = 0;
            for (index = 0; index < documentHighlights.highlights.length; ++index) {
                var highlightColor;
                if (documentHighlights.highlights[index].color === "yellow" || documentHighlights.highlights[index].color === "#FFFF00") //yellow
                    {
                        highlightColor = "yellow";
                    } else if (documentHighlights.highlights[index].color === "magenta" || documentHighlights.highlights[index].color === "#FF00FF") //magenta
                    {
                        highlightColor = "magenta";
                    } else if (documentHighlights.highlights[index].color === "green" || documentHighlights.highlights[index].color === "#ADFF2F") //green
                    {
                        highlightColor = "green";
                    } else if (documentHighlights.highlights[index].color === "blue" || documentHighlights.highlights[index].color === "#00FFFF") //cyan
                    {
                        highlightColor = "cyan";
                    }
                var byPositionPara = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")), new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, highlightColor))), new Ltxml.XElement(openXml.W.t, documentHighlights.highlights[index].text)));

                var lastPara = body.elements(openXml.W.p).lastOrDefault();
                if (lastPara !== null) {
                    lastPara.addAfterSelf(byPositionPara);
                }
            }
        } else {
            for (var index = 0; index < yellowHighlights.length; ++index) {
                var byPositionPara = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")), new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "yellow"))), new Ltxml.XElement(openXml.W.t, yellowHighlights[index])));

                lastPara = body.elements(openXml.W.p).lastOrDefault();
                if (lastPara !== null) {
                    lastPara.addAfterSelf(byPositionPara);
                }
            }
            for (var index = 0; index < cyanHighlights.length; ++index) {
                var byPositionPara = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")), new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "cyan"))), new Ltxml.XElement(openXml.W.t, cyanHighlights[index])));

                lastPara = body.elements(openXml.W.p).lastOrDefault();
                if (lastPara !== null) {
                    lastPara.addAfterSelf(byPositionPara);
                }
            }
            for (var index = 0; index < greenHighlights.length; ++index) {
                var byPositionPara = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")), new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "green"))), new Ltxml.XElement(openXml.W.t, greenHighlights[index])));

                lastPara = body.elements(openXml.W.p).lastOrDefault();
                if (lastPara !== null) {
                    lastPara.addAfterSelf(byPositionPara);
                }
            }
            for (var index = 0; index < magentaHighlights.length; ++index) {
                var byPositionPara = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.cs, "Arial")), new Ltxml.XElement(openXml.W.color, new Ltxml.XAttribute(openXml.W.val, "000000")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), new Ltxml.XElement(openXml.W.highlight, new Ltxml.XAttribute(openXml.W.val, "magenta"))), new Ltxml.XElement(openXml.W.t, greenHighlights[index])));

                lastPara = body.elements(openXml.W.p).lastOrDefault();
                if (lastPara !== null) {
                    lastPara.addAfterSelf(byPositionPara);
                }
            }
        }

        var pDocTitle = new Ltxml.XElement(openXml.W.p,
        //               new Ltxml.XElement(openXml.W.pPr,
        //                    new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "16"))),

        new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))), new Ltxml.XElement(openXml.W.t, documentHighlights.title), new Ltxml.XElement(openXml.W.br)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))), new Ltxml.XElement(openXml.W.t, this._email), new Ltxml.XElement(openXml.W.br)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Arial Bold"), new Ltxml.XAttribute(openXml.W.hAnsi, "Arial Bold")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24"))), new Ltxml.XElement(openXml.W.t, documentHighlights.url)));

        lastPara = body.elements(openXml.W.p).lastOrDefault();
        if (lastPara !== null) {
            lastPara.addAfterSelf(pDocTitle);
        }

        //  new Ltxml.XElement(openXml.W.b)

        /*  new Ltxml.XElement(openXml.W.p,
          new Ltxml.XElement(openXml.W.pPr,
              new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)),
              i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")),
              new Ltxml.XElement(openXml.W.rPr,
                  new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                  new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                  i === 0 ? new Ltxml.XElement(openXml.W.b) : null)),
          new Ltxml.XElement(openXml.W.r,
              new Ltxml.XElement(openXml.W.rPr,
                  new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")),
                  new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")),
                  i === 0 ? new Ltxml.XElement(openXml.W.b) : null),
              new Ltxml.XElement(openXml.W.t, "Word"))));*/

        //var mainXDoc = new Ltxml.XElement(openXml.W.document, new Ltxml.XElement(openXml.W.body, p1, p2, p3, p4));

        //var xd = openedDoc.mainDocumentPart().getXDocument();
        //xd.root.replaceWith(mainXDoc);

        //added some text now save to 64 bit string
        var saveToBase64 = openedDoc.saveToBase64();
        var savetoBlob = openedDoc.saveToBlob();

        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
            arrayBuffer = event.target.result;

            var binary = '';
            var bytes = new Uint8Array(arrayBuffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            // if(window.location.ancestorOrigins[0].indexOf("sharepoint.com") > 0) // We are dealing with Sharepoint so use the sharepoint urls to get access code and tokens
            // {        
            //     // window.postMessage(
            //     // {
            //     //     'method': 'collectHighlightsO365Request',
            //     //     'type': '1757FROM_PAGERW4G',
            //     //     'filename': filename,
            //     //     'filedata': window.btoa( binary )
            //     // }, '*'); 
            var filename = documentHighlights.docTitle + " " + new Date().getTime();
            var binary_string = window.atob(window.btoa(binary));
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            var filedata = bytes.buffer;
            this.upload0365SharepointDocument(token, interactive, scopes, filename, filedata, funcToOAuth, documentHighlights, retry);
            // }
            // else
            // {
            // window.postMessage(
            // {
            //     'method': 'collectHighlightsO365LiveRequest',
            //     'type': '1757FROM_PAGERW4G',
            //     'filename': filename,
            //     'filedata': window.btoa( binary )
            // }, '*');         
            // var filename = 'speechstreamhl';
            // var binary_string =  window.atob(window.btoa( binary ));
            // var len = binary_string.length;
            // var bytes = new Uint8Array( len );
            // for (var i = 0; i < len; i++)        {
            //     bytes[i] = binary_string.charCodeAt(i);
            // }
            // var filedata = bytes.buffer;
            // upload0365LiveDocument(filename, filedata);                        
            //}

            //reinitialise the arrays
            //      magentaHighlights = [];
            //      yellowHighlights = [];
            //      greenHighlights = [];
            //      cyanHighlights = [];
            //      byPositionHighlights = [];
        }.bind(this);

        fileReader.readAsArrayBuffer(savetoBlob);

        //     }, params, retry);

        // make an authenticated write highlights to docs call.
        /*      this.authenticate(true, this.collectHighlightsScopes, this.writeCollectHighlightsDoc, (resultUrl) => {
                  // return if we get null as we didn't get authenticated. 
                  callback(resultUrl);
              }, documenthighlights);
           /*     var documentHighlights = params;
                var documentHTML = '<!DOCTYPE html><html><head><style>';
              documentHTML += 'p{padding-bottom:10px}.blue{background-color:#0ff}.pink{background-color:#f0f}.green{background-color:#adff2f}.yellow{background-color:#ff0}.boldText{font-weight:700}'
              documentHTML += '</style></head><body>';
                var i = 0;
              for (i = 0; i < documentHighlights.highlights.length; i++) {
                  if (documentHighlights.highlights[i].color == "#FFFF00") {
                      documentHTML += '<p><span class="yellow">';
                  }
                  if (documentHighlights.highlights[i].color == "#ADFF2F") {
                      documentHTML += '<p><span class="green">';
                  }
                  if (documentHighlights.highlights[i].color == "#00FFFF") {
                      documentHTML += '<p><span class="blue">';
                  }
                  if (documentHighlights.highlights[i].color == "#FF00FF") {
                      documentHTML += '<p><span class="pink">';
                  }
                    documentHTML += documentHighlights.highlights[i].text + '</span></p>';
              }
                documentHTML += '<br><p><span class="boldText"><a href="' + documentHighlights.url;
              documentHTML += '">' + documentHighlights.title + '</a></span></p>';
              documentHTML += '<p><span class="user">' + this._name + '<br>' + this._id + '</span></p>';
                documentHTML += '</body></html>';
        
              var requestBody = '--rw4g\n' +
                  'Content-Type: application/json; charset=UTF-8\n\n' +
                  '{"title": "' + documentHighlights.docTitle + '", "description": "Read&Write for Google Chrome\u2122"}\n' +
                  '--rw4g\n' +
                  'Content-Type: text/html\n\n' +
                  documentHTML + '\n' +
                  '--rw4g--\n'
                var url = 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true';
              fetch(url, {
                  headers: {
                      'Content-Type': 'multipart/related; boundary="rw4g"',
                      "Authorization": 'Bearer ' + token
                  },
                  method: 'POST',
                  body:requestBody
              }).then((response)=>{return this.handleErrors(response, retry, interactive, scopes, funcToOAuth, onFuncResponse, params,token);
              }).then((data) => {
                  onFuncResponse(data.alternateLink);
              }).catch((err) => {
                  console.log(err);
              });*/
    }

    writeVocabResponse(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        this.imageProcessed = true;
        this.base64ImagesArray = [];

        var definitions = [];
        var allsymbols = [];
        var json = params;
        var vocabWords = params['vocab']['words'];
        var symbols;

        var vocabStandardisedData = {};
        vocabStandardisedData.words = [];
        vocabStandardisedData.translations = params.translations;
        vocabStandardisedData.locale = params.locale;
        vocabStandardisedData.user = params.user;
        vocabStandardisedData.sendResponse = params.sendResponse;

        var filename = vocabStandardisedData.translations.docTitle + new Date().getTime();
        for (var i = 0; i < vocabWords.length; i++) {
            var vocabWord = {};
            vocabWord.word = vocabWords[i].word;
            vocabWord.definitions = [];
            vocabWord.symbols = [];
            var vocabDescriptions = vocabWords[i]['inflections'];
            if (vocabDescriptions.length > 0) {
                for (var j = 0; j < vocabDescriptions.length; j++) {
                    for (var l = 0; l < vocabDescriptions[j]['definitions'].length; l++) {
                        vocabWord.definitions.push(vocabDescriptions[j]['definitions'][l].definition);
                    }
                    symbols = vocabDescriptions[j]['symbols'];
                    for (l = 0; l < symbols.length; l++) {
                        vocabWord.symbols.push(symbols[l]);
                        allsymbols.push(symbols[l]);
                    }
                }
            }

            vocabStandardisedData.words.push(vocabWord);
        }

        /*    if (allsymbols.length > 0) {
                for (var m = 0; m < allsymbols.length; m++) {
                    this.wait(allsymbols[m], this.createvocabdoc.bind(this), allsymbols.length, filename);
                }
            }
            else {
                this.createvocabdoc(filename, this.base64ImagesArray);
            }*/

        var symbolpromises = allsymbols.map(this.convertImgToBase64URLP);
        Promise.all(symbolpromises).then(function (images) {
            this.createvocabdoc(filename, vocabWords, vocabStandardisedData, images, token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
        }.bind(this)).catch(function (urls) {
            console.log("Error fetching some images: " + urls);
        }.bind(this));
    }

    writeVocabHTMLResponse(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {

        this.imageProcessed = true;
        this.base64ImagesArray = [];

        var allsymbols = [];
        var json = params;
        var vocabWords = params['vocab']['words'];
        var symbols;

        var vocabStandardisedData = {};
        vocabStandardisedData.words = [];
        vocabStandardisedData.translations = params.translations;
        vocabStandardisedData.locale = params.locale;
        vocabStandardisedData.user = params.user;
        vocabStandardisedData.sendResponse = params.sendResponse;

        var filename = vocabStandardisedData.translations.docTitle + new Date().getTime();

        for (var i = 0; i < vocabWords.length; i++) {
            var vocabWord = {};
            vocabWord.word = vocabWords[i].word;
            vocabWord.definitions = [];
            vocabWord.symbols = [];

            vocabWord.definitions.push(vocabWords[i]['definitionText']);

            symbols = vocabWords[i]['symbols'];
            for (var l = 0; l < symbols.length; l++) {
                vocabWord.symbols.push(symbols[l]);
                allsymbols.push(symbols[l]);
            }

            vocabStandardisedData.words.push(vocabWord);
        }
        /*     if (allsymbols.length > 0) {
                 for (var m = 0; m < allsymbols.length; m++) {
                     wait(allsymbols[m], this.createvocabdoc, allsymbols.length, filename);
                 }
             }
             else {
                 this.createvocabdoc(filename, this.base64ImagesArray);
             }*/

        var symbolpromises = allsymbols.map(this.convertImgToBase64URLP);
        Promise.all(symbolpromises).then(function (images) {
            this.createvocabdoc(filename, vocabWords, vocabStandardisedData, images, token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
        }.bind(this)).catch(function (urls) {
            console.log("Error fetching some images: " + urls);
        }.bind(this));
    }

    createvocabdoc(filename, vocabWords, vocabStandardisedData, base64ImagesArray, token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {
        var symbolCounter = 0;
        var openedDoc = new openXml.OpenXmlPackage(this.blankDocument);

        // Append the paragraphs to the document.
        var body = openedDoc.mainDocumentPart().getXDocument().root.element(openXml.W.body);

        var p1 = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.pStyle, new Ltxml.XAttribute(openXml.W.val, "Title")), new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center"))), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.title)));

        var p4 = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.pStyle, new Ltxml.XAttribute(openXml.W.val, "Heading1"))), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.t, "")));

        var imageElements = [];
        for (var imageIndex = 0; imageIndex < base64ImagesArray.length; imageIndex++) {
            var imageIcon = base64ImagesArray[imageIndex][0];

            var relidHelper = "rId" + (openedDoc.mainDocumentPart().getRelationships().length + 1);

            var imageElement = new Ltxml.XElement(openXml.W.drawing, new Ltxml.XElement(openXml.WP.inline, new Ltxml.XElement(openXml.WP.extent, new Ltxml.XAttribute(openXml.NoNamespace.cx, "457200"), new Ltxml.XAttribute(openXml.NoNamespace.cy, "457200")), new Ltxml.XElement(openXml.WP.docPr, new Ltxml.XAttribute(openXml.NoNamespace.id, imageIndex), new Ltxml.XAttribute(openXml.NoNamespace.name, "Pic" + imageIndex), new Ltxml.XAttribute(openXml.NoNamespace.descr, "thlogo.png")), new Ltxml.XElement(openXml.A.graphic, new Ltxml.XElement(openXml.A.graphicData, new Ltxml.XAttribute(openXml.NoNamespace.uri, "http://schemas.openxmlformats.org/drawingml/2006/picture"), new Ltxml.XElement(openXml.Pic._pic, new Ltxml.XElement(openXml.Pic.nvPicPr, new Ltxml.XElement(openXml.Pic.cNvPr, new Ltxml.XAttribute(openXml.NoNamespace.id, imageIndex), new Ltxml.XAttribute(openXml.NoNamespace.name, "thlogo.png")), new Ltxml.XElement(openXml.Pic.cNvPicPr)), new Ltxml.XElement(openXml.Pic.blipFill, new Ltxml.XElement(openXml.A.blip, new Ltxml.XAttribute(openXml.R.embed, relidHelper)), new Ltxml.XElement(openXml.A.stretch, new Ltxml.XElement(openXml.A.fillRect))), new Ltxml.XElement(openXml.Pic.spPr, new Ltxml.XElement(openXml.A.xfrm, new Ltxml.XElement(openXml.A.ext, new Ltxml.XAttribute(openXml.NoNamespace.cx, "457200"), new Ltxml.XAttribute(openXml.NoNamespace.cy, "457200"))), new Ltxml.XElement(openXml.A.prstGeom, new Ltxml.XAttribute(openXml.NoNamespace.prst, "rect"))))))));

            var partPath = "/word/media/image" + imageIndex + ".png";
            var relPath = "media/image" + imageIndex + ".png";
            openedDoc.addPart(partPath, openXml.contentTypes.png, "base64", imageIcon); // add Image Part to doc
            openedDoc.mainDocumentPart().addRelationship(relidHelper, openXml.relationshipTypes.image, relPath, "Internal"); // add relationship to image  
            imageElements.push(imageElement);
        }

        var tblPr = new Ltxml.XElement(openXml.W.tblPr, new Ltxml.XElement(openXml.W.tblStyle, new Ltxml.XAttribute(openXml.W.val, "TableGrid")), new Ltxml.XElement(openXml.W.tblW, new Ltxml.XAttribute(openXml.W._w, 0), new Ltxml.XAttribute(openXml.W.type, "dxa")), new Ltxml.XElement(openXml.W.tblLook, new Ltxml.XAttribute(openXml.W.val, "04A0"), new Ltxml.XAttribute(openXml.W.firstRow, 1), new Ltxml.XAttribute(openXml.W.lastRow, 0), new Ltxml.XAttribute(openXml.W.firstColumn, 1), new Ltxml.XAttribute(openXml.W.lastColumn, 0), new Ltxml.XAttribute(openXml.W.noHBand, 0), new Ltxml.XAttribute(openXml.W.noVBand, 1)));

        var tblGrid = new Ltxml.XElement(openXml.W.tblGrid, new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 1326)), new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 5355)), new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 1575)), new Ltxml.XElement(openXml.W.gridCol, new Ltxml.XAttribute(openXml.W._w, 1200)));

        //var dataArray = allData[dataSet];
        var rows = [];
        //Heading rows
        var headingColor = "E7E6E6";
        var c1 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1326), new Ltxml.XAttribute(openXml.W.type, "dxa")), new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.heading))));

        var c2 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 5355), new Ltxml.XAttribute(openXml.W.type, "dxa")), new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.meaning))));
        var c3 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1575), new Ltxml.XAttribute(openXml.W.type, "dxa")), new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.symbol))));

        var c4 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1200), new Ltxml.XAttribute(openXml.W.type, "dxa")), new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, headingColor))), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, vocabStandardisedData.translations.notes))));

        var row = new Ltxml.XElement(openXml.W.tr, c1, c2, c3, c4);

        rows.push(row);

        for (var i = 0; i < vocabStandardisedData.words.length; i++) {

            var isShade = i % 2 === 0;
            var evenRowColor = "99CDFF";
            var goodColor = "C5E0B3";
            var poorColor = "FF7D7D";

            var c1 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1326), new Ltxml.XAttribute(openXml.W.type, "dxa")), isShade ? new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, vocabWords[i]['word']))));

            var definitions = vocabStandardisedData.words[i].definitions;
            var combinedDefinitions = "";
            if (definitions.length > 0) {
                for (var j = 0; j < definitions.length; j++) {
                    combinedDefinitions = (combinedDefinitions + definitions[j]).trim();
                    if (j < definitions.length - 1) {
                        combinedDefinitions += "\n\n";
                    }
                }
            }

            if (combinedDefinitions === "") {
                //           combinedDefinitions = "No meaning found."
            }

            var c2 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 5355), new Ltxml.XAttribute(openXml.W.type, "dxa")), isShade ? new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "24")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, combinedDefinitions))));

            var c3 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1575), new Ltxml.XAttribute(openXml.W.type, "dxa")), isShade ? new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null));

            var symbols = vocabStandardisedData.words[i].symbols;
            var vocabDescriptions = vocabWords[i]['inflections'];
            if (symbols.length > 0) {
                for (var s = symbolCounter; s < symbols.length + symbolCounter; s++) {
                    var parg = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, imageElements[s]));

                    c3.add(parg);
                    //imageElements.splice(0, 1);
                }
                symbolCounter = parseInt(symbolCounter) + parseInt(symbols.length);
            } else {
                var parg = new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, "No Symbols"));

                c3.add(parg);
            }

            var c4 = new Ltxml.XElement(openXml.W.tc, new Ltxml.XElement(openXml.W.tcPr, new Ltxml.XElement(openXml.W.tcW, new Ltxml.XAttribute(openXml.W._w, 1200), new Ltxml.XAttribute(openXml.W.type, "dxa")), isShade ? new Ltxml.XElement(openXml.W.shd, new Ltxml.XAttribute(openXml.W.val, "clear"), new Ltxml.XAttribute(openXml.W.color, "auto"), new Ltxml.XAttribute(openXml.W.fill, evenRowColor)) : null), new Ltxml.XElement(openXml.W.p, new Ltxml.XElement(openXml.W.pPr, new Ltxml.XElement(openXml.W.spacing, new Ltxml.XAttribute(openXml.W.before, 80), new Ltxml.XAttribute(openXml.W.after, 80)), i === 0 ? new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")) : new Ltxml.XElement(openXml.W.jc, new Ltxml.XAttribute(openXml.W.val, "center")), new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null)), new Ltxml.XElement(openXml.W.r, new Ltxml.XElement(openXml.W.rPr, new Ltxml.XElement(openXml.W.rFonts, new Ltxml.XAttribute(openXml.W.ascii, "Trebuchet MS"), new Ltxml.XAttribute(openXml.W.hAnsi, "Trebuchet MS")), new Ltxml.XElement(openXml.W.sz, new Ltxml.XAttribute(openXml.W.val, "32")), i === 0 ? new Ltxml.XElement(openXml.W.b) : null), new Ltxml.XElement(openXml.W.t, ""))));

            var row = new Ltxml.XElement(openXml.W.tr, c1, c2, c3, c4);

            rows.push(row);
        }

        var tbl = new Ltxml.XElement(openXml.W.tbl, tblPr, tblGrid, rows);
        var testImage = this.createAndUploadVocab('', openedDoc, p1, p4, tbl, filename, token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry);
    }

    createAndUploadVocab(url, doc, paramp1, paramp4, paramtbl, filename, token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        var p1 = paramp1;
        var p4 = paramp4;
        var tbl = paramtbl;

        var openedDoc = doc;
        img.crossOrigin = 'Anonymous';

        var mainXDoc = new Ltxml.XElement(openXml.W.document, new Ltxml.XElement(openXml.W.body, p1, p4, tbl));

        var xd = openedDoc.mainDocumentPart().getXDocument();
        xd.root.replaceWith(mainXDoc);

        //added some text now save to 64 bit string
        var saveToBase64 = openedDoc.saveToBase64();
        var saveToOPC = openedDoc.saveToFlatOpc();
        var savetoBlob = openedDoc.saveToBlob();

        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
            arrayBuffer = event.target.result;

            var formData = new FormData();
            formData.append('file', savetoBlob, "VocabularyList.docx");

            var binary = '';
            var bytes = new Uint8Array(arrayBuffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            // if(window.location.ancestorOrigins[0].indexOf("sharepoint.com") > 0) // We are dealing with Sharepoint so use the sharepoint urls to get access code and tokens
            // { 
            //     window.postMessage(
            //     {
            //         'method': 'vocabO365WordsRequest',
            //         'type': '1757FROM_PAGERW4G',
            //         'filename' : filename,
            //         'filedata': window.btoa( binary )
            //     }, '*');
            var binary_string = window.atob(window.btoa(binary));
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            var filedata = bytes.buffer;
            this.upload0365SharepointDocument(token, interactive, scopes, filename, filedata, funcToOAuth, params, retry);

            // }
            // else
            // {
            // window.postMessage(
            // {
            //     'method': 'vocabO365WordsLiveRequest',
            //     'type': '1757FROM_PAGERW4G',
            //     'filename' : filename,
            //     'filedata': window.btoa( binary )
            // }, '*'); 

            /** var binary_string =  window.atob(window.btoa( binary ));
            var len = binary_string.length;
            var bytes = new Uint8Array( len );
            for (var i = 0; i < len; i++)        {
                bytes[i] = binary_string.charCodeAt(i);
            }
            var filedata = bytes.buffer;  
            upload0365LiveDocument(filename, filedata);**/
            //    }           
        }.bind(this);

        fileReader.readAsArrayBuffer(savetoBlob);
    }

    getVoiceNoteToken(token, interactive, scopes, funcToOAuth, onFuncResponse, params, retry) {}
};
exports.default = MicrosoftSharepointServices;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _MessagingFactory = __webpack_require__(11);

var _MessagingFactory2 = _interopRequireDefault(_MessagingFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Manages the messaging 
class MessagingManager {

  // Constructor
  constructor(messagingType, messageCallback) {

    // default to a Google account if no account type is set.
    if (messagingType === undefined) {
      messagingType = texthelp.RW4GC.enums.MessagingType.GCM;
    }

    // create the authenticator for the current account type and get the users id. As we are in the constructor
    // and don't want any OAuth dialogs on a Chrome start set Interactive here to false. 
    this._messaging = new _MessagingFactory2.default(messagingType, messageCallback).messaging;
  }

  /**
  * Retrieves the last message send to the specified topic
  * @param {string} topic - The topic to look up
  * @param {bool} useCache - The topic to look up
  * @param {function} callback - function to call on finish
  */
  getLastMessage(topic, useCache, callback) {
    this._messaging._getLastMessage(topic, useCache, callback);
  }

  /**
  * Retrieves the last message send to the specified topic
  * @param {string} topic - The topic to look up
  * @param {function} callback - function to call on message
  */
  waitForNextMessage(topic, callback) {
    // Are we already waiting for a message?
    // If not wait
    if (!this._messaging.waiting) {
      this._messaging._waitForNextMessage(topic, callback);
    }
  }

  onMessage(callback) {
    this._messaging._onMessage(callback);
  }

  checkIfStalled(restartIfStalled, timeout) {
    this._messaging._checkIfStalled(restartIfStalled, timeout);
  }

};
exports.default = MessagingManager;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CouchDbMessaging = __webpack_require__(12);

var _CouchDbMessaging2 = _interopRequireDefault(_CouchDbMessaging);

var _GCMMessaging = __webpack_require__(13);

var _GCMMessaging2 = _interopRequireDefault(_GCMMessaging);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creates the right type of messaging based on the the type passed.
// By default it will use the couch db messaging

class MessagingFactory {

  /**
   * @constructor
   * @param {string} messagingType - message type to create.
   * @param {function} messageCallback - function called on message
   */
  constructor(messagingType, messageCallback) {
    try {
      switch (messagingType) {
        case texthelp.RW4GC.enums.MessagingType.COUCHDB:
          this._messaging = new _CouchDbMessaging2.default('test-channel', 'longpoll', messageCallback);
          break;

        case texthelp.RW4GC.enums.MessagingType.GCM:
          this._messaging = new _GCMMessaging2.default('224182583415', 'gcm', messageCallback);
          break;

        default:
          this._messaging = new _GCMMessaging2.default('224182583415', 'gcm', messageCallback);
          break;
      }
    } catch (ex) {
      console.log(ex);
      this._messaging = {};
    }
  }

  /**
   * Read only property to get the correct messaging instance
   * @constructor
   * @return {object} instance of the created authenticator.
   */
  get messaging() {
    return this._messaging;
  }
}
exports.default = MessagingFactory;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// Manages the the current users identity 
class CouchDbMessaging {

  // Constructor
  constructor(database, syncType, messageCallback) {
    // sample url
    // https://messaging-db.texthelp.com/test-channel/_design/last/_view/last_view_topic?descending=true&limit=1&include_docs=true&startkey=["505e96030d9acc82debe4340d1e11954d8ed99643b79a12e72cab0b111d9715a@gedudemotexthelpsupport.com",{}]&endkey=["505e96030d9acc82debe4340d1e11954d8ed99643b79a12e72cab0b111d9715a@gedudemotexthelpsupport.com"]

    this._clientAuth = 'bXNnQWRtaW46dmVIdzxKZy5TZSUy';
    this._messagingUrl = 'https://messaging-db.texthelp.com/';
    this._messagingViewPath = '/_design/last/_view/last_view_topic?descending=true&limit=1&include_docs=true';
    this._messagingDatabase = database;
    this._messagingCallback = messageCallback;
    this._lastMessage = undefined;
    this._waiting = false;
    this._onMessageCallback = undefined;
    this._dateLastMessageRequest = undefined;
    this._lastTopic = undefined;
    this._lastCallback = undefined;
    this._lastWaitTopic = undefined;
    this._lastWaitCallback = undefined;
    this._syncType = syncType;
  }

  /**
   * Retrieves the last message send to the specified topic
   * @param {string} topic - The topic to look up
   * @param {bool} useCache - Use the cached version if it exists
   * @param {function} callback - Callback function to call on completion
   *       If undefined use massageCallback defined in the constructor
   */
  _getLastMessage(topic, useCache, callback) {
    var expired = false;

    console.log('Getting last message');

    var haveLastMessage = this._lastMessage !== undefined;

    if (topic !== this._lastTopic) {
      useCache = false;
    }

    this._lastTopic = topic;
    this._lastCallback = callback;

    if (useCache && haveLastMessage) {
      try {
        if (this._lastMessage.timetype == 'timed') {
          if (this._expiryTimeMS(this._lastMessage, true) < 0) {
            expired = true;
          }
        }
      } catch (error) {
        // The message isn't in the correct format, throw it away
        expired = true;
      }

      if (callback !== undefined) {
        if (expired) {
          callback(undefined);
        } else {
          callback(this._lastMessage);
        }
      }
      if (this._messagingCallback !== undefined) {
        if (expired) {
          this._messagingCallback(this._lastMessage);
        } else {
          this._messagingCallback(this._lastMessage);
        }
      }
      return;
    }

    var serviceUrl = this._messagingUrl + this._messagingDatabase + this._messagingViewPath + '&startkey=["' + topic + '",{}]' + '&endkey=["' + topic + '"]';

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status == 200) {
          console.log('Got last message from service');
          // Tidy the response
          var response = JSON.parse(xhr.responseText);
          var lastMessage = undefined;
          console.log(xhr.response);

          if (response.rows !== undefined) {
            if (response.rows.length > 0) {

              // Extract the message
              var tempDoc = response.rows[0].doc;
              lastMessage = this._parseMessageDoc(tempDoc);
            }
          }

          this._lastMessage = lastMessage;

          var expired = false;

          try {
            if (this._lastMessage.timetype == 'timed') {
              if (this._expiryTimeMS(this._lastMessage, true) < 0) {
                expired = true;
              }
            }
          } catch (error) {
            // The message isn't in the correct format, throw it away
            expired = true;
          }

          if (callback !== undefined) {
            if (expired) {
              callback(undefined);
            } else {
              callback(lastMessage);
            }
          }
          if (this._messagingCallback !== undefined) {
            if (expired) {
              this._messagingCallback(undefined);
            } else {
              this._messagingCallback(lastMessage);
            }
          }
          if (!expired && this._onMessageCallback !== undefined) {
            this._onMessageCallback(lastMessage);
          }
        } else {
          // just log the messaging error for now
          console.log('Messaging Error:');
          console.log(xhr.responseText);
          if (callback !== undefined) {
            callback(undefined);
          }
          if (this._messagingCallback !== undefined) {
            this._messagingCallback(undefined);
          }
        }
      }
    }.bind(this));

    xhr.open("GET", serviceUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Basic " + this._clientAuth);
    xhr.setRequestHeader("Cache-Control", "no-cache");

    xhr.send();
  }

  /**
   * Wait for the next message to come in
   * @param {string} topic - The topic to listen for
   * @param {function} callback - optional function to call on message
   */
  _waitForNextMessage(topic, callback) {
    console.log('start of _waitForNextMessage');

    this._waiting = true;

    // https://messaging-db.texthelp.com/test-channel/_changes?feed=longpoll&since=now&include_docs=true&filter=app/topic_filter&topic=f35d5fe078142bd523106c3f80d70bdb228745a50c14996d24fca7b418abdbe6@gedudemotexthelpsupport.com

    var serviceUrl = this._messagingUrl + this._messagingDatabase + '/_changes?feed=longpoll&since=now&include_docs=true&filter=app/topic_filter' + '&topic=' + topic;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    this._dateLastMessageRequest = moment(new Date()).utc();

    this._lastWaitTopic = topic;
    this._lastWaitCallback = callback;

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status == 200) {
          var lastMessage = undefined;

          console.log('Got current message');
          // Tidy the response
          var response = JSON.parse(xhr.responseText);

          console.log(response);

          // Extract the message if there is one
          if (response.results !== undefined) {
            if (response.results.length > 0) {

              // Extract the message
              var tempDoc = response.results[0].doc;
              lastMessage = this._parseMessageDoc(tempDoc);

              this._lastMessage = lastMessage;

              var expired = false;

              try {
                if (this._lastMessage.timetype == 'timed') {
                  if (this._expiryTimeMS(this._lastMessage, true) < 0) {
                    expired = true;
                  }
                }
              } catch (error) {
                // The message isn't in the correct format, throw it away
                expired = true;
              }

              if (!expired && callback !== undefined) {
                callback(lastMessage);
              }
              if (!expired && this._messagingCallback !== undefined) {
                this._messagingCallback(lastMessage);
              }
              if (!expired && this._onMessageCallback !== undefined) {
                this._onMessageCallback(lastMessage);
              }

              this._waitForNextMessage(topic, callback);
            }
          }
        } else if (xhr.status == 504) {
          console.log('Timeout error');
          // Gateway timeout, restart
          this._waitForNextMessage(topic, callback);
        } else {
          // just log the messaging error for now
          console.log('Messaging Error:');
          console.log(xhr.responseText);
          this._waitForNextMessage(topic, callback);
        }
      }
    }.bind(this));

    xhr.ontimeout = function (e) {
      // XMLHttpRequest timed out. Do something here.
      console.log('timeout');
      // this._waitForNextMessage(topic, callback);
    }.bind(this);

    xhr.onerror = function (e) {
      console.log('xhr error');
      console.log(e);
    }.bind(this);

    xhr.open("GET", serviceUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Basic " + this._clientAuth);
    xhr.setRequestHeader("Cache-Control", "no-cache");

    xhr.send();
  }

  _onMessage(callback) {
    this._onMessageCallback = callback;
  }

  /**
  * Checks if the waiting for a message has stalled
  * This can happen after a laptop goes to sleep
  * for example.
  * @param {bool} restartIfStalled - Attempt to restart waiting?
  * @param {number} timeout - timeout in milliseconds after last wait
  * @returns {bool} Has the waiting timed out
  */
  _checkIfStalled(restartIfStalled, timeout) {
    // if timeout isn't set default to 1 minute
    if (timeout == undefined) {
      timeout = 60000;
    }
    var currDateTime = moment(new Date()).utc();

    var timestamp = this._dateLastMessageRequest;

    var diff = currDateTime.diff(timestamp);
    console.log('Stall check/n----------');
    console.log(diff);

    if (diff > timeout) {
      if (restartIfStalled) {
        this._getLastMessage(this._lastTopic, false, this._lastCallback);
        this._waitForNextMessage(this._lastWaitTopic, this._lastWaitCallback);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
   * Parese the document and retrun a valid message
   * @param {json} document - The document to parse
   */
  _parseMessageDoc(document) {
    var returnMessage = undefined;
    try {
      // Get the message
      var tempMessage = document.message;
      returnMessage = {};
      try {
        returnMessage.features = tempMessage['disabled-features'].reduce(function (obj, v) {
          obj[v] = 0;
          return obj;
        }, {});
      } catch (error) {
        returnMessage.features = {};
      }

      returnMessage.time = tempMessage.time;
      returnMessage.timetype = tempMessage.timetype;

      // Parse the timestamp into a useable format
      // var timestamp = moment(document.ts, 'YYYYMMDDHHmmss').utc();
      // returnMessage.timestamp = timestamp.toISOString();
      returnMessage.timestamp = document.ts;
    } catch (error) {
      returnMessage = undefined;
    }

    return returnMessage;
  }

  _expiryTimeMS(message, setAlarm) {
    // Check we have a valid time addition
    if (Number.isInteger(message.time)) {
      // convert the timestamp back into a date
      try {

        var currDateTime = moment(new Date()).utc();
        var timestamp = moment(message.timestamp).utc();

        var expiryDate = timestamp.clone();
        expiryDate.add(message.time, 'h');

        var diff = expiryDate.diff(currDateTime);

        console.log("Date Diff - " + diff);

        if (setAlarm && diff > 0) {
          console.log('Setting alarm');
          chrome.alarms.create('MessageExpired', { delayInMinutes: Math.floor(diff / (1000 * 60)) });

          // chrome.alarms.create('MessageExpired', {delayInMinutes: 2});
        }

        return diff;
      } catch (error) {
        // Not a valid date, ignore
      }
    }
  }

  get waiting() {
    return this._waiting;
  }

};
exports.default = CouchDbMessaging;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// Manages the the current users identity 
class GCMMessaging {

  // Constructor
  constructor(database, syncType, messageCallback) {
    // sample url
    // https://messaging-db.texthelp.com/test-channel/_design/last/_view/last_view_topic?descending=true&limit=1&include_docs=true&startkey=["505e96030d9acc82debe4340d1e11954d8ed99643b79a12e72cab0b111d9715a@gedudemotexthelpsupport.com",{}]&endkey=["505e96030d9acc82debe4340d1e11954d8ed99643b79a12e72cab0b111d9715a@gedudemotexthelpsupport.com"]

    this._senderId = [database];
    this._messagingUrl = 'https://messaging.texthelp.com/';
    // this._messagingUrl = 'http://localhost:53530/';
    this._messagingCallback = messageCallback;
    this._lastMessage = undefined;
    this._waiting = false;
    this._onMessageCallback = undefined;
    this._lastTopic = undefined;
    this._lastCallback = undefined;
    this._lastWaitTopic = undefined;
    this._lastWaitCallback = undefined;
    this._syncType = syncType;

    this._GCMListen();

    chrome.alarms.onAlarm.addListener(alarm => {
      switch (alarm.name) {
        case "GCMKeepAlive":
          if (this._lastTopic != undefined) {
            this._registerTopic(this._lastTopic, false, response => {});
          }
          break;

        default:
          break;
      }
    });
  }

  /**
   * In GCM there isn't a way to get a new last message.
   * By default we return the last last message
   * @param {string} topic - The topic to look up
   * @param {bool} useCache - Use the cached version if it exists
   * @param {function} callback - Callback function to call on completion
   *       If undefined use massageCallback defined in the constructor
   */
  _getLastMessage(topic, useCache, callback) {
    var expired = false;

    var haveLastMessage = this._lastMessage !== undefined;

    if (topic !== this._lastTopic) {
      useCache = false;
    }

    if (this._lastTopic !== topic) {
      // Register the topic with our service
      this._registerTopic(topic, true, result => {});
    }

    this._lastTopic = topic;
    this._lastCallback = callback;

    if (useCache && haveLastMessage) {
      try {
        if (this._lastMessage.timetype == 'timed') {
          if (this._expiryTimeMS(this._lastMessage, true) < 0) {
            expired = true;
          }
        }
      } catch (error) {
        // The message isn't in the correct format, throw it away
        expired = true;
      }

      if (callback !== undefined) {
        if (expired) {
          callback(undefined);
        } else {
          callback(this._lastMessage);
        }
      }
      if (this._messagingCallback !== undefined) {
        if (expired) {
          this._messagingCallback(this._lastMessage);
        } else {
          this._messagingCallback(this._lastMessage);
        }
      }
      return;
    }

    try {
      var serviceUrl = this._messagingUrl + 'getlastmessage/v1';

      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      var data = JSON.stringify({
        "message_topic": topic
      });

      xhr.addEventListener("readystatechange", function () {
        if (xhr.readyState === 4) {
          if (xhr.status == 200) {
            // Tidy the response
            var response = JSON.parse(xhr.responseText);
            var lastMessage = undefined;

            if (response.length > 0) {

              // Extract the message
              var tempDoc = response[0];
              lastMessage = this._parseMessageDoc(tempDoc);
            }

            console.log('Got last message.');

            this._lastMessage = lastMessage;

            var expired = false;

            try {
              if (this._lastMessage.timetype == 'timed') {
                if (this._expiryTimeMS(this._lastMessage, true) < 0) {
                  expired = true;
                }
              }
            } catch (error) {
              // The message isn't in the correct format, throw it away
              expired = true;
            }

            if (callback !== undefined) {
              if (expired) {
                callback(undefined);
              } else {
                callback(lastMessage);
              }
            }
            if (this._messagingCallback !== undefined) {
              if (expired) {
                this._messagingCallback(undefined);
              } else {
                this._messagingCallback(lastMessage);
              }
            }
            if (!expired && this._onMessageCallback !== undefined) {
              this._onMessageCallback(lastMessage);
            }
          } else {
            if (callback !== undefined) {
              callback(undefined);
            }
            if (this._messagingCallback !== undefined) {
              this._messagingCallback(undefined);
            }
          }
        }
      }.bind(this));

      xhr.open("POST", serviceUrl);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", "Basic " + this._clientAuth);
      xhr.setRequestHeader("Cache-Control", "no-cache");

      xhr.send(data);
    } catch (error) {
      // throw it away
    }
  }

  /**
   * Wait for the next message to come in
   * @param {string} topic - The topic to listen for
   * @param {function} callback - optional function to call on message
   */
  _waitForNextMessage(topic, callback) {

    this._waiting = true;

    if (topic !== this._lastTopic) {
      // Register the topic with our service
      this._registerTopic(topic, true, result => {});
    }

    // Remove for now, not sure it helps anyway
    // this._GCMKeepAlive(5);

    this._lastWaitCallback = callback;
  }

  _onMessage(callback) {
    this._onMessageCallback = callback;
  }

  /**
  * Checks if the waiting for a message has stalled
  * This can happen after a laptop goes to sleep
  * for example.
  * @param {bool} restartIfStalled - Attempt to restart waiting?
  * @param {number} timeout - timeout in milliseconds after last wait
  * @returns {bool} Has the waiting timed out
  */
  _checkIfStalled(restartIfStalled, timeout) {
    // if timeout isn't set default to 1 minute
    return true;
  }

  /**
   * Parese the document and retrun a valid message
   * @param {json} document - The document to parse
   */
  _parseMessageDoc(document) {
    var returnMessage = undefined;
    try {
      // Get the message
      var tempMessage = {};

      if (typeof document['message'] == "string") {
        tempMessage = JSON.parse(document['message']);
      } else {
        tempMessage = document['message'];
      }

      returnMessage = {};
      try {
        returnMessage.features = tempMessage['disabled-features'].reduce(function (obj, v) {
          obj[v] = 0;
          return obj;
        }, {});
      } catch (error) {
        returnMessage.features = {};
      }

      returnMessage.time = tempMessage.time;
      returnMessage.timetype = tempMessage.timetype;

      // Parse the timestamp into a useable format
      // var timestamp = moment(document.ts, 'YYYYMMDDHHmmss').utc();
      // returnMessage.timestamp = timestamp.toISOString();
      returnMessage.timestamp = document.post_date;
    } catch (error) {
      returnMessage = undefined;
    }

    return returnMessage;
  }

  _expiryTimeMS(message, setAlarm) {
    // Check we have a valid time addition
    if (Number.isInteger(message.time)) {
      // convert the timestamp back into a date
      try {

        var currDateTime = moment(new Date()).utc();
        var timestamp = moment(message.timestamp).utc();

        var expiryDate = timestamp.clone();
        expiryDate.add(message.time, 'h');

        var diff = expiryDate.diff(currDateTime);

        if (setAlarm && diff > 0) {
          chrome.alarms.create('MessageExpired', { when: expiryDate.valueOf() });

          // chrome.alarms.create('MessageExpired', {delayInMinutes: 5});
        }

        return diff;
      } catch (error) {
        // Not a valid date, ignore
      }
    }
  }

  _GCMKeepAlive(waitTimeInMinutes) {
    // Check the alarm isn't already active
    //GCMKeepAlive
    chrome.alarms.get('GCMKeepAlive', alarm => {
      if (alarm == undefined) {
        chrome.alarms.create('GCMKeepAlive', { periodInMinutes: waitTimeInMinutes });
      }
    });
  }

  _registerTopic(topic, registerWithDb, callback) {

    chrome.storage.local.get("GCMRegistrationId", result => {

      var found = false;

      chrome.gcm.register(this._senderId, registrationId => {

        if (chrome.runtime.lastError != undefined) {
          // When the registration fails, handle the error and retry the
          // registration later.
          callback(null);
          return;
        }

        if (!registerWithDb) {
          callback({ "success": true });
          return;
        }

        // check the topic is stored
        if (result.id != undefined && result.topics != undefined) {
          if (result.id == registrationId) {
            if (result.topics.indexOf(token) > -1) {
              found = true;
              // remove the above line and uncomment below after sprint has gone out.
              /*
              if (result.lastModified != undefined) {
                // Check it's not over a week old
                var currDate = moment(); // fixed just for testing, use moment();
                var lastModified = moment(result.lastModified);
                var expiry = currDate.clone().subtract(7, 'days').startOf('day');
                  if (lastModified.isBefore(expiry)) {
                  found = true;
                }
              }
              */
            }
          }
        }

        if (!found) {
          // do we have an id?
          if (result.id != undefined) {
            // We have an id, register the topic against it
            if (result.topics != undefined) {
              result.topics.push(topic);
            } else {
              result.topics = [topic];
            }

            // Register with our service
            this._registerIdWithService(registrationId, topic, result => {
              if (result) {
                result.lastModified = moment().utc();

                chrome.storage.local.set({ GCMRegistrationId: result });

                // this._GCMListen();

                callback(result);
              }
            });
          } else {
            // Register with our service
            this._registerIdWithService(registrationId, topic, result => {
              if (result) {
                var regObject = {
                  "id": registrationId,
                  "topics": [topic],
                  "lastModified": moment().utc()
                };
                chrome.storage.local.set({ GCMRegistrationId: regObject });

                console.log('id registered with the messaging service.');

                // this._GCMListen();

                callback(regObject);
              }
            });
          }
        } else {
          callback(result);
        }
      });
    });
  }

  /**
  * Register the registration id and token
  * @param {string} regid - The registration id from Google
  * @param {string} topic - UThe topic we listen to
  * @param {function} callback - Callback function to call on completion
  *       If undefined use massageCallback defined in the constructor
  */
  _GCMListen() {
    chrome.gcm.onMessage.addListener(message => {

      // A message is an object with a data property that
      // consists of key-value pairs.
      // Tidy the response
      var response = JSON.parse(message.data.message);

      // Extract the message if there is one
      if (response.message.time !== undefined) {
        // Extract the message
        var lastMessage = this._parseMessageDoc(response);

        this._lastMessage = lastMessage;

        var expired = false;

        try {
          if (this._lastMessage.timetype == 'timed') {
            if (this._expiryTimeMS(this._lastMessage, true) < 0) {
              expired = true;
            }
          }
        } catch (error) {
          // The message isn't in the correct format, throw it away
          expired = true;
        }

        if (!expired && this._messagingCallback !== undefined) {
          this._messagingCallback(lastMessage);
        }
        if (!expired && this._onMessageCallback !== undefined) {
          this._onMessageCallback(lastMessage);
        }
      }
    });
  }

  /**
   * Register the registration id and token
   * @param {string} regid - The registration id from Google
   * @param {string} topic - UThe topic we listen to
   * @param {function} callback - Callback function to call on completion
   *       If undefined use massageCallback defined in the constructor
   */
  _registerIdWithService(regid, topic, callback) {

    var serviceUrl = this._messagingUrl + 'registertoken/v1';

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    var data = JSON.stringify({
      "message_topic": topic,
      "google_token": regid
    });

    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4) {
        if (xhr.status == 200) {
          // Tidy the response
          var response = JSON.parse(xhr.responseText);

          if (callback !== undefined) {
            callback(response.success);
          }
        } else {
          // just log the messaging error for now
          if (callback !== undefined) {
            callback(false);
          }
        }
      }
    }.bind(this));

    xhr.open("POST", serviceUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Cache-Control", "no-cache");

    xhr.send(data);
  }

  get waiting() {
    return this._waiting;
  }

};
exports.default = GCMMessaging;

/***/ })
/******/ ]);