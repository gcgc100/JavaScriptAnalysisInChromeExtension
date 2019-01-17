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
                    
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'predictionClient',
                            method: 'GetListOfWords2',
                            mirror: predictionLastRequest,
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                sentence: sentence,
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        if (result.reflection == predictionLastRequest) {
                            checkAnswer(result.result, delegate);
                        }
                    });
                },

                getTopicDictionaries: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'predictionClient',
                            method: 'GetTopicDictionaries',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        checkAnswer(result.result, delegate);
                    });
                }
            },

            dictionary: {
                search: function (searchString, dictID, delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'dictionaryClient',
                            method: 'search',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                searchString: searchString,
                                dictID: dictID
                            }
                        }
                    }, function (result) {
                        checkAnswer(result.result, delegate);
                    });
                },

                getArticle: function (dictID, word, key, settings, delegate, errorDelegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'dictionaryClient',
                            method: 'getArticle',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                dictID: dictID,
                                word: word,
                                key: key,
                                settings: settings
                            }
                        }
                    }, function (result) {
                        checkAnswer(result.result, delegate, errorDelegate);
                    });
                },

                getDictionaries: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'dictionaryClient',
                            method: 'getDictionaries',
                            request: {
                                session_id: Settings.getInstance().getSessionID()
                            }
                        }
                    }, function (result) {
                        checkAnswer(result.result, delegate);
                    });
                }
            },

            // speach namespace
            speach: {
                speak: function (text, returnIndices, delegate, isUserVoiceId, voiceId) {
                    var voice_id = (voiceId) ? voiceId :
                        ((isUserVoiceId) ? Settings.getInstance().getUserVoiceId() : Settings.getInstance().getVOICETYPE());

                    //FOr now we use only mp3
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'speachClient',
                            method: 'speak',
                            request: {
                                text: text.replace(/\u2019/g,"'"),
                                return_indices: returnIndices,
                                type: (canPlayOgg ? "ogg" : "mp3"),
                                session_id: Settings.getInstance().getSessionID(),
                                voice_id: voice_id,
                                voice_speed: Settings.getInstance().getVOICESPEED(),
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                },

                getIndeces: function (id, delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'speachClient',
                            method: 'get_indices',
                            request: {
                                id: id,
                                session_id: Settings.getInstance().getSessionID()
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                }
            },
            dictionarySpeach: {
                speak: function (language, text, delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'dictionarySpeachClient',
                            method: 'speak',
                            request: {
                                app_name: language,
                                text: text,
                                type: (canPlayOgg ? "ogg" : "mp3")
                            }
                        }
                    }, function (result) {
                        checkAnswer(result.result, delegate);
                    });
                }
            },
            session: {
                checkSessionId: function () {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'checkAccess',
                            request: {
                                session_id: Settings.getInstance().getSessionID()
                            }
                        }
                    }, function (result) {
                        if (result.success) {
                            if (!result.result.value) {
                                relogin();
                            }
                        } else {
                            serviceErrorCallback(result.error);
                        }
                    });
                }
            },
            //settings namespace
            settings: {
                checkIfUserHasAccess: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'checkAccess',
                            request: {
                                session_id: Settings.getInstance().getSessionID()
                            }
                        }
                    }, function (result) {
                        if (result.success) {
                            checkAnswer(result.result, function (value) {
                                if (value) {
                                    noUserAccess = false;
                                    delegate();
                                } else {
                                    noUserAccess = true;
                                    relogin();
                                }
                            });
                        } else {
                            serviceErrorCallback(result.error);
                        }
                    });
                },

                getCurrentSettings: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'getCurrentSettings',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
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

                            chrome.runtime.sendMessage({
                                action: 'Background.serviceClient',
                                payload: {
                                    client: 'settingClient',
                                    method: 'getProfiles',
                                    request: {
                                        session_id: Settings.getInstance().getSessionID(),
                                        application: settings_service_application_name
                                    }
                                }
                            }, function (result) {
                                if (result.success) {
                                    chrome.runtime.sendMessage({mv_profile_id: {method: 'set', value: result.result.value.current_profile_id}});
                                    checkAnswer(result.result, delegate);
                                } else {
                                    serviceErrorCallback(result.error)
                                }
                            });
        				}
                    },100);
                },

                setProfiles: function (profile, delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'setProfiles',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                profile_info: profile,
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                },

                getSettings: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'getSettings',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                profile_id: Settings.getInstance().getProfileID(),
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                },

                saveSettings: function (settingsData, delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'saveSettings',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                profile_id: Settings.getInstance().getProfileID(),
                                settings: settingsData,
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                },

                getSupportedValues: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'getSupportedValues',
                            request: {
                                session_id: Settings.getInstance().getSessionID()
                            }
                        }
                    }, function (result) {
                        if (result.success) {
                            if (result.result.method_result.res_code == 0) {
                                if (result.result.value != undefined && result.result.value != null) {
                                    delegate(result.result);
                                }
                            }
                            else {
                                alert(result.result.method_result.res_msg);
                            }
                        } else {
                            serviceErrorCallback(result.error);
                        }
                    });
                },

                restoreValues: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'restoreSettings',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                profile_id: Settings.getInstance().getProfileID(),
                                application: settings_service_application_name
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                },

                saveSettingsForPdfViewer: function (profile, delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'setProfiles',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                profile_info: profile,
                                application: settings_service_application_name_pdfViewer
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });

                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'settingClient',
                            method: 'saveSettings',
                            request: {
                                session_id: Settings.getInstance().getSessionID(),
                                profile_id: Settings.getInstance().getProfileID(),
                                settings: Settings.getInstance().getSettingData(),
                                application: settings_service_application_name_pdfViewer
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                }
            },

            permission: {
                hasPermission: function (delegate) {
                    if(Settings.getInstance().getSessionID() && Settings.getInstance().getSessionID() != '' && Settings.getInstance().getSessionID() != 'null') {

                        chrome.runtime.sendMessage({
                            action: 'Background.serviceClient',
                            payload: {
                                client: 'permissionClient',
                                method: 'hasPermission',
                                request: {
                                    session_id: Settings.getInstance().getSessionID(),
                                    access_identifier: intowords_access_identifier
                                }
                            }
                        }, function (result) {
                            if (result.success) {
                                checkAnswer(result.result, function (value) {
                                    if (value) {
                                        noUserAccess = false;
                                        delegate();
                                    } else {
                                        noUserAccess = true;
                                        relogin();
                                    }
                                });
                            } else {
                                serviceErrorCallback(result.error);
                            }
                        });
                    }
                },
                hasAppPermission: function (accessIdentifier, delegate) {
                    if(Settings.getInstance().getSessionID() && Settings.getInstance().getSessionID() != '' && Settings.getInstance().getSessionID() != 'null') {

                        chrome.runtime.sendMessage({
                            action: 'Background.serviceClient',
                            payload: {
                                client: 'permissionClient',
                                method: 'hasPermission',
                                request: {
                                    session_id: Settings.getInstance().getSessionID(),
                                    access_identifier: accessIdentifier
                                }
                            }
                        }, function (result) {
                            result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                        });
                    }
                },
                whoAmI: function (delegate) {
                    chrome.runtime.sendMessage({
                        action: 'Background.serviceClient',
                        payload: {
                            client: 'permissionClient',
                            method: 'whoami',
                            request: {
                                session_id: Settings.getInstance().getSessionID()
                            }
                        }
                    }, function (result) {
                        result.success ? checkAnswer(result.result, delegate) : serviceErrorCallback(result.error);
                    });
                }
            }
        };
    };

    return {
        getInstance: function () {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
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