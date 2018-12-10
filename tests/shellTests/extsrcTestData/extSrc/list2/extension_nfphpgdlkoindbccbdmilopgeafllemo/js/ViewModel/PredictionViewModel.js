function PredictionViewModel(mainviewmodel) {
    var getTranslationString = function(userLang, string) {
        return (Translation[userLang]) ?
            ((Translation[userLang][string]) ? Translation[userLang][string] : Translation['da'][string]) :
            Translation['da'][string];
    };
    var self = this;
    self.mainViewModel = mainviewmodel;
    self.wordsServerResult = [];
    self.allPredictedWords = ko.observableArray();
    self.allPredictedWordsPager = ko.observableArray();
    self.allDictionaryWords = ko.observableArray();
    self.allDictionaryWordsPager = ko.observableArray();
    self.predictedWordsCount = ko.observable(7);
    self.dictionaryWordsCount = ko.observable(3);
    self.shownWordsCount = ko.observable(0);
    self.shownDictionaryWordsCount = ko.observable(0);

    self.wordsOffsetNumber = ko.observable(0);
    self.predictedWords = ko.observableArray();
    self.dictionaryWords = ko.observableArray();

    self.dictionaryWordsCollapsed = ko.observable(false);
    self.toggleDictionaryWords = function (data, event) {
        self.dictionaryWordsCollapsed(!self.dictionaryWordsCollapsed());
    };
    self.isDictionariesSelected = ko.observable(true);

    self.selectedWord = ko.observable();
    self.selection = null;
    self.wordPlayer = new Player();
    self.savedPredictionWords = "";

    var LOADING_INTERVAL = $('#sdx_ow_iframe_loader').length > 0 ? 700 : 300;
    var PLAYING_INTERVAL = 250;
    var loadingTimer;
    var playingTimer;

	var presLeft = 0;
	var presRight = 0;

    //**********Options***************
    var isLoaded = false;

    self.isPredictionVisible = ko.observable();
    self.isEditableElement = ko.observable();
    self.showPrediction =  ko.computed(function() {        
	    return (self.mainViewModel.predictionsSupported() && self.isPredictionVisible() && (self.isEditableElement() || isWordOnline));
    });
    self.specDictSupported = ko.computed(function () {
        return self.mainViewModel.specDictSupported();
    });
    self.dictionaryOn = ko.observable();
    self.showAlternatives = ko.observable();
    self.readWords = ko.observable();    
    self.numberOfPredictionWords = ko.observable();       
    self.isPredictNextWord = ko.observable();
    self.isShortcutsShown = ko.observable();
    self.isDblClicked = false;
    
    self.availableMaxWordLength = ko.observableArray();
    self.numberOfWords = ko.observable();
    self.topicDictionaries = ko.observableArray();
    self.maxwordlength = ko.observable();
    
    self.possibleNumberOfPredictionWords = ko.observableArray();

	self.showWordListBtnTitle = ko.observable();
	self.shortcutsBtnTitle = ko.observable();
	self.alternativesBtnTitle = ko.observable();
	self.predictionBtnTitle = ko.observable();
	self.speechBtnTitle = ko.observable();

	self.text_Predictions = ko.observable(getTranslationString('da', 'Predictions_text'));
    self.text_Dictionary = ko.observable(getTranslationString('da', 'Dictionary_text'));
    self.text_SpecificPredictions = ko.observable(getTranslationString('da', 'SpecificPredictions_text'));
    self.text_SpellHelp = ko.observable(getTranslationString('da', 'SpellHelp_text'));
    self.text_SuggestNextWord = ko.observable(getTranslationString('da', 'SuggestNextWord_text'));

    self.text_wildcardAsterisk = ko.observable(self.mainViewModel.getTranslationString('da', 'WildcardAsterisk_text'));
    self.text_wildcardNumberSign = ko.observable(self.mainViewModel.getTranslationString('da', 'WildcardNumberSign_text'));
	
	self.preventTouchStart = function (data, event) {
        event.preventDefault();
        return false;
    };

    fillPossibleNumberOfPredictionWords = function () {
        var values = Settings.getInstance().getPosibleWordsNumberPrediction();
        if ((values != null) && (typeof values == "object") && (values instanceof Array) && (values.length == 2))
        {
            for (var i = values[0]; i <= values[1]; i++) { 
                self.possibleNumberOfPredictionWords.push(i);
            }
        }
    };

    self.isPredictionVisible.subscribe(function (newValue) {

        self.mainViewModel.logger.loggerModdel.isPredictionVisible(newValue);
        if (isLoaded) {
			//if(!isProduction)
            Settings.getInstance().saveIsWordlistShown(newValue, null);
			if(newValue) {
				self.LoadWords();
			}
			else {
				self.RemoveWords();
			}
        }
    });

    self.showAlternatives.subscribe(function (newValue) {

        self.mainViewModel.logger.loggerModdel.showAlternatives(newValue);
        if (isLoaded) {
		//if(!isProduction)
            Settings.getInstance().saveIsAlternativeShown(newValue, null);
			settingsChanged();
        }
    });

    self.readWords.subscribe(function (newValue) {
        if (isLoaded) {
		//if(!isProduction)
            Settings.getInstance().saveHasToReadPredictionWords(newValue, null);
			settingsChanged();
        }
    });

    self.isPredictNextWord.subscribe(function (newValue) {

        self.mainViewModel.logger.loggerModdel.isPredictNextWord(newValue);
        if (isLoaded) {
		//if(!isProduction)
			Settings.getInstance().savePredictNextWord(newValue, null);
            settingsChanged();
        }
    });
    
    self.isShortcutsShown.subscribe(function (newValue) {
        if (isLoaded) {
		//if(!isProduction)
			Settings.getInstance().saveIsShortcutsShown(newValue, null);
        }
    });

    self.dictionaryOn.subscribe(function (newValue) {
        if (isLoaded) {                        
            Settings.getInstance().saveShowTopicWords(newValue);
        }
    });

    self.applySetting = function () {
        isLoaded = false;
        self.isPredictionVisible(Settings.getInstance().getIsWordlistShown());
        
		self.isShortcutsShown(Settings.getInstance().getIsShortcutsShown() && !isOneNote);
		self.showAlternatives(Settings.getInstance().getIsAlternativeShown());
        self.isPredictNextWord(Settings.getInstance().getPredictNextWord());
		self.readWords(Settings.getInstance().getHasToReadPredictionWords());
        self.maxwordlength(Settings.getInstance().getMAXWORDLENGTH());
        self.numberOfWords(Settings.getInstance().getNumberOfWordsPrediction());
		self.numberOfPredictionWords(Settings.getInstance().getWordsNumberPrediction());
        
		settingsChanged();
		
		var userLang = self.mainViewModel.uiLanguage();
		self.showWordListBtnTitle(Translation[userLang].ShowWordList_menu);
		self.shortcutsBtnTitle(Translation[userLang].Shortcuts_button);		
		self.alternativesBtnTitle(Translation[userLang].Alternatives_button);	
		self.predictionBtnTitle(Translation[userLang].Prediction_button);	
		self.speechBtnTitle(Translation[userLang].Speech_button);

		self.text_Predictions(getTranslationString(userLang, 'Predictions_text'));
        self.text_Dictionary(getTranslationString(userLang, 'Dictionary_text'));
        self.text_SpecificPredictions(getTranslationString(userLang, 'SpecificPredictions_text'));
        self.text_SpellHelp(getTranslationString(userLang, 'SpellHelp_text'));
        self.text_SuggestNextWord(getTranslationString(userLang, 'SuggestNextWord_text'));
		
	    self.text_wildcardAsterisk(self.mainViewModel.getTranslationString(userLang, 'WildcardAsterisk_text'));
	    self.text_wildcardNumberSign(self.mainViewModel.getTranslationString(userLang, 'WildcardNumberSign_text'));

        var topicDictionaries = Settings.getInstance().getTopicDictionaries();
        var isDictionariesSelected = false;

        $.each(topicDictionaries, function (index, dict) {
            if (dict.included && dict.group != 0) {
                isDictionariesSelected = true;
                return false;
            }
        });

        self.isDictionariesSelected(isDictionariesSelected);
        var predictedWordsCount = self.isDictionariesSelected() && self.specDictSupported() ? 7 : 10;

        //if (self.predictedWordsCount() != predictedWordsCount) {
            self.predictedWordsCount(predictedWordsCount);
            self.dictionaryWordsCount(3);
            self.initPredictionsPanelResizales();

            self.SetPredictionWords(self.wordsServerResult);
            self.SetDictionaryWords(self.wordsServerResult);
        //}
        self.dictionaryOn(Settings.getInstance().getShowTopicWords());
        isLoaded = true;
        self.dictionaryOn(true);
    };

    settingsChanged = function () {
        self.LoadWords();
    };

    //*******************************************

    //****************Play words******************

    self.selectAndPlay = function (item) {
        canPlay = true;
        self.select(item);
        self.playWord(item);
        wasMouseOver = true;
    };

    var canPlay = true;
    var wasMouseOver = false;

    self.playWord = function (item) {
        if (!wasMouseOver) {
            if (self.readWords()) {
                clearTimeout(playingTimer);
                playingTimer = setTimeout(function () {
                    if (canPlay) {
                        ClientManager.getInstance().speach.speak(item.word, false, function (json) {
                            if ((!!json) && (canPlay)) {
                                self.wordPlayer.play(json);
                            }
                        });
                    }
                }, PLAYING_INTERVAL);
            }
        }
    };

    self.stopPlaying = function (data, e) {
        if (!e) var e = window.event;
        var tg = $('#listwords li').get(self.predictedWords.indexOf(self.selectedWord()));
        var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
        while ((reltg) && (reltg != tg) && (reltg.nodeName != 'BODY')) {
            reltg = reltg.parentNode;
        }
        if (reltg == tg) return;

        self.stopWord(data);
    };

    self.stopWord = function (data) {
        self.wordPlayer.pause();
        canPlay = false;
        wasMouseOver = false;
    };


    //***************************************
    self.preWordClick = function (item) {
		self.select(item);
        self.insertWordClick(item, true);        
    };

    var getEndTextOfWord = function (startNode, startPosition) {
        if (isPowerPoint) {
            var nodeText = "";
            while (startNode) {
                var endWordText = $(startNode).text().slice(startPosition);
                for (var i = 0; i < endWordText.length; i++) {
                    if (!TextManager.isBreakSymbol(endWordText[i])) {
                        nodeText += endWordText[i];
                    } else {
                        startNode = null;
                        break;
                    }
                };

                var nextNode = $(startNode).closest(".TextRun");
                if (nextNode.get(0) && nextNode.get(0).nextSibling && TextManager.isBreakSymbol($(nextNode.get(0).nextSibling).text())) {
                    break;
                }

                startPosition = 0;
                startNode = TextManager.getNextTextNode(startNode);
                if (startNode && startNode.className == "EOP") break;
                if (!isWordOnline)
                    nodeText += ' '; // we go to next line and have to divide them with space   -- ToDo: check if there is - (sign)            
            }          
        } else {
            var nodeText = '';
            while (startNode) {
                var endWordText = $(startNode).text().slice(startPosition);
                for (var i = 0; i < endWordText.length; i++) {
                    if(isWordOnline || !TextManager.isBreakSymbol(endWordText[i])){
                        nodeText += endWordText[i];
                    } else {
                        startNode = null;
                        break;
                    } 
                };
                startPosition = 0;
                startNode = TextManager.getNextTextNode(startNode);
                if (startNode && startNode.className == "EOP") break;
                if(!isWordOnline) {
                    nodeText += ' '; // we go to next line and have to divide them with space   -- ToDo: check if there is - (sign)            
                }
            };
        }
        
        return nodeText;
    }

     var createKeyboardEvent = function(options) {
        var event = document.createEvent('KeyboardEvent');
        extendEventFieldsWithSetter(event, ['type', 'keyCode', 'charCode', 'which', 'target', 'srcElement', 'currentTarget', 'defaultPrevented', 'ctrlKey', 'shiftKey','altKey']);
        event.defaultPreventedVal = options.defaultPrevented;
        event.initKeyboardEvent(options.type, true, true, options.window, false, false, false, false, 0, 0);
        event.currentTargetVal = options.document;
        event.srcElementVal = options.document;
        event.targetVal = options.document;
        
        return event;
      };

    self.loggedWord = null;
    //*********Navigation********************
    self.insertWordClick = function (item, isClick) {
        if ((item) && (item.word)) {
			$('div.itw_dictionary_button').remove();
            
			if(!self.loggedWord || self.loggedWord !== item.word){

            self.loggedWord = item.word;
            self.mainViewModel.logger.loggerModdel.chosen_word({
                "word": item.word,
                "selection_method": isClick 
                });
            }

            if ((!isGoogleDocs && !isGooglePresentation && !isGoogleDrawing)
                || (isGoogleDocs && mainViewModel.showDictionary() && CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()))) {
				if(CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName=="TEXTAREA"){					
					var input = CursorUtils.getActiveElement();
					var pos = input.selectionStart;
					var text = input.value;

					var wordStartWhiteSpace = text.substring(0, pos).lastIndexOf(" ") + 1;
                    var wordStartLineFeed = text.substring(0, pos).lastIndexOf(String.fromCharCode(10)) + 1;
                    var wordStart = wordStartWhiteSpace > wordStartLineFeed
                        ? wordStartWhiteSpace
                        : wordStartLineFeed;

                    var wordEndWhiteSpace = text.substring(pos, text.length).indexOf(" ");
                    var wordEndLineFeed = text.substring(pos, text.length).indexOf(String.fromCharCode(10));
                    var wordEnd = (wordEndLineFeed == -1 || wordEndWhiteSpace < wordEndLineFeed)
                        ? wordEndWhiteSpace
                        : wordEndLineFeed;

					wordEnd = (wordEnd == -1) ? text.length : wordEnd + pos;
					var newValue = text.substring(0,wordStart) + (item.word) + text.substring(wordEnd,text.length)
					input.value = newValue;
					input.selectionStart = wordStart + item.word.length;
					input.selectionEnd = input.selectionStart;
                    if (isFacebook)
                        $(input).parent().parent().parent().next(':input')[0].value = $(input)[0].value;

                    input.dispatchEvent && input.dispatchEvent(new Event('input', { bubbles: true })); 
					return;
				}else if(isWordOnline){
				    var range = CursorUtils.Range;
                    var newRange = range;
                    var charsToLeft = 0;
                    var charsToRight = 0;
                    
                    if (window.getSelection().type!="Caret") {
                       var startNode = CursorUtils.GetCursorPosition().getStartNode();
                       var endNode = CursorUtils.GetCursorPosition().getEndNode();
                       var startPosition = CursorUtils.GetCursorPosition().getStartOffset();
                       var nodeText = getEndTextOfWord(startNode, startPosition);
                       startPosition = 0 ;
                       customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1} });
                       document.getElementById("itw_predictionsmain").dispatchEvent(customEvent); 
                       while(!TextManager.isBreakSymbol(nodeText[startPosition])){
                           charsToRight++;
                           startPosition++; 
                       }
                   }
                   else
                   {
                    var containerText = getWordsForPrediction();
                        var cursorPos = containerText.length;
                        var leftBound = cursorPos - 1;
                        
                        while (!TextManager.isBreakSymbol(containerText[leftBound]) && (leftBound > -1)) {
                            leftBound--;
                            charsToLeft++;
                        }
                        
                        var cursorPos = window.getSelection().baseOffset;
                        var startNode = window.getSelection().baseNode;
                        var containerText = getEndTextOfWord(startNode, cursorPos);
                        var rightBound = 0;
                        while (!TextManager.isBreakSymbol(containerText[rightBound]) && (rightBound < containerText.length)) {
                            rightBound++;
                            charsToRight++;
                        }
                   }

                    var customEvent = new CustomEvent('pastePrediction', { 'detail': { text: item.word, charsToLeft: charsToLeft, charsToRight: charsToRight } });
                    document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);                    
				    
                }
                if(!isWordOnline){    
                    var newRange = TextManager.replaceWordUnderSelection(CursorUtils.Range, item.word);
                    CursorUtils.SetCursorPosition(newRange.getStartNode(), newRange.getStartOffset(), newRange.getEndNode(), newRange.getEndOffset());
                }
			}
			else if(isGoogleDocs){
				var range = CursorUtils.Range;
				var newRange = range;
                var charsToLeft = 0;
                var charsToRight = 0;
				if (!range.isCollapsed()) {
                   var startNode = CursorUtils.GetCursorPosition().getStartNode();
                   var endNode = CursorUtils.GetCursorPosition().getEndNode();
                   var startPosition = CursorUtils.GetCursorPosition().getStartOffset();
                   var nodeText = getEndTextOfWord(startNode, startPosition);
                   startPosition = 0 ;
                   customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1} });
                   document.getElementById("itw_predictionsmain").dispatchEvent(customEvent); 
                   while(!TextManager.isBreakSymbol(nodeText[startPosition])){
                       charsToRight++;
                       startPosition++; 
                   }
                }else{
					var container = range.getStartNode();
					if (container) {
						
						if(!CursorUtils.IsGoogleDocsCursorAfterSpace()){
							// var cursorPos = range.getStartOffset();
							// var containerText = $(range.getStartNode()).text();
							//var leftBound = cursorPos - 1;

							var containerText = getWordsForPrediction();
							var cursorPos = containerText.length;
							var leftBound = cursorPos - 1;
							
							while (!TextManager.isBreakSymbol(containerText[leftBound]) && (leftBound > -1)) {
								if(containerText.charCodeAt(leftBound) != 8203)
                                    charsToLeft++;

                                leftBound--;
							}
							
							var cursorPos = range.getStartOffset();
                            var startNode = range.getStartNode();
							var containerText = getEndTextOfWord(startNode, cursorPos);
							var rightBound = 0;
							while (!TextManager.isBreakSymbol(containerText[rightBound]) && (rightBound < containerText.length)) {
								if(containerText.charCodeAt(rightBound) != 8203)
                                    charsToRight++;
							
                                rightBound++;
                            }
						}
					}
                }
                
                var customEvent = new CustomEvent('pastePrediction', { 'detail': { text: item.word, charsToLeft: charsToLeft, charsToRight: charsToRight } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                CursorUtils.SetGoogleDocsCursor();

			} else if (isGooglePresentation || isGoogleDrawing) {
				var customEvent = new CustomEvent('pastePrediction', { 'detail': { text: item.word, charsToLeft: presLeft, charsToRight: presRight } });
				document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
				CursorUtils.SetGoogleDocsCursor();	
                self.LoadWords();
			}
        }
    };

    self.onWildcardClick = function (charVal) {

        if(charVal == "*"){
            self.mainViewModel.logger.loggerModdel.added_star.notifySubscribers();
        }  else {
            self.mainViewModel.logger.loggerModdel.added_hashtag.notifySubscribers();
        }
        if (!isGoogleDocs && !isGooglePresentation && !isGoogleDrawing) {
            if(CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName=="TEXTAREA"){                    
                var input = CursorUtils.getActiveElement();
                var pos = input.selectionStart;
                var text = input.value;
                var wordStart = text.substring(0,pos).lastIndexOf(" ")+1;
                var wordEnd = text.substring(pos,text.length).indexOf(" ");
                wordEnd = (wordEnd == -1) ? text.length : wordEnd + pos;
                var newValue = text.substring(0,pos) + charVal + text.substring(pos,text.length)
                input.value = newValue;
                input.selectionStart = pos + charVal.length;
                input.selectionEnd = input.selectionStart;
                if (isFacebook)
                    $(input).parent().parent().parent().next(':input')[0].value = $(input)[0].value;
                return;
            }
            
            var newRange = TextManager.insertWordUnderSelection(CursorUtils.Range, charVal);
            CursorUtils.SetCursorPosition(newRange.getStartNode(), newRange.getStartOffset(), newRange.getEndNode(), newRange.getEndOffset());
        }
        else  if(isGoogleDocs){
            var range = CursorUtils.Range;
            var newRange = range;
            var charsToLeft = 0;
            var charsToRight = 0;
            if (!range.isCollapsed()) {
               var startNode = CursorUtils.GetCursorPosition().getStartNode();
               var endNode = CursorUtils.GetCursorPosition().getEndNode();
               var startPosition = CursorUtils.GetCursorPosition().getStartOffset();
               var nodeText = getEndTextOfWord(startNode, startPosition);
               startPosition = 0 ;
               customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1} });
               document.getElementById("itw_predictionsmain").dispatchEvent(customEvent); 
               while(!TextManager.isBreakSymbol(nodeText[startPosition])){
                   charsToRight++;
                   startPosition++; 
               }
            }
            var customEvent = new CustomEvent('pastePrediction', { 'detail': { text: charVal, charsToLeft: charsToLeft, charsToRight: charsToRight } });
                    document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                    CursorUtils.SetGoogleDocsCursor();
        }
        else if (isGooglePresentation || isGoogleDrawing) {
            var customEvent = new CustomEvent('pastePrediction', { 'detail': { text: charVal, charsToLeft: presLeft, charsToRight: presRight } });
            document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
            CursorUtils.SetGoogleDocsCursor();              
        }
    };
	
    self.getInsertedWord = function (number) {
        if (number == -1) {
            return self.selectedWord();
        } else {
            /*if (self.predictedWords()) {
                if ((number > -1) && (number - 1 < self.predictedWords().length))
                    return self.predictedWords()[number - 1];
            }*/
            var res;
            if (number > self.shownWordsCount()) {
                if (self.dictionaryWords()) {
                    if ((number > -1) && (number - (self.shownWordsCount() + 1) < self.dictionaryWords().length)) {
                        res = self.dictionaryWords()[number - self.shownWordsCount() - 1];
                        return res;
                    }
                }
            }
            else {
                if (self.predictedWords()) {
                    if ((number > -1) && (number - 1 < self.predictedWords().length)) {
                        res = self.predictedWords().filter(function (el) { if (el.counter == number) return el; });
                        return res[0];
                    }
                }
            }
        }
    };

    PredictionViewModel.insertWord = function (number) {
        if ((self.isShortcutsShown() || (number == -1)) && !mainViewModel.isDisabled()) {
            var insertedWord = self.getInsertedWord(number);
            self.insertWordClick(insertedWord, false);
            //ClientManager.getInstance().speach.speak(insertedWord.word, false, function (json) {
            //    if (!!json) {
            //        self.wordPlayer.play(json);
            //    }
            //});
        }
    };

    PredictionViewModel.moveDown = function () {
        var selectedIndex = self.predictedWords().indexOf(self.selectedWord());
        if (selectedIndex < (self.predictedWords().length - 1)) {
            self.stopWord();
            self.selectAndPlay(self.predictedWords()[selectedIndex + 1]);
        }
    };

    PredictionViewModel.moveUp = function () {
        var selectedIndex = self.predictedWords().indexOf(self.selectedWord());
        if (selectedIndex > 0) {
            self.stopWord();
            self.selectAndPlay(self.predictedWords()[selectedIndex - 1]);
        }
    };

    self.select = function(item) {
        self.selectedWord(item);        
    };

    self.getShortcutIndex = function (word) {
        var index = self.predictedWords().indexOf(word) + 1;
        if (index == 10)
            index = 0;
        return index;
    };

    self.getShortcutIndexDict = function (word) {
        var index = self.dictionaryWords().indexOf(word) + self.shownWordsCount() + 1;
        if (index == 10)
            index = 0;
        return index;
    };

    //**********Load Words******************
    self.LoadWords = function () {
        clearTimeout(loadingTimer);
        loadingTimer = setTimeout(getPredictionWords, LOADING_INTERVAL);
    };

    var isCursorFromBegginigOfWord = function (startNode, startIndex) {
        if (startIndex !=0) {
           var text = $(startNode).text().slice(0, startIndex).replace(/\n/g, " ").replace(/\u00a0/g, ' ').replace(/\u200B/g, '');
           if(text[0] && text[text.length-1].trim() == "") 
            return true;
                return false;
        }
        return true;
    };

    var isOneWordSelected = function () {
        var isSymbolBreak = true;
        if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName=="TEXTAREA") {
            var posStart = CursorUtils.getActiveElement().selectionStart;
            var posEnd = CursorUtils.getActiveElement().selectionEnd - 1;
            var inputText = CursorUtils.getActiveElement().value;
            //var selectedTextLenght = posEnd - posStart;
            if (posStart != 0 && !TextManager.isBreakSymbol(inputText[posStart - 1]))
                return isSymbolBreak = false;
            if (inputText[posEnd].trim() == "") {
                posEnd = posEnd - 1;
            };
            for (var i = posStart; i < posEnd; i++) {
                if(TextManager.isBreakSymbol(inputText[i])){
                    isSymbolBreak = false;
                    break;
                }   
            };
        } else{
            var range = CursorUtils.GetCursorPosition();
            var startNode = currentNode = range.getStartNode();
            var endNode = range.getEndNode();
            var startIndex = range.getStartOffset();
            var endIndex = range.getEndOffset();
            var selectionEndNode = null;
            var text;
            if (startNode != endNode) {
                text = $(startNode).text().slice(startIndex);
                while(currentNode != endNode){
                    var breakSymbol = "";
                    var prevCurrentNode = currentNode;
                    currentNode = TextManager.getNextTextNode(currentNode, function(node) {
                        if (node == endNode) {
                            selectionEndNode = node;
                        };
                        if ($(node).text().trim() == "") {
                            breakSymbol = "\n";
                        };
                    });
                    if(selectionEndNode) {
                        currentNode = selectionEndNode;
                        text += breakSymbol; 
                        text += $(currentNode).text().slice(0, endIndex);
                    }else if(currentNode == endNode){
                        text += breakSymbol;  
                        text += $(currentNode).text().slice(0, endIndex);;
                    }else{
                        text += breakSymbol; 
                        text += $(currentNode).text();
                    }

                    if (prevCurrentNode == null && currentNode == null) {
                        break;
                    }
                }
            } else{
                text = $(startNode).text().slice(startIndex, endIndex);
            };

            if(isGoogleDocs)
            {
                text = text.replace(/\n/g, " ").replace(/\u00a0/g, ' ').replace(/\u200B/g, '');
            }
            
            var textlenght = text.length;
            if(!isCursorFromBegginigOfWord(startNode, startIndex)){
                return isSymbolBreak = false;
            }
            if (text[text.length - 1] && text[text.length - 1].trim() =="") {
                textlenght = textlenght - 1;
                //CursorUtils.SetCursorPosition(startNode, startIndex ,EndNode, endIndex - 1 );
            };
            for (var i = textlenght - 1; i >= 0; i--) {
                if(TextManager.isBreakSymbol(text[i])){
                    isSymbolBreak = false;
                    break;
                }   
            };
            for (var i = 0; i < textlenght; i++) {
                if(TextManager.isBreakSymbol(text[i])){
                    isSymbolBreak = false;
                    break;
                }
            };
        }
        return isSymbolBreak;
    };

    var getPredictionWords = function () {
		if (!self.isDblClicked) {
            var activeElement = CursorUtils.getActiveElement();
            var isInput = CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName=="TEXTAREA";
            var isInputSelected = isInput && (activeElement.selectionStart != activeElement.selectionEnd);
            var wasTextSelected = (!isInput && CursorUtils.GetCursorPosition() && !CursorUtils.GetCursorPosition().isCollapsed()) || isInputSelected ;    
            if (wasTextSelected){
                if(!isOneWordSelected()){
                    self.RemoveWords();
                    return;
                }
            }
            if (self.isPredictionVisible()) {
				var textToSend =null;
				/*
                console.log('getPredictionWords');

                var cursorRect = ( $('.modal-dialog.sketchy-dialog').length > 0 && $('.modal-dialog.sketchy-dialog').find('iframe')[0].contentDocument )
                    ? $($('.modal-dialog.sketchy-dialog').find('iframe')[0].contentDocument).find('svg:eq(0)').find('.docs-text-ui-cursor-blink')
                    : null;
                
                if(cursorRect && cursorRect.length > 0)
                {
                    cursorRect = cursorRect[0];
                    var svg = $(cursorRect).parents('svg')[0];
                    var textContainer = cursorRect.parentElement;
                    var cursorX = parseFloat(cursorRect.getAttributeNS(null,"x"));
                    var cursorY = Math.round(parseFloat(cursorRect.getAttributeNS(null,"y")));
                    var cursorClientRect = cursorRect.getBoundingClientRect();
                    var predictionText = "";
                    var text;
                    for (j=0;j< $(textContainer).find("text").length;j++) { 
                        var val = $(textContainer).find("text") [j];
                        
                        var x=parseFloat($(val).attr("x"));
                        var y = parseFloat($(val).attr("y"));
                        var matrix = getTransformToElement(val.parentElement.parentElement,cursorRect.parentElement);
                        var position = svg.createSVGPoint();
                        position.x = 0;
                        position.y = 0;
                        position = position.matrixTransform(matrix);
                        
                        x+=position.x;
                        y += position.y;
                        var nextNode = $(textContainer).find("text").length;            
                        if(cursorY>y+val.getBBox().height/2) 
                            predictionText+= val.textContent+ " ";
                        else{
                        if(y-5<cursorY)
                            if((x+parseFloat(val.getBBox().width))*1.018<cursorX) 
                                predictionText+= val.textContent +" ";              
                            else if(x<cursorX){
                                text = val;
                            }
                        }
                    }           
                    currentTextNode = text;
                    if(text){
                        var fullText = text.textContent;
                        var textX = parseFloat(text.getAttributeNS(null,"x"));
                        var cloneText = text.cloneNode(false);
                        cloneText.textContent = "";
                        var textBeforeCursor ='';
                        var i=0;
                        var res = "";
                        text.parentElement.appendChild(cloneText);
                        while(cloneText.getBBox().width<(cursorX-textX)*0.99 && i<fullText.length){
                            res = cloneText.textContent;
                            cloneText.textContent += fullText[i];   
                            i++;
                        }
                        presLeft = cloneText.textContent.length;
                        presRight = text.textContent.length-presLeft;
                        predictionText+=cloneText.textContent;
                        text.parentElement.removeChild(cloneText);
                    }

                    textToSend = predictionText;
                }
                else
*/
				if (isGooglePresentation || isGoogleDrawing) {
					textToSend = self.getPresentationPredictionText();
				}else{
					textToSend = getWordsForPrediction();
				}						
				if (CursorUtils.IsGoogleDocsCursorAfterSpace())
					textToSend = textToSend + ' ';
                if (isGoogleDocs) {
                     textToSend = textToSend.replace(/\u00a0/g, ' ').replace(/\u200B/g, '');
                    }   
                if (wasTextSelected && textToSend && textToSend.substr(textToSend.length - 1) == " ") {
                    textToSend = textToSend.substr(0, textToSend.length - 1);
                };
				if (textToSend) {
                    if (!self.isPredictNextWord() && (textToSend.substr(textToSend.length - 1) == " " || textToSend.trim()=="")) {
                        self.RemoveWords();
                    } // clear prediction if last symbol is space
                    else {						
						textToSend = textToSend.replace("’", "'");

						if (self.mainViewModel.predictionsSupported()) {
						    if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) && textToSend.trim() != ''
                                    && textToSend.trim().split(' ').length == 1 && textToSend == textToSend.toLowerCase()) {
                                textToSend = ' ' + textToSend;
                            }

                            ClientManager.getInstance().prediction.getListOfWords(textToSend, function (result) {
                                
                                self.mainViewModel.logger.loggerModdel.textToSend(textToSend);
                                self.wordsServerResult = result;
                                self.SetWords(result);
						    });
						}						
                    }
                } else {
                    // if textToSend is null or undefined then clear predictions
                    if (textToSend == null) {
                        self.RemoveWords();
                    } else if (textToSend === "" && self.isPredictNextWord()) {
                        ClientManager.getInstance().prediction.getListOfWords(textToSend, function (result) {
                            self.mainViewModel.logger.loggerModdel.textToSend(textToSend);
                            self.wordsServerResult = result;
                            self.SetWords(result);
                        });
                    }
                }
            }
        }
        else {
            self.isDblClicked = false;
        }
    };
    function getTransformToElement(element, target) {
      return target.getScreenCTM().inverse().multiply(element.getScreenCTM());
    }
	self.getPresentationPredictionText = function(){
		currentTextNode = null;
		presLeft = 0;
		presRight = 0;
		if($('.sketchy-text-selection-overlay').length>0) return "";
		var cursorRect = null;
		if($('path[stroke-opacity="0.6"]').length>0 && $('path[stroke-opacity="0.6"]').parent().parent().find('rect').length>1)		
			cursorRect = $('path[stroke-opacity="0.6"]').parent().parent().find('rect')[$('path[stroke-opacity="0.6"]').parent().parent().find('rect').length-2];
		if(!cursorRect) return "";
		var svg = $(cursorRect).parents('svg')[0];
		var textContainer = cursorRect.parentElement;
		var cursorX = parseFloat(cursorRect.getAttributeNS(null,"x"));
		var cursorY = Math.round(parseFloat(cursorRect.getAttributeNS(null,"y")));
		var cursorClientRect = cursorRect.getBoundingClientRect();
		var predictionText = "";
		var text;
		for (j=0;j< $(textContainer).find("text").length;j++) { 
			var val = $(textContainer).find("text") [j];
			
			var x=parseFloat($(val).attr("x"));
			var y = parseFloat($(val).attr("y"));
			var matrix = getTransformToElement(val.parentElement.parentElement,cursorRect.parentElement);
			var position = svg.createSVGPoint();
			position.x = 0;
			position.y = 0;
			position = position.matrixTransform(matrix);
			
			x+=position.x;
			y += position.y;
			var nextNode = $(textContainer).find("text").length;			
			if(cursorY>y+val.getBBox().height/2) 
				predictionText+= val.textContent+ " ";
			else{
			if(y-5<cursorY)
				if((x+parseFloat(val.getBBox().width))*1.018<cursorX) 
					predictionText+= val.textContent +" ";				
				else if(x<cursorX){
					text = val;
				}
			}
		}			
		currentTextNode = text;
		if(text){
			var fullText = text.textContent;
			var textX = parseFloat(text.getAttributeNS(null,"x"));
			var cloneText = text.cloneNode(false);
			cloneText.textContent = "";
			var textBeforeCursor ='';
			var i=0;
			var res = "";
			text.parentElement.appendChild(cloneText);
			while(cloneText.getBBox().width<(cursorX-textX)*0.99 && i<fullText.length){
				res = cloneText.textContent;
				cloneText.textContent += fullText[i];	
				i++;
			}
			presLeft = cloneText.textContent.length;
			presRight = text.textContent.length-presLeft;
			predictionText+=cloneText.textContent;
			text.parentElement.removeChild(cloneText);
		}
		return predictionText;
	};
    var getWordsForPrediction = function () {
		var activeElement = CursorUtils.getActiveElement();

        if(CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName=="TEXTAREA"){
            var pos = activeElement.selectionStart;
            var text = activeElement.value;
			if(activeElement.selectionStart != activeElement.selectionEnd){
                pos = activeElement.selectionEnd;
            };			
			
			return text.substring(0,pos);
		}
        else {
			if(!isGoogle && (activeElement.contentEditable!="true" && activeElement.contentEditable!="plaintext-only")) return;
			var range = isGoogleDocs ? CursorUtils.Range : CursorUtils.getSelection();
			if (range) {
				var rootNode;

                if(isGoogleDocs){
                    rootNode = $(range.getStartNode()).parents('div.kix-page')[0];
                }
                else if(isGoogleSpreadsheet) {
                    rootNode = $(range.getStartNode()).hasClass('cell-input') ? range.getStartNode() : $(range.getStartNode()).parents('div.cell-input')[0];
                }
                else if(isOneNote) {
                    rootNode = $(range.getStartNode()).parents('div.OutlineContainer')[0];
                }else if(isWordOnline) {
                    rootNode = $(range.getStartNode()).parents('div.OutlineContent')[0];
                }
                else {
                    rootNode = range.getStartNode()
                }

                var node = range.isCollapsed() ? range.getStartNode() : range.getEndNode();
                
                return TextManager.getWords(node, range.getEndOffset(),     rootNode, Settings.getInstance().getPREDICTION_NUMBER_OF_WORDS_SEND());
			}
			else {
				return;
			}
		}
    };

    self.SetWords = function (words) {
        self.isRemoved = false;
        self.SetPredictionWords(words);
        self.SetDictionaryWords(words);
    };

    self.SetPredictionWords = function (words) {
        words = words.filter(function (el) { return el.wOrigin == 0; });
        if (words.length > 50) words = words.slice(0, 50);
        self.allPredictedWords(words);

        var pagerSize = Math.ceil(words.length / self.predictedWordsCount());
        pagerSize = (pagerSize > 6) ? 6 : pagerSize;
        var pager = [];
        pager.push({ index: 0, active: false, title: '1-' + self.predictedWordsCount() });

        for (var i = 1; i < pagerSize; i++) {
            pager.push({ index: i * self.predictedWordsCount(), active: false, title: i * self.predictedWordsCount() + 1 + '-' + (i + 1) * self.predictedWordsCount() });
        }

        self.allPredictedWordsPager(pager);
        self.OnWordPagerClick(pager[0]);
    };

    self.SetDictionaryWords = function (words) {
        var dictWords = words.filter(function (el) { return el.wOrigin == 1; });
        self.allDictionaryWords.removeAll();
        if (dictWords.length > 50)
            dictWords = dictWords.slice(0, 50);
        self.allDictionaryWords(dictWords);

        var pagerSize = Math.ceil(dictWords.length / self.dictionaryWordsCount());
        pagerSize = (pagerSize > 6) ? 6 : pagerSize;
        var pager = [];
        pager.push({ index: 0, active: false, title: '1-' + self.dictionaryWordsCount() });

        for (var i = 1; i < pagerSize; i++) {
            pager.push({ index: i * self.dictionaryWordsCount(), active: false, title: i * self.dictionaryWordsCount() + 1 + '-' + (i + 1) * self.dictionaryWordsCount() });
        }

        self.allDictionaryWordsPager(pager);
        self.OnDictionaryWordPagerClick(pager[0]);
    };

    self.OnWordPagerClick = function (pagerItem) {
        if (pagerItem.active) return;

        var words = self.allPredictedWords();
        var wordsLength = words.length;

        if (wordsLength == 0) self.allPredictedWordsPager([]);

        if (wordsLength > self.predictedWordsCount())
            words = words.slice(pagerItem.index, (pagerItem.index + self.predictedWordsCount() > wordsLength) ? wordsLength : pagerItem.index + self.predictedWordsCount());

        self.shownWordsCount(words.length);

        while (words.length < self.predictedWordsCount()) {
            words.push({ word: '', wClass: 0, wOrigin: 0, counter: -1 });
        }

        self.predictedWords(words);
        
        for (var i = 0; i < self.predictedWords().length; i++) {
            self.predictedWords()[i].counter = i + 1;
        }

        if ((self.predictedWords()) && (self.predictedWords().length > 0) && wordsLength > 0) {
            self.select(self.predictedWords()[0]);
        }
        self.isRemoved = false;

        var pagerItems = self.allPredictedWordsPager();
        $.each(pagerItems, function (index, value) {
            value.active = (value == pagerItem);
        });
        self.allPredictedWordsPager([]);

        if (pagerItems.length > 1)
            self.allPredictedWordsPager(pagerItems);
    };

    self.OnDictionaryWordPagerClick = function (pagerItem) {
        if (pagerItem.active) return;

        var words = self.allDictionaryWords();
        var wordsLength = words.length;

        if (wordsLength == 0) self.allDictionaryWordsPager([]);

        if (wordsLength > self.dictionaryWordsCount())
            words = words.slice(pagerItem.index, (pagerItem.index + self.dictionaryWordsCount() > wordsLength) ? wordsLength : pagerItem.index + self.dictionaryWordsCount());

        self.shownDictionaryWordsCount(words.length);

        while (words.length < self.dictionaryWordsCount()) {
            words.push({ word: '', wClass: 0, wOrigin: 0, counter: -1 });
        }

        self.dictionaryWords(words);

        for (var i = 0; i < self.dictionaryWords().length; i++) {
            self.dictionaryWords()[i].counter = i + 1;
        }

        if ((self.dictionaryWords()) && (self.dictionaryWords().length > 0) && wordsLength > 0) {
            self.select(self.dictionaryWords()[0]);
        }

        var pagerItems = self.allDictionaryWordsPager();
        $.each(pagerItems, function (index, value) {
            value.active = (value == pagerItem);
        });
        self.allDictionaryWordsPager([]);

        if (pagerItems.length > 1)
            self.allDictionaryWordsPager(pagerItems);
    };

    self.SetWordsByOffset = function(offsetChange) {
		if(self.wordsOffsetNumber() + offsetChange >= 0
			&& self.wordsOffsetNumber() + offsetChange + 10 < self.allPredictedWords().length
			&& self.allPredictedWords().length > 10)
			self.wordsOffsetNumber(self.wordsOffsetNumber() + offsetChange);
		
		var words = self.allPredictedWords();

		var wordsLength = words.length;
		
		if(words.length > 10)
			words = words.slice(self.wordsOffsetNumber(), self.wordsOffsetNumber() + 10);
		
		while (words.length < 10) {
			words.push({ word: '', wClass: 0, wOrigin: 0, counter: -1 });
		}
		
		self.predictedWords(words);
        
		if ((self.predictedWords()) && (self.predictedWords().length > 0) && wordsLength > 0) {
            self.select(self.predictedWords()[0]);
        }
        self.isRemoved = false;
    }

    self.isRemoved = false;
    self.RemoveWords = function () {
        if (!self.isRemoved) {					
            self.SetWords([]);
            self.isRemoved = true;
            self.loggedWord = null;
        }
    };

    //*************************************

    self.changeAlternatives = function () {
        if (self.showAlternatives()) {
            self.showAlternatives(false);
        } else {
            self.showAlternatives(true);
        }
    };

    self.changePreSpeech = function () {
        self.readWords(!self.readWords());
    };

    self.togglePredictNextWord = function () {
        self.isPredictNextWord(!self.isPredictNextWord());
    };

    self.specificWordPredictionsClick = function () {

        self.mainViewModel.logger.loggerModdel.press_terms.notifySubscribers();
        //var url = "https://devintowords.mv-nordic.com/SpecificPredictions";
        var url = "https://online.intowords.com/SpecificPredictions";
        window.open(url , '_blank');
    };

    self.toggleDictionaryOn = function() {
        /*self.dictionaryOn(!self.dictionaryOn());*/
        if (self.dictionariesOn()) {
            fillTopicDictionaries();
        }

        self.dictionariesOn(!self.dictionariesOn());
        self.predictedWordsCount(self.isDictionariesSelected() ? 7 : 10);

        self.SetPredictionWords(self.wordsServerResult);
        self.SetDictionaryWords(self.wordsServerResult);

        self.initPredictionsPanel();
    };

    self.toogleIsShortcutsShown = function () {
        self.isShortcutsShown(!self.isShortcutsShown());
    };

    self.initPredictionsPanelResizales = function () {
        var wordList = $('div#itw_listwords_resizable');
        var wordHeight = 28;
        var minWordListHeight = wordHeight * 3 + 26;
        var maxWordListHeight = wordHeight * self.predictedWordsCount() + 26 + 8;

        wordList.resizable({
            handles: "s",
            grid: [0, wordHeight],
            minHeight: minWordListHeight,
            maxHeight: maxWordListHeight,
            create: function (event, ui) {
                $(event.target).find('div.ui-resizable-s');//.html('<div style="width: 50px; height: 7px; background-color: red;"></div>'); //text('. . .');
            },
            resize: function (event, ui) {
                var predictedWordsCount = ((ui.element.height() - 6) / wordHeight) - 1;

                if (self.predictedWordsCount() != predictedWordsCount) {
                    self.predictedWordsCount(predictedWordsCount);
                    self.dictionaryWordsCount(10 - predictedWordsCount);
                    self.SetPredictionWords(self.wordsServerResult);
                    self.SetDictionaryWords(self.wordsServerResult);
                }
            }
        });

        wordList.height(28 * self.predictedWordsCount() + 6 + 28);
    };

    self.initPredictionsPanel = function () {
        var predictionsBar = $('div#itw_predictionsmain');
        var draggableContainment = 'body';
        predictionsBar.draggable({
            containment: draggableContainment,
            scroll: false,
            start: function (event, ui) {
                var right = (ui.position.left > $(".kix-appview-editor").outerWidth() / 2)
                    ? parseInt(predictionsBar.css('right').replace('px', ''))
                    : $(".kix-appview-editor").outerWidth() - parseInt(predictionsBar.css('left').replace('px', '')) - predictionsBar.outerWidth();

                predictionsBar.data('right', right);
                predictionsBar.css('right', 'auto');
            },
            stop: function (event, ui) {
                if (ui.position.left > $(".kix-appview-editor").outerWidth() / 2) {
                    var right = predictionsBar.data('right') + (ui.originalPosition.left - ui.position.left);
                    predictionsBar.css('right', right + 'px');
                    predictionsBar.css('left', 'auto');
                }
            }
        });


        self.initPredictionsPanelResizales();
    };

    //constructor code
    fillPossibleNumberOfPredictionWords();

    PubSub.subscribe(Events.loadWords, function () {
        self.LoadWords();
    });

    PubSub.subscribe(Events.removeWords, function () {
        self.RemoveWords();
    });
    initShortcutsForElement = function (element) {
    	shortcut.add("Ctrl+1", function (key) {
			PredictionViewModel.insertWord(1, true);
		}, {'target': element});

        shortcut.add("Ctrl+numlock+1", function (key) {
            PredictionViewModel.insertWord(1, true);
        }, {'target': element});

		
		shortcut.add("Ctrl+2", function (key) {
			PredictionViewModel.insertWord(2, true);
		}, {'target': element});
		
		shortcut.add("Ctrl+3", function (key) {
			PredictionViewModel.insertWord(3, true);
		}, {'target': element});
		
		shortcut.add("Ctrl+4", function (key) {
			PredictionViewModel.insertWord(4, true);
		}, {'target': element});
		
		shortcut.add("Ctrl+5", function (key) {
			PredictionViewModel.insertWord(5, true);
		}, {'target': element});
		
		shortcut.add("Ctrl+6", function (key) {
			PredictionViewModel.insertWord(6, true);
		}, {'target': element});
		
		shortcut.add("Ctrl+7", function (key) {
			PredictionViewModel.insertWord(7, true);
		}, {'target': element});
		
		shortcut.add("Ctrl+8", function (key) {
			PredictionViewModel.insertWord(8, false);
		}, {'target': element});
		
		shortcut.add("Ctrl+9", function (key) {
			PredictionViewModel.insertWord(9, false);
		}, {'target': element});
		
		shortcut.add("Ctrl+0", function (key) {
			PredictionViewModel.insertWord(10, false);
		}, {'target': element});
    };
    self.initShortcutsForElements = function(elements){
    	elements.each(function(){
    		initShortcutsForElement(this);
    	});
    };
	

	var initShortcuts = function() {
	    var docstexteventtargetiframedocument = (isGoogleDocs || isGooglePresentation || isGoogleDrawing)
			? document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument
			//: document.body;
			: ((document.activeElement.nodeName == 'IFRAME') ? document.activeElement.contentWindow.document.body : document.body);

		initShortcutsForElement(docstexteventtargetiframedocument);
	};
	
	setTimeout(function(){
		initShortcuts();
	},100);	
};
