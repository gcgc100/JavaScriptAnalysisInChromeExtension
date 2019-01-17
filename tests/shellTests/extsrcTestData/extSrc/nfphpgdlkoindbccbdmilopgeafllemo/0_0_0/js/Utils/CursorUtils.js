var TreeDomHelper = {
    isBr: function (node) {
        if (node) {
            return (node.nodeName.toLowerCase() === "br");
        }

    },
    hasSingleChildBr: function (node) {
        if (node) {
            return (node.firstChild == node.lastChild) && (TreeDomHelper.isBr(node.firstChild));
        }
    }
};

CursorUtils = (function () {
    var SelectionRange = function (startNode, startOffset, endNode, endOffset, text) {
        var self = this;
        
        if(!TextManager.isTextNode(startNode)) {
            var nodeIterator = document.createNodeIterator(startNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

            var currentNode;
            var i = 0;

            while (i <= startOffset) {
                currentNode = nodeIterator.nextNode();
                i++;
            }

            if(currentNode && TextManager.isTextNode(currentNode)) {
                startNode = currentNode;
                startOffset = 0;
            }
        }


        var _startNode;
        var _startOffset;
        var _endNode;
        var _endOffset;
        var _text;

        self.isCollapsed = function () {
            return ((self.getEndNode() === self.getStartNode()) && (self.getEndOffset() === self.getStartOffset()));
        };

        self.toString = function () {
            return (_startNode.nodeName.toString() + ":" + _startOffset.toString() + ";" + _endNode.nodeName.toString() + ":" + _endOffset.toString());
        };

        self.getStartNode = function () {
            return _startNode;
        };

        self.getStartOffset = function () {
            return _startOffset;
        };

        self.getEndNode = function () {
            return _endNode;
        };


        self.getEndOffset = function () {
            return _endOffset;
        };

        self.getText = function() {
            return _text;
        };

        var setStart = function (node, offset) {
            _startNode = TextManager.isTextNode(node) ? node : document.createNodeIterator(node, NodeFilter.SHOW_TEXT).nextNode();//node;
            
            if(_startNode == null) {
                _startNode = TextManager.getNextTextNode(node);
            }

            _startOffset = offset;
        };

        var setEnd = function (node, offset) {
            _endNode = node;
            _endOffset = offset;

        };

        setStart(startNode, startOffset);

        if(startNode === endNode) {
            endNode = TextManager.isTextNode(endNode) ? endNode : document.createNodeIterator(endNode, NodeFilter.SHOW_TEXT).nextNode();
        }

        setEnd(endNode, endOffset);
        _text = text;
    };
    
    var hasHtml5Api = function () {
        return !!(window.getSelection);
    };
    
    var convertSelectiontoSelectionRange = function (selection) {
        if ((selection.getRangeAt) && (selection.rangeCount > 0)) {
            var range = selection.getRangeAt(0);
            return new SelectionRange(range.startContainer, range.startOffset, range.endContainer, range.endOffset, range.toString());
        }
    };
    
    var inputTextualTypeArray = ['text', 'search'];

    return {    
        getActiveElementBody: function(){
            return (!isGoogleDocs && document.activeElement.nodeName == 'IFRAME')
                ? document.activeElement.contentWindow.document.body
                : document.body;
        },

        getActiveElement: function(){
            if(isGoogleDocs) return document.activeElement;

            var activeElement = (document.activeElement.nodeName == 'IFRAME')
                ?   document.activeElement.contentWindow.document.activeElement
                :   (isElevTestTasks && document.activeElement.nodeName == 'LABEL' && document.activeElement.className == 'comma-container')
                    ?  document.body
                    :  document.activeElement;

            return activeElement;
        },

        isTextualTypeEditableInput: function(activeElement){
            return activeElement.nodeName === "INPUT" && inputTextualTypeArray.indexOf(activeElement.type) !== -1;
        },

//
        getActiveWindowSelection: function(){
            if(isGoogleDocs) return window.getSelection();

            var selection = (document.activeElement.nodeName == 'IFRAME')
                ? document.activeElement.contentWindow.document.getSelection()
                : window.getSelection();
            return selection;
        },

        setSelection: function (startNode, startOffset, endNode, endOffset, dontAddRange) {
            if (hasHtml5Api()) {
                //var selection = window.getSelection();
                var selection = CursorUtils.getActiveWindowSelection();
                selection.removeAllRanges();
                var range = document.createRange();
                range.setStart(startNode, startOffset);
                if (endNode) {
                    range.setEnd(endNode, endNode.length < endOffset ? endNode.length : endOffset);
                } else {
                    endNode = startNode;
                    endOffset = startOffset;
                    range.setEnd(startNode, startOffset);
                }
                
                if(dontAddRange == null)
                    selection.addRange(range);
            }

            return new SelectionRange(startNode, startOffset, endNode, endOffset);
        },

        getTextAndBoundingClientRectFromSelectionRange: function(selectionRange) {
            var text;
            var boundingClientRect;

            if (hasHtml5Api()) {
                var selection = CursorUtils.getActiveWindowSelection();
                selection.removeAllRanges();
                var range = document.createRange();
                range.setStart(selectionRange.getStartNode(), selectionRange.getStartOffset());
                range.setEnd(selectionRange.getEndNode(), selectionRange.getEndOffset());
                
                //selection.addRange(range);
                //text = selection.toString();
                //boundingClientRect = selection.getRangeAt(0).getBoundingClientRect();
                //selection.removeAllRanges();
                text = range.toString();
                boundingClientRect = range.getBoundingClientRect();
            }

            return { text: text, boundingClientRect: boundingClientRect };
        },
        
        getSelection: function () {
            if (hasHtml5Api()) {
                return convertSelectiontoSelectionRange(CursorUtils.getActiveWindowSelection());
                //return convertSelectiontoSelectionRange(window.getSelection());
            }
        },
        
        isEqualRanges: function (range1, range2) {
            var res = false;
            if ((range1) && (range2)) {
                res = (range1.getStartNode() == range2.getStartNode()) && (range1.getEndNode() == range2.getEndNode()) && (range1.getStartOffset() == range2.getStartOffset()) && (range1.getEndOffset() == range2.getEndOffset());
            }
            return res;
        },
        
        SetCursorPosition: function (startTextNode, startIndex, endTextNode, endIndex, dontAddRange) {
            var currentRange = CursorUtils.setSelection(startTextNode, startIndex, endTextNode, endIndex, dontAddRange);
            if (currentRange) {
                if (!CursorUtils.isEqualRanges(currentRange, CursorUtils.Range)) {
                    CursorUtils.Range = currentRange;
                    if (CursorUtils.Range.isCollapsed()) {
                        PubSub.publish(Events.loadWords, null);
                    } else {
                        PubSub.publish(Events.removeWords, null);
                    }
                }
            }
        },
        
        GetCursorPosition: function () {
            return (!isGoogle || (CursorUtils.Range == null || CursorUtils.Range.isCollapsed())) && !isWordOnline ? CursorUtils.getSelection() : CursorUtils.Range;
        },
        
        SaveRange: function (areEventsFired) {
            var currentRange = CursorUtils.getSelection();
            if (currentRange) {
                CursorUtils.Range = currentRange;
                var activeElement = CursorUtils.getActiveElement();
                var isInput = CursorUtils.isTextualTypeEditableInput(activeElement) || activeElement.nodeName=="TEXTAREA";
                if (areEventsFired) {
                    if (CursorUtils.Range.isCollapsed() || isWordOnline || isInput) {
                        PubSub.publish(Events.loadWords, null);
                    } else {
                        PubSub.publish(Events.removeWords, null);
                    }
                }
            }
        },
        
        GetNodeIndex: function(element, right) {
            if(element.length <= 0) return;
            
            var node = null;
            var offset = null;
            
            var cursorOffset = element.offset();
            //var offsetX = (right) ? cursorOffset.left + element.width() : cursorOffset.left;
            var offsetX = (right) ? cursorOffset.left + element[0].getBoundingClientRect().width : cursorOffset.left;
            
            var lineviews = $('.kix-lineview');
            
            var currentLineView = lineviews.filter(function(index) {
                var lineView = $(this);
                var lineViewOffset = lineView.offset();
                var lineViewTextBlock = lineView.find('.kix-lineview-content .kix-lineview-text-block');
                return cursorOffset.top + 1 >= lineViewOffset.top && cursorOffset.top <= (lineViewTextBlock.offset().top + lineViewTextBlock.height());     
            });
            
            var textblocks = currentLineView.find('span.kix-lineview-text-block span');
            
            if(textblocks.length <= 0) {
                node = currentLineView[0];
                offset = charOffset;
            }
            else
            {   
                var kixWordNodes = textblocks.filter(function(index) {
                    var textblock = $(this);
                    return textblock.hasClass('kix-wordhtmlgenerator-word-node');
                });
                var currentTextBlock = kixWordNodes;
                
                if(currentTextBlock.length <= 0 || currentTextBlock.length > 1) {               
                    currentTextBlock = textblocks.filter(function(index) {
                        var textblock = $(this);
                        var textblockOffset = textblock.offset();
                        return offsetX >= textblockOffset.left && offsetX <= textblockOffset.left + textblock.width();
                    });             
                }
                
                if(currentTextBlock.length > 1) {
                    currentTextBlock = currentTextBlock.last().width(0).removeClass('goog-inline-block');
                }
                
                if( currentTextBlock.length > 0 ) { 
                    var currentTextBlockCopy = currentTextBlock.clone().empty();
                    currentTextBlock.parent().append(currentTextBlockCopy);
                    //$('body').append(currentTextBlockCopy);
                    
                    var charOffset = 0;
                    
                    var n = currentTextBlock[0].childNodes[0];
                    
                    //while(currentTextBlockCopy.width()+currentTextBlock.offset().left + 1 < offsetX) {
                    //while(currentTextBlockCopy[0].getBoundingClientRect().width+currentTextBlock.offset().left + 1 < offsetX) {
                    var selectionWidth = 0;
                    if ($('.kix-selection-overlay').length > 0) selectionWidth = 1;
                    
                    while(Math.ceil(currentTextBlockCopy[0].getBoundingClientRect().width + currentTextBlock.offset().left + selectionWidth) < Math.ceil(offsetX)) {
                        
                        if(n.length <= charOffset && n.nextSibling != null) n = n.nextSibling;
                        
                        if(TextManager.isTextNode(n)) {
                            //currentTextBlockCopy.text( currentTextBlockCopy.text() + n.nodeValue[charOffset] );
                            currentTextBlockCopy[0].innerHTML = currentTextBlockCopy[0].innerHTML + n.nodeValue[charOffset];
                            charOffset++;
                        }
                        else {
                            currentTextBlockCopy[0].innerHTML = currentTextBlockCopy[0].innerHTML + n.outerHTML;
                            if (n.nextSibling != null) {
                                n = n.nextSibling;
                            };
                            charOffset = 0;
                        }                       
                        //currentTextBlockCopy.text( currentTextBlockCopy.text() + currentTextBlock.text()[charOffset] );
                        //charOffset++;
                    }
                    
                    
                    currentTextBlockCopy.remove();
                    node = n; //currentTextBlock[0].childNodes[0];
                    offset = charOffset;
                }
                else {
                    currentTextBlock = kixWordNodes.last();
                    node = currentTextBlock[0].childNodes[0];
                    offset = currentTextBlock.text().length;

                    if(!TextManager.isTextNode(node)) {
                        offset = 0;
                    }
                }
            }       
            
            while(node && node.length < offset) {
                offset = offset - node.length;
                node = node.nextSibling;
                
                if(!TextManager.isTextNode(node)) {
                    offset--;
                    node = node.nextSibling;
                }
            }           
            
            return { node: node, offset: offset };
        },
        
        SetGoogleDocsCursor: function() {
            if(!isGoogleDocs) return;
            
            var cursor = $('.kix-cursor-caret').parent();
            var nodeOffset = CursorUtils.GetNodeIndex(cursor);
            
            var selection = $('.kix-selection-overlay');
            
            if(selection.length > 0) {
                var selectionStartNodeOffset = CursorUtils.GetNodeIndex(selection.first());
                var selectionEndNodeOffset = CursorUtils.GetNodeIndex(selection.last(), true);
                CursorUtils.SetCursorPosition(selectionStartNodeOffset.node, selectionStartNodeOffset.offset, selectionEndNodeOffset.node, selectionEndNodeOffset.offset, true);
            }
            else if (nodeOffset.node) {
                CursorUtils.SetCursorPosition(nodeOffset.node, nodeOffset.offset);
            }
        },
        
        IsGoogleDocsCursorAfterSpace: function() {
            var cursorOffset = $('.kix-cursor-caret').parent().offset();
            var lineviews = $('.kix-lineview');
            
            var currentLineView = lineviews.filter(function(index) {
                var lineView = $(this);
                var lineViewOffset = lineView.offset();
                return cursorOffset.top + 1 >= lineViewOffset.top && cursorOffset.top <= (lineViewOffset.top+lineView.find('.kix-lineview-content .kix-lineview-text-block').height());         
            });
            
            var textblocks = currentLineView.find('span.kix-lineview-text-block span');
            
            if(textblocks.length > 0) {
                var currentTextBlock = textblocks.filter(function(index) {
                    var textblock = $(this);
                    var textblockOffset = textblock.offset();
                    //return cursorOffset.left >= textblockOffset.left && cursorOffset.left <= textblockOffset.left + textblock.width();
                    return cursorOffset.left >= textblockOffset.left && cursorOffset.left <= textblockOffset.left + textblock[0].getBoundingClientRect().width;                 
                });
                        
                if( currentTextBlock.length <=0 ) { 
                    return true;
                }
            }
            
            return false;
        },
        
        FullStop: Array(".", "!", "?"),
        Range: null,
        
        getSelectionRange: function(startNode, startOffset, endNode, endOffset) {
            return new SelectionRange(startNode, startOffset, endNode, endOffset);
        }
    };
})();