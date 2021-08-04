function SpeachManager(onPlayStateChanged) {
    var player = new Player();

    rangy.init();
    var cssApplier = rangy.createCssClassApplier("itw_sentance_highlight", { normalize: true, ignoreWhiteSpace: !isWordOnline });
    if (!isGoogle || isGoogleDocs || isGoogleSpreadsheet || isGooglePresentation||isGoogleDrawing) {
        player.bindTimeUpdateEvent(function (event) {
            timeupdate(event);
        });
    }

    player.bindEndPlayingEvent(function (event) {
        loadFileAndPlay(false);
        player.unbindTimeUpdateEvent();
    });

    var setIsPlaying = function (value) {
        isPlaying = value;

        if (onPlayStateChanged != null) {
            onPlayStateChanged();
        }
    };
    var wasTextSelelected = false;
    var startNode = null;
    var isPlaying = false;
    var startRange = null;
    var selectedRangeWhenUserPressPlay = null;
    var serverResponse = null;
    var mappingItemIndex = 0;
    var textNodeSymbolIndex = 0;
    var sentanceSymbolIndex = 0;
    var wordIndex = 0;
    var isCollapsedOnClickPlay = false;
    var pdfSelection = null;
    var currentNode = null;
    var presentationMoveRight = false;
    var indexForReadingPdfBySentance = 0;
    var totalTextResultForPdf;
    var presentationWordsList = [];
    var isSelectedText = false;
    var prevWord = null;
    var iframeCssNode = null;
    var wordOnlineSelectedNodesNumber = 0;
    var wordOnlineSelectedNodesCounter = 0;

    var highlightNextWord = function () {
        if (inputTextReadingData) {
            var element = inputTextReadingData.element;
            if (Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.sentance) {
                element.selectionStart = inputTextReadingData.wordStart;
                element.selectionEnd = inputTextReadingData.endSentanceIndex;
            }
            else {
                var mapping = serverResponse.Mapping[mappingItemIndex];
                element.selectionStart = inputTextReadingData.wordStart + mapping.text_index;
                element.selectionEnd = inputTextReadingData.wordStart + mapping.text_index + mapping.text_length;
            }
        }
        else {
            var googPagesContainer = $('div.kix-appview-editor');
            if (googPagesContainer.length > 0) {
                var textTopOffset = $(startNode.parentElement).positionRelative(googPagesContainer).top + googPagesContainer.scrollTop();
                if ($(startNode.parentElement).positionRelative(googPagesContainer).top + $(startNode.parentElement).height() >= googPagesContainer.height()) googPagesContainer.scrollTop(textTopOffset);
            }

            if (!isGoogle) {
            	var windowHeight = $(window).height(); 
				
                if(window.getSelection().rangeCount > 0) {
                    var clientRect = window.getSelection().getRangeAt(0).getBoundingClientRect();

    				if(clientRect.top > windowHeight || clientRect.top < 0) {
    					var currentTop = $('body').scrollTop();
    					$('html, body').animate({
    	                    scrollTop: currentTop + clientRect.top - windowHeight / 2
    	                }, 100);
    				}
                }        
            }

            if (isWordOnline && !isCollapsedOnClickPlay) {
                //var customEvent = new CustomEvent('moveCursorRight', { 'detail': { count: 1 } });
                //document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                isCollapsedOnClickPlay = true;
                if(window.getSelection().baseNode){
                    startNode = window.getSelection().baseNode; 

                }
            }
            var mapping = serverResponse.Mapping[mappingItemIndex];
            if (isWordOnline  && isCollapsedOnClickPlay) {                
                var customEvent = null;
                
                if (mapping.text_index != 0) {
                    customEvent = new CustomEvent('moveCursorToWordStart');
                    document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                    if(!document.contains(startNode)&&window.getSelection().baseNode/*&&wasTextSelelected*/){
                        startNode = window.getSelection().baseNode; 
                        textNodeSymbolIndex = 0;                            
                        sentanceSymbolIndex++;                                     
                    }
                }                
            }
            var textNode = null;
            var time = new Date();
            var isWordMode = true;//Settings.getInstance().getHIGHLIGHTSTRATEGY() == HighLightStrategiesWord;            
            var startContainer = startNode;
            var startPosition = textNodeSymbolIndex;
            var textMatch = null;
            //var nextTextNode = startNode;
            var currentText = "";
            var previoustextNodeSymbolIndex = null;
            var previousTextNode = null;
            var woMoveRight = 0;            

            while (startNode && (isWordMode && sentanceSymbolIndex < mapping.text_length + mapping.text_index)) {
                if (sentanceSymbolIndex == mapping.text_index) {
                    startPosition = textNodeSymbolIndex;
                    startContainer = startNode;
                }

                var nodeText = $(startNode).text();

                if (nodeText.length > textNodeSymbolIndex) {
                    if($.trim($(startNode).text()[textNodeSymbolIndex])!=""){
                        woMoveRight++;
                    }
                    currentText += $(startNode).text()[textNodeSymbolIndex];
                    textMatch = (currentText).match(Settings.getFullStopRegExp());
                    previousTextNode = startNode;
                    previoustextNodeSymbolIndex = textNodeSymbolIndex;
                    
                    //if($(startNode).text().charCodeAt(textNodeSymbolIndex) != 8203)
                    if(!(isWordOnline && ($(startNode).text().charCodeAt(textNodeSymbolIndex) === 8239
                        /*|| $(startNode).text().charCodeAt(textNodeSymbolIndex) === 160*/
                        /*|| $(startNode).text().charCodeAt(textNodeSymbolIndex) === 82*/)))
                        sentanceSymbolIndex++;

                    if (startPosition == $(startContainer).text().length && startContainer != startNode) {
                        startContainer = startNode;
                        startPosition = 0;
                    }

                    textNodeSymbolIndex++;
                    
                } else {
                    startNode = TextManager.getNextTextNode($(startNode),
						function (node) {
						    var text = $(startContainer).text();
						    //
						    //if (!isGoogleDocs && !isWordOnline && node.innerHTML == '&nbsp;') {
						    //    sentanceSymbolIndex++;
						    //}

						    if (($(node).get(0).nodeName.match(Settings.getBreakLineTagsRegExp()))) {
						        //if (text[text.length - 1] == "-") {
						            //text.substr(0, text.length - 1)
						        //    sentanceSymbolIndex -= 1;
						        //} else {
						            currentText += "\n";
						            sentanceSymbolIndex++;
						        //}
						    }
                            else if((node.nodeName === 'SPAN' && $(node).css('display') === 'inline-block'
                                && node.previousSibling && node.previousSibling.nodeName === 'SPAN' && $(node.previousSibling).css('display') === 'inline-block')
                                || node.nodeName === 'TD') {
                                text += ' ';
                                sentanceSymbolIndex++;
                            }

						    if ((isGoogleDocs || isWordOnline) && $.trim($(node).text()) == ""/* && node.nodeName === '#text'*/) {
						        currentText += " ";
						        sentanceSymbolIndex++;
						    }
						});

                    /*if (startNode && isGoogleDocs) {
					    if (Settings.getInstance().getHIGHLIGHTSTRATEGY() != Settings.highlightStrategies.doublehighlight || mappingItemIndex != 0 ) { 
							currentText += " ";
							sentanceSymbolIndex++;
						}
					}*/

                    previoustextNodeSymbolIndex++;                    
                    textNodeSymbolIndex = 0;
                }
            }

            var userPrev = (textNodeSymbolIndex == 0 && !!previousTextNode) || textMatch;
            if (isWordOnline  && isCollapsedOnClickPlay) {
                var customEvent = null;
                customEvent = new CustomEvent('moveCursorRight', { 'detail': { count: woMoveRight} });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
            }

            if (!isGooglePresentation && !isGoogleDrawing && (Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.word ||
               Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.doublehighlight)) {
                CursorUtils.SetCursorPosition(startContainer, startPosition,
					userPrev ? previousTextNode : startNode,
					userPrev ? previoustextNodeSymbolIndex : textNodeSymbolIndex);
                // http://10.1.13.2:8081/issue/ITWC-1001 
                if (location.host && location.host.indexOf("ebog.mitcfu") > -1 && $(".atbContextMenu") && !$(".atbContextMenu").hasClass("hiddenContent")) {
                    $(".atbContextMenu").addClass("hiddenContent");
                }
            }
            
            if (!isCollapsedOnClickPlay && (isGoogleDocs || isWordOnline)) {
                //var customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1 } });
                //document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                isCollapsedOnClickPlay = true;
            };
            if ((isGoogleDocs) && isCollapsedOnClickPlay) {
                var customEvent = null;

                customEvent = new CustomEvent('moveCursorRight', { 'detail': { count: (userPrev ? previoustextNodeSymbolIndex : textNodeSymbolIndex) - startPosition } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                customEvent = new CustomEvent('moveCursorToWordStart');
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);                
            } else
                if (isCollapsedOnClickPlay && (isGooglePresentation || isGoogleDrawing)) {
                    prevWord = moveToNextWordInPresentation(prevWord);
                    if (isGooglePresentation || isGoogleDrawing) {
                        textNode = getPresentationCurrentTextNode();
                    }

                    if ((isGooglePresentation || isGoogleDrawing) && (Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.word ||
                    Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.doublehighlight)) {
                        var selection = document.getElementById("selection");
                        if (selection)
                            selection.parentNode.removeChild(selection);
                        if (textNode) {
                            var textContainer = $(textNode).parents(".sketchy-text-content-text");
                            var selectionRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

                            if (textContainer.find('.sentance-selection').length > 0) {
                                textContainer.find('.sentance-selection').after(selectionRect);
                            }
                            else {
                                textContainer.prepend(selectionRect);
                            }
                            var x, y, width, height;
                            x = textNode.getAttributeNS(null, "x");
                            y = textNode.getAttributeNS(null, "y");
                            width = textNode.getBBox().width;
                            height = textNode.getBBox().height;
                            selectionRect.setAttributeNS(null, "id", "selection");
                            selectionRect.setAttributeNS(null, "x", x);
                            selectionRect.setAttributeNS(null, "y", parseFloat(y) - height);
                            selectionRect.setAttributeNS(null, "width", width);
                            selectionRect.setAttributeNS(null, "height", height);
                            selectionRect.setAttributeNS(null, "fill", "#BCDCF5");
                            selectionRect.setAttributeNS(null, 'opacity', 1);
                        }
                    }
                }
           
        }

        mappingItemIndex++;
        if (serverResponse.Mapping.length > mappingItemIndex &&
            player.currentTime() >= serverResponse.Mapping[mappingItemIndex].wav_end) {
            highlightNextWord();
        }
    };

    var moveToNextWordInPresentation = function (prevWord) {
        var curNode = getPresentationCurrentTextNode();
        var i = 0;
        while (curNode && curNode == prevWord && i < 3 && $.inArray(curNode, presentationWordsList) >= 0) {
            var customEvent = new CustomEvent('moveCursorToWordStart');
            document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);

            curNode = getPresentationCurrentTextNode();
            i++;
        }
        return curNode;
    }
    var highlightPresentationText = function (words) {

        $(".sentance-selection").remove();
        var selectionRect = null;
        var textContainer = null;
        for (i = 0; i < words.length; i++) {
            var word = words[i];
            var x, y, width, height;
            x = word.getAttributeNS(null, "x");
            y = word.getAttributeNS(null, "y");

            width = word.getBBox().width;
            height = word.getBBox().height;
            if ((selectionRect && selectionRect.getAttributeNS(null, "y") != parseFloat(y) - height) || !selectionRect || (textContainer && textContainer[0] != $(word).parents(".sketchy-text-content-text")[0])) {

                if (selectionRect && textContainer) textContainer.prepend(selectionRect);
                selectionRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

                selectionRect.setAttributeNS(null, "class", "sentance-selection");
                selectionRect.setAttributeNS(null, "x", x);
                selectionRect.setAttributeNS(null, "y", parseFloat(y) - height);
                selectionRect.setAttributeNS(null, "width", width);
                selectionRect.setAttributeNS(null, "height", height);
                selectionRect.setAttributeNS(null, "fill", "#DEEDFA");
                selectionRect.setAttributeNS(null, 'opacity', 1);
            } else {
                selectionRect.setAttributeNS(null, "width", parseFloat(x) + width - parseFloat(selectionRect.getAttributeNS(null, "x")));
            }
            textContainer = $(word).parents(".sketchy-text-content-text");
        }
        if (selectionRect && textContainer) {
            textContainer.prepend(selectionRect);
        }
    }

    var timeupdate = function (event) {
        var sec = event.target.currentTime;
        if (serverResponse && serverResponse.Mapping != null) {
            if (serverResponse.Mapping[mappingItemIndex] != null
                && sec >= serverResponse.Mapping[mappingItemIndex].wav_start
                && serverResponse.Mapping.length >= mappingItemIndex + 1) { 
                highlightNextWord();
            }
        }
    };

    var onInputReadingStop = function () {
        if (inputTextReadingData.selStart != inputTextReadingData.selEnd) {
            inputTextReadingData.element.selectionStart = inputTextReadingData.selStart;
            inputTextReadingData.element.selectionEnd = inputTextReadingData.selEnd;
        }
        else {
            inputTextReadingData.element.selectionStart = inputTextReadingData.element.selectionEnd;

            PubSub.publish(Events.loadWords, null);

        }

        inputTextReadingData = null;
    };

    var toggleHighlightCss = function (enable) {
        if (enable) { 
            if ((!isGoogleDocs && document.activeElement.nodeName == 'IFRAME' && iframeCssNode == null)) {
                var node = document.activeElement.contentWindow.document.createElement('style');
                node.innerHTML = '* { -webkit-user-select: text !important; } .Selected .EOP, .EOP.Selected, .LineBreakBlob.Selected, .TextRun .Selected { background-color: transparent !important; border-color: transparent !important; } ::selection:not(body.alinea) { background: #BCDCF5 !important; color: #000 !important; } .itw_sentance_highlight { background-color: #DEEDFA !important; }';
                $(document.activeElement.contentWindow.document.body).prepend(node);
                iframeCssNode = $(node);
            }
            $('body').addClass('itw_word_highlight');
        }
        else {
            if ((!isGoogleDocs && document.activeElement.nodeName == 'IFRAME' && iframeCssNode)) {
                iframeCssNode.remove();
                iframeCssNode = null;
            }            
            $('body').removeClass('itw_word_highlight');
        }
    };

    var runStop = function () {
        player.stop();
        toggleHighlightCss(false);        

        if (sentanceHighlighRange) {
            if (sentanceHighlighRange.isValid()) cssApplier.undoToRange(sentanceHighlighRange);
            sentanceHighlighRange = null;
        }

        if (isGoogle) {
            if (isGooglePresentation || isGoogleDrawing) {
                $(".sentance-selection").remove();
                var selection = document.getElementById("selection");
                if (selection)
                    selection.parentNode.removeChild(selection);
            } else {

                if (isGoogleDocs) {
                    setCursorVisibilityForGoogleDocs("visible");
                }
                else if(!isGoogleSpreadsheet) {
                    var range = CursorUtils.GetCursorPosition();
                    if (range != null && !range.isCollapsed()) {
                        var oldRange = CursorUtils.GetCursorPosition();
                        CursorUtils.SetCursorPosition(oldRange.getEndNode(), oldRange.getEndOffset());
                    }
                }
            }
        }
        else if (inputTextReadingData) {
            onInputReadingStop();
        }
        else if (CursorUtils.getActiveElement().contentEditable == "true" || CursorUtils.getActiveElement().contentEditable == "plaintext-only") {

        }
        else if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName=="TEXTAREA") {

        }
        else {
            if (wasTextSelelected) {
                savedRange = selectedRangeWhenUserPressPlay;
            }
            if (savedRange)
                CursorUtils.SetCursorPosition(savedRange.getStartNode(), savedRange.getStartOffset(), savedRange.getEndNode(), savedRange.getEndOffset());
        }
        setIsPlaying(false);
        isLoadNewFileInProgress = false;
    };

    var isLoadNewFileInProgress = false;
    var mustStopPlaying = false;
    var readBysentence = true;
    var prevNode;
    var savedRange = null;

    var loadFileAndPlay = function (newCycle) {

        if (isLoadNewFileInProgress)
            return;
        isLoadNewFileInProgress = true;
        player.unbindEndPlayingEvent();
        //we use it for feature which we need highlight latest played word
        setTimeout(function () {
            player.bindEndPlayingEvent(function (event) {
                loadFileAndPlay(false);
            });
        }, 200);
        
        player.bindTimeUpdateEvent(function (event) {
            timeupdate(event);
        });
    
        if (isGooglePdf) {
            var text;
            if (newCycle) {
                text = getTextFromPdfFile(newCycle);
                if (text.match(/^\s*$/)) return;
                //SpeachManager.loadIndecies(text, playIndecies);
            } else if (!newCycle && MainViewModel.isSentenceFromCursor() && mustStopPlaying) {
                mustStopPlaying = false;
                setIsPlaying(false);
                isLoadNewFileInProgress = false;
            } else {
                text = getTextFromPdfFile(newCycle);
            }
            if ($.trim(text) != "") {
                if ($.trim(text).slice(-1).match(Settings.endSentenceMarks()) && MainViewModel.isSentenceFromCursor() && !wasTextSelelected) {
                    mustStopPlaying = true;
                }
                setIsPlaying(true);
                SpeachManager.loadIndecies(text, playIndecies);
            }
            else {
                setIsPlaying(false);
                isLoadNewFileInProgress = false;
            }
        } else if (isGooglePresentation || isGoogleDrawing) {

            if (newCycle) {
                var text = getTextFromPresentation(newCycle);
                isLoadNewFileInProgress = false;
                if (text.match(/^\s*$/)) return;
                //SpeachManager.loadIndecies(text, playIndecies);
            } else if (!newCycle && MainViewModel.isSentenceFromCursor() && mustStopPlaying || (isSelectedText && !newCycle)) {
                mustStopPlaying = false;
                setIsPlaying(false);
                isLoadNewFileInProgress = false;
                moveToNextWordInPresentation(prevWord);
                $(".sentance-selection").remove();
                var selection = document.getElementById("selection");
                if (selection) selection.parentNode.removeChild(selection);
            } else {
                moveToNextWordInPresentation(prevWord);
                text = getTextFromPresentation(newCycle);
                isLoadNewFileInProgress = false;
            }

            if ($.trim(text) != "") {
                if ($.trim(text).slice(-1).match(Settings.endSentenceMarks()) && MainViewModel.isSentenceFromCursor()) {
                    mustStopPlaying = true;
                }
                setIsPlaying(true);
                SpeachManager.loadIndecies(text, playIndecies);
            }
            else {
                setIsPlaying(false);
                isLoadNewFileInProgress = false;
                var selection = document.getElementById("selection");
                if (selection) selection.parentNode.removeChild(selection);
                $(".sentance-selection").remove();
            }
        }
        else {            
            savedRange = CursorUtils.GetCursorPosition();
            if (newCycle) {
                isCollapsedOnClickPlay = CursorUtils.GetCursorPosition().isCollapsed();
                var text = getTextForPlay(newCycle);
                readBysentence = true;
            } else if (!newCycle && MainViewModel.isSentenceFromCursor() && mustStopPlaying && !wasTextSelelected) {
                mustStopPlaying = false;
                setIsPlaying(false);
                isLoadNewFileInProgress = false;
                setCursorVisibilityForGoogleDocs("visible");
                if (sentanceHighlighRange) {
                    if (sentanceHighlighRange.isValid()) cssApplier.undoToRange(sentanceHighlighRange);
                    sentanceHighlighRange = null;
                }

                if (isWordOnline) {
                    customEvent = new CustomEvent('moveCursorToWordStart');
                    document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                }   

                if (!inputTextReadingData) {
                    moveCursorToStartPositionBeforePlaying();
                    if (prevNode == selectedRangeWhenUserPressPlay.getEndNode()) {
                        readBysentence = true;
                    } else {
                        readBysentence = false;
                    }
                }
            } else {
                var text = getTextForPlay(newCycle);                
                readBysentence = true;
                if ((isWordOnline && wordOnlineSelectedNodesNumber > 0 && wordOnlineSelectedNodesCounter >= wordOnlineSelectedNodesNumber && text == "") || text == "") { // think about this? check.
                    wordOnlineSelectedNodesCounter = 0;
                }
            }
            if (readBysentence) {
                startRange = CursorUtils.GetCursorPosition();
                startNode = startRange.getStartNode();
                textNodeSymbolIndex = CursorUtils.GetCursorPosition().getStartOffset();
                if ($.trim(text) != "") {
                    if ($.trim(text).slice(-1).match(Settings.endSentenceMarks()) && MainViewModel.isSentenceFromCursor()) {
                        mustStopPlaying = true;
                    }
                    setIsPlaying(true);
                    setCursorVisibilityForGoogleDocs("hidden");
                    SpeachManager.loadIndecies(text, playIndecies);
                } else {
                    setIsPlaying(false);
                    isLoadNewFileInProgress = false;
                    setCursorVisibilityForGoogleDocs("visible");

                    if (inputTextReadingData) {
                        onInputReadingStop();
                    }
                    else {

                        if (CursorUtils.getActiveElement().contentEditable == "true" || CursorUtils.getActiveElement().contentEditable == "plaintext-only") {
                            if (sentanceHighlighRange) {
                                if (sentanceHighlighRange.isValid()) cssApplier.undoToRange(sentanceHighlighRange);
                                sentanceHighlighRange = null;
                            }
                            toggleHighlightCss(false);
                            if (wasTextSelelected && !isWordOnline) {
                                savedRange = selectedRangeWhenUserPressPlay;
                                CursorUtils.SetCursorPosition(savedRange.getStartNode(), savedRange.getStartOffset(), savedRange.getEndNode(), savedRange.getEndOffset());
                                readBysentence = true;
                                prevNode = null;
                            }

                        } else {
                            if (sentanceHighlighRange) {
                                if (sentanceHighlighRange.isValid()) cssApplier.undoToRange(sentanceHighlighRange);
                                sentanceHighlighRange = null;
                            }
                            toggleHighlightCss(false);                            
                            if (wasTextSelelected || readBysentence) {
                                savedRange = selectedRangeWhenUserPressPlay;
                            }
                            if (!isGoogleDocs) {
                                CursorUtils.SetCursorPosition(savedRange.getStartNode(), savedRange.getStartOffset(), savedRange.getEndNode(), savedRange.getEndOffset());
                                readBysentence = true;
                                prevNode = null;
                            }
                            // http://10.1.13.2:8081/issue/ITWC-1001 
                            setTimeout(function() {
                                if (location.host && location.host.indexOf("ebog.mitcfu") > -1 && $(".atbContextMenu") && $(".atbContextMenu").hasClass("hiddenContent")) {
                                    $(".atbContextMenu").removeClass("hiddenContent");
                                }
                            }, 500);
                            
                        }

                    }
                }
            }
        }
    };
    var getTextFromPdfFile = function (newCycle) {
        if (newCycle) {
            var isBlockStructure;
            var selection = $('.drive-viewer-paginated-page-selection').children();
            pdfSelection = selection.clone();
            if (selection) {
                var selectionTextConteiner = $('.drive-viewer-paginated-page-selection').children().parent().parent();
                var listSelectionTextBeforeSplitUp = selectionTextConteiner.find('.drive-viewer-paginated-page-reader-content-container p');
                var arr = new Array();
                isBlockStructure = arrHasDupes(listSelectionTextBeforeSplitUp);
                if (!isBlockStructure) {
                    listSelectionTextBeforeSplitUp.each(function (i) {
                        var text = $(this).text();
                        var lineCount = getLineBreakCount(text);
                        var splitedText = text.split(/\n/);
                        if (lineCount > 1) {
                            var lineHeight = parseFloat(this.nextSibling.style.top) - parseFloat(this.style.top);
                            for (var i = 1; i < lineCount; i++) {
                                var currentLineHieght = parseFloat(this.style.top) + (lineHeight / (i + 1))
                                var pElement = $(this).clone().text(splitedText[i]).css('top', currentLineHieght + '%');
                                var newText = $(this).text().replace(splitedText[i], "");
                                $(this).text(newText);
                                $(this).after(pElement);
                            }
                        }
                    });
                    var listSelectionTextAfterSplitUp = selectionTextConteiner.find('.drive-viewer-paginated-page-reader-content-container p');

                    listSelectionTextAfterSplitUp.each(function (i) {
                        var that = this;
                        $.each(selection, function (i, val) {
                            if (Math.round(parseFloat(val.style.top)) == Math.round(parseFloat(that.style.top))) {    //  TODO ROUNDING 
                                // var copyLine = $(that).clone().empty();
                                // $(copyLine).css('width', '');
                                // $(that).parent().append(copyLine);
                                // var copyLineWidth = copyLine.width();
                                // var currentLineWidth = $(that).width();
                                // var currentLineLeftOffset = $(that).offset().left;
                                // var highlightedElementLeftOffset  = $(val).offset().left;
                                // var highlightedElementWidth = $(val).width();
                                // var charCounter = 0;
                                // //var copyElementOffset = $(copyElement).offset();
                                // while(currentLineLeftOffset + copyLineWidth < highlightedElementLeftOffset){
                                // copyLine[0].innerHTML +=  that.textContent[charCounter];
                                // copyLineWidth = copyLine.width();
                                // charCounter++;
                                // }
                                // var startPosition = charCounter++;
                                // //charCounter = 0;
                                // while(copyLineWidth < highlightedElementLeftOffset + highlightedElementWidth){
                                // copyLine[0].innerHTML +=  that.textContent[charCounter];
                                // copyLineWidth = copyLine.width();
                                // charCounter++;
                                // }
                                // var endPosition = charCounter++;
                                // copyLine.remove();
                                arr.push(
									{
									    pValueText: $(that).text(),
									    pTotalTextWidth: parseFloat(that.style.width),
									    pLeftfileBorder: parseFloat(that.style.left),
									    startPosition: parseFloat(val.style.left),
									    textLength: parseFloat(val.style.width)
									});
                            }
                        });
                    });
                } else {
                    listSelectionTextBeforeSplitUp.each(function (i) {
                        var that = this;
                        $.each(selection, function (i, val) {
                            if (parseFloat(val.style.top) == parseFloat(that.style.top) && parseFloat(val.style.left) >= parseFloat(that.style.left) &&
								parseFloat(val.style.left) < parseFloat(that.style.left) + parseFloat(that.style.width)) {    //  TODO ROUNDING 
                                arr.push(
									{
									    pValueText: $(that).text(),
									    pTotalTextWidth: parseFloat(that.style.width),
									    pLeftfileBorder: parseFloat(that.style.left),
									    startPosition: parseFloat(val.style.left),
									    textLength: parseFloat(val.style.width)
									});
                            }
                        });
                    });
                }
                if (!$.isEmptyObject(arr)) {
                    var totalTextResult = "";
                    for (var i = 0; i < arr.length; i++) {
                        totalTextResult += getTextByCurrentLine(arr[i]);
                    }
                    totalTextResultForPdf = totalTextResult;
                    return getNextSentanceForPdf(totalTextResultForPdf, indexForReadingPdfBySentance);
                }
            }
        } else {
            return getNextSentanceForPdf(totalTextResultForPdf, indexForReadingPdfBySentance);
        }
    }

    var getNextSentanceForPdf = function (text, index) {
        var newText = text.slice(index);
        if (newText.trim() == "") {
            indexForReadingPdfBySentance = 0;
        } else {
            var endIndex = newText.match(Settings.getFullStopRegExp()) == null ? newText.length : newText.match(Settings.getFullStopRegExp()).index;
            indexForReadingPdfBySentance = endIndex + 1 + index;
        }
        return totalTextResultForPdf.slice(index, indexForReadingPdfBySentance);
    }
    function getTransformToElement(element, target) {
      return target.getScreenCTM().inverse().multiply(element.getScreenCTM());
    }
    var getPresentationCurrentTextNode = function () {
        var predictionText = "";
        if ($('.sketchy-text-selection-overlay').length == 0) {
            var cursorRect = null;
            if ($('path[stroke-opacity="0.6"]').length > 0 && $('path[stroke-opacity="0.6"]').parent().parent().find('rect').length > 1)
                cursorRect = $('path[stroke-opacity="0.6"]').parent().parent().find('rect')[$('path[stroke-opacity="0.6"]').parent().parent().find('rect').length - 2];
            if (!cursorRect) return "";
            isCollapsedOnClickPlay = true;
            var svg = $(cursorRect).parents('svg')[0];
            var textContainer = cursorRect.parentElement;
            var cursorX = cursorRect.getAttributeNS(null, "x") == null ? null : parseFloat(cursorRect.getAttributeNS(null, "x"));
            var cursorY = cursorRect.getAttributeNS(null, "y") == null ? null : Math.round(parseFloat(cursorRect.getAttributeNS(null, "y")));
            var cursorClientRect = cursorRect.getBoundingClientRect();
            //cursorY = cursorY - (cursorRect.parentElement.getBoundingClientRect().top - cursorRect.parentElement.parentElement.getBoundingClientRect().top);
            
            for (j = 0; j < $(textContainer).find("text").length; j++) {
                var val = $(textContainer).find("text")[j];
                var x = parseFloat($(val).attr("x"));
                var y = parseFloat($(val).attr("y"));
                var matrix =  getTransformToElement(val.parentElement.parentElement,cursorRect.parentElement);//val.parentElement.parentElement.getTransformToElement(cursorRect.parentElement);
                var position = svg.createSVGPoint();
                position.x = 0;
                position.y = 0;
                position = position.matrixTransform(matrix);

                x += position.x;
                y += position.y;

                if (cursorY == null || y > cursorY + 5) {

                } else
                    if (y > cursorY - val.getBBox().height / 2)
                        if (Math.round(x + parseFloat(val.getBBox().width)) >= Math.round(cursorX)) {

                            return val;
                        }

            }
        }
        return null;
    }
    var getTextFromPresentation = function (newCycle) {
        var curNode = getPresentationCurrentTextNode();
        isSelectedText = false;
        prevWord = null;
        var text = "";
        startNode = null;

        if ($('.sketchy-text-selection-overlay').length > 0) {
            isCollapsedOnClickPlay = false;
            isSelectedText = true;
            presentationWordsList = [];
            for (j = 0; j < $('.sketchy-text-selection-overlay').length; j++) {
                var selection = $('.sketchy-text-selection-overlay')[j];
                for (k = 0; k < $(selection.parentElement).find('text').length; k++) {
                    var textElement = $(selection.parentElement).find('text')[k];
                    var selectionStart = parseFloat(selection.getAttributeNS(null, "x"));
                    var selectionEnd = selectionStart + parseFloat(selection.getBBox().width);
                    var textStart = parseFloat(textElement.getAttributeNS(null, "x"));
                    var textEnd = textStart + parseFloat(textElement.getBBox().width);
                    if ((textStart >= selectionStart && textStart <= selectionEnd)
					|| (textEnd >= selectionStart && textEnd <= selectionEnd)
					|| (textStart <= selectionStart && selectionEnd <= textEnd)
					) {
                        text += textElement.textContent + " ";
                        presentationWordsList.push(textElement);
                    }
                }
            }
            var customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1 } });
            document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
            isCollapsedOnClickPlay = true;
        } else {
            if (newCycle) presentationWordsList = [];
            var i = 0;
            while (curNode && i < 3 && $.inArray(curNode, presentationWordsList) >= 0) {
                var customEvent = new CustomEvent('moveCursorToWordStart');
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                if (curNode == getPresentationCurrentTextNode()) return "";
                else {
                    curNode = getPresentationCurrentTextNode();
                }
                i++;
            }
            presentationWordsList = [];
            var cursorRect = null;
            if ($('path[stroke-opacity="0.6"]').length > 0 && $('path[stroke-opacity="0.6"]').parent().parent().find('rect').length > 1)
                cursorRect = $('path[stroke-opacity="0.6"]').parent().parent().find('rect')[$('path[stroke-opacity="0.6"]').parent().parent().find('rect').length - 2];
            if (!cursorRect || cursorRect.className.animVal != "docs-text-ui-cursor-blink") return "";
            isCollapsedOnClickPlay = true;
            var svg = $(cursorRect).parents('svg')[0];
            var textContainer = cursorRect.parentElement;
            var cursorX = cursorRect.getAttributeNS(null, "x") == null ? null : parseFloat(cursorRect.getAttributeNS(null, "x"));
            var cursorY = cursorRect.getAttributeNS(null, "y") == null ? null : Math.round(parseFloat(cursorRect.getAttributeNS(null, "y")));
            var cursorClientRect = cursorRect.getBoundingClientRect();
            //cursorY = cursorY - (cursorRect.parentElement.getBoundingClientRect().top - cursorRect.parentElement.parentElement.getBoundingClientRect().top);

            for (j = 0; j < $(textContainer).find("text").length; j++) {
                var val = $(textContainer).find("text")[j];
                var x = parseFloat($(val).attr("x"));
                var y = parseFloat($(val).attr("y"));
                //var matrix = val.parentElement.parentElement.getTransformToElement(cursorRect.parentElement);
                var matrix =  getTransformToElement(val.parentElement.parentElement,cursorRect.parentElement);//val.parentElement.parentElement.getTransformToElement(cursorRect.parentElement);
                var position = svg.createSVGPoint();
                position.x = 0;
                position.y = 0;
                position = position.matrixTransform(matrix);

                x += position.x;
                y += position.y;

                if (cursorY == null || y > cursorY + 5) {
                    text += val.textContent + " ";
                    presentationWordsList.push(val);
                    if (val.textContent[val.textContent.length - 1].match(/\.|\!|\?/)) break;
                } else
                    if (y > cursorY - val.getBBox().height / 2)
                        if (x + parseFloat(val.getBBox().width) > cursorX) {
                            if (!startNode) startNode = val;
                            text += val.textContent + " ";
                            presentationWordsList.push(val);
                            if (val.textContent[val.textContent.length - 1].match(/\.|\!|\?/)) break;
                        }

            }
        }
        presentationMoveRight = false;

        var textMatch = text.match(Settings.getFullStopRegExp());

        if (textMatch && !isSelectedText) {
            text = text.substr(0, textMatch.index + 1);
        }
        if ((Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.sentance ||
				Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.doublehighlight))
            highlightPresentationText(presentationWordsList);
        return text;
    }
    var arrHasDupes = function (arr) {
        var i, j, n;
        n = arr.length;
        for (i = 0; i < n; i++) {
            for (j = i + 1; j < n; j++) {
                if (arr[i].style.top == arr[j].style.top) return true;
            }
        }
        return false;
    }

    var getLineBreakCount = function (text) {
        breakLines = text.split(/\n/);
        var newLinesCount = breakLines.length;
        if (text.length > 0 && breakLines.length > 0) {
            for (var i = breakLines.length - 1; i >= 0; i--) {
                if (breakLines[i].trim() === "") {
                    newLinesCount = newLinesCount - 1;
                }
            }
        }
        return newLinesCount;
    }

    var getTotalPercentageByCurrentLine = function (lineLength, totalTextWidth) {
        return lineLength / totalTextWidth;
    }
    var getTextByCurrentLine = function (curentLineObj) {
        var totalPercent = getTotalPercentageByCurrentLine(curentLineObj.pValueText.trim().length, curentLineObj.pTotalTextWidth);
        var startPosition = (curentLineObj.startPosition - curentLineObj.pLeftfileBorder) * totalPercent;
        var lengthPosition = curentLineObj.textLength * totalPercent;
        var endPosition = startPosition + lengthPosition;
        return rightLeftSentenceFix(curentLineObj.pValueText, Math.round(startPosition), Math.round(endPosition)) + "\n";
    }

    var rightLeftSentenceFix = function (text, startPosition, endPosition) {
        var splitedText = text.split('');
        var startSymbol = 0;
        var endSymbol;
        var rightSymbolCount;
        var leftSymbolCount;
        var rgx = /[ _.,!?"'\s]/;
        if (!oneWordCheck(startPosition, endPosition, text, rgx)) {
            rightSymbolCount = getRightSymbolCount(startPosition, text, splitedText, rgx);
            leftSymbolCount = getLeftSymbolCount(startPosition, text, splitedText, rgx);
            if (leftSymbolCount > rightSymbolCount) {
                startSymbol = startPosition + rightSymbolCount;
            } else {
                startSymbol = startPosition - leftSymbolCount;
            }
            if (!rgx.test(splitedText[endPosition])) {
                rightSymbolCount = getRightSymbolCount(endPosition, text, splitedText, rgx);
                leftSymbolCount = getLeftSymbolCount(endPosition, text, splitedText, rgx);
                if (leftSymbolCount > rightSymbolCount) {
                    endSymbol = endPosition + rightSymbolCount;
                } else {
                    endSymbol = endPosition - leftSymbolCount;
                }
            } else {
                endSymbol = endPosition;
            }
        } else {
            if (rgx.test(splitedText[endPosition])) {
                endSymbol = endPosition;
            } else {
                rightSymbolCount = getRightSymbolCount(endPosition, text, splitedText, rgx);
                endSymbol = endPosition + rightSymbolCount - 1;
            }
            if (rgx.test(splitedText[startPosition])) {
                startSymbol = startPosition;
            } else {
                leftSymbolCount = getLeftSymbolCount(startPosition, text, splitedText, rgx);
                startSymbol = startPosition - leftSymbolCount;
            }
        }

        return text.slice(startSymbol, endSymbol);
    }
    var oneWordCheck = function (startPosition, endPosition, text, rgx) {
        var selectedText = text.slice(startPosition, endPosition).trim();
        var splitedText = selectedText.split('');
        for (var i = 0; i < splitedText.length; i++) {
            if (rgx.test(splitedText[i])) {
                return false;
            }
        }
        return true;
    }

    var getRightSymbolCount = function (position, text, splitedText, rgx) {
        var rightCharCounter = 0;
        for (var i = position - 1; i < text.length; i++) {
            if (rgx.test(splitedText[i])) {
                break;
            }
            rightCharCounter++;
        }
        return rightCharCounter;
    }

    var getLeftSymbolCount = function (position, text, splitedText, rgx) {
        var leftCharCounter = 0;
        for (var i = position - 1; i > 0; i--) {
            if (rgx.test(splitedText[i])) {
                break;
            }
            leftCharCounter++;
        }
        return leftCharCounter;
    }

    var playIndecies = function (indices, json) {
        wordIndex = 0;
        isLoadNewFileInProgress = false;
        if (isPlaying || player.getIsPaused()) {
            mappingItemIndex = 0;
            sentanceSymbolIndex = 0;
            serverResponse = { fileinfo: json, Mapping: indices };
            if (serverResponse.Mapping.length > 0 && (!isGoogle || (isGoogle && isGoogleDocs) || (isGoogle && isGooglePresentation) || (isGoogle && isGoogleDrawing))) {
                toggleHighlightCss(true);
                player.stop();
                highlightNextWord(serverResponse.Mapping[mappingItemIndex]);
            }
            if (!player.getIsPaused()) {
                player.play(json);
            } else {
                player.setmedia(json);
            }
        }
    };

    var currentSentanseNode = null;
    var currentSentanseIndex = null;

    var fixCursorPositionToStartWithSentence = function () {
        var oldRange = CursorUtils.GetCursorPosition();
        currentSentanseNode = oldRange.getStartNode();
        currentSentanseIndex = oldRange.getStartOffset();

        var text = $(currentSentanseNode).text();
        var textMatch = text.match(Settings.getFullStopRegExp());
        var matchIndex = -1;

        while (textMatch) {
            matchIndex = textMatch.index;
            text = text.substr(0, textMatch.index);
            textMatch = text.match(Settings.getFullStopRegExp());
        }

        if (matchIndex != -1 && matchIndex + 2 == currentSentanseIndex) {
            return;
        }

        text = $(currentSentanseNode).text().substr(0, currentSentanseIndex);
        textMatch = (text).match(Settings.getFullStopRegExp());

        if (textMatch && textMatch.index < currentSentanseIndex) {
            CursorUtils.SetCursorPosition(currentSentanseNode, textMatch.index + 2, null, null);
        } else {
            var nodeSentenceStartOffset = -1;
            var lastSentenceNode = null;

            do {
                var textBreakLineNode = '';
                lastSentenceNode = currentSentanseNode;

                var currentSentanseNode = TextManager.getPrevTextNode(currentSentanseNode, function (node) {
                    if ($(node).get(0).nodeName.match(Settings.getBreakLineTagsRegExp())) {
                        textBreakLineNode = "\n";
                    }
                });
                text = $(currentSentanseNode).text() + textBreakLineNode + text;
                var textMatcher = text;
                var textMatchIndex = 0;
                var matchFound = false;

                do {
                    textMatch = (textMatcher).match(Settings.getFullStopRegExp());
                    if (textMatch) {
                        textMatchIndex = textMatchIndex + textMatch.index + 2;
                        textMatcher = textMatcher.substr(textMatchIndex);
                        matchFound = true;
                    }
                } while (textMatch);

                if (matchFound) {
                    while (textMatchIndex > $(currentSentanseNode).text().length) {
                        textMatchIndex = textMatchIndex - $(currentSentanseNode).text().length;
                        currentSentanseNode = TextManager.getNextTextNode(currentSentanseNode, null);
                    }
                    textMatchIndex = textMatchIndex - 1; //(text.match(/\n/g) || []).length;
                    if (text.length == textMatchIndex) {
                        currentSentanseNode = TextManager.getNextTextNode(currentSentanseNode, null);
                        nodeSentenceStartOffset = 0;
                    } else {
                        nodeSentenceStartOffset = textMatchIndex;
                    }
                } else {
                    if (!currentSentanseNode || $(currentSentanseNode).attr("id") == "area" || $(currentSentanseNode).length <= 0) {
                        currentSentanseNode = lastSentenceNode;
                        nodeSentenceStartOffset = 0;
                    }
                }
            } while (nodeSentenceStartOffset == -1);

            CursorUtils.SetCursorPosition(currentSentanseNode, nodeSentenceStartOffset, null, null);
        }
    };

    var fixCursorPositionTostartWithWord = function (fixLeftAndRight) {
        if(isWordOnline){
            var prev = null;

            while(window.getSelection().baseNode && window.getSelection().baseNode.data.trim()=="" 
                && prev != window.getSelection().baseNode
                && !(window.getSelection().baseNode.data === ' ' && window.getSelection().baseOffset === 1)) {
                prev = window.getSelection().baseNode;
                customEvent = new CustomEvent('moveCursorToWordStart');
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
            }
        }
        var oldRange = CursorUtils.GetCursorPosition();
        var startTextNode = oldRange.getStartNode();
        var until = null;
        var untilIndex = null;
        var startIndex = firstSpacePostition($(startTextNode).text(), oldRange.getStartOffset(), false);
        
        if (fixLeftAndRight) {
            until = oldRange.getEndNode();
            untilIndex = firstSpacePostition($(until).text(), oldRange.getEndOffset(), true);
        }
        
        if ((isGoogle && isGoogleDocs) || isWordOnline) {
            var moveLeftCount = oldRange.getStartOffset() - startIndex + (wasTextSelelected ? 1 : 0);
            
            if(isWordOnline && moveLeftCount == 0) {
                var customEvent = new CustomEvent('moveCursorRight', { 'detail': { count: 1 } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                var customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1 } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                oldRange = CursorUtils.GetCursorPosition();
                startTextNode = oldRange.getStartNode();
            }
            else {
                var customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: moveLeftCount } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
            }
        }

        CursorUtils.SetCursorPosition(startTextNode, startIndex, until, untilIndex);
    };

    var firstSpacePostition = function (text, startIndex, isStart) {
        var ifItsSymbolBeforeWord = function (symbol) {
            //return symbol == " " || symbol == "\n";
            return symbol && (symbol.charCodeAt(0) == 160 || symbol.charCodeAt(0) == 32 || symbol == "\n");
        };
        if (ifItsSymbolBeforeWord(text[startIndex - 1])) {
            return startIndex;
        }
        if (isStart) {
            for (var i = startIndex; i < text.length; i++) {
                if (ifItsSymbolBeforeWord(text[i])) {
                    return i;
                }
            }
            return text.length;
        } else {
            for (var i = startIndex; i > 0; i--) {
                if (ifItsSymbolBeforeWord(text[i])) {
                    return i + 1;
                }
            }
            return 0;
        }

    };

    var sentanceHighlighRange;
    var isNextNewParagraph = false;

    var getTextForPlay = function (newCycle) {
        if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA") {
            return getTextFromInputTextArea(CursorUtils.getActiveElement(), newCycle);
        }        

        if (sentanceHighlighRange) {
            if (sentanceHighlighRange.isValid()) cssApplier.undoToRange(sentanceHighlighRange);
            sentanceHighlighRange = null;
        }
        var text = "";
        var wordOnlineRangeModified = false;
        var savedSentanceNode;
        var savedSentanceIndex;
        // var startContainer, startPosition;
        if (newCycle) {
            //if (MainViewModel.isSentenceFromCursor()) {
            //    fixCursorPositionToStartWithSentence();                
            //}
            //else 
            if (MainViewModel.isSentenceFromCursor() && isGoogleDocs && wasTextSelelected && !readBysentence) {
                moveCursorToStartPositionBeforePlaying();
            } else if (isGoogle || (CursorUtils.getActiveElement().hasAttribute('contenteditable') && !wasTextSelelected)) {
                fixCursorPositionTostartWithWord(false);
            }
        } else {
            if (isWordOnline) {
                customEvent = new CustomEvent('moveCursorToWordStart');
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                //currentSentanseIndex = 0; // ITWC-1067
            }
            if (isGoogleDocs && isNextNewParagraph && navigator.platform.toUpperCase().indexOf('MAC')>=0) {
                customEvent = new CustomEvent('moveCursorToWordStart', { 'detail': { isNextNewParagraph: true } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                isNextNewParagraph = false;
            }
            moveCursorToStartPositionBeforePlaying();
        }
        var oldRange = CursorUtils.GetCursorPosition();
        //normalize should be false if we are on eleve test tasks site. ITWC-787 NationalTest + Klik - flyt - klik exercise: doubleclick on box breaks the style
        cssApplier.normalize = !($(oldRange.getStartNode()).parents('.draggable').length && isElevTestTasks);

        if(event && event.type == 'dblclick' && oldRange.getText() == '') return '';

        currentSentanseNode = oldRange.getStartNode();
        currentSentanseIndex = oldRange.getStartOffset();
        var wordIsMoved = false;
        if  (isWordOnline && wasTextSelelected && !isCollapsedOnClickPlay) {   // if we play selected text in word online first time
            if (!(CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA")) {

                // remove selection
                var customEvent = new CustomEvent('moveCursorLeft', { 'detail': { count: 1 } });
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);                

                // fix rangy after event
                //var prev = null;
                //while (window.getSelection().baseNode && window.getSelection().baseNode.data.trim() == "" && prev != window.getSelection().baseNode) {
                //    prev = window.getSelection().baseNode;
                //    customEvent = new CustomEvent('moveCursorToWordStart');
                //    document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
                //}
                
                if (isWordOnline && currentSentanseNode != window.getSelection().baseNode) {
                    currentSentanseNode = window.getSelection().baseNode;
                    currentSentanseIndex = window.getSelection().baseOffset;

                    wordOnlineRangeModified = true;
                    savedSentanceNode = currentSentanseNode;
                    savedSentanceIndex = currentSentanseIndex;
                }
            }
            //return text.replace(/\n/g, " ").replace(/\s+$/, '');
        }
        var isWordOnlineNewParagraph = false;        
        while (currentSentanseNode && !text.match(Settings.getFullStopRegExp()) && $(currentSentanseNode).length > 0) {
            if (isWordOnline && wordOnlineSelectedNodesNumber > 0 && wordOnlineSelectedNodesCounter >= wordOnlineSelectedNodesNumber) {                
                break;
            }

            var textToAdd = '';

            if (currentSentanseIndex > 0) {                
                textToAdd = $(currentSentanseNode).text().substr(currentSentanseIndex, $(currentSentanseNode).text().length);
                text = textToAdd;
            } else {
                //TODO: Remove wordIsMoved property
                if (wordIsMoved) {
                    textToAdd = text.substr(0, text.length - 1);//.replace(/\s+/g, ' ');
                    text = textToAdd;
                }                
                
                // ITWC-749 ExampleTests: 'highlight word' and 'highlight word and sentence' not correct marking on some texts 
                if(currentSentanseNode.parentNode && currentSentanseNode.parentNode.className === 'note-container' && $(currentSentanseNode).text() === '×') {
                    textToAdd = ' ';
                    text += textToAdd;
                }
                else {
                    textToAdd = $(currentSentanseNode).text();//.replace(/\s+/g, ' ');
                    text += textToAdd;
                }
            }

            if (isWordOnline && wordOnlineSelectedNodesNumber > 0
                && textToAdd !== ''
                && textToAdd.charCodeAt(0) !== 160 /*&& $(currentSentanseNode).text().match(Settings.getSymbolRegExp())*/) { 
                wordOnlineSelectedNodesCounter++;
            }

            wordIsMoved = false;
            
            if(isGoogleDocs) text = text.replace(/\u200B/g, ' ');            
            
            // ITWC-890 Writing templates + Word: highlight functionality is not working in text with '...' 
            if(isWordOnline) {
                text = text.replace(/\s/g, ' ');
                // replace '...' char with '.'
                text = text.replace(/\u2026/g, '.');

                // ITWC-892 Writing templates + Word: not reading correct with highlight functions and text in list style
                //replace 'BULLET' char with space
                text = text.replace(/\u2022/g, ' ');
            }

            var textMatch = text.match(Settings.getFullStopRegExp());
            
            var lineBreak = "";
            if (MainViewModel.isSentenceFromCursor()) {
                //lineBreak = text.indexOf("\n");
            }

            // ITWC-1026
            var selectedRangeWhenUserPressPlayEndOffset = (currentSentanseNode.compareDocumentPosition(selectedRangeWhenUserPressPlay.getEndNode()) === Node.DOCUMENT_POSITION_PRECEDING)
                ? 0
                : selectedRangeWhenUserPressPlay.getEndOffset();

            if ((textMatch || (lineBreak != -1 && lineBreak != "")) && (textMatch && (selectedRangeWhenUserPressPlay && selectedRangeWhenUserPressPlayEndOffset > textMatch.index + currentSentanseIndex || !wasTextSelelected))) {

                if (!textMatch || textMatch.index < lineBreak) {
                    textMatch = {};
                    textMatch.index = lineBreak;
                }                

                var diff = text.indexOf($(currentSentanseNode).text().replace(/\u200B/g, ' '));
                var sentenseSeparator = text[textMatch.index];
                text = text.substr(0, textMatch.index);
                if (isWordOnline && wordOnlineSelectedNodesNumber > 0) {
                    wordOnlineSelectedNodesCounter--;
                }
                if (diff > textMatch.index) {
                    currentSentanseIndex = 0;
                } else {
                    currentSentanseIndex = currentSentanseIndex + (textMatch.index - diff) + 1;
                }
                var separators = ".!?";
                if (separators.indexOf(sentenseSeparator) >= 0)
                    text += sentenseSeparator;
                if ($.trim(text) != "") {
                    break;
                } else {
                    text = "";
                }

            }
            else                
                if (wasTextSelelected && (currentSentanseNode == selectedRangeWhenUserPressPlay.getEndNode()
                        || currentSentanseNode == selectedRangeWhenUserPressPlay.getEndNode().firstChild
                        || currentSentanseNode.compareDocumentPosition(selectedRangeWhenUserPressPlay.getEndNode()) === Node.DOCUMENT_POSITION_PRECEDING)) {
                    
                    // ITWC-1026
                    currentSentanseIndex = (currentSentanseNode.compareDocumentPosition(selectedRangeWhenUserPressPlay.getEndNode()) === Node.DOCUMENT_POSITION_PRECEDING)
                        ? 0
                        : selectedRangeWhenUserPressPlay.getEndOffset();

                    var nodeOffset = $(currentSentanseNode).text().length - text.length;
                    text = text.substr(0, currentSentanseIndex - nodeOffset); //.replace(/\s+/g, ' ');
                    prevNode = currentSentanseNode;
                    break;
                }
                else if (wasTextSelelected && (textMatch || (lineBreak != -1 && lineBreak != ""))) {
                    if (!textMatch || textMatch.index < lineBreak) {
                        textMatch = {};
                        textMatch.index = lineBreak;
                    }

                    var diff = text.lastIndexOf($(currentSentanseNode).text().replace(/\u200B/g, ' '));
                    var sentenseSeparator = text[textMatch.index];
                    var cuttedText = text.substring(textMatch.index, text.length);
                    text = text.substr(0, textMatch.index);//.replace(/\s+/g, ' ');
                    if (isWordOnline && wordOnlineSelectedNodesNumber > 0 /* && cuttedText.match(Settings.getSymbolRegExp())*/) {
                        wordOnlineSelectedNodesCounter--;
                    }
                    if (diff > textMatch.index) {
                        currentSentanseIndex = 0;
                    } else {
                        currentSentanseIndex = currentSentanseIndex + (textMatch.index - diff) + 1;
                    }
                    var separators = ".!?";
                    if (separators.indexOf(sentenseSeparator) >= 0)
                        text += sentenseSeparator;
                    if ($.trim(text) != "") {
                        break;
                    } else {
                        text = "";
                    }
                }
                else {
                    currentSentanseIndex = $(currentSentanseNode).text().length;
                }
            //We need to save latest parsed node.
            prevNode = currentSentanseNode;
            var selectionEndNode = null;

            var isNewParagraph = false;
            if (isGoogleDocs && $.trim(text) != "") {
                var nextSentanseNode = TextManager.getNextTextNodeIfParagraph(currentSentanseNode);
                if (nextSentanseNode == null) {
                    isNewParagraph = true;
                    isNextNewParagraph = true;
                }
            }

            currentSentanseNode = TextManager.getNextTextNode(currentSentanseNode, function (node) {  // 1

                if (wasTextSelelected && node == selectedRangeWhenUserPressPlay.getEndNode())
                    selectionEndNode = node;

                if ($(node).get(0).nodeName.match(Settings.getBreakLineTagsRegExp())) {
                    //if (text.substr(text.length - 1) == "-") {
                    //    wordIsMoved = true;
                    //} else {
                        text += "\n";
                    //}
                }
                else if((node.nodeName === 'SPAN' && $(node).css('display') === 'inline-block'
                    && node.previousSibling && node.previousSibling.nodeName === 'SPAN' && $(node.previousSibling).css('display') === 'inline-block')
                    || node.nodeName === 'TD') {
                    text += ' ';
                }

                //fix for justify in google docs
                if ((isGoogleDocs || isWordOnline) && $.trim($(node).text()) == "") {
                    text += " ";
                }
            });
            if (isWordOnline && /*!wasTextSelelected && */ currentSentanseNode && currentSentanseNode.className == "EOP") {
                //currentSentanseIndex = 0;
                break;            
            }

            if (selectionEndNode) currentSentanseNode = selectionEndNode;

            if (isNewParagraph) {
                isNewParagraph = false;
                if (currentSentanseNode) {
                    currentSentanseIndex = 0;
                    if (isGoogleDocs) {
                        text += " ";
                    }
                } else {
                    currentSentanseNode = prevNode;
                }
                break;
            }

            if (currentSentanseNode) {
                currentSentanseIndex = 0;  
                //if (isGoogleDocs)//fix for justify in google docs
                //text += " ";
            } else {
                isNewParagraph = false;
                currentSentanseNode = prevNode;
                break;
            }
        }

        if (text.replace(/\n/g, " ") != '' && (Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.sentance ||
				Settings.getInstance().getHIGHLIGHTSTRATEGY() == Settings.highlightStrategies.doublehighlight) &&
				!(CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA")) {
            
            if (wordOnlineRangeModified) { // fix for Word Online range has taken place

                sentanceHighlighRange = rangy.createRange();                
                sentanceHighlighRange.setStart(savedSentanceNode, savedSentanceIndex);

                try {
                    sentanceHighlighRange.setEnd(currentSentanseNode, currentSentanseIndex);
                } catch (e) {
                    if (e.code == 1) {
                        sentanceHighlighRange.setEnd(currentSentanseNode, 0);
                    }
                }                
                cssApplier.applyToRange(sentanceHighlighRange);
                wordOnlineRangeModified = false;
            } else {
                sentanceHighlighRange = rangy.createRange();
                var oldRange = CursorUtils.GetCursorPosition();
                sentanceHighlighRange.setStart(oldRange.getStartNode(), oldRange.getStartOffset());

                try {
                    sentanceHighlighRange.setEnd(currentSentanseNode, currentSentanseIndex);
                } catch (e) {
                    if (e.code == 1) {
                        sentanceHighlighRange.setEnd(currentSentanseNode, 0);
                    }
                }
                cssApplier.applyToRange(sentanceHighlighRange);
                CursorUtils.SetCursorPosition(oldRange.getStartNode(), oldRange.getStartOffset());
            }                       
        }

        //return text.replace(/\n/g, " ").trim();

        //.replace(/\u00a0/g, " ") - replace &nbsp; with space
        //.replace(/\u200B/g, '') - remove ZERO WIDTH SPACE (unicode 8203) from string
        return text.replace(/\n/g, " ").replace(/\s+$/, '').replace(/\u00a0/g, ' ').replace(/\u200B/g, '');
    };

    var inputTextReadingData = null;

    var getTextFromInputTextArea = function (element, newCycle) {
        if (newCycle || (inputTextReadingData && inputTextReadingData.endSentanceIndex < element.value.length)) {
            var text = element.value + ' ';
            if (element.selectionStart >= text.length && text.slice(element.selectionStart, text.length).trim() == "") {
                element.select();
            }
            var selStart = (inputTextReadingData) ? inputTextReadingData.selStart : element.selectionStart;
            var selEnd = (inputTextReadingData) ? inputTextReadingData.selEnd : element.selectionEnd;
            var wordStart = selStart;
            var wordEnd = text.length;

            if (inputTextReadingData) {
                //selStart = inputTextReadingData.endSentanceIndex;
                wordStart = inputTextReadingData.endSentanceIndex;
            }

            // find word start when selection starts with space
            while (wordStart < text.length && !text[wordStart].match(Settings.getSymbolRegExp())) {
                wordStart++;
            }

            var spaceBeforeSelStartIndex = text.substring(0, wordStart).replace(/(\r\n|\n|\r)/gm, " ").lastIndexOf(' ');
            // update start selection to start with word
            if (spaceBeforeSelStartIndex != -1)
                wordStart = spaceBeforeSelStartIndex + 1;

            if (selStart != selEnd) {
                wordEnd = selEnd;
                while (text[wordEnd - 1] == ' ') {
                    wordEnd--;
                }

                var spaceAfterSelEndIndex = text.substring(wordEnd, text.length).replace(/(\r\n|\n|\r)/gm, " ").indexOf(' ');

                if (spaceAfterSelEndIndex != -1)
                    wordEnd = spaceAfterSelEndIndex + wordEnd;
            }

            text = text.substring(wordStart, wordEnd);
            if (!inputTextReadingData) {
                inputTextReadingData = {
                    element: element,
                    endSentanceIndex: 0,
                    selStart: selStart,
                    selEnd: selEnd
                };
            }
            inputTextReadingData.endSentanceIndex += wordStart - inputTextReadingData.endSentanceIndex;
            inputTextReadingData.wordStart = wordStart;
            var match = text.match(Settings.getFullStopRegExp());

            if (match) {
                text = text.substring(0, match.index + 1);
                inputTextReadingData.endSentanceIndex += match.index + 1;
            }
            else {
                inputTextReadingData.endSentanceIndex += wordEnd - wordStart;
            }

            return text;
        }
        else {
            //inputTextReadingData = null;
            return '';
        }
    }

    var moveCursorToStartPositionBeforePlaying = function (node) {
        if(isWordOnline){
            var prev = null;
            while(window.getSelection().baseNode && window.getSelection().baseNode.data
                && (window.getSelection().baseNode.data.trim() === '' || window.getSelection().baseNode.textContent.length === currentSentanseIndex)
                && (prev != window.getSelection().baseNode)
                && !(window.getSelection().baseNode.data === ' ' && window.getSelection().baseOffset === 1)) {
                prev = window.getSelection().baseNode;
                customEvent = new CustomEvent('moveCursorToWordStart');
                document.getElementById("itw_predictionsmain").dispatchEvent(customEvent);
            }
        }
        if (isWordOnline && currentSentanseNode != window.getSelection().baseNode){
            currentSentanseNode = window.getSelection().baseNode;
            currentSentanseIndex = window.getSelection().baseOffset;
        }        

        var _node = currentSentanseNode;
        if (!TextManager.isTextNode(currentSentanseNode)) {
            while (_node != null) {
                var child = $(_node).get(0).firstChild;
                if (child != null) {
                    _node = child;
                    if (TextManager.isTextNode(_node)) {
                        break;
                    }
                } else {
                    _node = TextManager.getNextTextNode(_node);
                    break;
                }
            }

        }
        var text = $(_node).text();
        var symbolFound = false;

        if (isWordOnline && currentSentanseIndex == text.length) { // check if cursor is in last symbol of the node
            var newNode = TextManager.getNextTextNode(_node);      // 2
            if (newNode) {
                if(newNode.className === 'EOP' && newNode != node){
                    moveCursorToStartPositionBeforePlaying(newNode);
                    return;
                }

                //if (isWordOnline && wordOnlineSelectedNodesNumber > 0 && $(currentSentanseNode).text().match(Settings.getSymbolRegExp())) { wordOnlineSelectedNodesCounter++; }

                CursorUtils.SetCursorPosition(newNode, 0);
   
                return;
            }
        }

        for (var i = currentSentanseIndex; i < text.length; i++) {
            if (text[i].match(Settings.getSymbolRegExp())) {
                symbolFound = true;
                break;
            }
            currentSentanseIndex++;
        }
        currentSentanseNode = _node;
        if (symbolFound) {
            CursorUtils.SetCursorPosition($(_node).get(0), currentSentanseIndex);
        } else {

            if (_node != null) {
                CursorUtils.SetCursorPosition(_node, text.length);
            }
        }        
    };

    var isPdfSelectionChanged = function (oldSelection, newSelection) {
        if (oldSelection.length != newSelection.length)
            return true;
        for (var i = 0; i < oldSelection.length; i++) {
            if (oldSelection[i].style.left != newSelection[i].style.left || oldSelection[i].style.top != newSelection[i].style.top ||
				oldSelection[i].style.width != newSelection[i].style.width || oldSelection[i].style.height != newSelection[i].style.height)
                return true;
        }
        return false;
    };

    var setCursorVisibilityForGoogleDocs = function (value) {
        if (isGoogleDocs) {
            $('.kix-cursor-caret').css("visibility", value);
        };
    }

    return {
        playPause: function () {
            if (!isPlaying) {                
                var range = CursorUtils.GetCursorPosition();
                if (range || (isGoogle && !isGoogleDocs)) {
                    if (!player.getIsPaused()) {
                        if (!isGoogle || (isGoogle && (isGoogleDocs || isGoogleSpreadsheet))) {
                            if (!isGoogle && !range.isCollapsed()) {
                                readBysentence = true;
                            }
                            if (readBysentence) {
                                if (CursorUtils.isTextualTypeEditableInput(CursorUtils.getActiveElement()) || CursorUtils.getActiveElement().nodeName == "TEXTAREA") {
                                    wasTextSelelected = CursorUtils.getActiveElement().selectionEnd > 0;
                                } else {
                                    wasTextSelelected = !range.isCollapsed();
                                }
                                selectedRangeWhenUserPressPlay = CursorUtils.GetCursorPosition();
                            }

                        }
                        if (isWordOnline && wasTextSelelected) {
                            wordOnlineSelectedNodesNumber = $(".TextRun .Selected").length;
                            //wordOnlineSelectedNodesNumber = $(".SpellingError.Selected").length;
                            /*$("span.Selected").each(function (i) {  // check if we have words with one letter (Word Online does not place them in SpellingError class)
                                if ($(this).text().match(Settings.getSymbolRegExp()) && !$(this).hasClass("SpellingError")) {
                                    wordOnlineSelectedNodesNumber++;
                                }
                            });*/
                        } else {
                            wordOnlineSelectedNodesNumber = 0;
                        }
                        wordOnlineSelectedNodesCounter = 0;
                        loadFileAndPlay(true);
                    } else {
                        if (isGooglePdf) {
                            var newPdfSelection = $('.drive-viewer-paginated-page-selection').children();
                            if (isPdfSelectionChanged(pdfSelection, newPdfSelection)) {
                                runStop();
                                loadFileAndPlay(true);
                            } else {
                                setIsPlaying(true);
                                player.resume();
                            }
                        }
                        else {
                            if (!isGoogle && (currentNode.getStartNode() != range.getStartNode()
							|| (range.getStartOffset() != currentNode.getStartOffset() && range.getEndOffset() != currentNode.getEndOffset()))) {
                                selectedRangeWhenUserPressPlay = range;
                                wasTextSelelected = !range.isCollapsed();
                                runStop();
                                loadFileAndPlay(true);
                            } else {
                                setIsPlaying(true);
                                player.resume();
                                setCursorVisibilityForGoogleDocs("hidden");
                            }
                        }
                    }
                    //setIsPlaying(true);
                }
            } else {
                setIsPlaying(false);
                player.pause();
                setCursorVisibilityForGoogleDocs("visible");
                setTimeout(function () {
                    currentNode = CursorUtils.GetCursorPosition();
                }
						 , 15);
            }
        },
        canBePlayed: function (startIndex) {
            var start = CursorUtils.GetCursorPosition().getStartNode();

            while (start != null) {
                var text = $(start).text();
                if ($.trim(text.substr(startIndex, text.length - 1)) != "") {
                    return true;
                }
                start = TextManager.getNextTextNode($(start));
                startIndex = 0;
            }
            return false;
        },
        indexForReadingPdfBySentance: function (value) {
            if ($.isNumeric(value)) {
                indexForReadingPdfBySentance = value;
            } else {
                return indexForReadingPdfBySentance;
            }
        },
        stop: function () {
            runStop();
        },
        isPlaying: function () {
            return isPlaying;
        },
        isPaused: function () {
            return player.getIsPaused();
        },
        getPlayer: function () {
            return player;
        },
        setWasTextSelected: function (val) {
            wasTextSelelected = val;
        }
    };
};

SpeachManager.loadIndecies = function (text, callback) {
    ClientManager.getInstance().speach.speak(text, true, function (json) {
        //ClientManager.getInstance().speach.getIndeces(json.id, function (indices) {
            if (callback) {
                callback(json.indices, json);
            }
        //});
    });
};