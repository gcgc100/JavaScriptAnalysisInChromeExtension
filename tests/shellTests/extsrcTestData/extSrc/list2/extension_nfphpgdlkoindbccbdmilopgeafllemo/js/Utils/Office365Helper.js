var Office365Helper = (function () {
    var LEFTARROW_KEYCODE = 37 ;
    var RIGHTARROW_KEYCODE = 39;
    var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
    var isWordOnline = location.host.indexOf("word-edit.officeapps.live.com")>=0 && location.pathname.match(/^\/we\/wordeditorframe\.aspx/)||"word-view.officeapps.live.com" === location.host ; //$('iframe#WebApplicationFrame').length > 0;
    var isPowerPoint = location.host.indexOf("powerpoint.officeapps.live.com")>=0  && location.pathname.match(/^\/p\/PowerPointFrame\.aspx/) && location.search.indexOf("PowerPointView=ReadingView")<0;

    function createEvent(eventType, keyCode, funcKey) {
        funcKey = funcKey || {};
        var e = document.createEvent("Event");
        e.initEvent(eventType, true, true);
        e.ctrlKey = !!funcKey.ctrlKey;
        e.shiftKey = !!funcKey.shiftKey;
        e.altKey = !!funcKey.altKey;
        e.metaKey = !!funcKey.metaKey;
        e.which = keyCode;
        e.repeat = false;
        //e.code = keyCode;
        if ("keypress" === eventType) {
            e.charCode = keyCode; 
            e.keyIdentifier = "";;
        } else {
            e.keyCode = keyCode;
            e.keyIdentifier = keyCodeToString(keyCode);
        }
        return e
    };

    function getEditElement(){
        var editElement = (!isPowerPoint)?document.getElementById("WACViewPanel_EditingElement"):document.activeElement;
        return editElement;
    }

    function getActiveWindow() {
        var active = document.activeElement;
        if (active) {
            if ("IFRAME" === active.tagName) try {
                var body = active.contentDocument.body;
                if (body && body.isContentEditable)
                    active = body;
            } catch (error) { }
            if(active)
            {
                active = active.ownerDocument; 
                active = active.defaultView || active.parentWindow;
            }
            else{ 
                active = window;
            }
            return active;
        }
        return window;
    };
    function keyCodeToString(code) {
        switch (code) {
            case 16:
                return "Shift";
            case LEFTARROW_KEYCODE :
                return "Left";
            case RIGHTARROW_KEYCODE:
                return "Right"
        }
        return '';
    };    

    var pastePrediction = function (details) {
        var editElement = getEditElement();
        var word = details.text, toLeft = details.charsToLeft, toRight = details.charsToRight;

        if(toLeft + toRight<1){
            editElement.dispatchEvent(createEvent("keydown", LEFTARROW_KEYCODE ));
            editElement.dispatchEvent(createEvent("keyup", LEFTARROW_KEYCODE ));
            editElement.dispatchEvent(createEvent("keydown", RIGHTARROW_KEYCODE));
            editElement.dispatchEvent(createEvent("keyup", RIGHTARROW_KEYCODE));
        }else{
            for (var i = 0; i < toLeft; i++) {
                editElement.dispatchEvent(createEvent("keydown", LEFTARROW_KEYCODE ));
                editElement.dispatchEvent(createEvent("keyup", LEFTARROW_KEYCODE ));
            }
            
            for (var i = 0; i < toLeft + toRight; i++) {
                editElement.dispatchEvent(createEvent("keydown", RIGHTARROW_KEYCODE, { shiftKey: true }));
                editElement.dispatchEvent(createEvent("keyup", RIGHTARROW_KEYCODE, { shiftKey: true }));
            }
        }
        
        window.postMessage({ action: 'clipboardCopyPaste', payload: word}, "*");
    };
    
    var moveCursorRight = function (details) {
        var editElement = getEditElement();
        var count = details.count;

        for (var i = 0; i < count; i++) {
            editElement.dispatchEvent(createEvent("keydown", RIGHTARROW_KEYCODE, null));
            editElement.dispatchEvent(createEvent("keyup", RIGHTARROW_KEYCODE, null));
        }        
    };
    var moveCursorLeft = function (details) {
        var editElement = getEditElement();
        var count = details.count;

        for (var i = 0; i < count; i++) {
            editElement.dispatchEvent(createEvent("keydown", LEFTARROW_KEYCODE , null));
            editElement.dispatchEvent(createEvent("keyup", LEFTARROW_KEYCODE , null));
        }
    };
    var moveCursorToWordStart = function (details) {
       var editElement = getEditElement();
        editElement.dispatchEvent(createEvent("keydown", RIGHTARROW_KEYCODE, { ctrlKey: isMac?false:true, altKey: !isMac?false:true}));
        editElement.dispatchEvent(createEvent("keyup", RIGHTARROW_KEYCODE, { ctrlKey: isMac?false:true, altKey: !isMac?false:true}));
    };
    
    document.getElementById('itw_predictionsmain').addEventListener('pastePrediction', function (e) {
        e.stopPropagation();
        e.preventDefault();
        pastePrediction(e.detail);
    });
    document.getElementById('itw_predictionsmain').addEventListener('moveCursorRight', function (e) {
        e.stopPropagation();
        e.preventDefault();
        moveCursorRight(e.detail);
    });
    document.getElementById('itw_predictionsmain').addEventListener('moveCursorLeft', function (e) {
        e.stopPropagation();
        e.preventDefault();
        moveCursorLeft(e.detail);
    });
    document.getElementById('itw_predictionsmain').addEventListener('moveCursorToWordStart', function (e) {
        e.stopPropagation();
        e.preventDefault();
        moveCursorToWordStart(e.detail);
    });    

})();
