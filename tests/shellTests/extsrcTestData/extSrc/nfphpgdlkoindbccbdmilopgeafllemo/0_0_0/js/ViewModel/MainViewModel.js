var Events = {
    removeWords: "RemoveWords",
    loadWords: "loadWords",
    relogin: "relogin"
};

var KeyCodes = {
    backspace: 8,
    enter: 13,
    shift: 16,
    space: 32,
    leftArrow: 37,
    rightArrow: 39,
    upArrow: 38,
    downArrow: 40
};

var VoiceNamesGender = {
    Anne: 0, // female
    Sara: 0,
    Magnus: 1, // male
    Stine: 0,
    Claire: 0,
    Daniel: 1,
    Kate: 0,
    Serena: 0,
    Oliver: 1,
    Petra: 0,
    Felix: 1,
    Yannick: 1,
    Anna: 0,
    Markus: 1,
    Audrey: 0,
    Thomas: 1,
    Aurelie: 0,
    Manuel: 1,
    Jorge: 1,
    Marisol: 0,
    Monica: 0,
    Alva: 0,
    Kristian: 1,
    Klara: 0,
    Oskar: 1,
    Henrik: 1,
    Tor: 1,
    Nora: 0,
    Olai: 1,
    Lekha: 0,
    Carlos: 1,
    Juan: 1,
    Claire: 0,
    Tom: 1,
    Miren: 0,
    Luciana: 0,
    Sora: 0,
    Damayanti: 0,
    Katya: 0,
    Kanya: 0,
    Iveta: 0,
    Empar: 0,
    Carmela: 0,
    Catarina: 0,
    Satu: 0,
    Milena: 0,
    Paulina: 0,
    Yuna: 0,
    Mariska: 0,
    Nikos: 1,
    Ellen: 0,
    Ioana: 0,
    Jordi: 1,
    Federica: 0,
    Veena: 0,
    Joaquim: 1,
    Montserrat: 0,
    Krzysztof: 1,
    Lee: 1,
    Felipe: 1,
    Moira: 0,
    Rishi: 1,
    Neel: 1,
    Samantha: 0,
    Onni: 1,
    Ava: 0,
    Angelica: 0,
    Nicolas: 1,
    Laila: 0,
    Joana: 0,
    Yelda: 1,
    Otoya: 1,
    Susan: 0,
    Luca: 1,
    Chantal: 0,
    Paola: 0,
    Daria: 0,
    Melina: 0,
    Alice: 0,
    Allison: 0,
    Carmit: 0,
    Yuri: 1,
    Cem: 1,
    Karen: 0,
    Tarik: 1,
    Maged: 1,
    Tessa: 0,
    Soledad: 0,
    Zosia: 0,
    Xander: 1,
    Kyoko: 0,
    Ewa: 0,
    Fiona: 0,
    Laura: 0,
    Zuzana: 1,
    Diego: 1,
    Amelie: 0,
    'Bin-Bin': 1,
    'Li-Li': 0,
    'Tian-Tian': 0,
    'Mei-Jia': 0,
    'Sin-Ji': 0
};

function MainViewModel() {
    var getTranslationString = function (userLang, string) {
        return (Translation[userLang]) ?
            ((Translation[userLang][string]) ? Translation[userLang][string] : Translation['da'][string]) :
            Translation['da'][string];
    };
    var getLocalBrowserLanguage = function () {
        var language = (navigator.language || navigator.userLanguage);
        var language = language.replace(/-/g, "_");
        language = language.toLowerCase();
        var lang_parts = language.split("_");

        //var lang = /*(navigator.languages && navigator.languages.length > 0) ? navigator.languages[0] :*/ navigator.language;
        switch (lang_parts[0]) {
            case "da": return "da";
            case "sv": return "sv";
            case "nb": return "nb";
            case "nn": return "nb";
            case "no": return "nb";
            case "se": return "sv";
            case "dk": return "da";
            case "pl": return "pl";
            case "en":
            case "uk":
            case "us":
            case "en-US":
                return "en";
            case "nl": return "nl";
            default:
                return 'en';
        }
    }

    var isActiveElementEditable = function () {
        var activeElement = CursorUtils.getActiveElement();

        return ((CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName == "TEXTAREA"
            || activeElement.hasAttribute('contenteditable') || isGoogleDocs || isGooglePresentation || isGoogleDrawing)
            && !(isGoogleSpreadsheet && activeElement.hasAttribute('contenteditable') && activeElement.clientWidth == 0));
    }

    var READ_WORD_DELAY = 0;
    var self = this;
    self.getTranslationString = function (userLang, string) {
        return getTranslationString(userLang, string);
    };
    var isLoaded = false;
    var isErrorMessageShown = false;
    var changePlayPausebuttonState = function () {
        self.isPlayPause(speachManager.isPlaying());
    };
    var speachManager = null;
    speachManager = new SpeachManager(changePlayPausebuttonState);
    var player = speachManager.getPlayer();
    var hoverplayer = new Player();
    var predictionViewModel;
    var localBrowserLanguage = getLocalBrowserLanguage();
    self.dictionarySearchHasFocus = ko.observable(false);
    self.localBrowserLanguage = getLocalBrowserLanguage();
    self.version = ko.observable();
    self.isLoggedIn = ko.observable(false);
    self.isDisabled = ko.observable(false);
    self.isInited = ko.observable(false);
    self.voiceSpeed = ko.observable();
    self.voiceSpeedText = ko.computed(function () {
        return (self.voiceSpeedSliderTitle != null) ? self.voiceSpeedSliderTitle().replace("{SPEED}", self.voiceSpeed()) : self.voiceSpeed();
    });
    self.isPlayPause = ko.observable(false);
    self.isSentenceFromCursor = ko.observable(false);
    self.stoped;
    self.maxVoiceSpeed = ko.observable();
    self.minVoiceSpeed = ko.observable();
    self.loginBtnTitle = ko.observable(Translation[localBrowserLanguage].Login_button);
    self.playBtnTitle = ko.observable(Translation[localBrowserLanguage].Play_button);
    self.pauseBtnTitle = ko.observable();
    self.stopBtnTitle = ko.observable();
    self.voiceSpeedSliderTitle = ko.observable('');
    self.noUserAccessDialogHeadlline = ko.observable();
    self.noUserAccessDialogText = ko.observable();
    self.connectionLostHeadlline = ko.observable();
    self.connectionLostDialogText = ko.observable();

    self.uiLanguage = function () {
        return localBrowserLanguage; /*Settings.getInstance().getUserLanguage()*/
    };

    self.noUserAccessDialogHeadlline(getTranslationString(localBrowserLanguage, 'NoUserAccessDialog_headlline'));
    self.noUserAccessDialogText(getTranslationString(localBrowserLanguage, 'NoUserAccessDialog_text'));
    self.connectionLostHeadlline(getTranslationString(localBrowserLanguage, 'ConnectionLostDialog_headline'));

    self.optionsExpanded = ko.observable(false);
    self.text_Restore = ko.observable(getTranslationString(localBrowserLanguage, 'Restore_text'));
    self.text_Apps = ko.observable(getTranslationString(localBrowserLanguage, 'Apps_text'));
    self.text_AppPdfViewer = ko.observable(getTranslationString(localBrowserLanguage, 'AppPdfViewer_text'));
    self.text_AppEpubViewer = ko.observable(getTranslationString(localBrowserLanguage, 'AppEpubViewer_text'));
    self.text_AppDictionary = ko.observable(getTranslationString(localBrowserLanguage, 'AppDictionary_text'));
    self.text_AppIntoWords = ko.observable(getTranslationString(localBrowserLanguage, 'AppIntoWords_text'));
    self.text_AppSpecDictionary = ko.observable(getTranslationString(localBrowserLanguage, 'AppSpecPrediction_text'));
    self.text_AppWritingTemplates = ko.observable(getTranslationString(localBrowserLanguage, 'AppWritingTemplates_text'));
    self.text_AppCommaSuggestion = ko.observable(getTranslationString(localBrowserLanguage, 'AppCommaSuggestion_text'));
    self.text_AppMivo = ko.observable(getTranslationString(localBrowserLanguage, 'AppMivo_text'));
    self.text_AppGrammateket = ko.observable(getTranslationString(localBrowserLanguage, 'AppGrammateket_text'))
    self.text_AppStatistics = ko.observable(getTranslationString(localBrowserLanguage, 'AppStatistics_text'));
    self.text_LostServiceConnection = ko.observable(getTranslationString(localBrowserLanguage, 'LostServiceConnection_text'));
    self.text_LostInternetConnection = ko.observable(getTranslationString(localBrowserLanguage, 'LostInternetConnection_text'));
    self.text_voiceSpeed = ko.observable(getTranslationString(localBrowserLanguage, 'VoiceSpeed_text'));
    self.text_voiceSppedValue = ko.computed(function () {
        return (self.text_voiceSpeed != null) ? self.text_voiceSpeed().replace("{SPEED}", '<span>' + (self.voiceSpeed() ? self.voiceSpeed() : 80) + '</span>') : self.voiceSpeed();
    });
    self.text_Predictions = ko.observable(getTranslationString(localBrowserLanguage, 'Predictions_text'));
    self.text_ReadLikeThis = ko.observable(getTranslationString(localBrowserLanguage, 'ReadLikeThis_text'));
    self.text_ReadWhileWriting = ko.observable(getTranslationString(localBrowserLanguage, 'ReadWhileWriting_text'));
    self.text_Highlight = ko.observable(getTranslationString(localBrowserLanguage, 'Highlight_text'));
    self.text_Information = ko.observable(getTranslationString(localBrowserLanguage, 'Information_text'));
    self.text_LogOutUser = ko.observable(getTranslationString(localBrowserLanguage, 'LogOutUser_text'));
    self.text_More = ko.observable(getTranslationString(localBrowserLanguage, 'More_text'));
    self.text_Hide = ko.observable(getTranslationString(localBrowserLanguage, 'Hide_text'));
    self.text_MoreLangs = ko.observable(getTranslationString(localBrowserLanguage, 'MoreLanguages_text'));
    self.text_HideLangs = ko.observable(getTranslationString(localBrowserLanguage, 'HideLanguages_text'));
    self.text_MoreHide = ko.computed(function () {
        return (self.optionsExpanded()) ? self.text_Hide() : self.text_More();
    });
    self.isRestLangsExpanded = ko.observable(false);
    self.text_MoreHideRestLangs = ko.computed(function () {
        return (self.isRestLangsExpanded()) ? self.text_HideLangs() : self.text_MoreLangs();
    });
    self.text_ReadPage = ko.observable(getTranslationString(localBrowserLanguage, 'ReadPage_text'));
    self.text_ReadSentence = ko.observable(getTranslationString(localBrowserLanguage, 'ReadSentence_text'));
    self.text_ReadLetterName = ko.observable(getTranslationString(localBrowserLanguage, 'ReadLetterName_text'));
    self.text_ReadLetterSound = ko.observable(getTranslationString(localBrowserLanguage, 'ReadLetterSound_text'));
    self.text_ReadWord = ko.observable(getTranslationString(localBrowserLanguage, 'ReadWord_text'));
    self.text_ReadSentence = ko.observable(getTranslationString(localBrowserLanguage, 'ReadSentence_text'));
    self.text_HighlightWord = ko.observable(getTranslationString(localBrowserLanguage, 'HighlightWord_text'));
    self.text_HighlightSentence = ko.observable(getTranslationString(localBrowserLanguage, 'HighlightSentence_text'));
    self.text_HighlightWordAndSentence = ko.observable(getTranslationString(localBrowserLanguage, 'HighlightWordAndSentence_text'));

    self.text_DictionaryHeader = ko.observable(getTranslationString(localBrowserLanguage, 'DictionaryHeader_text'));
    self.text_DictionaryText = ko.observable(getTranslationString(localBrowserLanguage, 'IntowordsDictionary_text'));
    self.text_SearchGoogleImageText = ko.observable(getTranslationString(localBrowserLanguage, 'SearchInGoogleImages_text'));
    self.text_DictionaryWordDontExist = ko.observable(getTranslationString(localBrowserLanguage, 'DictionaryWordDontExist_text'));

    /* Read while typing settings */
    self.readLetterNameTyping = ko.observable();
    self.readLetterSoundTyping = ko.observable();
    self.readWordAfterType = ko.observable();
    self.readSentanceAfterType = ko.observable();

    self.isSentenceFromCursorVisible = ko.observable();

    self.showDictionary = ko.observable(false);

    self.toggleLetterReadingStyleName = function () {
        self.readLetterNameTyping(!self.readLetterNameTyping());
        self.readLetterSoundTyping(false);

        self.logger.loggerModdel.letterSoundAndLetterNameTyping.notifySubscribers();
        Settings.getInstance().saveLetterSoundAndLetterNameTyping(self.readLetterSoundTyping(), self.readLetterNameTyping());
    };

    self.toggleLetterReadingStyleSound = function () {
        self.readLetterSoundTyping(!self.readLetterSoundTyping());
        self.readLetterNameTyping(false);

        self.logger.loggerModdel.letterSoundAndLetterNameTyping.notifySubscribers();
        Settings.getInstance().saveLetterSoundAndLetterNameTyping(self.readLetterSoundTyping(), self.readLetterNameTyping());
    };

    self.toggleReadWordAfterType = function () {
        self.readWordAfterType(!self.readWordAfterType());
        Settings.getInstance().saveReadWordAfterType(self.readWordAfterType());
    };

    self.toggleReadSentanceAfterType = function () {
        self.readSentanceAfterType(!self.readSentanceAfterType());
        Settings.getInstance().saveReadSentenceAfterType(self.readSentanceAfterType());
    };

    self.readWordAfterType.subscribe(function (newValue) {
     
        self.logger.loggerModdel.readWordAfterType(newValue);      
    });

    self.readSentanceAfterType.subscribe(function (newValue) {
     
        self.logger.loggerModdel.readSentanceAfterType(newValue);      
    });

    self.readLetterSoundTyping.subscribe(function (newValue) {
     
        self.logger.loggerModdel.readLetterSoundTyping(newValue);      
    });

    self.readLetterNameTyping.subscribe(function (newValue) {
     
        self.logger.loggerModdel.readLetterNameTyping(newValue);      
    });

    /* end of Read while typing settings */

    ////
    self.profileIsLoading = ko.observable(true);
    self.profileIsLoading.subscribe(function (newValue) {
        shortcut['enabled'] = !newValue;
    });

    /* Read out load settings */
    self.isSentenceFromCursor.subscribe(function (newValue) {

        self.logger.loggerModdel.readingStrategy(newValue ? Settings.readingStrategies.sentance : Settings.readingStrategies.page);
        if (isLoaded) {
            Settings.getInstance().saveReadFromCursor(newValue, self.isSentenceFromCursorVisible());
        }
    });

    self.toggleReadForwardFromCursor = function () {
        self.isSentenceFromCursor(false);
        self.isSentenceFromCursor(false);
    };
    self.toggleReadSentenceFromCursor = function () {
        self.isSentenceFromCursor(true);
        self.isSentenceFromCursor(true);
    };

    /* end of Read out load settings */

    self.isWordHighlightStrategy = ko.observable();
    self.isSentanceHighlightStrategy = ko.observable();
    self.isDoubleHighlightStrategy = ko.observable();

    self.toggleWordHightlightStrategy = function () {
        self.isWordHighlightStrategy(true);
        self.isSentanceHighlightStrategy(false);
        self.isDoubleHighlightStrategy(false);
        self.logger.loggerModdel.highlightStrategy(Settings.highlightStrategies.word);
        Settings.getInstance().saveHIGHLIGHTSTRATEGY(Settings.highlightStrategies.word);
    };

    self.toggleSentenceHighlightStrategy = function () {
        self.isWordHighlightStrategy(false);
        self.isSentanceHighlightStrategy(true);
        self.isDoubleHighlightStrategy(false);
        self.logger.loggerModdel.highlightStrategy(Settings.highlightStrategies.sentance);
        Settings.getInstance().saveHIGHLIGHTSTRATEGY(Settings.highlightStrategies.sentance);
    };

    self.toggleDoubleHighlightStrategy = function () {
        self.isWordHighlightStrategy(false);
        self.isSentanceHighlightStrategy(false);
        self.isDoubleHighlightStrategy(true);
        self.logger.loggerModdel.highlightStrategy(Settings.highlightStrategies.doublehighlight);
        Settings.getInstance().saveHIGHLIGHTSTRATEGY(Settings.highlightStrategies.doublehighlight);
    };

    var playWordTimeout;
    var playLetterTimeout;

    var _audioQueue;

    var executeAudioQueue = function (currentNode, currentOffset, event) {
        if (_audioQueue) {
            if (_audioQueue.length > 0) {
                var firstAudioFunction = _audioQueue.shift();
                firstAudioFunction(currentNode, currentOffset, event);
            }
        }
    };

    var addAudioQueue = function (func) {
        if (!_audioQueue) {
            _audioQueue = new Array();
        }

        _audioQueue.push(func);
    };

    var isLetterSymbol = function (c) {
        var allLetters = "qwertyuiopasdfghjklzxcvbnmäëÿüïöåøæáéýúíóàöþßąęćłńśźż".toLowerCase();
        var index = allLetters.indexOf(c.toLowerCase());

        if (index <= -1) {
            var numbers = "1234567890".toLowerCase();
            index = numbers.indexOf(c.toLowerCase());
        }

        if (index <= -1) {
            var cyrillicLetters = "абвгдежзийклмнопрстуфхцчшщъыьэюяё".toLowerCase();
            index = cyrillicLetters.indexOf(c.toLowerCase());
        }

        if (index <= -1) {
            var greekLetters = "α".toLowerCase();
            index = greekLetters.indexOf(c.toLowerCase());
        }

        return index > -1;
    };

    var isLetterTyped = function (e) {
        return e.key ? isLetterSymbol(e.key) : false;
    };

    var playTypedLetter = function (event) {
        var isLetter = isLetterTyped(event);
        playLetterTimeout = setTimeout(function () {
            var currentNode;
            var currentOffset;
            var isCursorInWord;
            if (!isGooglePresentation && !isGoogleDrawing) {
                currentNode = CursorUtils.Range.getStartNode();
                currentOffset = CursorUtils.Range.getStartOffset();
                isCursorInWord = TextManager.isCursorInWord(currentNode, currentOffset);
            }


            player.bindEndPlayingEvent(function () {
                executeAudioQueue(currentNode, currentOffset, event);
                //speachManager.bindEndPlay();
            });
            if (isLetter) {
                addAudioQueue(playLetterSoundOrName);
            }
            executeAudioQueue(currentNode, currentOffset, event);
        }, READ_WORD_DELAY);
    };

    var letterForStorage;

    var playLetterSoundOrName = function (currentNode, currentOffset, event) {
        if ((self.readLetterNameTyping() && self.isReadLetterNameTypingVisible()) || (self.readLetterSoundTyping() && self.isReadLetterSoundTypingVisible())) {
            var lastChar;
            if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA" || isGooglePresentation || isGoogleDrawing) {
                var charCode = event.keyCode || event.charCode || event.which;
                //if (event.keyIdentifier) {
                //    var unicode = event.keyIdentifier.replace('U+', '');
                //    lastChar = String.fromCharCode(parseInt(unicode, 16));
                //} else {
                lastChar = event.key; //String.fromCharCode(charCode);
                //}
            }
            else {
                var rootNode = (CursorUtils.getActiveElement().hasAttribute('contenteditable')) ? CursorUtils.getActiveElement() : $(CursorUtils.Range.getStartNode()).parents('div.kix-page')[0];
                var previousAndCurrentSentences = TextManager.getPreviousAndCurrentSentence(currentNode, currentOffset, rootNode);
                lastChar = previousAndCurrentSentences[previousAndCurrentSentences.length - 1];
            }

            letterForStorage = { char: lastChar, lang: Settings.getInstance().getVOICETYPE(), isName: self.readLetterNameTyping(), date: Date.now() };

            chrome.storage.local.get('letters', function (obj) {
                var storageLetter = obj.letters ? $.grep(obj.letters, function (n, i) {
                    return n.char == letterForStorage.char && n.lang == letterForStorage.lang && n.url && n.isName == letterForStorage.isName
                }) : null;

                if (storageLetter && storageLetter.length > 0) {
                    if (storageLetter.length > 1) {
                        obj.letters = $.grep(obj.letters, function (n, i) {
                            return !(n.char == storageLetter[0].char && n.lang == storageLetter[0].lang && n.isName == storageLetter[0].isName);
                        });

                        chrome.storage.local.set({ 'letters': obj.letters });
                    }
                    storageLetter = storageLetter[0];
                }
                else {
                    storageLetter = null;
                }

                if (storageLetter && !(storageLetter.date && Date.now() - storageLetter.date < 5 * 60 * 1000)) {
                    obj.letters = $.grep(obj.letters, function (obj) {
                        return obj != storageLetter;
                    });

                    storageLetter = null;
                }

                if (storageLetter) {
                    player.play({ ogg_url: storageLetter.url });
                }
                else {
                    var voiceId = null;

                    if (!letterForStorage.isName) {
                        switch (letterForStorage.lang) {
                            case 'nve_dad_magnus':
                            case 'nve_dad_sara':
                                voiceId = 'mv_da_gsh';
                                break;

                            case 'nve_non_nora':
                            case 'nve_non_henrik':
                                voiceId = 'mv_nb_hk';
                                break;

                            case 'nve_sws_oskar':
                            case 'nve_sws_alva':
                            case 'nve_sws_klara':
                                voiceId = 'mv_sv_jm';
                                break;

                            default:
                                break;
                        }
                    }

                    ClientManager.getInstance().speach.speak(lastChar, false, function (json) {
                        player.play(json);
                        letterForStorage.url = json.ogg_url;

                        if (!obj.letters)
                            obj = { letters: [] };

                        obj.letters.push(letterForStorage);
                        chrome.storage.local.set({ 'letters': obj.letters });

                        chrome.storage.local.getBytesInUse(
                            function (bytesInUse) {
                                if (bytesInUse > 5000000) {
                                    chrome.storage.local.remove('letters');
                                }
                            }
                        );
                    }, false, voiceId);
                }
            });
        } else {
            executeAudioQueue(currentNode, currentOffset, event);
        }
    };

    var getLastWordIf = function (test, text) {
        return test ? $.trim(TextManager.getLastWordFromText(text)) : '';
    };

    var playTypedWord = function (event) {
        if ((self.readSentanceAfterType() || self.readWordAfterType()) && (!isWordOnline || event.originalEvent instanceof KeyboardEvent)) {
            var currentNode;
            var wordWasRead;
            var currentOffset;
            var enterIsPressed = (event.keyCode == KeyCodes.enter);

            if (!isGooglePresentation && !isGoogleDrawing) {
                currentNode = CursorUtils.Range.getStartNode();
                currentOffset = CursorUtils.Range.getStartOffset();
            }

            if (checkReadingWordFullStop(event) || enterIsPressed) {
                if (!wordWasRead && self.readWordAfterType()) {
                    var lastWord;

                    if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA") {
                        var inputText = CursorUtils.getActiveElement().value.substring(0, CursorUtils.getActiveElement().selectionStart)
                            + (checkReadingWordFullStop(event) ? ' ' : '');
                        lastWord = getLastWordIf(!/([ \t\n]{2})$/g.test(inputText) && !$.trim(inputText)[$.trim(inputText).length-1].match(Settings.endSentenceMarks()), inputText);
                    }
                    else if (isGooglePresentation || isGoogleDrawing) {
                        var inputText = predictionViewModel.getPresentationPredictionText();
                        lastWord = getLastWordIf(!/([ \t\n]{1})$/g.test(inputText), inputText);
                    } else {
                        var testForLastWord = true;
                        var rootNode = (CursorUtils.getActiveElement().hasAttribute('contenteditable')) ? CursorUtils.getActiveElement() : $(CursorUtils.Range.getStartNode()).parents('div.kix-page')[0];
                        var previousAndCurrentSentences = TextManager.getPreviousAndCurrentSentence(currentNode, currentOffset, rootNode);
                        var withNoZeroWidthSpaces = previousAndCurrentSentences.replace(/\u200b/g, '');

                        if (isGoogleDocs) {
                            var isCurrentNodeTextContentEmpty = /(^[ ]$)/.test(currentNode.textContent);
                            if (!enterIsPressed) {
                                if (isCurrentNodeTextContentEmpty) {
                                    var style = $(currentNode).parents('.kix-wordhtmlgenerator-word-node').attr('style')
                                            + ';visibility: hidden;';

                                    var tempSpan = $('<span> </span>').attr('style', style);
                                    $('body').append(tempSpan);
                                    var spaceWidth = tempSpan.width();

                                    var textWidth = $(currentNode).parents('.kix-lineview-content').width();
                                    var textOffset = $(currentNode).parents('.kix-lineview-content').offset().left;

                                    var widthBetweenCursorAndLastLetter = $('.kix-cursor-caret').offset().left
                                                                          - (textOffset + textWidth);
                                    withNoZeroWidthSpaces = $.trim(withNoZeroWidthSpaces);
                                    testForLastWord = Math.floor(widthBetweenCursorAndLastLetter) <= spaceWidth
                                        && !(withNoZeroWidthSpaces.length > 0 && withNoZeroWidthSpaces[withNoZeroWidthSpaces.length-1].match(Settings.endSentenceMarks()));
                                    tempSpan.remove();
                                } else {
                                    if(checkReadingWordFullStop(event)) withNoZeroWidthSpaces = withNoZeroWidthSpaces.slice(0, -1) + ' ';
                                    testForLastWord = !/([ \t\n]{2})$/g.test(withNoZeroWidthSpaces) && !$.trim(withNoZeroWidthSpaces)[$.trim(withNoZeroWidthSpaces).length-1].match(Settings.endSentenceMarks());
                                }
                            } else {
                                testForLastWord = !/([ \t\n]{3})$/g.test(withNoZeroWidthSpaces) && !$.trim(withNoZeroWidthSpaces)[$.trim(withNoZeroWidthSpaces).length-1].match(Settings.endSentenceMarks());
                            }
                        }
                        else {
                            if(checkReadingWordFullStop(event)) withNoZeroWidthSpaces = withNoZeroWidthSpaces.slice(0, -1) + ' ';
                            testForLastWord = !/([ \t\n]{2})$/g.test(withNoZeroWidthSpaces)
                                && !$.trim(withNoZeroWidthSpaces)[$.trim(withNoZeroWidthSpaces).length-1].match(Settings.endSentenceMarks());
                        }

                        lastWord = getLastWordIf(testForLastWord, withNoZeroWidthSpaces);
                            
                    }
                    if (lastWord.length > 0) {
                        //wordWasRead = true;
                        playWordTimeout = setTimeout(function () {
                            ClientManager.getInstance().speach.speak(lastWord, false, function (json) {
                                if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA") {
                                    previousAndCurrentSentences = CursorUtils.getActiveElement().value.substring(0, CursorUtils.getActiveElement().selectionStart);
                                }
                                else if (isGooglePresentation || isGoogleDrawing) {
                                    previousAndCurrentSentences = predictionViewModel.getPresentationPredictionText();
                                }
                                else {
                                    var rootNode = (CursorUtils.getActiveElement().hasAttribute('contenteditable')) ? CursorUtils.getActiveElement() : $(CursorUtils.Range.getStartNode()).parents('div.kix-page')[0];
                                    previousAndCurrentSentences = TextManager.getPreviousAndCurrentSentence(currentNode, currentOffset, rootNode);
                                }
                                if (self.readSentanceAfterType() && (previousAndCurrentSentences[previousAndCurrentSentences.length - 1].match(Settings.endSentenceMarks()) || enterIsPressed)) {
                                    sentenceWasRead = true;
                                    var sentence = TextManager.getSentenceFromText(previousAndCurrentSentences);

                                    if (sentence != lastWord) {
                                        player.bindEndPlayingEvent(function () {
                                            ClientManager.getInstance().speach.speak(sentence.replace(/\u200B/g, ''), false, function (json) { // playing
                                                player.unbindEndPlayingEvent();
                                                player.play(json);
                                                //speachManager.bindEndPlay();
                                            });
                                        });
                                    }
                                }
                                player.play(json);
                            });
                        }, READ_WORD_DELAY);
                    }
                }
                else {
                    if (!sentenceWasRead && self.readSentanceAfterType()) {
                        var previousAndCurrentSentences; // = $.trim(TextManager.getPreviousAndCurrentSentence(currentNode, currentOffset, $(CursorUtils.Range.getStartNode()).parents('div.kix-page')[0]));
                        if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA") {
                            previousAndCurrentSentences = CursorUtils.getActiveElement().value.substring(0, CursorUtils.getActiveElement().selectionStart);
                        }
                        else if (isGooglePresentation || isGoogleDrawing) {
                            previousAndCurrentSentences = predictionViewModel.getPresentationPredictionText();
                        }
                        else {
                            var rootNode = (CursorUtils.getActiveElement().hasAttribute('contenteditable')) ? CursorUtils.getActiveElement() : $(CursorUtils.Range.getStartNode()).parents('div.kix-page')[0];
                            previousAndCurrentSentences = $.trim(TextManager.getPreviousAndCurrentSentence(currentNode, currentOffset, rootNode));
                        }

                        if (previousAndCurrentSentences[previousAndCurrentSentences.length - 1].match(Settings.endSentenceMarks()) || enterIsPressed) {
                            sentenceWasRead = true;
                            var sentence = TextManager.getSentenceFromText(previousAndCurrentSentences);
                            playWordTimeout = setTimeout(function () {
                                ClientManager.getInstance().speach.speak(sentence.replace(/\u200B/g, ''), false, function (json) { // playing
                                    player.play(json);
                                });
                            }, READ_WORD_DELAY);
                        }
                    }
                }
            }
            else {
                wordWasRead = false;
                sentenceWasRead = false;
                if (player.getIsPlaying()) {
                    player.unbindEndPlayingEvent();
                    player.stop();
                    //speachManager.bindEndPlay();
                    player.bindEndPlayingEvent();
                }
            }
        }
    };

    var checkReadingWordFullStop = function (e) {
        var code = null;
        if (e.keyCode) code = e.keyCode;
        else if (e.which) code = e.which;

        if (e.type == "keypress") {
            if (code == 32) return true; //space
            if (code == 44) return true; //,
            if (code == 46) return true; //.
            if (code == 33 && e.shiftKey) return true; //!
            if ((code == 187 && e.shiftKey) || (code == 63 && e.shiftKey) || (code == 171 && e.shiftKey))
                return true; //?
        }
        else {
            if (code == 32) return true; //space
            if (code == 188) return true; //,
            if (code == 190) return true; //.
            if (code == 49 && e.shiftKey) return true; //!
            if ((code == 187 && e.shiftKey) || (code == 191 && e.shiftKey))
                return true; //?
        }

        return false;
    };

    //
    var isProfilesLoaded = false;
    self.sessionId = ko.observable();
    var latestLanguagesLength = 6;
    self.latestLanguages = ko.observable();
    self.restLanguages = ko.observable();

    self.profiles = ko.observableArray();
    self.selectedProfile = ko.observable();
    self.profilesInfo = null;
    self.userDisplayName = ko.observable();

    self.predictionsSupported = ko.computed(function () {
        return !self.isLoggedIn() || (self.selectedProfile() && $.inArray(self.selectedProfile().lang_code,
            //["mv_da_gsh", "nve_dad_magnus", "nve_dad_sara", //danish
            //    "mv_en_crb", "nve_eng_daniel", "nve_eng_kate", "nve_eng_oliver", "nve_eng_serena", //english
            //    "mv_nb_hk", "nve_non_henrik", "nve_non_nora", //norwegian
            //    "mv_nn_kors", //new norwegian
            //    "mv_sv_jm", "nve_sws_alva", "nve_sws_klara", "nve_sws_oskar",  //swedish
            //    "mv_de_bits3", "nve_ged_anna", "nve_ged_markus", "nve_ged_petra", "nve_ged_yannick", //german
            //    "mv_es_tc73", "nve_spe_jorge", "nve_spe_marisol", "nve_spe_monica",  //spanish
            //    "nve_iti_alice", "nve_iti_federica", "nve_iti_luca", "nve_iti_paola", //italian
            //    "nve_dun_claire", "nve_dun_xander",  //dutch
            //    "nve_frf_audrey", "nve_frf_aurelie", "nve_frf_thomas" //french
            //]
             ["dad", "dun", "nyn", "spe", "sws", "ged", "eng", "frf", "iti", "non", "ptb", "ptp"]
            ) >= 0);
    });

    self.specDictSupported = ko.computed(function () {
        return ((self.selectedProfile() && $.inArray(self.selectedProfile().voice_id,
            ["mv_da_gsh", "nve_dad_magnus", "nve_dad_sara", "mv_da_acl" //danish
                //,"mv_en_crb", "nve_eng_daniel", "nve_eng_kate" "nve_eng_oliver", "nve_eng_serena", //english
                ,"mv_nb_hk", "nve_non_henrik", "nve_non_nora" //norwegian
                //,"mv_nn_kors" //new norwegian
                , "mv_sv_jm", "nve_sws_alva", "nve_sws_klara", "nve_sws_oskar"
            ]) >= 0));
    });

    self.viewProfiles = ko.observable(false);
    self.viewProfilesEnabled = ko.observable(true);
    self.viewProfilesEnabled1 = ko.observable(true);
    self.selectProfileTitle = ko.observable();
    self.restoreDialogHeadlineTitle = ko.observable();
    self.restoreDialogCloseTitle = ko.observable();
    self.noTextToPlayDialogHeadlineTitle = ko.observable();
    self.noTextToPlayDialogText = ko.observable();
    self.pdfOpenDialogHeadlineTitle = ko.observable();
    self.pdfOpenDialogText = ko.observable();
    self.couldNotPlayTextDialogHeadlineTitle = ko.observable();
    self.couldNotPlayTextDialogText = ko.observable();
    self.couldNotPlayTextInDrivePdfViewerDialogHeadlineTitle = ko.observable();
    self.couldNotPlayTextInDrivePdfViewerDialogText = ko.observable();

    self.toggleViewProfiles = function () {
        self.viewProfiles(!self.viewProfiles());

        if (self.viewProfiles()) {
            var itw_panel = $('div#itw_panel');

            //if( itw_panel.offset().top - $(window).scrollTop() + $('div#itw_panel').height() / 2 > $(window).height() / 2 ) {
            if (itw_panel.offset().top - $(window).scrollTop() + $('div#itw_panel').height() + $('div#profilebox').height() > $(window).height()) {
                $('div#itw_panel div#profilebox').addClass('top');
            }
            else {
                $('div#itw_panel div#profilebox').removeClass('top');
            }
        }
    };

    self.changeSelectedLanguage = function (e) {
        var target = $(e.currentTarget);
        var voiceProfile = target.find('.profile_voice:first');

        if (voiceProfile.length >= 1) {
            self.setSelectedProfile(voiceProfile);
            self.appsExpanded(false);
        }

        return false;
    };

    self.changeSelectedProfile = function (e) {
        var target = $(e.currentTarget);
        self.setSelectedProfile(target);
        self.appsExpanded(false);

        return false;
    };

    self.setSelectedProfile = function (profile) {
        var profile_id = profile.data('profileid');
        data = $.grep(getProfilesResult.profiles, function (n, i) {
            return (n.profile_id == profile_id);
        })[0];

        if (data) {
            if (self.selectedProfile().lang_code !== data.lang_code) {
                mainViewModel.showDictionary(false);
            }
            var i = getProfilesResult.profiles.indexOf(data);
            getProfilesResult.profiles.splice(i, 1);
            getProfilesResult.profiles.unshift(data);
        }

        chrome.runtime.sendMessage({ mv_profile_id: { method: 'set', value: data.profile_id } });
        self.selectedProfile(data);
        //Settings.getInstance().loadSettings(self.refreshProfiles);
        self.isRestLangsExpanded(false);
        self.viewProfiles(false);

        var lang_code = profile.data('langcode');
        var lang = $.grep(allLanguages, function (n, i) {
            return (n.lang_code == lang_code);
        });

        if (lang.length > 0) {
            lang = lang[0];
            var i = allLanguages.indexOf(lang);
            allLanguages.splice(i, 1);
            allLanguages.unshift(lang);
            bindAllLanguages(allLanguages);
        }
    };

    self.disable = function () {
        chrome.runtime.sendMessage('disablePlugin');
    };

    self.isReadLetterSoundTypingVisible = ko.computed(function () {
        var selectedProfile = self.selectedProfile();

        return selectedProfile ?
            // Festival voices
            (selectedProfile.profile_id == 1 || selectedProfile.profile_id == 4 || selectedProfile.profile_id == 3 || selectedProfile.profile_id == 5)
            // Danish voices
            || (selectedProfile.profile_id == 19 || selectedProfile.profile_id == 20 || selectedProfile.profile_id == 6)
            // Swedish voices
            || (selectedProfile.profile_id == 92 || selectedProfile.profile_id == 93 || selectedProfile.profile_id == 94)
            // Norwegian voices
            || (selectedProfile.profile_id == 68 || selectedProfile.profile_id == 69)
            // Dutch voices
            //|| (selectedProfile.profile_id == 22 || selectedProfile.profile_id == 23)
            : false;
    }, this);

    self.isReadLetterNameTypingVisible = ko.computed(function () {
        return self.selectedProfile() ? true
            //(self.selectedProfile().profile_id == 1 || self.selectedProfile().profile_id == 4 || self.selectedProfile().profile_id == 3 || self.selectedProfile().profile_id == 5 || self.selectedProfile().profile_id == 2)
            : false;
    }, this);

    self.selectedProfileClass = ko.computed(function () {
        var nnProfileForEnglish = '';
        if (self.uiLanguage() == 'en' && self.selectedProfile() && self.selectedProfile().profile_id == 5) {
            nnProfileForEnglish = 'itw_btn_with_text_for_NN';
        }
        return 'navprofile_' + (self.selectedProfile() ? self.selectedProfile().lang_code : '') + ' active navprofile ' + nnProfileForEnglish;
    }, this);


    self.getProfileTooltips = function (data) {
        return data.lang_code;

        var userLang = self.uiLanguage();
        if (data && userLang) {
            /*if (data.profile_name.substring(0, 1).toLowerCase() == "d") {
                return Translation[userLang].Profile_Danish;
            }
            else if (data.profile_name.substring(0, 1).toLowerCase() == "e") {
                return Translation[userLang].Profile_English;
            } else if (data.profile_name.substring(0, 1).toLowerCase() == "n") {
                return Translation[userLang].Profile_Norvegian;
            } else if (data.profile_name.substring(0, 1).toLowerCase() == "s") {
                return Translation[userLang].Profile_Swedish;
            }*/
            switch (data.profile_name) {
                case 'Dansk':
                    return Translation[userLang].Profile_Danish;
                case 'Engelsk':
                    return Translation[userLang].Profile_English;
                case 'Tysk':
                    return Translation[userLang].Profile_German;
                case 'Spansk-Female':
                    return Translation[userLang].Profile_Spanish_Female;
                case 'Spansk-Male':
                    return Translation[userLang].Profile_Spanish_Male;
                case 'Norsk Bolmål':
                    return Translation[userLang].Profile_Norvegian;
                case 'Nynorsk':
                    return Translation[userLang].Profile_New_Norvegian;
                case 'Svensk':
                    return Translation[userLang].Profile_Swedish;
                default:
                    return '';
            }
        } else {
            return "";
        }
    };

    self.getLanguageName = function (data) {
        var userLang = self.uiLanguage();
        if (data && userLang) {
            switch (data.lang_code) {
                case 'arw':
                    return Translation[userLang].Profile_Arabic;
                case 'bae':
                    return Translation[userLang].Profile_Basque;
                case 'bgb':
                    return Translation[userLang].Profile_Bulgarian;
                case 'cae':
                    return Translation[userLang].Profile_Catalan;
                case 'czc':
                    return Translation[userLang].Profile_Czech;
                case 'dad':
                    return Translation[userLang].Profile_Danish;
                case 'dub':
                case 'dun':
                    return Translation[userLang].Profile_Dutch;
                case 'ena':
                case 'ene':
                case 'eng':
                case 'eni':
                case 'ens':
                case 'enu':
                case 'enz':
                    return Translation[userLang].Profile_English;
                case 'fif':
                    return Translation[userLang].Profile_Finnish;
                case 'frc':
                case 'frf':
                    return Translation[userLang].Profile_French;
                case 'ged':
                    return Translation[userLang].Profile_German;
                case 'gle':
                    return Translation[userLang].Profile_Galician;
                case 'grg':
                    return Translation[userLang].Profile_Greek;
                case 'hei':
                    return Translation[userLang].Profile_Hebrew;
                case 'hii':
                    return Translation[userLang].Profile_Hindi;
                case 'huh':
                    return Translation[userLang].Profile_Hungarian;
                case 'idi':
                    return Translation[userLang].Profile_Indonesian;
                case 'iti':
                    return Translation[userLang].Profile_Italian;
                case 'jpj':
                    return Translation[userLang].Profile_Japanese;
                case 'kok':
                    return Translation[userLang].Profile_Korean;
                case 'non':
                    return Translation[userLang].Profile_Norvegian;
                case 'nyn':
                    return Translation[userLang].Profile_New_Norvegian;
                case 'plp':
                    return Translation[userLang].Profile_Polish;
                case 'ptb':
                case 'ptp':
                    return Translation[userLang].Profile_Portuguese;
                case 'ror':
                    return Translation[userLang].Profile_Romanian;
                case 'rur':
                    return Translation[userLang].Profile_Russian;
                case 'sks':
                    return Translation[userLang].Profile_Slovak;
                case 'spa':
                case 'spc':
                case 'spe':
                case 'spm':
                    return Translation[userLang].Profile_Spanish;
                case 'sws':
                    return Translation[userLang].Profile_Swedish;
                case 'tht':
                    return Translation[userLang].Profile_Thai;
                case 'trt':
                    return Translation[userLang].Profile_Turkish;
                case 'vae':
                    return Translation[userLang].Profile_Valencian;
                case 'mnt':
                case 'mnc':
                    return Translation[userLang].Profile_Mandarin;
                case 'cah':
                    return Translation[userLang].Profile_HongKong;
                default:
                    return '';
            }
        } else {
            return "";
        }
    }

    self.profileClass = function (data) {
        if (data) {
            return 'itw_profile' + data.profile_id + (data == self.selectedProfile() ? ' hidden' : '');
        }
        else {
            return "";
        }
    };

    self.languageClass = function (data) {
        if (data) {
            return 'profile_' + data.lang_code;
        }
        else {
            return "";
        }
    };

    self.getCredentials = function () {
        var sessionId = Settings.getInstance().getSessionID();
        if (sessionId /*&& !isProfilesLoaded*/) {
            loadProfiles();
        }
    };

    self.selectedProfile.subscribe(function (newValue) {
        if (isProfilesLoaded && newValue) {

            self.logger.loggerModdel.active_profile(self.selectedProfile());
            Settings.getInstance().setProfileID(newValue.profile_id);
            if ((!!self.profilesInfo) && (self.profilesInfo.current_profile_id != newValue.profile_id)) {
                self.profilesInfo.current_profile_id = newValue.profile_id;
                // comment setProfiles when changing back to intowords online service
                self.viewProfilesEnabled(false);
                ClientManager.getInstance().settings.setProfiles({ current_profile_id: self.profilesInfo.current_profile_id }, function (result) {
                    Settings.getInstance().loadSettings(function () {

                       self.logger.loggerModdel.profile_settings(Settings.getInstance().getSettingData());
                   });
                    //self.refreshProfiles();
                    //self.viewProfilesEnabled(true);
                });
            }
            else {
                //Settings.getInstance().loadSettings(self.refreshProfiles);
                //self.refreshProfiles();
            }
        }
    });

    self.readStrategyExpanded = ko.observable(false);
    self.readWhileWritingExpanded = ko.observable(false);
    self.highlightExpanded = ko.observable(false);
    self.appsExpanded = ko.observable(false);
    self.isDictionaryAppVisible = ko.observable(false);
    self.isUserLanguageDanish = ko.observable(false);
    self.isUserLanguageNorwegian = ko.observable(false);
    self.isCommaSuggestionAppAvailable = ko.observable(false);
    self.mivoSupportedLanguages = ['da']; // Non-danish languages not yet supported: 'sv', 'nb', 'nn', 'en'
    self.isMivoLanguageAvailable = ko.observable(false);
    self.isMivoAppAvailable = ko.observable(false);
    self.grammateketSupportedLanguages = ['da'];
    self.isGrammateketLanguageAvailable = ko.observable(false);
    self.isGrammateketAppAvailable = ko.observable(false);
    self.templatesAvailable = ko.observable(false);
	self.statisticsAvailable = ko.observable(false);
    
    self.toggleOptions = function () {
        self.readStrategyExpanded(false);
        self.readWhileWritingExpanded(false);
        self.highlightExpanded(false);
        self.optionsExpanded(!self.optionsExpanded());

        calculatePanelWidth();

        if (self.optionsExpanded()) {
            var panel = $('div#itw_panel');
            var panelWidth = panel.width();
            var panelLeft = panel.position().left;
            var windowWidth = $(window).width();

            if (panelLeft + panelWidth > windowWidth) {
                panel.css('left', windowWidth - panelWidth);
            }
        }
    };

    var calculatePanelWidth = function () {
        var width = $('div#itw_panel div#itw_profile').width()
            + ($('div#itw_panel div.itw_player').width() == 0 ? 309 : $('div#itw_panel div.itw_player').width())
            + (self.optionsExpanded() ? $('div#itw_panel div.itw_playermoreseparator').width() : 0)
            + (self.optionsExpanded() ? $('div#itw_panel div.itw_optionscontainer').width() : 0)
            + $('div#itw_panel div.itw_expandoptions').width();

        $('div#itw_panel').width(width + 1);
    }

    self.toggleReadStrategy = function () {
        self.readWhileWritingExpanded(false);
        self.highlightExpanded(false);
        self.appsExpanded(false);
        self.readStrategyExpanded(!self.readStrategyExpanded());
    };

    self.toggleReadWhileWriting = function () {
        self.readStrategyExpanded(false);
        self.highlightExpanded(false);
        self.appsExpanded(false);
        self.readWhileWritingExpanded(!self.readWhileWritingExpanded());
    };

    self.toggleHighlight = function () {
        self.readWhileWritingExpanded(false);
        self.readStrategyExpanded(false);
        self.appsExpanded(false);
        self.highlightExpanded(!self.highlightExpanded());
    };

    self.toggleApps = function () {
        self.readStrategyExpanded(false);
        self.readWhileWritingExpanded(false);
        self.highlightExpanded(false);

        self.appsExpanded(!self.appsExpanded());
    };

    self.toggleRestLangs = function () {
        self.isRestLangsExpanded(!self.isRestLangsExpanded());
    };

    self.clickInfoBtn = function () {
        var userLang = self.uiLanguage();
        window.open(Translation[userLang].UrlHome, '_blank');
    };
    self.refreshProfiles = function () {
        var profiles = self.profiles().slice(0);
        self.profiles([]);
        self.profiles(profiles);
        var userLang = self.uiLanguage();
        var currentProfileName = (theme == themes.main) ? self.getLanguageName(self.selectedProfile()) : Translation[userLang].SelectProfile_menu;
        self.selectProfileTitle(currentProfileName);
        self.selectedProfile.notifySubscribers();
    };

    var getProfilesResult = [];
    var allLanguages = [];

    loadProfiles = function () {
        //ClientManager.getInstance().permission.listPermissions(function (result) {

        //});

        ClientManager.getInstance().settings.getProfiles(function (result) {
            getProfilesResult = result;
           var sameId = Settings.getInstance().getProfileID() == getProfilesResult.current_profile_id;
            Settings.getInstance().setProfileID(getProfilesResult.current_profile_id);

            Settings.getInstance().loadSupportedValues(function () {
                Settings.getInstance().loadSettings(function () {

                    if (!sameId) {
                    // group service profile by lang_code
                    var languages = [], key, lang;
                    //var maleVoiceIndex = 1, femaleVoiceIndex = 1;

                    $.each(result.profiles, function (index, val) {
                        key = val.lang_code;
                        lang = null;

                        $.each(languages, function (index, val) {
                            if (val.lang_code == key) {
                                lang = val;
                                return false;
                            }
                        });

                        if (!lang) {
                            //maleVoiceIndex = 1;
                            //femaleVoiceIndex = 1;
                            lang = {
                                lang_code: val.lang_code,
                                profiles: [],
                                disabled: false,
                                name: self.getLanguageName(val)
                            };
                            languages.push(lang);
                        }

                        var gender = VoiceNamesGender[val.profile_name];

                        var genderIndex = $.grep(lang.profiles, function (n, i) {
                            return n.gender == gender;
                        }).length + 1;

                        if (gender == 0 && genderIndex >= 4) genderIndex = 1;
                        if (gender == 1 && genderIndex >= 3) genderIndex = 1;

                        lang.profiles.push({
                            profile_id: val.profile_id,
                            profile_name: val.profile_name,
                            voice_id: val.voice_id,
                            gender: gender,
                            voice_gender_class: ('profile_voice_' + gender + '_' + genderIndex),
                            data: val
                        });

                        //if(gender == 0) femaleVoiceIndex++;
                        //if(femaleVoiceIndex >= 4) femaleVoiceIndex = 1;

                        //if(gender == 1) maleVoiceIndex++;
                        //if(maleVoiceIndex >= 3) maleVoiceIndex = 1; 
                    });

                    var allLangCodes = Settings.getInstance().getAvailableLangCodes();

                    $.each(allLangCodes, function (index, value) {
                        var langCode = value;

                        var arr = $.grep(getProfilesResult.profiles, function (n, i) {
                            return n.lang_code == langCode;
                        });

                        if (arr.length <= 0)
                            languages.push({
                                lang_code: langCode,
                                profiles: [],
                                disabled: true,
                                name: self.getLanguageName({ lang_code: langCode })
                            });
                    });

                    // set latest languages
                    //self.latestLanguages( languages.slice(0, (languages.length > latestLanguagesLength) ? latestLanguagesLength : languages.length) );
                    // set rest languages
                    //self.restLanguages( languages.length > latestLanguagesLength ? languages.slice(latestLanguagesLength) : [] );
                    allLanguages = languages;
                    //bindAllLanguages(languages);
                    self.profilesInfo = result;
                    self.profiles(result.profiles);
                    isProfilesLoaded = true;
                    self.logger.getUserInfo();
                    self.selectedProfile(findProfile(self.profiles(), result.current_profile_id));
                    bindAllLanguages(languages);
                    self.isLoggedIn(true);
                    self.languagesLoaded(true);
                }
                    //ClientManager.getInstance().user.getUserInfo(function (userInfo) {
                    //    self.userDisplayName(userInfo.given_name + " " + userInfo.surname);
                    //});
                });
            });
        });
    };

    self.languagesLoaded = ko.observable(false);

    var bindAllLanguages = function (languages) {
        bindLanguages(languages.slice(0, (languages.length > latestLanguagesLength) ? latestLanguagesLength : languages.length),
            $('div#itw_panel div.itw_latest_langs_cont'));

        if (languages.length > latestLanguagesLength) {
            var restLanguages = languages.slice(latestLanguagesLength);
            restLanguages.sort(
                function (a, b) {
                    var nameorder = a.name === b.name ? 0 : (a.name < b.name ? -1 : 1);
                    if ((a.disabled && b.disabled) || (!a.disabled && !b.disabled)) {
                        return nameorder;
                    } else { return a.disabled ? 1 : -1; };
                }
            );

            bindLanguages(restLanguages, $('div#itw_panel div.itw_rest_langs'));
        }
    };

    var bindLanguages = function (langs, container) {
        container.empty();
        var lang_html = '';
        var profile_html = '';

        if (container[0] == $('div#profilebox div.itw_latest_langs_cont')[0]) {
            langs[0].profiles[0].nodefault = true;
            if (langs[1] && langs[1].profiles[0]) {
                langs[1].profiles[0].nodefault = false;
            }
        }

        $.each(langs, function (index, val) {
            profile_html = '';

            if (val.profiles.length > 0) {
                $.each(val.profiles, function (i, profile) {
                    var isSelected;
                    if (self.selectedProfile() != undefined) {
                        isSelected = profile.profile_id == self.selectedProfile().profile_id;
                    } else {
                        isSelected = profile.profile_id == getProfilesResult.current_profile_id;
                    }
                    var isDefault = profile.profile_id == val.profiles[0].profile_id;

                    profile_html += '<a href="#" class="itw_btn_with_text profile_voice ' + profile.voice_gender_class
                        + ' ' + (((isDefault && !profile.nodefault) || isSelected) ? 'itw_selected' : '')
                        + '" data-profileid="' + profile.profile_id + '" data-langcode="' + val.lang_code + '"'
                        + '><div></div><br /><span>' + profile.profile_name + '</span>'
                        + (((isDefault && !profile.nodefault) || isSelected) ? '<div class="itw_selected_img"></div>' : '') + '</a>';
                });
            }

            lang_html += '<div class="itw_language' + (val.disabled ? ' itw_disabled' : '') + '"><a href="#" class="itw_btn_with_text itw_profile profile_'
                + val.lang_code + '"><div></div><br /><span>'
                + val.name + '</span></a><div class="itw_lang_profiles" style="display: none'
                + '"><div class="itw_lang_profiles_arrow"></div><div class="itw_lang_profiles_border">' + profile_html + '</div></div></div>';
        });

        container.append(lang_html);
        container.find('div.itw_language').on('mouseenter', mainViewModel.toggleLangProfiles).on('mouseleave', mainViewModel.toggleLangProfiles)
            .on('click', self.changeSelectedLanguage);
        container.find('a.profile_voice').on('click', self.changeSelectedProfile);

        container.find('div.itw_language span').on('mouseover', mainViewModel.onTextHover);
    };

    var showVoicesTimeout;

    self.toggleLangProfiles = function (event) {
        clearTimeout(showVoicesTimeout);

        var itw_lang_profiles = $(event.currentTarget).find('.itw_lang_profiles');

        if (event.type == 'mouseleave') {
            $(event.currentTarget).find('a.itw_profile').removeClass('itw_selected');
            itw_lang_profiles.css('display', 'none');
        }
        else if (event.type == 'mouseenter') {
            showVoicesTimeout = setTimeout(function () {
                $(event.currentTarget).find('a.itw_profile').addClass('itw_selected');
                itw_lang_profiles.css('display', 'inline-flex');
            }, 400);

            //itw_lang_profiles.css('display', 'inline-flex');
        }
    };

    findProfile = function (profiles, profile_id) {
        for (var i = 0; i < profiles.length; i++) {
            if (profiles[i].profile_id == profile_id)
                return profiles[i];
        }
        return null;
    };
    //

    self.getPredictionViewModel = function () {
        return predictionViewModel;
    };

    //******handlers********
    self.openLoginDialog = function (data, event) {
        if ((!$(event.target).hasClass('itw_btn_close') && event.target.parentElement.id != 'itw_login' && event.target.id != 'itw_login' && event.target.parentElement.id != 'itw_btn_log_out_user')
            && !self.isLoggedIn()) {
            $('div#itw_panel a#itw_login').get(0).click();;
        }

        return true;
    }

    self.preventTouchStart = function (data, event) {
        event.preventDefault();
        return false;
    };

    self.isLoginButtonPressed = ko.observable(false);

    self.login = function (data, event) {
        var top = window.screen.availHeight / 2 - 250;
        var left = window.screen.availWidth / 2 - 250;
        self.isLoginButtonPressed(true);
        self.logger.allowLogg(false);
        self.logger.disposeSubscriptions();
        window.open('https://mv-login.mv-nordic.com/mvid-login/chrome-device-login.php', 'login', 'height=500,width=500,top=' + top + ',left=' + left).focus();

        return false;
    };

    self.mousedown = function (event) {
        if (self.isDisabled()) return true;

        if (event && !$(event.target).hasClass('itw_dictionary_button')) {
            if (isGoogleDocs || isWordOnline || isGoogleSpreadsheet || isExcel) {
                $('div.itw_dictionary_button').remove();
            }
            else {
                $('div.itw_dictionary_button').remove(); //ITWC-752 ExampleTests: easy access icon added on each line and not removed on clickick on page
                $(CursorUtils.getActiveElement()).find('div.itw_dictionary_button').remove();
            }
        }

        if (speachManager.isPlaying() || speachManager.isPaused()) {
            if (event == null || $(event.target).parents('div#itw_panel').length == 0) {
                speachManager.setWasTextSelected(false);
                speachManager.stop();
            }
        }

        if (event == null || $(event.target).parents('div#itw_panel').length == 0) {
            self.readStrategyExpanded(false);
            self.readWhileWritingExpanded(false);
            self.highlightExpanded(false);
            self.appsExpanded(false);
        }

        CursorUtils.SetGoogleDocsCursor();

        if (event == null || $(event.target).parents('div#itw_predictionsmain').length == 0) {
            setTimeout(function () {
                reloadWords();
            }, 10);
            //reloadWords();
        }

        // http://10.1.13.2:8081/issue/ITWC-1001 
        setTimeout(function () {
            if (location.host && location.host.indexOf("ebog.mitcfu") > -1 && $(".atbContextMenu") && $(".atbContextMenu").hasClass("hiddenContent")) {
                $(".atbContextMenu").removeClass("hiddenContent");
            }
        }, 500);

        return true;
    };

    var bindSingleIframeEvents = function (frameDoc) {
        if (!isWordOnline) {
            var bindElement = frameDoc.find('body');
            // http://10.1.13.2:8081/issue/ITWC-1001 
            if (location.host && location.host.indexOf("ebog.mitcfu") > -1) {
                bindElement = frameDoc;
            }
            bindElement.off('mousedown.itw')
                .off('mouseup.itw')
                .on('mousedown.itw', mainViewModel.mousedown)
                .on('mouseup.itw', mainViewModel.mouseclick);
        }
        else {
            frameDoc.find('div#WACViewPanel').off('mouseup.itw').off('mouseup.itw')
                .on('mouseup', mainViewModel.mousedown).on('mouseup', mainViewModel.mouseclick);
        }

        frameDoc.find("[contenteditable='true']")
            .off('keyup.itw')
            .off('focusin.itw')
            .off('focusout.itw')
            .on('keyup.itw', mainViewModel.typing)
            .on('focusin.itw', mainViewModel.focusin)
            .on('focusout.itw', mainViewModel.focusout);

        frameDoc.find("[contenteditable='plaintext-only']")
            .off('keyup.itw')
            .off('focusin.itw')
            .off('focusout.itw')
            .on('keyup.itw', mainViewModel.typing)
            .on('focusin.itw', mainViewModel.focusin)
            .on('focusout.itw', mainViewModel.focusout);

        frameDoc.find("input:not([type='password']), textarea")
            .off('keyup.itw')
            .off('keypress.itw')
            .off('focusin.itw')
            .off('focusout.itw')
            .on('keyup.itw', mainViewModel.typingInput)
            .on('keypress.itw', mainViewModel.typingInput)
            .on('focusin.itw', mainViewModel.focusin)
            .on('focusout.itw', mainViewModel.focusout);

        predictionViewModel.initShortcutsForElements(frameDoc.find("[contenteditable='true']"));
        predictionViewModel.initShortcutsForElements(frameDoc.find("input, textarea"));
        predictionViewModel.initShortcutsForElements(frameDoc.find("[contenteditable='plaintext-only']"));

    };

    var bindIframeEvents = function () {
        $('iframe').each(function () {
            var frame = this;
			
			$(frame).load(function () {
            //$(frame).on('load', function () {
                try {
                    var frameDoc = $(this.contentWindow.document);
                    observeDOM(frameDoc[0].body, function () {
                        bindSingleIframeEvents(frameDoc);
                    });
                }
                catch (err) {
                    //console.log(err);
                }
            });

            try {
                if (frame.contentWindow.document)
                    bindSingleIframeEvents($(frame.contentWindow.document));
            }
            catch (err) {
                //console.log(err);
            }
        });
    };

    self.wordOnlineDblClick = function () {
        setTimeout(function () {
            var word = window.getSelection().toString();

            if (word && word.length > 0) {
                word = word.trimAll();

                ClientManager.getInstance().speach.speak(word, false, function (json) {
                    player.unbindEndPlayingEvent();
                    player.play(json);
                });
            }
        }, 50);
    };

    self.appLinksClick = function (vm, event){

        if(event.target.id && event.target.id != 'itw_link_statistics') {

            if(self.logger.loggerModdel.choose_app() == event.target.id){
                self.logger.loggerModdel.choose_app.notifySubscribers();
            } else{
                self.logger.loggerModdel.choose_app(event.target.id);   
            }             
        }

        return true;
    };

    self.mouseclick = function (event) {
        if (self.isDisabled()) return true;

        if (!isGoogle) {
            setTimeout(function () {
                $("[contenteditable='true']").off('keyup.itw').on('keyup.itw', mainViewModel.typing);
                $("[contenteditable='plaintext-only']").off('keyup.itw').on('keyup.itw', mainViewModel.typing);
                $("input:not([type='password']), textarea").off('keypress.itw').on('keypress.itw', mainViewModel.typingInput);
                $("input:not([type='password']), textarea").off('keyup.itw').on('keyup.itw', mainViewModel.typingInput);
                bindIframeEvents();
            }, 100);

            if (!isWordOnline) {
                predictionViewModel.initShortcutsForElements($("[contenteditable='true']"));
                predictionViewModel.initShortcutsForElements($("input, textarea"));
                predictionViewModel.initShortcutsForElements($("[contenteditable='plaintext-only']"));
            }

            if (isWordOnline && self.dictionarySearchHasFocus()) {
                var deactivateFocusOut = event.target.id == "itw_dictionarymain" || $(event.target).closest("#itw_dictionarymain").length > 0;
                self.dictionarySearchHasFocus(deactivateFocusOut);
            }
        }

        setTimeout(function () {
            isSentenceFromCursorToggleVisibility();
            //if(isGoogleDocs || (isGoogleSpreadsheet && $(event.target).hasClass('cell-input') )){
            //  speachManager.stop();
            //}
            //if(isGooglePresentation  ){           
            //  speachManager.stop();
            //}
            /*
            if($(event.target).parents('div#itw_panel').length == 0) {
                speachManager.setWasTextSelected(false);
                speachManager.stop();
            }

            CursorUtils.SetGoogleDocsCursor();
            reloadWords();
            */

            predictionViewModel.isEditableElement(isActiveElementEditable());
            if (isGoogleDocs) {
                CursorUtils.SetGoogleDocsCursor();
                PubSub.publish(Events.loadWords, null);
            };

            if (isWordOnline) {
                PubSub.publish(Events.loadWords, null);
            }

            if ($(event.target).parents('div#itw_panel').length <= 0)
                self.showDictionaryIcon(event);
        }, 100);

        return true;
    };

    self.dictionaryAccessAvailable = ko.observable(false);

    self.showDictionaryIcon = function (event) {
        if (!isIntowordsDictionary && dictionariesList && dictionariesList.length > 0 && self.getDictionaryIndexByLanguage() !== null &&
            ($(event.target).attr('id') != 'itw_dictionarymain' && $(event.target).parents('div#itw_dictionarymain').length <= 0)
            && ($(event.target).attr('id') != 'itw_predictionsmain' && $(event.target).parents('div#itw_predictionsmain').length <= 0)) {
            setTimeout(function () {
                var activeElement = CursorUtils.getActiveElement();
                var isDictionaryButtonClicked = $(event.target).hasClass("itw_dictionary_button");
                var inputValue;
                if (CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName == "TEXTAREA") {
                    inputValue = activeElement.value.substring(activeElement.selectionStart,
                                    activeElement.selectionEnd);
                }

                var windowSelection = CursorUtils.getActiveWindowSelection();

                if (!isDictionaryButtonClicked && (inputValue || !windowSelection.isCollapsed ||
                    (isGoogleDocs && !CursorUtils.GetCursorPosition().isCollapsed()))) {

                    var selectionText;
                    var r;

                    if (isGoogleDocs) {
                        var textAndBoundingClientRectFromSelectionRange = CursorUtils.getTextAndBoundingClientRectFromSelectionRange(CursorUtils.GetCursorPosition())
                        selectionText = textAndBoundingClientRectFromSelectionRange.text;
                        r = textAndBoundingClientRectFromSelectionRange.boundingClientRect;
                    } else if (isWordOnline) {
                        selectionText = window.getSelection().toString();
                        r = window.getSelection().getRangeAt(0).getBoundingClientRect();
                    } else if (inputValue) {
                        selectionText = inputValue;
                        r = activeElement.getBoundingClientRect();
                    } else {
                        selectionText = windowSelection.toString();
                        r = windowSelection.getRangeAt(0).getBoundingClientRect();
                    }

                    selectionText = selectionText.replace(/\s/, ' ');
                    selectionText = selectionText.trimAll();

                    if (selectionText && selectionText.split(' ').length == 1) {
                        var dictBtn = $('<div class="itw_dictionary_button" contenteditable="false"></div>');
                        dictBtn.data('word', selectionText);

                        dictBtn.on('mouseup', function (e) {

                            var dictID = self.setDictionaryByLanguage();
                            var word = $(e.currentTarget).data('word').trim();
                            var showInflections = true;
                            var readAloud = true;
                            $('div#itw_dictionarymain').data('word', word);
                            self.dictionarySearchValue('');
                            self.loadDictionaryWordDescription(word, dictID);
                            $('div.itw_dictionary_button').remove();

                            e.preventDefault();
                            return false;
                        });

                        dictBtn.on('mousedown click', function (e) {
                            e.preventDefault();
                            return false;
                        });

                        var dictionaryButtonHeight = 22;
                        var relative, appendTo, additionalTopOffset, additionalLeftOffset;
                        if (isGoogleDocs) {
                            appendTo = 'div.kix-appview-editor';
                            relative = document.getElementsByClassName('kix-page')[0].getBoundingClientRect();
                            additionalTopOffset = r.height + dictionaryButtonHeight / 2;
                            additionalLeftOffset = relative.left;
                        } else if (isWordOnline) {
                            appendTo = '#WACViewPanel';
                            relative = document.getElementById("PageContentContainer").getBoundingClientRect();
                            additionalTopOffset = r.height + dictionaryButtonHeight;
                            additionalLeftOffset = 0;
                            if(isPowerPoint||isOneNote){
                                additionalTopOffset-=20;
                            }
                        } else if (isGoogleSpreadsheet) {
                            appendTo = 'div.grid-scrollable-wrapper';
                            relative = document.getElementById("docs-editor").getBoundingClientRect();
                            additionalTopOffset = 0;
                            additionalLeftOffset = 0;
                        } else if (isExcel) {
                            appendTo = 'div#m_excelWebRenderer_ewaCtl_sheetContentDiv';
                            var page = document.getElementById("m_excelWebRenderer_ewaCtl_sheetContentDiv").getElementsByClassName('ewr-grdblkflow')[0];
                            relativeBounding = page.getBoundingClientRect();
                            relative = {
                                left: relativeBounding.left,
                                top: relativeBounding.top - page.offsetTop
                            };

                            additionalTopOffset = 0;
                            additionalLeftOffset = -27;
                        } else if (CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName == "TEXTAREA") {
                            relative = document.body.parentNode.getBoundingClientRect();
                            appendTo = 'body';
                            additionalTopOffset = r.height;
                            additionalLeftOffset = 0;
                        } else {
                            relative = CursorUtils.getActiveElement().parentNode.getBoundingClientRect();
                            appendTo = CursorUtils.getActiveElement();
                            additionalTopOffset = r.height;
                            additionalLeftOffset = 0;
                        }

                        var left = 0, top = 0;

                        if (isGoogleSpreadsheet) {
                            var inputbox = $('div.input-box')[0].getBoundingClientRect();
                            relative = document.getElementById("docs-editor").getBoundingClientRect();
                            top = r.top - relative.top - 27;
                            left = inputbox.left - relative.left - 27;
                        }
                        else {
                            top = r.top - relative.top + additionalTopOffset;
                            left = r.left - relative.left + additionalLeftOffset;
                        }

                        dictBtn.css('top', top + 'px');
                        dictBtn.css('left', left + 'px');

                        dictBtn.css('width', '24px')
                            .css('height', '24px')
                            .css('position', 'absolute')
                            .css('background-color', '#fff')
                            .css('z-index', 2147483647)
                            .css('-webkit-border-radius', '4px')
                            .css('border', '1px solid #a7aaad')
                            .css('cursor', 'pointer')
                            .css('background-image', "url('chrome-extension://" + chrome.runtime.id + "/images/new_design.png')")
                            .css('background-size', 'auto')
                            .css('background-position', '-251px -459px')
                            .css('outline', 'none')
                            .css('margin-top', '1px')
                            .css('-webkit-box-sizing', 'content-box')
                            .css('-moz-box-sizing', 'content-box')
                            .css('box-sizing', 'content-box');

                        $('div.itw_dictionary_button').remove()
                        if (isExcel) {
                            $(appendTo).prepend(dictBtn);
                        }
                        else {
                            $(appendTo).append(dictBtn);
                        }
                    }
                }
                //else {
                    /*if(isGoogleDocs || isWordOnline){
                        $('div.itw_dictionary_button').remove()
                    }
                    else {
                        $(CursorUtils.getActiveElement()).find('div.itw_dictionary_button').remove();
                    }*/

                    //if (!$(event.target).hasClass("itw_dictionary_button")) {
                    //    self.showDictionary(false);
                    //}
               // }
            }, 1);
        }
    };

    self.setDictionaryByLanguage = function () {
        var profileLang = self.selectedProfile().lang_code;
        var dictionaryIndex = self.getDictionaryIndexByLanguage();
        var dictID = null;

        if (dictionaryIndex !== null) {
            var dictID = dictionariesList[dictionaryIndex].dictID;
            $('div#itw_ddlDictionary').dc_dropdown('setvalue', dictID);
        }

        return dictID;
    }

    self.getDictionaryIndexByLanguage = function () {
        var profileLang = self.selectedProfile().lang_code;
        var dictionaryIndex = null;

        if (dictionariesList && dictionariesList.length > 0) {
            switch (self.localBrowserLanguage) {
                case 'da':
                    switch (profileLang) {
                        case 'dad':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'da' && d.Lang2 == 'da' });
                            break;
                        case 'sws':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'sv' && d.Lang2 == 'sv' });
                            break;
                        case 'non':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'nb' && d.Lang2 == 'nb' });
                            break;
                        case 'nyn':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'nn' && d.Lang2 == 'nn' });
                            break;
                        case 'eng':
                            //dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'en' && d.Lang2 == 'da' });
                            // ITWC-1095 Easy Access: English-Danish search redirects to wrong dictionary
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.dictID == 18 });
                            break;
                        case 'ged':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'de' && d.Lang2 == 'da' });
                            break;
                        case 'spe':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'es' && d.Lang2 == 'da' });
                            break;
                        case 'frf':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'fr' && d.Lang2 == 'da' });
                            break;
                    }

                    break;

                case 'sv':
                    switch (profileLang) {
                        case 'dad':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'da' && d.Lang2 == 'da'; });
                            break;
                        case 'sws':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'sv' && d.Lang2 == 'sv'; });
                            break;
                        case 'non':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'nb' && d.Lang2 == 'nb'; });
                            break;
                        case 'nyn':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'nn' && d.Lang2 == 'nn'; });
                            break;
                        case 'eng':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'en' && d.Lang2 == 'sv'; });
                            break;
                        case 'ged':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'de' && d.Lang2 == 'sv'; });
                            break;
                        case 'spe':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'es' && d.Lang2 == 'sv'; });
                            break;
                        case 'frf':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'fr' && d.Lang2 == 'sv'; });
                            break;
                    }

                    break;

                case 'nb':
                    switch (profileLang) {
                        case 'dad':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'da' && d.Lang2 == 'da'; });
                            break;
                        case 'sws':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'sv' && d.Lang2 == 'sv'; });
                            break;
                        case 'non':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'nb' && d.Lang2 == 'nb'; });
                            break;
                        case 'nyn':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'nn' && d.Lang2 == 'nn'; });
                            break;
                        case 'eng':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'en' && d.Lang2 == 'nb'; });
                            break;
                        case 'ged':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'de' && d.Lang2 == 'nb'; });
                            break;
                        case 'spe':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'es' && d.Lang2 == 'nb'; });
                            break;
                        case 'frf':
                            dictionaryIndex = dictionariesList.findIndex(function (d) { return d.Lang1 == 'fr' && d.Lang2 == 'nb'; });
                            break;
                    }

                    break;

                default:
                    break;
            }
        }

        if (dictionaryIndex == -1)
            dictionaryIndex = null;

        return dictionaryIndex;
    }

    self.dictionarySearchValue = ko.observable('');

    self.loadDictionaryWordDescription = function (word, dictID) {
        word = word.toLowerCase().trim();

        ClientManager.getInstance().dictionary.search(word, dictID, function (words) {
            var itw_dictpanel_bar = $('div#itw_dictionarycontent');

            if (words && words.length > 0 && words[0].Word.toLowerCase() == word.toLowerCase()) {
                ClientManager.getInstance().dictionary.getArticle(dictID, word, words[0].Key, { readAloud: true, showInflections: true }, function (json) {
                    var extensionId = chrome.runtime.id;
                    itw_dictpanel_bar.empty();
                    var div = $('<div></div>').append(json);
                    div.find('meta').remove();
                    div.find('link').remove();
                    div.find('title').remove();
                    var script1 = div.find('script:eq(0)').html();
                    script1 = script1.split('/expand.png').join('chrome-extension://' + extensionId + '/images/expand.png');
                    script1 = script1.split('/collapse.png').join('chrome-extension://' + extensionId + '/images/collapse.png');
                    script1 = script1.split('/expand_02.png').join('chrome-extension://' + extensionId + '/images/expand_02.png');
                    script1 = script1.split('/collapse_02.png').join('chrome-extension://' + extensionId + '/images/collapse_02.png');
                    div.find('script:eq(0)').html(script1);
                    var script2 = div.find('script:eq(1)').html();
                    script2 = script2.split('/Content/img').join('');
                    div.find('script:eq(1)').html(script2);
                    div.find('div#Debug').hide();
                    itw_dictpanel_bar.append(div.html());

                    itw_dictpanel_bar.find('img').each(function (i) {
                        var img = $(this);

                        if (img.attr('src') == '/Content/img/expand.png') {
                            img.attr('src', 'chrome-extension://' + extensionId + '/images/expand.png');
                        }

                        if (img.attr('src') == '/Content/img/collapse.png') {
                            img.attr('src', 'chrome-extension://' + extensionId + '/images/collapse.png');
                        }

                        if (img.attr('src') == '/Content/img/expand_02.png') {
                            img.attr('src', 'chrome-extension://' + extensionId + '/images/expand_02.png');
                        }

                        if (img.attr('src') == '/Content/img/collapse_02.png') {
                            img.attr('src', 'chrome-extension://' + extensionId + '/images/collapse_02.png');
                        }
                    });

                    itw_dictpanel_bar.find('a[onclick]').each(function (i) {
                        var a = $(this);
                        var onclick = a.attr('onclick').replace('javascript:', '');
                        a.removeAttr('onclick');

                        var cloneA = a.clone();
                        a.replaceWith(cloneA);

                        cloneA.on('click', { onclickHandler: onclick }, function (e) {
                            eval(e.data.onclickHandler);
                        });
                    });

                    var elems = itw_dictpanel_bar.find('span[onmouseenter], td[onmouseenter]');

                    while (elems && elems.length > 0) {
                        elems.each(function (i) {
                            var span = $(this);
                            var onmouseenter = span.attr('onmouseenter');
                            var onmouseleave = span.attr('onmouseleave');
                            span.removeAttr('onmouseenter').removeAttr('onmouseleave');
                            span.unbind('onmouseenter').unbind('onmouseleave');

                            var cloneSpan = span.clone(true);
                            span.replaceWith(cloneSpan);

                            cloneSpan.on('mouseenter', { onmouseenterHandler: onmouseenter }, function (e) {
                                eval(e.data.onmouseenterHandler);
                            });
                            cloneSpan.on('mouseleave', { onmouseleaveHandler: onmouseleave }, function (e) {
                                eval(e.data.onmouseleaveHandler);
                            });
                        });

                        elems = itw_dictpanel_bar.find('span[onmouseenter], td[onmouseenter]');
                    }

                    itw_dictpanel_bar.find('span:not(.lemmaPro, .specialPronounce, :has(*))')
                        .filter(function (index) {
                            return this.innerText.toLowerCase().trim().split(' ').length == 1;
                        })
                        .on('dblclick', self.onDictionaryDblClick);

                    self.showDictionary(true);

                    $("input#itw_dictionaryinput")
                        .off('keyup.itw')
                        .off('keydown.itw')
                        .off('keypress.itw')
                        .off('focusin.itw')
                        .off('focusout.itw')
                        .on('keyup.itw', mainViewModel.typingInput)
                        .on('keydown.itw', mainViewModel.typingInput)
                        .on('keypress.itw', mainViewModel.typingInput)
                        .on('focusin.itw', mainViewModel.focusin)
                        .on('focusout.itw', mainViewModel.focusout);
                    /*try {
                        itw_dictpanel_bar.find('script')[0].remove();
                    }
                    catch (e) {
                        var script = itw_dictpanel_bar.find('script')[0];
                        script.parentElement.removeChild(script);
                    }*/
                });
            }
            else {
                ClientManager.getInstance().dictionary.getArticle(dictID, '0-1-nederlag', '1,1', { readAloud: true, showInflections: true }, function (json) {
                    var div = $('<div></div>').append(json);
                    var script1 = div.find('script:eq(0)');
                    itw_dictpanel_bar.append(script1);
                    self.showDictionary(true);
                    itw_dictpanel_bar.empty();
                    var message = self.text_DictionaryWordDontExist();
                    var messageSpan = $('<span class="def">' + message.replace("{WORD}", word) + '</span>');
                    messageSpan.on('mouseenter', function () { EnterStructure(message.replace("{WORD}", word), 1); });
                    messageSpan.on('mouseleave', function () { ExitStructure(); });
                    itw_dictpanel_bar.html(messageSpan);
                });
            }
        });
    };

    self.onDictionarySearchFocusIn = function(data, event) {
        self.dictionarySearchHasFocus(true);
    }

    self.onDictionarySearchFocusOut = function (data, event) {
        if (isWordOnline) {
            if (self.dictionarySearchHasFocus()) {
                event.preventDefault();
                $(event.target).focus();
            }
        }
    };

    self.onDictionaryKeyPress = function (data, event) {
        if (event.keyCode == 13) {
            self.onDictionarySearchClick();
        }

        return true;
    };

    self.onDictionarySearchClick = function (data, event) {
        var dictID = $('div#itw_ddlDictionary').dc_dropdown('getvalue');
        var word = self.dictionarySearchValue();
        $('div#itw_dictionarymain').data('word', word);
        self.loadDictionaryWordDescription(word, dictID);
    };

    self.onGoogleImagesSearchClick = function (data, event) {
        window.open('https://google.com/search?tbm=isch&q=' + $('div#itw_dictionarymain').data('word'));
    };

    self.onDictionaryDblClick = function (event) {
        var word = event.currentTarget.innerText.toLowerCase().trim();
        self.dictionarySearchValue(word);
        $('input#itw_dictionaryinput').focus();
    };

    self.onPredictionDblClick = function (item, event) {
        if (!isIntowordsDictionary && dictionariesList && dictionariesList.length) {
            var dictID = self.setDictionaryByLanguage();

            if (dictID !== null) {
                var word = item.word;
                $('div#itw_dictionarymain').data('word', word);
                self.dictionarySearchValue('');
                self.loadDictionaryWordDescription(word, dictID);
            }
        }
        event.stopPropagation();
    };

    self.keyPress = function (event) {
        return true;
    };

    self.focusin = function (event) {
        if (self.isDisabled()) return true;

        predictionViewModel.isEditableElement(isActiveElementEditable());
        return true;
    };

    self.focusout = function (event) {
        if (self.isDisabled()) return true;

        if (isExcel) {
            $('div.itw_dictionary_button').remove();
        }
        else {
            predictionViewModel.isEditableElement(isActiveElementEditable());
        }

        return true;
    };

    self.dblclick = function (event) {
        if (self.isDisabled()) return true;

        predictionViewModel.isEditableElement(isActiveElementEditable());
        isSentenceFromCursorToggleVisibility();
        return true;
    };

    function getTransformToElement(element, target) {
        return target.getScreenCTM().inverse().multiply(element.getScreenCTM());
    }
    var haveTextToPlay = function () {
        //if (document.URL.indexOf(".pdf") > 0) return false;
        if (document.contentType == 'application/pdf') return false;
        var ectiveElement;
        if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA" ||
           CursorUtils.getActiveElement().hasAttribute('contenteditable')) {
            ectiveElement = CursorUtils.getActiveElement();
            if (ectiveElement.type === "password") {
                return false;
            }
        }
        var wasTextSelected = (!isGoogleSpreadsheet && !isGooglePresentation && !isGoogleDrawing && (CursorUtils.GetCursorPosition() && !CursorUtils.GetCursorPosition().isCollapsed()));
        var isContenteditableHasSomeText = (ectiveElement && ectiveElement.textContent != null && (ectiveElement.textContent.trim().length > 0 || (ectiveElement.textContent.length > 0 && isWordOnline)));
        var isInputOrTextEreaHasSomeText = (ectiveElement && ectiveElement.value != null && ectiveElement.value.trim().length > 0 && ectiveElement.value.trim().length != ectiveElement.selectionStart);
        if (event && event.target)
            var isPlayStopButton = (event.target.id == "itw_stoptext" || event.target.id == "itw_playpausetext");
        var isPlaying = $('#itw_playpausetext').hasClass('pause');
        var isGooglePresentationHasSomeText = false;
        var isGooglePdfHasSomeText = false;
        if (isGooglePresentation || isGoogleDrawing) {
            isContenteditableHasSomeText = false;
            var cursorRect = null;
            var lastParagX = 0;
            var lastParagY = 0;
            if ($('path[stroke-opacity="0.6"]').length > 0 && $('path[stroke-opacity="0.6"]').parent().parent().find('rect').length > 1) {
                cursorRect = $('path[stroke-opacity="0.6"]').parent().parent().find('rect')[$('path[stroke-opacity="0.6"]').parent().parent().find('rect').length - 2];
                var lastParag = $(cursorRect).parent().find(".sketchy-text-content-text").last()[0];
                var svg = $(cursorRect).parents('svg')[0];
                lastParagX = lastParag.parentElement.getBBox().x;
                lastParagY = lastParag.parentElement.getBBox().y;
                //var matrix = lastParag.parentElement.getTransformToElement(cursorRect.parentElement);
                var matrix = getTransformToElement(lastParag.parentElement, cursorRect.parentElement);//val.parentElement.parentElement.getTransformToElement(cursorRect.parentElement);
                var position = svg.createSVGPoint();
                position.x = 0;
                position.y = 0;
                position = position.matrixTransform(matrix);

                lastParagX += position.x + lastParag.getBBox().width;
                lastParagY += position.y;
            }

            isGooglePresentationHasSomeText = ((cursorRect && cursorRect.className.animVal == "docs-text-ui-cursor-blink" && !(cursorRect.getBBox().x + cursorRect.getBBox().width > lastParagX && cursorRect.getBBox().y + cursorRect.getBBox().height / 2 > lastParagY)) || $('.sketchy-text-selection-overlay').length > 0);
        }
        if (isGooglePdf) {
            var selection = $('.drive-viewer-paginated-page-selection').children();
            if (selection && selection.length > 0) isGooglePdfHasSomeText = true;
        }

        if (isContenteditableHasSomeText && CursorUtils.GetCursorPosition().isCollapsed())
            isContenteditableHasSomeText = !TextManager.isCursorPositionInTheEnd();

        if (speachManager.isPaused() || wasTextSelected || isInputOrTextEreaHasSomeText || isContenteditableHasSomeText || isPlayStopButton || isPlaying || isGooglePresentationHasSomeText || isGoogleDrawing || (isGoogleDocs && !TextManager.isCursorPositionInTheEnd()) || isGooglePdfHasSomeText) {
            return true;
        } else {
            return false;
        };
    };

    self.typing = function (event) {
        if ((isWordOnline && speachManager.isPlaying()) || (isWordOnline && !event.originalEvent instanceof KeyboardEvent)) return;
        if (self.isDisabled()) return true;

        //if (event.keyCode == 113 || event.keyCode == 115) { // prevent crashing range when double highlight using shortcuts
        if (event.code == 'F2' || event.code == 'F4') { // prevent crashing range when double highlight using shortcuts
            return false;
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90)
            || (event.keyCode >= 96 && event.keyCode <= 105) || (event.keyCode >= 37 && event.keyCode <= 40)) {
            speachManager.stop();
        }
        if (!isGoogle) {

        }

        CursorUtils.SetGoogleDocsCursor();
        reloadWords();

        if (!event.shiftKey && !event.ctrlKey && event.keyCode != KeyCodes.shift) {
            clearTimeout(playWordTimeout);
            clearTimeout(playLetterTimeout);

            _audioQueue = null;
            player.unbindEndPlayingEvent();
            //if (player.getIsPlaying()) {
            //    speachManager.stop();
            //}
        }

        playTypedLetter(event);
        playTypedWord(event);
        $('div.itw_dictionary_button').remove();
        return false;
    };

    self.typingInput1 = function (event) {
        //event.preventDefault();
        event.stopPropagation();
        return true;
    };

    self.typingInput = function (event) {
        event.stopPropagation();
        if (self.isDisabled()) return true;
        $('div.itw_dictionary_button').remove();

        if (event.type === "keyup") { //ITWC-1016 Moving with left/right arrows in input field not updating wordpredictions
            if (event.keyCode === KeyCodes.leftArrow || event.keyCode === KeyCodes.rightArrow || event.keyCode === KeyCodes.backspace) {
                reloadWords();
            }
            return true;
        }

        reloadWords();

        if (!event.shiftKey && !event.ctrlKey && event.keyCode != KeyCodes.shift) {
            clearTimeout(playWordTimeout);
            clearTimeout(playLetterTimeout);

            _audioQueue = null;
            player.unbindEndPlayingEvent();
            if (player.getIsPlaying()) {
                speachManager.stop();
            }
        }

        playTypedLetter(event);
        playTypedWord(event);

        return true;
    };

    var reloadWords = function () {
        if (isGooglePresentation || isGoogleDrawing) {
            PubSub.publish(Events.loadWords, null);
            return;
        }
        var wasCollapsed = false;
        var activeElement = CursorUtils.getActiveElement();

        if (CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName == "TEXTAREA") {
            wasCollapsed = (activeElement.selectionStart == activeElement.selectionEnd);
        }
        else {
            wasCollapsed = (!!CursorUtils.Range) ? CursorUtils.Range.isCollapsed() : true;
        }

        if (wasCollapsed) {
            CursorUtils.SaveRange(true);
        }
        else {
            setTimeout(function () {
                CursorUtils.SaveRange(true);
            }, 300);
        }
    };

    self.applySettings = function () {

        self.logger.disposeSubscriptions();
        isLoaded = false;
        self.voiceSpeed(Settings.getInstance().getVOICESPEED());
        self.maxVoiceSpeed(Settings.getInstance().getMaxVolumeSpeed(Settings.getInstance().getVOICETYPE()));
        self.minVoiceSpeed(Settings.getInstance().getMinVolumeSpeed(Settings.getInstance().getVOICETYPE()));
        self.isSentenceFromCursor(!Settings.getInstance().getReadFromCursor());

        self.readLetterNameTyping(Settings.getInstance().getLetterNameTyping());
        self.readLetterSoundTyping(Settings.getInstance().getLetterSoundTyping());
        self.readWordAfterType(Settings.getInstance().getReadWordAfterType());
        self.readSentanceAfterType(Settings.getInstance().getReadSentenceAfterType());

        self.isWordHighlightStrategy(Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.word);
        self.isSentanceHighlightStrategy(Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.sentance);
        self.isDoubleHighlightStrategy(Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.doublehighlight);
        self.logger.loggerModdel.highlightStrategy(Settings.getInstance().getHIGHLIGHTSTRATEGY());

        var userLang = self.uiLanguage();
        self.loginBtnTitle(Translation[userLang].Login_button);
        self.playBtnTitle(Translation[userLang].Play_button);
        self.pauseBtnTitle(Translation[userLang].Pause_button);
        self.stopBtnTitle(Translation[userLang].Stop_button);
        self.voiceSpeedSliderTitle(Translation[userLang].VoiceSpeed_slider);
        self.restoreDialogHeadlineTitle(Translation[userLang].RestoreDialog_headline);
        self.restoreDialogCloseTitle(Translation[userLang].RestoreDialog_close);
        self.noTextToPlayDialogHeadlineTitle(Translation[userLang].NoTextToPlayDialog_headline);
        self.noTextToPlayDialogText(Translation[userLang].NoTextToPlayDialog_text);
        self.pdfOpenDialogHeadlineTitle(Translation[userLang].PdfOpenDialog_headline);
        self.pdfOpenDialogText(Translation[userLang].PdfOpenDialog_text);
        self.couldNotPlayTextDialogHeadlineTitle(Translation[userLang].CouldNotPlayTextDialog_headline);
        self.couldNotPlayTextDialogText(Translation[userLang].CouldNotPlayTextDialog_text);
        self.couldNotPlayTextInDrivePdfViewerDialogHeadlineTitle(Translation[userLang].CouldNotPlayTextInDrivePdfViewerDialog_headline);
        self.couldNotPlayTextInDrivePdfViewerDialogText(Translation[userLang].CouldNotPlayTextInDrivePdfViewerDialog_text);

        self.connectionLostHeadlline(getTranslationString(userLang, 'ConnectionLostDialog_headline'));
        self.text_LostServiceConnection(getTranslationString(userLang, 'LostServiceConnection_text'));
        self.text_LostInternetConnection(getTranslationString(userLang, 'LostInternetConnection_text'));
        self.text_Restore(getTranslationString(userLang, 'Restore_text'));
        self.text_Apps(getTranslationString(userLang, 'Apps_text'));
        self.text_AppPdfViewer(getTranslationString(userLang, 'AppPdfViewer_text'));
        self.text_AppEpubViewer(getTranslationString(userLang, 'AppEpubViewer_text'));
        self.text_AppDictionary(getTranslationString(userLang, 'AppDictionary_text'));
        self.text_AppIntoWords(getTranslationString(userLang, 'AppIntoWords_text'));
        self.text_AppSpecDictionary(getTranslationString(userLang, 'AppSpecPrediction_text'));
        self.text_AppWritingTemplates(getTranslationString(userLang, 'AppWritingTemplates_text'));
        //self.text_AppCommaSuggestion(getTranslationString(userLang, 'AppCommaSuggestion_text'));
        self.text_voiceSpeed(getTranslationString(userLang, 'VoiceSpeed_text'));
        self.text_Predictions(getTranslationString(userLang, 'Predictions_text'));
        self.text_ReadLikeThis(getTranslationString(userLang, 'ReadLikeThis_text'));
        self.text_ReadWhileWriting(getTranslationString(userLang, 'ReadWhileWriting_text'));
        self.text_Highlight(getTranslationString(userLang, 'Highlight_text'));
        self.text_Information(getTranslationString(userLang, 'Information_text'));
        self.text_LogOutUser(getTranslationString(userLang, 'LogOutUser_text'));
        self.text_More(getTranslationString(userLang, 'More_text'));
        self.text_Hide(getTranslationString(userLang, 'Hide_text'));
        self.text_MoreLangs(getTranslationString(userLang, 'MoreLanguages_text'));
        self.text_HideLangs(getTranslationString(userLang, 'HideLanguages_text'));
        self.text_ReadPage(getTranslationString(userLang, 'ReadPage_text'));
        self.text_ReadSentence(getTranslationString(userLang, 'ReadSentence_text'));
        self.text_ReadLetterName(getTranslationString(userLang, 'ReadLetterName_text'));
        self.text_ReadLetterSound(getTranslationString(userLang, 'ReadLetterSound_text'));
        self.text_ReadWord(getTranslationString(userLang, 'ReadWord_text'));
        self.text_ReadSentence(getTranslationString(userLang, 'ReadSentence_text'));
        self.text_HighlightWord(getTranslationString(userLang, 'HighlightWord_text'));
        self.text_HighlightSentence(getTranslationString(userLang, 'HighlightSentence_text'));
        self.text_HighlightWordAndSentence(getTranslationString(userLang, 'HighlightWordAndSentence_text'));

        var settingsUserLanguage = userLang; //Settings.getInstance().getUserLanguage();
        self.isDictionaryAppVisible(settingsUserLanguage == 'da' || settingsUserLanguage == 'nn' || settingsUserLanguage == 'nb' || settingsUserLanguage == 'sv');
        self.isUserLanguageDanish(settingsUserLanguage == 'da');
        self.isUserLanguageNorwegian(settingsUserLanguage === 'nn' || settingsUserLanguage === 'nb');
        self.templatesAvailable(settingsUserLanguage === 'da'
            || settingsUserLanguage === 'nn' || settingsUserLanguage === 'nb'
            || settingsUserLanguage === 'sv');
		self.statisticsAvailable(settingsUserLanguage === 'da'
            || settingsUserLanguage === 'nn' || settingsUserLanguage === 'nb'
            || settingsUserLanguage === 'sv');

        if (predictionsRequired)
            predictionViewModel.applySetting();
        OnSettingsApplied();
        isLoaded = true;
        self.profileIsLoading(false);
        self.viewProfilesEnabled(true);
        self.dictionaryAccessAvailable(self.getDictionaryIndexByLanguage() !== null);
    };

    var saveVoiceSpeedTimeout = null;
    self.voiceSpeed.subscribe(function (newValue) {

        self.logger.loggerModdel.voiceSpeed(newValue);
        if (isLoaded) {
            clearTimeout(saveVoiceSpeedTimeout);
            self.viewProfilesEnabled1(false);
            saveVoiceSpeedTimeout = setTimeout(function () {
                Settings.getInstance().saveVOICESPEED(newValue, function () { self.viewProfilesEnabled1(true); });
            }, 300);
        }
    });

    self.getSessionId = function () {
        self.getCredentials();
    };

    self.settingsApplied;
    self.isFirstTime = true;

    var OnSettingsApplied = function () {

       self.logger.loggerModdel.updateEtalon();
       self.logger.subscribeToMyProperties();
        if ((self.settingsApplied != null) && (self.isFirstTime)) {
            self.settingsApplied();
            self.isFirstTime = false;
            self.getPredictionViewModel().initPredictionsPanel();

            if(self.isLoginButtonPressed()){
                self.logger.loggerModdel.profile_settings(Settings.getInstance().getSettingData());  
                self.isLoginButtonPressed(false);
            }else{
                self.logger.loggerModdel.updateProfileEtalon();
            }
        }

        if((self.settingsApplied != null) && !self.isFirstTime && self.isLoginButtonPressed()){

            self.logger.loggerModdel.ProfileEtalon.active_profile = null;
            self.logger.loggerModdel.profile_settings(Settings.getInstance().getSettingData()); 
            self.isLoginButtonPressed(false);
        }

        calculatePanelWidth();
        self.showPlugin();
    };

    var isDropBoxAndNotSharedLink = function () {
        var dropBoxHostRex = location.href.match(/.dropbox.com\S*/);
        var dropBoxSharedLinkRex = location.href.match(/.dropbox.com\S*.pdf(?=\?dl)/);
        if (dropBoxHostRex && !dropBoxSharedLinkRex) return true;
        return false;
    };

    var isDrivePdfViewerLink = function () {
        var driveHostRex = location.href.match(/drive.google.com\S*/);
        var drivePdfViewer = $('.drive-viewer-paginated-page, .a-c-Z-Ha').length > 0;
        if (driveHostRex && drivePdfViewer) return true;
        return false;
    }

    var isPdfFileViewer = function () {
        var fileNameElement = $('.a-c-S-P-Ye, .drive-viewer-toolstrip-name-sizing');
        var isPdfFile = false;
        if (fileNameElement.length > 0) {
            var fileName = fileNameElement.text();
            isPdfFile = fileName.match(/.pdf$/);
        };
        if (isPdfFile) return true;
        return false;
    };

    self.isPlayPause.subscribe(function (newValue) {
        if(newValue){
            self.logger.loggerModdel.press_play.notifySubscribers();
        }
    });

    self.playText = function (data, event) {
        if (data && data.target &&
            (($(data.target).attr('id') == 'itw_dictionarymain' || $(data.target).parents('div#itw_dictionarymain').length >= 1)
                || ($(data.target).attr('id') == 'itw_predictionsmain' || $(data.target).parents('div#itw_predictionsmain').length >= 1))) {

            return false;
        }

        if (event) event.preventDefault();
        if (isDropBoxAndNotSharedLink()) {
            self.couldNotPlayTextDialog(!self.couldNotPlayTextDialog());
            return false;
        };

        if (isDrivePdfViewerLink()) {
            if (isPdfFileViewer()) {
                self.couldNotPlayTextInDrivePdfViewerDialog(!self.couldNotPlayTextInDrivePdfViewerDialog());
            } else {
                self.couldNotPlayTextDialog(!self.couldNotPlayTextDialog());
            }
            return false;
        };


        //if (location.href.match(/.pdf$|.pdf(?=\?)/)/*&& !isProduction*/) {
        if (document.contentType == 'application/pdf') {
            self.pdfOpenDialog(!self.pdfOpenDialog());
        }
        else {
            if (isWordOnline) {
                var selections = $(CursorUtils.getActiveElementBody()).find('span.Selected');

                if (selections && selections.length > 0) {
                    var start = selections.first();
                    var end = selections.last();
                    var startTextNode = start.get(0).firstChild;
                    var endTextNode = end.get(0).firstChild;

                    if (isPowerPoint && $(endTextNode.parentNode).hasClass("EOP")) {
                        CursorUtils.SetCursorPosition(startTextNode, 0, endTextNode, 0);
                    } else if (isPowerPoint) {
                        CursorUtils.SetCursorPosition(startTextNode, 0, endTextNode, endTextNode.length);
                    } else {
                        CursorUtils.setSelection(startTextNode, 0, endTextNode, endTextNode.length);
                    }
                } else if (window.getSelection().baseNode && CursorUtils.GetCursorPosition() == null) {
                    CursorUtils.SetCursorPosition(window.getSelection().baseNode, window.getSelection().baseOffset)
                }
            }

            if(CursorUtils.getActiveElement().nodeName == "INPUT" && CursorUtils.getActiveElement().type === 'checkbox')
            {
                return false;
            }

            if (haveTextToPlay()) {
                if (isGoogleDocs) {
                    if (data && data.type === 'dblclick') {
                        var word = CursorUtils.getTextAndBoundingClientRectFromSelectionRange(CursorUtils.GetCursorPosition()).text;

                        if (word && word.length > 0) {
                            word = word.replace(/\u200B/g, '').trim();

                            ClientManager.getInstance().speach.speak(word, false, function (json) {
                                player.unbindEndPlayingEvent();
                                player.play(json);
                            });
                        }

                        return false;
                    }
                    else {
                        CursorUtils.SetGoogleDocsCursor();
                    }
                }
                else if (isGoogle) {
                    speachManager.playPause();
                    return false;
                }

                var startIndex = CursorUtils.GetCursorPosition().getStartOffset();
                //if (speachManager.canBePlayed(startIndex)) {              
                speachManager.playPause();
                if (speachManager.isPlaying()) {
                    PubSub.publish(Events.removeWords, null);
                }
                //}
            }
            else if (CursorUtils.getActiveElement().type != "password") {
                self.noTextToPlayDialog(!self.noTextToPlayDialog());
            }
        }
        return false;
    };

    self.stopText = function (data, event) {
        if (event == null || (event && !$(event.target).hasClass('disabled'))) {
            speachManager.stop();

            if (isGoogleDocs) {
                CursorUtils.SetGoogleDocsCursor();
            }

            PubSub.publish(Events.loadWords, null);
        }
    };

    //******************************************************************
    self.onActivate = function (mv_session_id, disabled) {
        //if(mv_session_id != null && !mainViewModel.isLoggedIn()) {
        mainViewModel.isDisabled(disabled);
        if (!disabled) {
            mainViewModel.isLoggedIn(mv_session_id != 'null');
            var callback = self.isInited() ? mainViewModel.update : mainViewModel.init;
            //if(self.profiles.length == 0&&callback==null)calback = mainViewModel.update;
            Settings.getInstance().setSessionID(mv_session_id);

            callback();
            //ClientManager.getInstance().loadDescrioptions(callback);
        }

        if (disabled) {
            $('div#itw_panel_bar').hide();
            $('div#itw_panel').hide();
            $('div#itw_panel').css('visibility', 'hidden');
            $('div#itw_predictionsmain').hide();
            $('div#itw_dictionarymain').hide();
            self.stopText();
        }
        else {
            $('div#itw_panel_bar').show();
            $('div#itw_panel').show();
            $('div#itw_panel').css('visibility', 'visible');
            if (predictionViewModel.isPredictionVisible() && isActiveElementEditable()) {
                $('div#itw_predictionsmain').show();
            } else {
                $('div#itw_predictionsmain').hide();
            }
            predictionViewModel.dictionaryWordsCollapsed(false);
        }
    };

    var dictionariesList;

    self.update = function () {
        //ClientManager.getInstance().settings.checkIfUserHasAccess(function () {
        ClientManager.getInstance().permission.hasPermission(function () {
            mainViewModel.settingsApplied = function () {
                if (isGoogleSpreadsheet) {
                    $('body').on('mousedown', mainViewModel.mousedown);
                    $('body').on('mouseup', mainViewModel.mouseclick);
                    $('body').on('keyup', mainViewModel.typing);
                    $('body').off('dblclick.itw');
                    $('body').on('dblclick.itw', mainViewModel.dblclick);
                }
                else if (isGooglePresentation || isGoogleDrawing) {
                    $('div#workspace-container').on('mousedown', mainViewModel.mousedown);
                    $('div#workspace-container').on('mouseup', mainViewModel.mouseclick);
                    var iframe = document.getElementsByClassName("docs-texteventtarget-iframe")[0];
                    if (iframe) {
                        iframe.contentDocument.addEventListener("keypress", mainViewModel.typing, false);
                        //iframe.contentDocument.addEventListener("keyup", mainViewModel.typing, false);
                    }
                }
                else if (isGoogleDocs) {
                    $('div.kix-appview-editor').on('mousedown', mainViewModel.mousedown)
                        .on('mouseup', mainViewModel.mouseclick);

                    $('div.kix-appview-editor').off('dblclick.itw', mainViewModel.playText)
                        .on('dblclick.itw', mainViewModel.playText);

                    var iframe = document.getElementsByClassName("docs-texteventtarget-iframe")[0];

                    if (iframe) {
                        //iframe.contentDocument.addEventListener("keypress", mainViewModel.keyPress, false);
                        iframe.contentDocument.addEventListener("keyup", mainViewModel.typing, false);
                    }
                } else {
                    if (isExcel) {
                        $("#MainApp").on("click", "table.ewr-grdcontarea-ltr", function (event) {

                            mainViewModel.mousedown(event);
                            mainViewModel.mouseclick(event);
                        });
                        $("input:not([type='password']), textarea")
                            .off('mousedown.itw')
                            .off('mouseup.itw')
                            .off('dblclick.itw')
                            .on('mousedown.itw', mainViewModel.mousedown)
                            .on('mouseup.itw', mainViewModel.mouseclick)
                            .on('dblclick.itw', mainViewModel.playText);
                    }
                    else if (!isWordOnline) {
                        $(document).on('mousedown', mainViewModel.mousedown)
                            .on('mouseup', mainViewModel.mouseclick)
                            .on('dblclick.itw', mainViewModel.playText);
                    }
                    else {
                        if (isPowerPoint) {
                            $('div.FishBowlPanel').on('mouseup', mainViewModel.mousedown)
                            .on('mouseup', mainViewModel.mouseclick);
                        }
                        else {
                            $('div#WACViewPanel').on('mouseup', mainViewModel.mousedown).on('mouseup', mainViewModel.mouseclick);
                            $('#WACViewPanel_EditingElement').on('dblclick', mainViewModel.wordOnlineDblClick);
                        }
                    }

                    $("[contenteditable='true']")
                        .off('keyup.itw')
                        .off('focusin.itw')
                        .off('focusout.itw')
                        .on('keyup.itw', mainViewModel.typing)
                        .on('focusin.itw', mainViewModel.focusin)
                        .on('focusout.itw', mainViewModel.focusout);

                    $("[contenteditable='plaintext-only']")
                        .off('keyup.itw')
                        .off('focusin.itw')
                        .off('focusout.itw')
                        .on('keyup.itw', mainViewModel.typing)
                        .on('focusin.itw', mainViewModel.focusin)
                        .on('focusout.itw', mainViewModel.focusout);

                    $("input:not([type='password']), textarea")
                        .off('keyup.itw')
                        .off('focusin.itw')
                        .off('focusout.itw')
                        .on('keyup.itw', mainViewModel.typingInput)
                        .on('keypress.itw', mainViewModel.typingInput)
                        .on('focusin.itw', mainViewModel.focusin)
                        .on('focusout.itw', mainViewModel.focusout);

                    predictionViewModel.initShortcutsForElements($("[contenteditable='true']"));
                    predictionViewModel.initShortcutsForElements($("input, textarea"));
                    predictionViewModel.initShortcutsForElements($("[contenteditable='plaintext-only']"));

                    observeDOM(document.body, function () {
                        bindIframeEvents();
                    });

                    bindIframeEvents();
                }

                if ($.trim($('div#itw_ddlDictionary').html()) == '') {
                    ClientManager.getInstance().dictionary.getDictionaries(function (json) {
                        dictionariesList = json;

                        if (json.length > 0) {
                            var dictIdsArray = [];
                            var browserLanguage = self.localBrowserLanguage;
                            switch (browserLanguage) {
                                case "nb": // If the browser is Norwegian.
                                    dictIdsArray = [2, 7, 14, 12, 13, 23, 16, 20, 15, 19, 11, 1, 9, 26, 18, 25, 29, 28, 32, 27, 30, 8, 33, 17, 22, 24, 35, 21, 34, 31, 10];
                                    break;
                                case "sv": // If the browser is Swedish.
                                    dictIdsArray = [8, 33, 17, 22, 24, 35, 21, 34, 31, 10, 1, 9, 26, 18, 25, 29, 28, 32, 27, 30, 2, 7, 14, 12, 13, 23, 16, 20, 15, 19, 11];
                                    break;
                                default: // If the browser is Danish or any other.
                                    dictIdsArray = [1, 9, 26, 18, 25, 29, 28, 32, 27, 30, 2, 7, 14, 12, 13, 23, 16, 20, 15, 19, 11, 8, 33, 17, 22, 24, 35, 21, 34, 31, 10, 36];
                                    break;
                            }
                            if (dictIdsArray.length > 0) {
                                $.each(json, function () {
                                    this.priority = json.length;
                                });
                                for (var i = 0; i < dictIdsArray.length; i++) {
                                    var dictiondary = json.find(function (obj) {
                                        return obj.dictID === dictIdsArray[i];
                                    });
                                    if (dictiondary) {
                                        dictiondary.priority = i + 1;
                                    }
                                }
                                json.sort(function (a, b) {
                                    return a.priority - b.priority;
                                });
                            }
                            dictionariesList = json;

                            var ddl = $('div#itw_ddlDictionary');
                            var selected = $('<div class="itw_dictionaryItem selected"></div>');
                            var divFlags = $('<div class="itw_flags" title="@Translation.DictionaryTitle" onmouseenter="EnterStructure(\'@Translation.DictionaryTitle.Replace("\n"," ").Replace("\r"," ")\', \'@ViewBag.language\')" onmouseleave="ExitStructure()"></div>');
                            selected.append('<div class="itw_name">' + json[0].Name + '</div>');

                            if (json[0].Lang1 != json[0].Lang2) {
                                divFlags.append('<div class="itw_flag flag_2 flag_' + json[0].Lang2 + '"></div>');
                            }
                            else {
                                selected.find('div.itw_name').addClass('oneflag');
                            }

                            divFlags.append('<div class="itw_flag flag_' + json[0].Lang1 + '"></div>');
                            selected.append(divFlags);
                            selected.data('id', json[0].dictID);
                            selected.data('lang', { lang1: json[0].Lang1, lang2: json[0].Lang2 });
                            ddl.append(selected);
                            var ul = $('<ul class="dropdown"></ul>');

                            for (var i = 0; i < json.length; i++) {
                                var li = $('<li class="itw_dictionaryItem"></li>');
                                divFlags = $('<div class="itw_flags"></div>');
                                li.append('<div class="itw_name">' + json[i].Name + '</div>');

                                if (json[i].Lang1 != json[i].Lang2) {
                                    divFlags.append('<div class="itw_flag flag_2 flag_' + json[i].Lang2 + '"></div>');
                                }
                                else {
                                    li.find('div.itw_name').addClass('oneflag');
                                }
                                if (json[i].Name == 'Sundhedsfaglig ordbog'){
                                    divFlags.append('<div class="itw_flag flag_health"></div>');
                                } else {
                                    divFlags.append('<div class="itw_flag flag_' + json[i].Lang1 + '"></div>');
                                }

                                li.append(divFlags);
                                li.data('id', json[i].dictID);
                                li.data('lang', { lang1: json[i].Lang1, lang2: json[i].Lang2 });

                                ul.append(li);
                            }
                            ddl.append(ul);

                            ddl.dc_dropdown({
                                onChange: function (val) {
                                    var word = $('div#itw_dictionarymain').data('word');

                                    if (word && word != '') {
                                        self.loadDictionaryWordDescription(word, val);
                                    }

                                    return false;
                                }
                            });
                        }

                        self.dictionaryAccessAvailable(self.getDictionaryIndexByLanguage() !== null);
                    });
                }

                if (predictionsRequired) {
                    CursorUtils.SetGoogleDocsCursor();
                }
                else {
                    $('div#itw_predictionsonoff').remove();
                }
            };
            ClientManager.getInstance().session.checkSessionId();
            mainViewModel.getSessionId();
            initShortcuts();
            predictionViewModel.isEditableElement(isActiveElementEditable());

            if (isGoogleDocs) {
                CursorUtils.SetGoogleDocsCursor();
                PubSub.publish(Events.loadWords, null);
            }
        });
        isSentenceFromCursorToggleVisibility();
        ClientManager.getInstance().permission.hasAppPermission(ClientManager.commaSuggestionsAccessIdentifier, function (result) {
            self.isCommaSuggestionAppAvailable(result && localBrowserLanguage == 'da');
        });

        var mivoLanguageIndex = self.mivoSupportedLanguages.indexOf(localBrowserLanguage.substring(0,2));
        if (mivoLanguageIndex < 0 || !self.mivoSupportedLanguages[mivoLanguageIndex]) {
            self.isMivoAppAvailable(false);
        } else {
            self.isMivoLanguageAvailable(true);
            var mivoLanguage = self.mivoSupportedLanguages[mivoLanguageIndex].substring(0,2);
            if (mivoLanguage && ClientManager[mivoLanguage + 'MivoAccessIdentifier']) {
                ClientManager.getInstance().permission.hasAppPermission(ClientManager[mivoLanguage + 'MivoAccessIdentifier'], function (result) {
                    self.isMivoAppAvailable(result);
                });
            }
        }
        
        var grammateketLanguageIndex = self.grammateketSupportedLanguages.indexOf(localBrowserLanguage.substring(0,2));
        if (grammateketLanguageIndex < 0 || !self.grammateketSupportedLanguages[grammateketLanguageIndex]) {
            self.isGrammateketAppAvailable(false);
        } else {
            self.isGrammateketLanguageAvailable(true);
            var grammateketLanguage = self.grammateketSupportedLanguages[grammateketLanguageIndex].substring(0,2);
            if (grammateketLanguage && ClientManager[grammateketLanguage + 'GrammateketAccessIdentifier']) {
                ClientManager.getInstance().permission.hasAppPermission(ClientManager[grammateketLanguage + 'GrammateketAccessIdentifier'], function (result) {
                    self.isGrammateketAppAvailable(result);
                });
            }
        }
    };

    var playHoveredTextTimeout;

    self.onTextHover = function (data, event) {
        if (!player.getIsPlaying() && predictionViewModel.readWords()) {
            if (!event) event = data;
            $(event.target).data('hovered', true);
            clearTimeout(playHoveredTextTimeout);
            $(event.target).off('mouseout').on('mouseout', function () { $(event.target).data('hovered', false); clearTimeout(playHoveredTextTimeout); hoverplayer.stop(); });
            playHoveredTextTimeout = setTimeout(
                function () {
                    var voiceId = Settings.getInstance().getUserVoiceIdByBrowserLanguage(getLocalBrowserLanguage());
                    ClientManager.getInstance().speach.speak($(event.target).text(), false, function (json) { // playing
                        if ($(event.target).data('hovered')) {
                            hoverplayer.unbindEndPlayingEvent();
                            hoverplayer.play(json);
                        }
                    }, true, voiceId);
                }, 500);
        }
    };
    //***********************

    self.logger = new Logger();
    self.logger.init();
    
    if (predictionsRequired) {
        predictionViewModel = new PredictionViewModel(this);
        ko.cleanNode($('div#itw_predictionsmain')[0]);
        ko.applyBindings(predictionViewModel, $('div#itw_predictionsmain')[0]);
    } else {
        predictionViewModel = new PredictionViewModel(this);
        predictionViewModel.isPredictionVisible(false);
    }

    MainViewModel.stoped = function () {
        CursorUtils.SaveRange(true);
    };

    Settings.getInstance().registerLoaded(self.applySettings);

    MainViewModel.playPause = function () {
        self.playText();
    };

    MainViewModel.stop = function () {
        self.stopText();
    };

    MainViewModel.isPlaying = function () {
        return self.isPlayPause();
    };

    MainViewModel.isSentenceFromCursor = function () {
        return self.isSentenceFromCursor();
    };

    //constructore code
    Settings.getInstance().registerLoaded(self.refreshProfiles);

    var initShortcuts = function () {
        var target = (isGoogle && (isGoogleDocs || isGooglePresentation || isGoogleDrawing) && !isGoogleSpreadsheet)
            ? { 'target': document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument }
            : null;

        shortcut.remove('F2');
        shortcut.remove('F4');

        shortcut.add('F2', function (key) {
            //if (!MainViewModel.isPlaying()) {         
            MainViewModel.playPause();
            //}        
        }, target);

        shortcut.add('F4', function (key) {
            self.stopText();
        }, target);
    };

    self.showPlugin = function () {
        $('div#itw_panel_bar').show();
        $('div#itw_panel_bar').css('visibility', 'visible');
        $('div#itw_panel').css('visibility', 'visible');
    };

    self.init = function () {
        var itw_panel_bar = (isGooglePdf || predictionsRequired) ? $('div#itw_panel') : $('div#itw_panel_bar');
        ko.cleanNode(itw_panel_bar[0]);
        ko.applyBindings(mainViewModel, itw_panel_bar[0]);
        ko.applyBindings(mainViewModel, $('div#itw_dictionarymain')[0]);
        var win = $(window);

        chrome.storage.local.get('itw_panel_bar_left', function (value) {
            if (value.itw_panel_bar_left) {
                if (value.itw_panel_bar_left < 0) value.itw_panel_bar_left = 0;
                itw_panel_bar.css('left', value.itw_panel_bar_left * win.width() / 100 + 'px');
            }
        });
        chrome.storage.local.get('itw_panel_bar_top', function (value) {
            if (value.itw_panel_bar_top) {
                if (value.itw_panel_bar_top < 0) value.itw_panel_bar_top = 0;
                itw_panel_bar.css('top', value.itw_panel_bar_top * win.height() / 100 + 'px');
            }
        });
        var draggableContainment = (isGoogle && isGooglePdf) ? $('.drive-viewer-carousel-slide ') : "window";
        itw_panel_bar.draggable({
            containment: draggableContainment,
            scroll: false,
            stop: function (event, ui) {
                chrome.storage.local.set({ 'itw_panel_bar_left': parseInt(itw_panel_bar.css('left').replace('px', '')) * 100 / win.width() }, function () { });
                chrome.storage.local.set({ 'itw_panel_bar_top': parseInt(itw_panel_bar.css('top').replace('px', '')) * 100 / win.height() }, function () { });
            }
        }).css('position', 'fixed');

        $(window).resize(function () {
            if ($('div#itw_panel').css('left').replace('px', '') > win.width() - $('div#itw_panel').width()) {
                var left = win.width() - $('div#itw_panel').width();
                $('div#itw_panel').css('left', left + "px");
            }
            if ($('div#itw_panel').css('top').replace('px', '') > win.height() - $('div#itw_panel').height()) {
                var top = win.height() - $('div#itw_panel').height();
                $('div#itw_panel').css('top', top + "px");
            }
        });

        function dragFix(event, ui) {
            var containment = draggableContainment === "window" ? window : draggableContainment;
            var contWidth = $(containment).width(), contHeight = $(containment).height();
            
            ui.position.left = Math.max(-290, Math.min(ui.position.left / 1, contWidth - ui.helper.width() + 290));
            ui.position.top = Math.max(0, Math.min(ui.position.top / 1, contHeight - ($("#itw_dictionarymain #itw_dictionarynav").height() + $("#itw_dictionarymain .itw_moveclose").height())));
        }

        var itw_dictpanel_bar = $('div#itw_dictionarymain');
        itw_dictpanel_bar.draggable({
            drag: dragFix,
            scroll: false,
            stop: function (event, ui) {

            }
        }).css('position', 'fixed');

        self.isInited(true);
        document.getElementById('itw_panel').addEventListener('click', function (e) {
            if (isErrorMessageShown) {
                isErrorMessageShown = false;
            };
        });
        ClientManager.setServiceErrorCallback(function (result) {
            self.showPlugin();
            if (!isErrorMessageShown) {
                if (navigator.onLine) {
                    self.connectionLostDialogText(self.text_LostServiceConnection());
                } else {
                    self.connectionLostDialogText(self.text_LostInternetConnection());
                }
                self.connectionLostDialog(!self.connectionLostDialog());
                PubSub.publish(Events.relogin, null);
                isErrorMessageShown = true;
                speachManager.stop();
            };
        });
        calculatePanelWidth();
        if (!mainViewModel.isLoggedIn() || mainViewModel.isDisabled()) {
            //ClientManager.getInstance().session.checkSessionId();
            //calculatePanelWidth();
            return;
        }

        mainViewModel.update();
    };

    self.restoreDialogButtons = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.restoreDialog(false);
                    Settings.getInstance().restoreSettings();
                }
            }
        ];
    };

    self.pdfOpenDialogButtons = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.pdfOpenDialog(false);
                    var href = location.href
                    if (location.href.match(/.dropbox.com\S*.pdf|.dropbox.com\S*.pdf(?=\?)/)) {
                        var index = href.indexOf('.pdf?');
                        if (index != -1) {
                            href = href.substring(0, href.indexOf('.pdf?') + 5) + "dl=1";
                        } else {
                            href = href + "?dl=1";
                        }
                    };
                    ClientManager.getInstance().settings.saveSettingsForPdfViewer(self.profilesInfo, function (result) {
                    });
                    if (isProduction) {
                        window.open('https://online.intowords.com/pdfviewer/file?url=' + href, '_blank');
                    } else {
                        window.open('http://devintowords.mv-nordic.com/pdfviewer/file?url=' + href, '_blank');
                    }

                }
            }
        ];
    };

    self.ButtonsForNoTextToPlayDialog = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.noTextToPlayDialog(false);
                }
            }
        ];
    };
    self.ButtonsForNoUserAccessDialog = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.noUserAccessDialog(false);
                }
            }
        ];
    };
    self.ButtonsForConnectionLostDialog = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.connectionLostDialog(false);
                }
            }
        ];
    };
    self.ButtonsForCouldNotPlayTextDialog = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.couldNotPlayTextDialog(false);
                }
            }
        ];
    };
    self.ButtonsForCouldNotPlayTextInDrivePdfViewerDialog = function () {
        return [
            {
                text: Translation[localBrowserLanguage].Label_Ok, click: function () {
                    self.couldNotPlayTextInDrivePdfViewerDialog(false);
                }
            }
        ];
    };

    self.customDialogText = function () {
        var selectedProfile = self.selectedProfile();
        var userLanguage = self.uiLanguage() == null ? localBrowserLanguage : self.uiLanguage();
        var profileName = "";
        if (selectedProfile) {
            profileName = self.getProfileTooltips(selectedProfile);
        }
        return Translation[userLanguage].RestoreDialog_Description.replace("{PROFILE}", profileName);
    };

    self.selectedProfile.subscribeChanged(function (newValue, oldValue) {
        if (oldValue != newValue) {
            self.readWhileWritingExpanded(false);
            self.highlightExpanded(false);
            self.readStrategyExpanded(false);

            self.profileIsLoading(!!newValue);
        }
    });

    self.restoreDialog = ko.observable(false);
    self.noTextToPlayDialog = ko.observable(false);
    self.pdfOpenDialog = ko.observable(false);
    self.noUserAccessDialog = ko.observable(false);
    self.connectionLostDialog = ko.observable(false);
    self.couldNotPlayTextDialog = ko.observable(false);
    self.couldNotPlayTextInDrivePdfViewerDialog = ko.observable(false);

    self.showHideRestoreDialog = function () {
        self.restoreDialog(!self.restoreDialog());
    };

    var isSentenceFromCursorToggleVisibility = function () {
        if (isActiveElementEditable()) {
            self.isSentenceFromCursorVisible(true);
        } else {
            self.isSentenceFromCursorVisible(false);
            self.isSentenceFromCursor(false);
        }
    };

    self.logOutUser = function (data, event) {
        self.toggleOptions();
        mainViewModel.isLoggedIn(false);
        Settings.getInstance().setSessionID("");
        chrome.runtime.sendMessage('clearCookies');
    };
    self.isChromeOS = ko.computed(function () {
        return /cros/.test(navigator.userAgent.toLowerCase());
        //return true;
    });
};

MainViewModel.init = function (disabled) {
    $('div#itw_panel_bar').hide();
    $('div#itw_panel').css('visibility', 'hidden');
    $('div#itw_predictionsmain').hide();
    $('div#itw_dictionarymain').hide();
    mainViewModel = new MainViewModel();
    mainViewModel.isLoggedIn(Settings.getInstance().getSessionID() != null);
    mainViewModel.isDisabled(disabled);
    PubSub.subscribe(Events.relogin, function () {
        if (noUserAccess) {
            mainViewModel.noUserAccessDialog(!mainViewModel.noUserAccessDialog());
        }

        mainViewModel.isLoggedIn(false);
        $('div#itw_dictionarymain').hide();

        if (mainViewModel.optionsExpanded()) {
            mainViewModel.toggleOptions();
        }

        chrome.runtime.sendMessage('clearCookies');
    });
    if (!disabled) {
        if (mainViewModel.isLoggedIn()) {
            var isErrorMessageShown = false;
            ClientManager.setServiceErrorCallback(function (result) {
                mainViewModel.showPlugin();
                if (!isErrorMessageShown) {
                    try {
                        var itw_panel_bar = (isGooglePdf || predictionsRequired) ? $('div#itw_panel') : $('div#itw_panel_bar');
                        ko.cleanNode(itw_panel_bar[0]);
                        ko.applyBindings(mainViewModel, itw_panel_bar[0]);
                    } catch (e) {
                        console.log(e);
                    }
                    setTimeout(function () {
                        if (result.status == 404) {
                            mainViewModel.connectionLostDialogText(mainViewModel.text_LostServiceConnection());
                        }
                        mainViewModel.connectionLostDialog(!mainViewModel.connectionLostDialog());
                        PubSub.publish(Events.relogin, null);
                    }, 0);
                    isErrorMessageShown = true;
                    // speachManager.stop();
                };
            });
            mainViewModel.init();
            //ClientManager.getInstance().loadDescrioptions(mainViewModel.init);
        }
        else {
            mainViewModel.showPlugin();
            //$('div#itw_predictionsmain').show();
            mainViewModel.init();
        }
    }
};
