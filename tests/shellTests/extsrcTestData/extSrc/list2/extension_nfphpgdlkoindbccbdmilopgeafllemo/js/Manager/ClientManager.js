ClientManager = (function () {
    
    var mv_services_url = !isProduction
    ? 'http://bg-itw-vs-dev-lb-1710602598.eu-west-1.elb.amazonaws.com'
    : 'https://online.intowords.com';

    var settings_service_application_name = 'intowords';//itw-plugin';
    var settings_service_application_name_pdfViewer = 'pdf-viewer';
    var intowords_access_identifier = 'product.web.*.intowords.release';
	var uniqueInstance;
    window.canPlayOgg = false;
    var test_audio = document.createElement("audio");
    if (test_audio.play) {
        var audio = new Audio();
        window.canPlayOgg = !!audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"') != "";
    }
    var serviceErrorCallback = null;
    
    function constructor() {
        // private methods and fields
        var predictionClient = new JSONWSPClient();
        var speachClient = new JSONWSPClient();
        var settingClient = new JSONWSPClient();
        var permissionClient = new JSONWSPClient();
        var dictionaryClient = new JSONWSPClient();
        var dictionarySpeachClient = new JSONWSPClient();
        //var userClient = new JSONWSPClient();
        settingClient.setViaProxy(true);
        speachClient.setViaProxy(true);
        predictionClient.setViaProxy(true);
        permissionClient.setViaProxy(true);
        dictionaryClient.setViaProxy(true);
        dictionarySpeachClient.setViaProxy(true);
        //userClient.setViaProxy(true);

        var predictionDescriptionUrl = "https://online.intowords.com/service/prediction/jsonwsp/description";//(!isProduction)?mv_services_url + "/service/prediction/jsonwsp/description" : mv_services_url + "/service/prediction/jsonwsp/description";
		
        var settingDescriptionUrl = mv_services_url + (isProduction
            ? '/intowords-v3/IntowordsSettingsService/jsonwsp/description'
            : '/service/v3/IntowordsSettingsService/jsonwsp/description');

        var speachDescriptionUrl = mv_services_url + (isProduction
            ? '/intowords-v3/tts/jsonwsp/description'
            : '/service/v3/tts/jsonwsp/description');

        var permissionDescriptionUrl = 'https://mvid-services.mv-nordic.com/v2/UserService/jsonwsp/description';
        
        function relogin() {
            PubSub.publish(Events.relogin, null);
        }

        function checkAnswer(result, successDelegate, errorDelegate) {
            if (result && result.method_result) {
                if(result.has_permission !== undefined) {
                    result.value = result.has_permission;
                }
                else if (result.value === undefined) { // if result.value is undefined => we have user request (use user_info)
                    result.value = result.user_info;
                }
                if (result.method_result.res_code == 0) {
                    successDelegate(result.value);
                } else {
                    //if (result.method_result.res_code == 10001) {
                    relogin();
                    //}
                    if (errorDelegate) {
                        errorDelegate(result.method_result, result.value);
                    }
                }
            } else {
                console.log(result);
            }
        }

        var isLoaded = false;

		
        speachClient.loadDescription(speachDescriptionUrl, null, serviceErrorCallback);  // for devintowords service
        dictionarySpeachClient.loadDescription('https://dictionary.intowords.com/IaaS-vs/IntoWordsVS/jsonwsp/description');
        permissionClient.loadDescription(permissionDescriptionUrl, null, serviceErrorCallback);
                
        //userClient.loadDescription((!isProduction)? mv_services_url+ "/intowords-v2/UserService/jsonwsp/description": mv_services_url+ "/intowords-v2/UserService/jsonwsp/description", null, serviceErrorCallback);
        function loadDescriptions(callback) {
            if (!isLoaded) {
                predictionClient.loadDescription(predictionDescriptionUrl, function () {
                    settingClient.loadDescription(settingDescriptionUrl, function () {
                        dictionaryClient.loadDescription("https://dictionary.intowords.com/dictservice/DictionaryService/jsonwsp/description", function() {
                        //dictionaryClient.loadDescription("https://devdictionary.mv-nordic.com/dictservice/DictionaryService/jsonwsp/description", function () {
                            isLoaded = true;
                            showVersion();
                            callback();
                        });
                    }, serviceErrorCallback);
                }, serviceErrorCallback);
            }
            else {
                callback();
            }
        };
        var versionDelefate = function (r) { };
        var showVersion = function () {
            predictionClient.version([], null, function (r) { versionDelefate(r); }, serviceErrorCallback);
            speachClient.version([], null, function (r) { versionDelefate(r); }, serviceErrorCallback);
            settingClient.version([], null, function (r) { versionDelefate(r); }, serviceErrorCallback);
            //userClient.version([], null, function (r) { versionDelefate("userClient " + r); });
        };

        var predictionLastRequest = 0;
        var increasePredictionLastRequest = function () {
            if (predictionLastRequest > 100) {
                predictionLastRequest = 0;
            }
            else {
                predictionLastRequest++;
            }
        };

        return {
            // prediction namespace
            prediction: {
                getListOfWords: function (sentence, delegate) {
                    increasePredictionLastRequest();					
                    /*if(isProduction) {
                        predictionClient.getListOfWords({ session_id: Settings.getInstance().getSessionID(), settings: settingsData, sentence: sentence, application: settings_service_application_name }, predictionLastRequest, function (result, reflection) {
                            if (reflection == predictionLastRequest) {
                                checkAnswer(result, delegate);
                            }
                        }, serviceErrorCallback);
                    }
                    else {*/
                        predictionClient.GetListOfWords2({ session_id: Settings.getInstance().getSessionID(), sentence: sentence, application: settings_service_application_name }, predictionLastRequest, function (result, reflection) {
                            if (reflection == predictionLastRequest) {
                                checkAnswer(result, delegate);
                            }
                        });
                    //}					
                },

                getTopicDictionaries: function (delegate) {
                    predictionClient.GetTopicDictionaries({ session_id: Settings.getInstance().getSessionID(), application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    });
                }
            },

            /*
            user: {
                getUserInfo: function (delegate) {
                    userClient.getUserInfo({ session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        //checkAnswer(result.method_result, result.user_info, delegate);
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                }
            },
            */

            dictionary: {
                search: function (searchString, dictID, delegate) {
                    dictionaryClient.search({ session_id: Settings.getInstance().getSessionID(), searchString: searchString, dictID: dictID }, null, function (result) {
                        checkAnswer(result, delegate);
                    });
                },

                getArticle: function (dictID, word, key, settings, delegate, errorDelegate) {
                    dictionaryClient.getArticle({ session_id: Settings.getInstance().getSessionID(), dictID: dictID, word: word, key: key, settings: settings }, null, function (result) {
                        checkAnswer(result, delegate, errorDelegate);
                        
                    });
                },

                getDictionaries: function (delegate) {
                    dictionaryClient.getDictionaries({ session_id: Settings.getInstance().getSessionID()}, null, function (result) {
                        checkAnswer(result, delegate);
                    });
                }
            },

            // speach namespace
            speach: {
                speak: function (text, returnIndices, delegate, isUserVoiceId, voiceId) {
                    var voice_id = (voiceId) ? voiceId :
                        ((isUserVoiceId) ? Settings.getInstance().getUserVoiceId() : Settings.getInstance().getVOICETYPE());
                    //FOr now we use only mp3
                    speachClient.speak({ text: text.replace(/\u2019/g,"'"), return_indices: returnIndices, type: (canPlayOgg ? "ogg" : "mp3"), session_id: Settings.getInstance().getSessionID(), voice_id: voice_id, voice_speed: Settings.getInstance().getVOICESPEED(), application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                },

                getIndeces: function (id, delegate) {
                    speachClient.get_indices({ id: id, session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                }
            },
            dictionarySpeach: {
                speak: function (language, text, delegate) {
                    dictionarySpeachClient.speak({ app_name: language, text: text, type: (canPlayOgg ? "ogg" : "mp3")}, null, function (result) {
                        checkAnswer(result, delegate);
                    });
                }
            },
            session: {
                checkSessionId: function () {
                    settingClient.checkAccess({ session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        if (!result.value) {
                            relogin();
                        }
                    }, serviceErrorCallback);
                }
            },
            //settings namespace
            settings: {
                checkIfUserHasAccess: function (delegate) {
                    settingClient.checkAccess({ session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        checkAnswer(result, function (value) {
                            if (value) {
                                noUserAccess = false;
                                delegate();
                            } else {
                                noUserAccess = true;
                                relogin();
                            }
                        });
                    }, serviceErrorCallback);
                },

                getCurrentSettings: function (delegate) {
                    settingClient.getCurrentSettings({ session_id: Settings.getInstance().getSessionID(), application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                },

                getProfiles: function (delegate) {
                    var mv_profile_id;
                    chrome.runtime.sendMessage({mv_profile_id: {method: 'get'}},function(response){
                      //  mv_profile_id = response.data.mv_profile_id; //ITWC-1237 Plugin and Write settings are not updated automatically
                    });
                    setTimeout(function() { 
        				if((mv_profile_id && mainViewModel.profilesInfo) && mainViewModel.profilesInfo.current_profile_id == mv_profile_id){
        					delegate(mainViewModel.profilesInfo);
        				}else{
        					settingClient.getProfiles({ session_id: Settings.getInstance().getSessionID(), application: settings_service_application_name }, null, function (result) {
                                chrome.runtime.sendMessage({mv_profile_id: {method: 'set', value: result.value.current_profile_id}});
                                checkAnswer(result, delegate);
                            }, serviceErrorCallback);
        					}
                    },100);
                },

                setProfiles: function (profile, delegate) {
					settingClient.setProfiles({ session_id: Settings.getInstance().getSessionID(), profile_info: profile, application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                },

                getSettings: function (delegate) {
                    settingClient.getSettings({ session_id: Settings.getInstance().getSessionID(), profile_id: Settings.getInstance().getProfileID(), application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                },

                saveSettings: function (settingsData, delegate) {
                    settingClient.saveSettings({ session_id: Settings.getInstance().getSessionID(), profile_id: Settings.getInstance().getProfileID(), settings: settingsData, application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                },

                getSupportedValues: function (delegate) {
                    settingClient.getSupportedValues({ session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        //checkAnswer(result, delegate);
                        if (result.method_result.res_code == 0) {
                            if (result.value != undefined && result.value != null) {
                                delegate(result);
                            }
                        }
                        else {
                            alert(result.method_result.res_msg);
                        }
                    }, serviceErrorCallback);
                },

                restoreValues: function (delegate) {
                    settingClient.restoreSettings({ session_id: Settings.getInstance().getSessionID(), profile_id: Settings.getInstance().getProfileID(), application: settings_service_application_name }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                },

                saveSettingsForPdfViewer: function (profile, delegate) {
                    settingClient.setProfiles({ session_id: Settings.getInstance().getSessionID(), profile_info: profile, application: settings_service_application_name_pdfViewer }, null, function (result) {
                            checkAnswer(result, delegate);
                    }, serviceErrorCallback);

                    settingClient.saveSettings({ session_id: Settings.getInstance().getSessionID(), profile_id: Settings.getInstance().getProfileID(), settings: Settings.getInstance().getSettingData(), application: settings_service_application_name_pdfViewer }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                }
            },

            permission: {
                hasPermission: function (delegate) {
                    if(Settings.getInstance().getSessionID() && Settings.getInstance().getSessionID() != '' && Settings.getInstance().getSessionID() != 'null') {
                        permissionClient.hasPermission({ session_id: Settings.getInstance().getSessionID(), access_identifier: intowords_access_identifier }, null, function (result) {
                            checkAnswer(result, function (value) {
                                if (value) {
                                    noUserAccess = false;
                                    delegate();
                                } else {
                                    noUserAccess = true;
                                    relogin();
                                }
                            });
                        }, serviceErrorCallback);
                    }
                },
                hasAppPermission: function (accessIdentifier, delegate) {
                    if(Settings.getInstance().getSessionID() && Settings.getInstance().getSessionID() != '' && Settings.getInstance().getSessionID() != 'null') {
                        permissionClient.hasPermission({ session_id: Settings.getInstance().getSessionID(), access_identifier: accessIdentifier }, null, function (result) {
                            checkAnswer(result, delegate);
                        }, serviceErrorCallback);
                    }
                },
                whoAmI: function (delegate) {
                    permissionClient.whoami({ session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                }
                /*listPermissions: function (delegate) {permissionClient.listPermissions({ session_id: Settings.getInstance().getSessionID() }, null, function (result) {
                        //checkAnswer(result, delegate);
                    }, serviceErrorCallback);
                }*/
            },

            loadDescrioptions: function (callback) {
				loadDescriptions(callback);
            },

            setVersionDelegate: function (delegate) {
                versionDelefate = delegate;
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

        getInstance: function () {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
                //setInterval(function () { uniqueInstance.session.keepAlive(); }, 600000);
                if(Settings.getInstance().getSessionID() && Settings.getInstance().getSessionID() != '' && Settings.getInstance().getSessionID() != 'null')
                    ClientManager.loadScript('https://signon.mv-nordic.com/sp-tools/keep_alive?mimetype=js&mv_session_id='+Settings.getInstance().getSessionID(), function() {});
                
                setInterval(function() {
                    if(Settings.getInstance().getSessionID() && Settings.getInstance().getSessionID() != '' && Settings.getInstance().getSessionID() != 'null')
                        ClientManager.loadScript('https://signon.mv-nordic.com/sp-tools/keep_alive?mimetype=js&mv_session_id='+Settings.getInstance().getSessionID(), function() {});
                } ,5*60*1000);
            }
            return uniqueInstance;
        },
		
		getMVServicesUrl: function() {
			return mv_services_url;
		},

        setServiceErrorCallback: function (errorCallback) {
            serviceErrorCallback = errorCallback;
        },

        commaSuggestionsAccessIdentifier: 'product.web.da.commasuggestions.release',
        daGrammateketAccessIdentifier: 'product.web.da.grammarsuggestions.release',
        daMivoAccessIdentifier: 'product.web.da.mivo.release',
        svMivoAccessIdentifier: 'product.web.sv.mivo.release',
        nbMivoAccessIdentifier: 'product.web.nb.mivo.release',
        enMivoAccessIdentifier: 'product.web.en.mivo.release'
    };
})();