Settings = (function () {
    var uniqueInstance;

    function constructor() {
        // private methods and fields
        var sessionId = null;
        var profileId = null;

        //********hardcoded values************
        var PREDICTION_NUMBER_OF_WORDS_SEND = 3;
        var PREDICTION_NUMBER_OF_WORDS_SHOW_LOWER_BOUND = 1;
        var PREDICTION_NUMBER_OF_WORDS_SHOW_UPPER_BOUND = 10;

        //********settings names**************
        var PREDICTION_NUMBER_OF_WORDS_SHOW_NAME = "numberOfDisplayedWords";
        var NUMBER_OF_WORDS_PREDICTION_SETTING_NAME = "numberOfWords";
        var SHOW_ALTERNATIVE_SETTING_NAME = "showAlternative";
        var READ_WORDS_SETTING_NAME = "readWords";
        var VOICETYPE_TEXT_SETTING_NAME = "voice_id";
        var VOICESPEED_TEXT_SETTING_NAME = "voiceSpeed";
        var MAXWORDLENGTH_TEXT_SETTING_NAME = "maxWordLength";
        var FONTCOLOR_PREDICTION_SETTING_NAME = "wordColor1";
        var PREDICT_NEXT_WORD_PREDICTION_SETTING_NAME = "predictNextWord";
        var IS_SHORTCUTS_SHOWN_PREDICTION_SETTING_NAME = "showShortCuts";
        var IS_WORDLIST_SHOWN_PREDICTION_SETTING_NAME = "showWordlist";
        var READ_FROM_CURSOR = "readingStrategy";
		var LANGUAGE_SETTING_NAME = "language";
		var USER_LANGUAGE_SETTING_NAME = "userLanguage";
        var HIGHLIGHTSTRATEGY_TEXT_SETTING_NAME = "highlightStrategy";
        var SHOW_TOPIC_WORDS = "showTopicWord";

		var LETTERREADINGSTYLE_TEXT_SETTING_NAME = "wordlistFontType";
        var LETTER_NAME_AFTER_TYPING = "letterName";
        var LETTER_SOUND_AFTER_TYPING = "letterSound";
        //************************************
        var fontColorPrediction = "#000";
        var availableVoices = null;
        var availbaleLanguages = null;
        var availableLangCodes = null;
        var settingsData = null;
        var topicDictionaries = null;
        var isDataLoaded = false;
        var eventLoaded = [];

        var onloaded = function () {
            for (var i = 0; i < eventLoaded.length; i++) {
                if (eventLoaded[i])
                    eventLoaded[i]();
            }
        };

        var updateSetting = function (settingName, value) {
            settingsData[settingName] = value;
        };
        var sendDataToServer = function (callback) {
            ClientManager.getInstance().settings.saveSettings(settingsData, function (result) {
                if (callback)
                    callback(result);
            });
        };
        var updateAndSaveToServer = function (settingName, value, callback) {
            //TODO: Delete FONTCOLOR_PREDICTION_SETTING_NAME
            if (settingName == FONTCOLOR_PREDICTION_SETTING_NAME) {
                fontColorPrediction = value;
                if (callback)
                    callback();
            }
            else {
                if (settingsData.hasOwnProperty(settingName)) {
                    if (settingsData[settingName] != value) {
                        settingsData[settingName] = value;
                        sendDataToServer(callback);
                    }
                    else {
                        if (callback)
                            callback();
                    }
                }
            }
        };
				
        var getSetting = function (settingName) {
            if (settingName == FONTCOLOR_PREDICTION_SETTING_NAME) return fontColorPrediction;
            return isDataLoaded ? settingsData[settingName] : null;
        };

        var getPosibleValues = function (settingName) {
            switch (settingName) {
                case PREDICTION_NUMBER_OF_WORDS_SHOW_NAME:
                    return [PREDICTION_NUMBER_OF_WORDS_SHOW_LOWER_BOUND, PREDICTION_NUMBER_OF_WORDS_SHOW_UPPER_BOUND];
                case VOICETYPE_TEXT_SETTING_NAME:
                    return availableVoices;
                case MAXWORDLENGTH_TEXT_SETTING_NAME:
                    return [3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 99];
            }
            return null;
        };

        return {
            Domain: 'https://online.intowords.com',
            //Domain: null,
            saveSettingsToServer: function (callback) {
                sendDataToServer(callback);
            },
            //SessionID
            getSessionID: function () {
				return sessionId;
            },
			setSessionID: function(value) { 
                sessionId = value; 
            },

            //ProfileID
            getProfileID: function () {
                return profileId;
            },

            setProfileID: function (value) {
                profileId = value;
            },

            // Loaded
            registerLoaded: function (f) {
				eventLoaded.push(f);
            },

            unregisterLoaded: function (f) {
                var i = eventLoaded.indexOf(f);
                while (i > -1) {
                    eventLoaded.splice(i, 1);
                    i = eventLoaded.indexOf(f);
                }
            },

            // Settings
            getPREDICTION_NUMBER_OF_WORDS_SEND: function () {
                return PREDICTION_NUMBER_OF_WORDS_SEND;
            },

            // HasToReadPredictionWords
            getIsWordlistShown: function () {
                return getSetting(IS_WORDLIST_SHOWN_PREDICTION_SETTING_NAME);
            },
			saveIsWordlistShown: function (value, callback) {
                return updateAndSaveToServer(IS_WORDLIST_SHOWN_PREDICTION_SETTING_NAME, value, callback);
            },			

            // WordsNumberPrediction
            getPosibleWordsNumberPrediction: function () {
                return getPosibleValues(PREDICTION_NUMBER_OF_WORDS_SHOW_NAME);
            },
            getWordsNumberPrediction: function () {
                return getSetting(PREDICTION_NUMBER_OF_WORDS_SHOW_NAME);
            },
            getNumberOfWordsPrediction: function () {
                return getSetting(NUMBER_OF_WORDS_PREDICTION_SETTING_NAME);
            },
            saveWordsNumberPrediction: function (value, callback) {
                return updateAndSaveToServer(PREDICTION_NUMBER_OF_WORDS_SHOW_NAME, value, callback);
            },

            // HasToReadPredictionWords
            getHasToReadPredictionWords: function () {
                return getSetting(READ_WORDS_SETTING_NAME);
            },
			saveHasToReadPredictionWords: function (value, callback) {
                return updateAndSaveToServer(READ_WORDS_SETTING_NAME, value, callback);
            },
			
            // ReadAfterType
            getReadAfterTypeKey: function () {
                return "readWhileTyping";
            },
            getReadAfterType: function () {
                var canRead = getSetting(this.getReadAfterTypeKey());
                return canRead == null ? false : canRead;
            },
            saveReadAfterType: function (value) {
                return updateAndSaveToServer(Settings.getInstance().getReadAfterTypeKey(), value);
            },


            getReadSentenceAfterTypeKey: function() {
                return "readWhileTypingSentence";
            },

            getReadSentenceAfterType: function () {
                var canRead = getSetting(this.getReadSentenceAfterTypeKey());
                return canRead == null ? true : canRead;
            },

            saveReadSentenceAfterType: function (value) {
                updateAndSaveToServer(Settings.getInstance().getReadSentenceAfterTypeKey(), value);
            },

            getReadWordAfterTypeKey: function() {
                return "readWhileTypingWord";
            },

            getReadWordAfterType: function() {
                var canRead = getSetting(this.getReadWordAfterTypeKey());
                return canRead == null ? true : canRead;
            },

            saveReadWordAfterType: function (value) {
                updateAndSaveToServer(Settings.getInstance().getReadWordAfterTypeKey(), value);
            },

            // IsAlternativeShown
            getIsAlternativeShown: function () {
                return getSetting(SHOW_ALTERNATIVE_SETTING_NAME);
            },
			saveIsAlternativeShown: function (value, callback) {
                updateAndSaveToServer(SHOW_ALTERNATIVE_SETTING_NAME, value, callback);
            },

            // Voice
            getVOICETYPE: function () {
                return getSetting(VOICETYPE_TEXT_SETTING_NAME);
            },

            getAvailableVoices: function () {
                return getPosibleValues(VOICETYPE_TEXT_SETTING_NAME);
            },

            getUserVoiceId: function () {
                var userLang = getSetting('userLangCode');
                var userVoice = $.grep(availableVoices, function(n,i) {
                    return n.lang_code == userLang;
                });

                return (userVoice.length > 0) ? userVoice[0].voice_id : getVOICETYPE();
            },

            getUserVoiceIdByBrowserLanguage: function(browserLanguage) {
                var userLang = null;

                switch (browserLanguage) {
                    case "da":
                        userLang = 'dad';
                        break;
                    case "sv":
                        userLang = 'sws';
                        break;
                    case "sw":
                        userLang = 'sws';
                        break;
                    case "nb":
                        userLang = 'non';
                        break;
                    case "no":
                        userLang = 'non';
                        break;
                    case "ny":
                        userLang = 'nyn';
                        break;
                    case "en":
                        userLang = 'eng';
                        break;
                    case "de":
                        userLang = 'ged';
                        break;
                    case "es":
                        userLang = 'spe';
                        break;
                    case "du":
                        userLang = 'dun';
                        break;
                    case "nl":
                        userLang = 'dun';
                        break;
                    case "pl":
                        userLang = 'plp';
                        break;
                    default:
                        break;
                }

                var userVoice = $.grep(availableVoices, function (n, i) {
                    return n.lang_code == userLang;
                });

                return (userVoice.length > 0) ? userVoice[0].voice_id : null;
            },

            // Lang codes
            getAvailableLangCodes: function() {
                return availableLangCodes;
            },

            // Voice speed
            getVOICESPEED: function () {
                return getSetting(VOICESPEED_TEXT_SETTING_NAME);
            },
            saveVOICESPEED: function (value, callback) {
                updateAndSaveToServer(VOICESPEED_TEXT_SETTING_NAME, value, callback);
				//updateSetting(VOICESPEED_TEXT_SETTING_NAME, value);
            },

            getMaxVolumeSpeed: function (voice_id) {
                var res = 100;
                for (var i = 0; i < availableVoices.length; i++) {
                    if (availableVoices[i].voice_id == voice_id) {
                        res = availableVoices[i].max_speed;
                    }
                }
                return res;
            },

            getMinVolumeSpeed: function (voice_id) {
                var res = 100;
                for (var i = 0; i < availableVoices.length; i++) {
                    if (availableVoices[i].voice_id == voice_id) {
                        res = availableVoices[i].min_speed;
                    }
                }
                return res;
            },

            getMAXWORDLENGTH: function () {
                return getSetting(MAXWORDLENGTH_TEXT_SETTING_NAME);
            },

            // Shortcuts
            getIsShortcutsShown: function () {
                return getSetting(IS_SHORTCUTS_SHOWN_PREDICTION_SETTING_NAME);
            },
			saveIsShortcutsShown: function (value, callback) {
                updateAndSaveToServer(IS_SHORTCUTS_SHOWN_PREDICTION_SETTING_NAME, value, callback);
            },

            // Highlight color
            getPredictNextWord: function () {
                return getSetting(PREDICT_NEXT_WORD_PREDICTION_SETTING_NAME);
            },
			savePredictNextWord: function (value, callback) {
                updateAndSaveToServer(PREDICT_NEXT_WORD_PREDICTION_SETTING_NAME, value, callback);
            },
            
            // read from cursor
            getReadFromCursor: function () {
                return getSetting(READ_FROM_CURSOR) != Settings.readingStrategies.sentance;
            },
			saveReadFromCursor: function (value, saveToServer, callback) {
                value = value ? Settings.readingStrategies.sentance : Settings.readingStrategies.page;
                if(saveToServer) {
                    updateAndSaveToServer(READ_FROM_CURSOR, value, callback);
                }
                else {
                    updateSetting(READ_FROM_CURSOR, value)
                }
            },

            getLanguage: function() {
				return getSetting(LANGUAGE_SETTING_NAME);
			},
			
			getUserLanguage: function() {
				var lang = getSetting(USER_LANGUAGE_SETTING_NAME);
                switch(lang){
                    case 'sw': lang = 'sv'; break;
                    case 'no': lang = 'nn'; break;
                    case 'ny': lang = 'nn'; break;
                    case 'du': lang = 'nl'; break;

                }
                if (lang == 'sw') lang = 'sv'
                    else if (lang == 'no') lang = 'nn';

                if($.inArray(lang, ['da','de','en','es','nb','nl','nn','sv']) < 0) lang = 'en';
                return lang;
			},
			// Letter reading style
            getLETTERREADINGSTYLE: function () {
                return getSetting(LETTERREADINGSTYLE_TEXT_SETTING_NAME);
            },

			saveLETTERREADINGSTYLE: function (value, callback) {
                updateAndSaveToServer(LETTERREADINGSTYLE_TEXT_SETTING_NAME, value, callback);
            },

            getLetterNameTyping: function () {
                return getSetting(LETTER_NAME_AFTER_TYPING);
            },
            
            getLetterSoundTyping: function () {
                return getSetting(LETTER_SOUND_AFTER_TYPING);
            },

            saveLetterSoundAndLetterNameTyping: function (soundValue, letterValue) {
                if (settingsData.hasOwnProperty(LETTER_SOUND_AFTER_TYPING)) {
                    if (settingsData[LETTER_SOUND_AFTER_TYPING] != soundValue) {
                        settingsData[LETTER_SOUND_AFTER_TYPING] = soundValue;
                    }
                }
                if (settingsData.hasOwnProperty(LETTER_NAME_AFTER_TYPING)) {
                    if (settingsData[LETTER_NAME_AFTER_TYPING] != letterValue) {
                        settingsData[LETTER_NAME_AFTER_TYPING] = letterValue;                       
                    }
                }

                sendDataToServer();
            },


            getHIGHLIGHTSTRATEGY: function () {
                return getSetting(HIGHLIGHTSTRATEGY_TEXT_SETTING_NAME);
            },
            saveHIGHLIGHTSTRATEGY: function (value, callback) {
                updateAndSaveToServer(HIGHLIGHTSTRATEGY_TEXT_SETTING_NAME, value, callback);
            },

            getTopicDictionaries: function() {
                return $.extend(true, [], topicDictionaries);
            },

            getShowTopicWords: function () {
                //return true;//change this when create functionality to disable specific dictionaries
                return getSetting(SHOW_TOPIC_WORDS);
            },
            
            saveShowTopicWords: function (value, callback) {
                updateAndSaveToServer(SHOW_TOPIC_WORDS, value, callback);
            },
			
            loadSettings: function (callback) {
				ClientManager.getInstance().settings.getSettings(function (result) {
                    settingsData = result;
                    isDataLoaded = true;

                    ClientManager.getInstance().prediction.getTopicDictionaries(function (result) {
                        topicDictionaries = result;
                        onloaded();
                    });

                    if(callback) callback();
                });
            },

            loadSupportedValues: function(callback) {
                ClientManager.getInstance().settings.getSupportedValues(function (values) {
                    availableVoices = values.value.voices;
                    availbaleLanguages = values.value.languages;
                    availableLangCodes = values.value.lang_codes;
                    PREDICTION_NUMBER_OF_WORDS_SHOW_UPPER_BOUND = values.value.maxNumberOfWords;

                    if(callback) callback();
                });
            },

            restoreSettings: function () {
                isDataLoaded = false;
                ClientManager.getInstance().settings.restoreValues(function (result) {
                    settingsData = result;
                    isDataLoaded = true;
                    onloaded();
                });
            },

            getIsDataLoaded: function () {
                return isDataLoaded;
            },

            getSettingData: function () {
                return settingsData;
            }
        };
    }

    return {
        getInstance: function () {
            if (!uniqueInstance) {
                uniqueInstance = constructor();
            }
            return uniqueInstance;
        }
    };
})();

Settings.getFullStopRegExp = function () { return /((\.)\s*([A-ZÆØÅÄÖ]|\n|\")|((\!|\?)\s+))/; };
Settings.endSentenceMarks = function () { return /\.|\!|\?/; };
Settings.getSymbolRegExp = function () { return /[A-ZÆØÅÄÖ0-9]/gi; };
Settings.getBreakLineTagsRegExp = function() { return /^(div|p|br|li|\n|\r|\r\n)$/mgi; };
Settings.highlightStrategies = { word: 1, sentance: 2, doublehighlight: 3 };
Settings.readingStrategies = { page: 1, sentance: 2 };
