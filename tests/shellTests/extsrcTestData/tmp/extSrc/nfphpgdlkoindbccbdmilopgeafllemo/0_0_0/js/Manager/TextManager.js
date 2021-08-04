var TextManager = {
    lastIndex: 0,
    savedRange: null,
    isInFocus: null,
    parsedText: "",

    isStopChar: function (c) {
        return ((c == String.fromCharCode(32)) || (c == String.fromCharCode(160)) || (c == '\t') || (CursorUtils.FullStop.indexOf(c) > -1));
    },

    getNextTextNodeIfParagraph: function (runFrom, nodeProcessDelegate){
        if (isGoogleDocs) {
            if ($(runFrom).parents('div.kix-paginateddocumentplugin').length <= 0 || runFrom == null) return null;
        }
        if (CursorUtils.getActiveElement().contentEditable == "true" || CursorUtils.getActiveElement().contentEditable == "plaintext-only") {
            if (($(runFrom).parents('div[contenteditable="true"]').length <= 0 && $(runFrom).parents('div[contenteditable="plaintext-only"]').length <= 0) || runFrom == null) return null;
        }
        else {
            if ($(runFrom).parents('body').length <= 0 || runFrom == null) return null;
        }

        var node = $(runFrom).get(0).nextSibling;
        if (node == null) {
            return this.getNextTextNodeIfParagraph($(runFrom).parent(), nodeProcessDelegate);
        }

        if ($(node).hasClass('kix-paragraphrenderer')) {
            return null;
        }

        if (!TextManager.isTextNode(node)) {
            if (nodeProcessDelegate != null) {
                nodeProcessDelegate(node);
            }
        }

        if ($.trim($(node).text()) == "") {
            return this.getNextTextNodeIfParagraph(node, nodeProcessDelegate);
        }

        if (node != null) {
            while (!TextManager.isTextNode(node)) {
                if (node.childNodes.length > 0) {
                    node = node.firstChild;
                } else {
                    return this.getNextTextNode(node, nodeProcessDelegate);
                }
            }
            return node;
        }
        return null;
    },

    //Method will always return next text node in DOM
    //Second parameter is used to fix proper position when we highlight word check AudioManager.highlightNextWord
    getNextTextNode: function (runFrom, nodeProcessDelegate) {
        //if ($(runFrom).attr("id") == "area" || runFrom == null) return null;
        if(isGoogleDocs) {
			if($(runFrom).parents('div.kix-paginateddocumentplugin').length <= 0 || runFrom == null) return null;
        }
        if (isGooglePresentation || isGoogleDrawing) {
            if($(runFrom).parents('svg').length <= 0 || runFrom == null) return null;
        }
        if(CursorUtils.getActiveElement().contentEditable=="true" || CursorUtils.getActiveElement().contentEditable=="plaintext-only"){
            if(( !isWordOnline && $(runFrom).parents('div[contenteditable="true"]').length <= 0 
                && $(runFrom).parents('div[contenteditable="plaintext-only"]').length <= 0 ) || runFrom == null
                || (isWordOnline && !isOneNote && $(runFrom).parents('div.OutlineContent').length <= 0  )
                || (isOneNote && $(runFrom).parents('div.OutlineElement').length <= 0  )) return null;
        }
		else {
			if($(runFrom).parents('body').length <= 0 || runFrom == null) return null;
		}
		
        var node = $(runFrom).get(0).nextSibling;
        if (node && (node.id == 'itw_panel' || node.nodeName == 'image' ||(node.className && node.className.indexOf("HiddenParagraph") > -1))) {
            node = node.parentNode.nextSibling;
        }

        // ITWC-755 ExampleTests: 'highlight word' and 'highlight word and sentence' issue when selecting text
        if(node && node.nodeType === Node.COMMENT_NODE) {
            node = node.nextSibling;
        }

        if (node == null || (isWordOnline && ($(node).hasClass('HiddenByEditing')))) {
            return this.getNextTextNode($(runFrom).parent(), nodeProcessDelegate);
        }

        if (isWordOnline && node != null && $(node).hasClass('EmptyTextRun')) {
            return this.getNextTextNode(node, nodeProcessDelegate);
        }

        if(node.className =="EOP") return node;

        if (!TextManager.isTextNode(node)) {
            if (nodeProcessDelegate != null) {
                nodeProcessDelegate(node);
            }
        }

        /*if (node != null) {
            while (!(TextManager.isTextNode(node) || $(node).get(0).nodeName == 'INPUT')) {
                if (node.childNodes.length > 0) {
                    node = node.firstChild;
                } else {
                    return this.getNextTextNode(node, nodeProcessDelegate);
                }
            }
            return node;
        }*/

        // ITWC-755 ExampleTests: 'highlight word' and 'highlight word and sentence' issue when selecting text
        //if (!isWordOnline && $.trim($(node).text()) == "") {
        //    return this.getNextTextNode(node, nodeProcessDelegate);
        //}

        if (node != null) {
            while (!TextManager.isTextNode(node)) {
                if (node.childNodes.length > 0 && node.nodeName != 'SCRIPT') {
                    node = node.firstChild;
                } else {
                    return this.getNextTextNode(node, nodeProcessDelegate);
                }
            }
            return node;
        }
        return null;
    },

    getPrevTextNode: function (runFrom, nodeProcessDelegate) {
        if ($(runFrom).attr("id") == "area" || runFrom == null) return null;
        var node = $(runFrom).get(0).previousSibling;
        if (node == null) {
            return this.getPrevTextNode($(runFrom).parent(), nodeProcessDelegate);
        }

        if (!TextManager.isTextNode(node)) {
            if (nodeProcessDelegate != null) {
                nodeProcessDelegate(node);
            }
        }
        if ($.trim($(node).text()) == "") {
            return this.getPrevTextNode(node, nodeProcessDelegate);
        }
        if (node != null) {
            while (!TextManager.isTextNode(node)) {
                if (node.childNodes.length > 0) {
                    node = node.lastChild;
                } else {
                    return this.getPrevTextNode(node, nodeProcessDelegate);
                }
            }
            return node;
        }
        return null;
    },

    //#endregion

    // Get text for prediction
    //#region

    getWordsFromText: function (text, maxCount) {
        if (text) {
            var countOfWords = 0;
            var startIndex = 0;

            for (var i = text.length - 1; i >= 0; i--) {
                if (i == 0) {
                    countOfWords++;
                }
                else {
                    if ((TextManager.isBreakSymbol(text[i - 1])) && (!TextManager.isBreakSymbol(text[i]))) {
                        countOfWords++;
                    }
                }
                if (countOfWords >= maxCount) {
                    startIndex = i;
                    break;
                }
            }

            return text.substr(startIndex);
        }
        return text;
    },

    isBreakSymbol: function (symbol) {
        //var breakSymbols = TextManager.getWordBreakSymbols();
        //return breakSymbols.indexOf(symbol) > -1;
        var res = true;
        if (symbol) {
            var breakSymbols = TextManager.getWordBreakSymbols();
            res = breakSymbols.indexOf(symbol) > -1;
        }
        return res;
    },

    getSentenceBreakSymbols: function () {
        var breakSymbols = new Array('.', '?', '!');
        return breakSymbols;
    },

    getSentenceBreakSymbolsWithNewLine: function () {
        var breakSymbols = TextManager.getSentenceBreakSymbols();
        breakSymbols.push('\n');
        breakSymbols.push('\r\n');
        return breakSymbols;
    },

    getInsideSentenceWordBreakSymbols: function (symbol) {
        var breakSymbols = new Array(' ', String.fromCharCode(160), ',');
        return breakSymbols;
    },

    getWordBreakSymbols: function () {
        var insideSentenceWordBreakSymbols = TextManager.getInsideSentenceWordBreakSymbols();
        var sentenceBreakSymbols = TextManager.getSentenceBreakSymbolsWithNewLine();
        return insideSentenceWordBreakSymbols.concat(sentenceBreakSymbols);
    },

    getPreviousAndCurrentSentence: function (startNode, startNodeOffset, rootNode) {
        var path = TextManager.getPath(startNode, rootNode);
        if (!path) return null;
        var res = "";
        var sentenceCounter = { Value: 0 };
        for (var i = 0; i < path.length; i++) {
            var offset = -1;
            var prevNode = null;
            if (i == 0) {
                offset = startNodeOffset;
            }
            else {
                prevNode = path[i - 1];
            }

            res = TextManager.getTwoLastSentences(path[i], prevNode, offset, sentenceCounter, path[i] == rootNode) + res;
        }
        return TextManager.removeNonbreakingSpaces(res);

    },

    getWords: function (startNode, startNodeOffset, rootNode, wordsNumber) {
        var previousAndCurrentSentence = TextManager.getPreviousAndCurrentSentence(startNode, startNodeOffset, rootNode);
        return TextManager.getWordsFromText(previousAndCurrentSentence, wordsNumber);
    },

    getPath: function (startNode, rootNode) {
        var path = new Array();
        if (startNode) {
            var curNode = startNode;
            path.push(curNode);
            while ((curNode !== rootNode) && curNode && (curNode.nodeName != 'BODY')) {
                curNode = curNode.parentNode;
                path.push(curNode);
            }
            if (curNode && curNode !== rootNode) return;
        }
        return path;
    },

    sentencesToGet: 2,
    //TODO: rewrite it using regexp
    countSentenceBreakSymbols: function (text) {
        var fullStopSymbols = TextManager.getSentenceBreakSymbols();

        var sentenceBreakSymbols = 0;
        for (var i = 0; i < text.length; i++) {
            if (fullStopSymbols.indexOf(text[i]) > -1)
                sentenceBreakSymbols++;
        }
        return sentenceBreakSymbols;
    },

    getTwoLastSentences: function (node, stopNode, offset, sentenceCounter, isRootNode) {
        //(node === undefined) || (node.id == 'area') ||
        if (sentenceCounter.Value >= TextManager.sentencesToGet) return "";

        var res = "";
        var breakBeforeString = "";
        var breakAfterString = "";

        if(!node) return "";

        if (TextManager.isTextNode(node) && node.parentElement && $(node.parentElement).css('visibility') === 'visible') {
            var text = $(node).text();
            if (offset > -1) text = text.substr(0, offset);
            var breakSymbols = TextManager.countSentenceBreakSymbols(text);
            sentenceCounter.Value += breakSymbols;
            res = text;
        }
        else {
            if (TreeDomHelper.isBr(node)) {
                res = '\n';
            }
            else {
                var indexOfLastChild = TextManager.indexOfNodeList(node.childNodes, (stopNode));
                if (!isRootNode) {
                    if (TextManager.canNodeCauseBreak(node) && (!TreeDomHelper.hasSingleChildBr(node))) {
                        var isMostRightNode = indexOfLastChild > -1;
                        if ((!TextManager.canNodeCauseBreak(node.parentNode)) || (node.parentNode.firstChild != node)) {
                            breakBeforeString = "\n";
                        }
                        if ((!isMostRightNode)
                                && ((!TextManager.canNodeCauseBreak(node.parentNode)) || (node.parentNode.lastChild != node))
                                && ((!node.nextSibling) || (!TextManager.canNodeCauseBreak(node.nextSibling)))
                                && (!TreeDomHelper.isBr(node.lastChild))) {
                            breakAfterString = "\n";
                        }
                    }
                }

                indexOfLastChild = indexOfLastChild > -1 ? indexOfLastChild - 1 : node.childNodes.length - 1;

                for (var i = indexOfLastChild; i > -1; i--) {
                    res = TextManager.getTwoLastSentences(node.childNodes[i], stopNode, -1, sentenceCounter, false) + res;
                }
            }
        }

        return breakBeforeString + res + breakAfterString;
    },

    canNodeCauseBreak: function (node) {
        return (node && node.nodeName)
            ? (((node.nodeName.toLowerCase() === "p") || (node.nodeName.toLowerCase() === "div") || (node.nodeName.toLowerCase().indexOf("h") > -1)) && ((node.childNodes.length > 0)))
            : false;
    },

    indexOfNodeList: function (nodeList, node) {
        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i] === node) {
                return i;
            }
        }
        return -1;
    },

    removeNonbreakingSpaces: function (text) {
        var words = text;
        if (words) {
            var normalSpace = String.fromCharCode(32);
            var sp = words.indexOf(String.fromCharCode(160));
            while (sp > -1) {
                if (sp == 0) {
                    words = normalSpace + words.substring(sp + 1);
                } else {
                    if (sp == words.length - 1) {
                        words = words.substring(0, sp) + normalSpace;
                    }
                    else {
                        words = words.substring(0, sp) + normalSpace + words.substring(sp + 1);
                    }
                }
                sp = words.indexOf(String.fromCharCode(160));
            }
        }
        return words;

    },

    isCursorInWord: function (node, offset) {
        var res = false;

        if (TextManager.isTextNode(node)) {
            var text = $(node).text();
            if ((offset > 0) && (offset < text.length)) {
                res = !TextManager.isBreakSymbol(text[offset - 1]) && !TextManager.isBreakSymbol(text[offset]);
            }
            else {
                if (offset == 0) {
                    res = !TextManager.isBreakSymbol(text[offset]);
                }
            }
        }

        return res;
    },

    getLastWordFromText: function (text) {
        var endIndex = text.length;
        while ((endIndex > -1) && (TextManager.isBreakSymbol(text[endIndex - 1]))) {
            endIndex--;
        }

        var startIndex = endIndex - 1;
        while ((startIndex > -1) && (!TextManager.isBreakSymbol(text[startIndex]))) {
            startIndex--;
        }

        if (TextManager.isBreakSymbol(text[startIndex])) {
            startIndex++;
        }

        return text.substring(startIndex, endIndex);
    },

    getSentenceFromText: function (text) {
        var sentenceBreakSymbols = TextManager.getSentenceBreakSymbolsWithNewLine();
        var endIndex = text.length;
        while ((endIndex > -1) && (TextManager.isBreakSymbol(text[endIndex - 1]))) {
            endIndex--;
        }

        var startIndex = endIndex - 1;
        while ((startIndex > -1) && (sentenceBreakSymbols.indexOf(text[startIndex]) < 0)) {
            startIndex--;
        }

        if (sentenceBreakSymbols.indexOf(text[startIndex]) > -1) {
            startIndex++;
        }

        return text.substring(startIndex, endIndex);
    },

    isTextNode: function (node) {
        return node != null && $(node).parents('image').length <= 0 && $(node).get(0).nodeName == "#text";
    },
	
	isDoubleQuoteChar: function(c) {
        return c == String.fromCharCode(34);
    },
	
	setText: function (node, text) {
        if (TextManager.isTextNode(node)) {
            node.nodeValue = text;
        }
        else {
            var textNode = document.createTextNode(text);
            node.appendChild(textNode);
            if ($.browser.mozilla) {
                $(node).html(function () {
                    return node.innerHTML.replace(/\n/g, "<br/>");
                });
            }
        }
    },

	replaceWordUnderSelection: function (range, insertString) {
        var newRange = range;
        if (range.isCollapsed()) {
            var container = range.getStartNode();
            if (container) {
                if (TextManager.isTextNode(container)) {
                    var cursorPos = range.getStartOffset();
                    var containerText = $(range.getStartNode()).text();
                    var leftBound = cursorPos - 1;
                    while ((!TextManager.isStopChar(containerText[leftBound])) && (!TextManager.isDoubleQuoteChar(containerText[leftBound])) && (leftBound > -1)) {
                        leftBound--;
                    }
                    var rightBound = cursorPos;
                    while ((!TextManager.isStopChar(containerText[rightBound])) && (!TextManager.isDoubleQuoteChar(containerText[rightBound])) && (rightBound < containerText.length)) {
                        rightBound++;
                    }
                    var newText = containerText.slice(0, leftBound + 1) + insertString + containerText.slice(rightBound);
                    TextManager.setText(range.getStartNode(), newText);
                    newRange = CursorUtils.getSelectionRange(range.getStartNode(), leftBound + 1 + insertString.length, range.getEndNode(), leftBound + 1 + insertString.length); //InvariantSelection.createNewRange(range.getStartNode(), leftBound + 1 + insertString.length, range.getEndNode(), leftBound + 1 + insertString.length);
                    
                    if(isFacebook) {
                        var nodeTemp = container.parentNode.innerHTML;
                        container.parentNode.innerHTML = nodeTemp + ' ';
                        container.parentNode.innerHTML = nodeTemp;
                    }
                    if(isWordOnline){
                        $(CursorUtils.getActiveElement().parentElement.parentElement).find(".HiddenByEditing").html(CursorUtils.getActiveElement().innerHTML);
                    }
                }
                else {
                    var textNode = document.createTextNode(insertString);
                    if (TextManager.isBr(container)) {
                        var parent = container.parentNode;
                        if (parent) {

                            if (parent.lastChild == container) {
                                parent.insertBefore(textNode, container);
                                parent.removeChild(container);
                            }
                            else {
                                parent.insertBefore(textNode, container.nextSibling);
                            }
                        }
                    }
                    else {
                        if (container.childNodes.length > 0) {
                            container.insertBefore(textNode, container.firstChild);
                        }
                        else {
                            container.appendChild(textNode);
                        }
                    }

                    newRange = CursorUtils.getSelectionRange(textNode, insertString.length, textNode, insertString.length);// InvariantSelection.createNewRange(textNode, insertString.length, textNode, insertString.length);
                }
            }
        }
        return newRange;
    },

    insertWordUnderSelection: function (range, insertString) {
        var newRange = range;
        if (range.isCollapsed()) {
            var container = range.getStartNode();
            if (container) {
                if (TextManager.isTextNode(container)) {
                    var cursorPos = range.getStartOffset();
                    var containerText = $(range.getStartNode()).text();
                    var leftBound = cursorPos - 1;
                    var rightBound = cursorPos;
                    var newText = containerText.slice(0, leftBound + 1) + insertString + containerText.slice(rightBound);
                    TextManager.setText(range.getStartNode(), newText);
                    newRange = CursorUtils.getSelectionRange(range.getStartNode(), leftBound + 1 + insertString.length, range.getEndNode(), leftBound + 1 + insertString.length); //InvariantSelection.createNewRange(range.getStartNode(), leftBound + 1 + insertString.length, range.getEndNode(), leftBound + 1 + insertString.length);
                    
                    if(isFacebook) {
                        var nodeTemp = container.parentNode.innerHTML;
                        container.parentNode.innerHTML = nodeTemp + ' ';
                        container.parentNode.innerHTML = nodeTemp;
                    }
                    if(isWordOnline){
                        $(CursorUtils.getActiveElement().parentElement.parentElement).find(".HiddenByEditing").html(CursorUtils.getActiveElement().innerHTML);
                    }
                }
                else {
                    var textNode = document.createTextNode(insertString);
                    if (TextManager.isBr(container)) {
                        var parent = container.parentNode;
                        if (parent) {

                            if (parent.lastChild == container) {
                                parent.insertBefore(textNode, container);
                                parent.removeChild(container);
                            }
                            else {
                                parent.insertBefore(textNode, container.nextSibling);
                            }
                        }
                    }
                    else {
                        if (container.childNodes.length > 0) {
                            container.insertBefore(textNode, container.firstChild);
                        }
                        else {
                            container.appendChild(textNode);
                        }
                    }

                    newRange = CursorUtils.getSelectionRange(textNode, insertString.length, textNode, insertString.length);// InvariantSelection.createNewRange(textNode, insertString.length, textNode, insertString.length);
                }
            }
        }
        return newRange;
    },

    isCursorPositionInTheEnd: function () {
        var flag = true;
        var currentRange = CursorUtils.GetCursorPosition();
        if (currentRange) {
            var currentNode = currentRange.getEndNode();
            
            while (currentNode != null) {
                if(CursorUtils.getActiveElement().hasAttribute('contenteditable') && currentNode.nextSibling == null) {
                    if(isWordOnline && $(currentNode).parents('.OutlineElement').length > 0 && $(currentNode).parents('.OutlineElement')[0].nextElementSibling && $(currentNode).parents('.OutlineElement')[0].nextElementSibling.childNodes.length > 0) {
                        currentNode = $(currentNode).parents('.OutlineElement')[0].nextElementSibling.childNodes[0];
                    }
                    else if(currentNode.parentElement && currentNode.parentElement.nextElementSibling && currentNode.parentElement.nextElementSibling.childNodes.length > 0)
                        {currentNode = currentNode.parentElement.nextElementSibling.childNodes[0];}
                    else {currentNode = currentNode.nextSibling;}
                }
                else {
                    if(currentNode.nextSibling == null && isGoogleDocs && $(currentNode.parentElement).parents('.kix-paragraphrenderer').next().hasClass('kix-paragraphrenderer')) {
                        currentNode = $(currentNode.parentElement).parents('.kix-paragraphrenderer').next()[0].childNodes[0];
                    }
                    else if(currentNode.parentElement && isGoogleDocs && currentNode.parentElement.nextElementSibling && currentNode.parentElement.nextElementSibling.childNodes.length > 0)
                    {
                        currentNode = currentNode.parentElement.nextElementSibling.childNodes[0];
                    }
                    else {
                        currentNode = currentNode.nextSibling;
                    }
                }

                if ($(currentNode).text().trim() != "") {
                    return flag = false;
                }
            }
            if (flag) {
                //currentPosition = CursorUtils.GetCursorPosition().getEndNode();
                var currentPosition = CursorUtils.GetCursorPosition().getEndOffset();
                var curentNodeLength = $(CursorUtils.GetCursorPosition().getEndNode()).text().replace(/\s+$/, '').length;
                if (currentPosition >= curentNodeLength) {
                    return flag = true;
                } else { return flag = false; }
            }

            return flag;
        }        
    }
};