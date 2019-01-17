var GoogleDocsHelper = (function () {
  var LEFTARROW_KEYCODE = 37;
  var RIGHTARROW_KEYCODE = 39;
  var KEYDOWN_EVENTTYPE = 'keydown';
  var KEYPRESS_EVENTTYPE = 'keypress';
  var docstexteventtargetiframe = document.getElementsByClassName('docs-texteventtarget-iframe')[0];
  var googClosureListenersField = 'g';
  var googClosureKeyDownHandler = [];
  var googClosureKeyPressHandler = [];
  var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
  var isPresentation = document.URL.indexOf('https://docs.google.com/presentation') == 0
  	|| document.URL.indexOf('https://docs.google.com/drawings') == 0;;
    
  var extendEventFieldsWithSetter = function(event, fields) {
	fields.forEach(function(field) {
		Object.defineProperty(event, field, {
			get : function() {
				return this[field + 'Val'];
			}
		});
	});	
  };
  
  var createKeyboardEvent = function(options) {
	var event = document.createEvent('KeyboardEvent');
    extendEventFieldsWithSetter(event, ['type', 'keyCode', 'charCode', 'which', 'target', 'srcElement', 'currentTarget', 'defaultPrevented', 'ctrlKey', 'shiftKey','altKey']);
	event.defaultPreventedVal = options.defaultPrevented;
	event.initKeyboardEvent(options.type, true, true, options.window, false, false, false, false, 0, 0);
	event.currentTargetVal = options.document;
	event.srcElementVal = options.document.body;
	event.targetVal = options.document.body;
	
	return event;
  };
  
  var getEventListener = function(closure, ev){
  	var func = '';
  	for(var i = 0; i<Object.getOwnPropertyNames(closure).length;i++){
  		func = Object.getOwnPropertyNames(closure)[i];
  		for(var j = 0; j< Object.getOwnPropertyNames(closure[func]).length; j++ ){
  			if(Object.getOwnPropertyNames(closure[func])[j]==ev) return closure[func][ev];;
  		}
  	}
  	return null;

  };

  var initHandlers = function(){
  	if(document)
  		docstexteventtargetiframe = document.getElementsByClassName('docs-texteventtarget-iframe')[0];
		googClosureKeyDownHandler = [];
        googClosureKeyPressHandler = [];

        var documentContent;
        if (docstexteventtargetiframe && docstexteventtargetiframe.contentDocument) {
            documentContent = docstexteventtargetiframe.contentDocument;
        } else {
            return;
        }

		for (prop in documentContent) {
		  if (prop.indexOf('closure') == 0 ){
			
			var closure = documentContent[prop];
			
			var keydownListeners = getEventListener(closure, KEYDOWN_EVENTTYPE);
			for (var i = 0; i < keydownListeners.length; i++){
				for(property in keydownListeners[i]) {
					if(keydownListeners[i][property].src == documentContent) {
						googClosureKeyDownHandler.push(keydownListeners[i][property]);
						break;
					}
				}
			}

			var keydownListeners = getEventListener(closure, KEYPRESS_EVENTTYPE);
			if(keydownListeners){
				for (var i = 0; i < keydownListeners.length; i++){
					for(property in keydownListeners[i]) {
						if(keydownListeners[i][property].src == documentContent) {
							googClosureKeyPressHandler.push(keydownListeners[i][property]);
							break;
						}
					}
				}
			}
			break;
			
		  }
		}
  };
  
  var pastePrediction = function(details){
		if(isPresentation)initHandlers();
		var event = createKeyboardEvent({
			type: KEYDOWN_EVENTTYPE,
			defaultPrevented: false,
			window: docstexteventtargetiframe.contentWindow,
			document: docstexteventtargetiframe.contentDocument
		});
		var charsToRight = details.charsToRight;
		var charsBackToLeft = details.charsToLeft + charsToRight;
		while (charsToRight > 0) {
			event.keyCodeVal = RIGHTARROW_KEYCODE;
			event.whichVal = event.keyCode;		
			charsToRight--;
			for (var i = 0; i < googClosureKeyDownHandler.length; i++){
				googClosureKeyDownHandler[i](event);
			}
		};
		while (charsBackToLeft > 0) {
			event.keyCodeVal = LEFTARROW_KEYCODE;
			event.whichVal = event.keyCode;	
			event.shiftKeyVal = true;	
			charsBackToLeft--;
			for (var i = 0; i < googClosureKeyDownHandler.length; i++){
				googClosureKeyDownHandler[i](event);
			}
		};
		// if(details.charsToLeft > 0 || details.charsToRight > 0) {
		// 	event.keyCodeVal = LEFTARROW_KEYCODE;
		// 	event.whichVal = event.keyCode;
		// 	if(isMac){
		// 		event.altKeyVal = true;
		// 	}else{
		// 		event.ctrlKeyVal = true;
		// 	}
		// 	event.shiftKeyVal = true;		
		// 	for (var i = 0; i < googClosureKeyDownHandler.length; i++){
		// 		googClosureKeyDownHandler[i](event);
		// 	}
		// }
		
		event.typeVal = KEYPRESS_EVENTTYPE;
		event.ctrlKeyVal = false;
		event.shiftKeyVal = false;
		event.defaultPreventedVal = true;
		
		for (var i = 0; i < details.text.length; i++){
		  event.keyCodeVal = details.text[i].charCodeAt(0);
		  event.charCodeVal = event.keyCode;      
		  event.whichVal = event.keyCode;
		
		  for (var j = 0; j < googClosureKeyPressHandler.length; j++){
		    googClosureKeyPressHandler[j](event);
		  }
		}
	  };
  
  var moveCursorRight = function(details) {  
		if(isPresentation)initHandlers();
		var event = createKeyboardEvent({
			type: KEYDOWN_EVENTTYPE,
			defaultPrevented: false,
			window: docstexteventtargetiframe.contentWindow,
			document: docstexteventtargetiframe.contentDocument
		});

		var charsToRight = details.count;
		while (charsToRight > 0) {
			event.keyCodeVal = RIGHTARROW_KEYCODE;
			event.whichVal = event.keyCode;		
			charsToRight--;
			for (var i = 0; i < googClosureKeyDownHandler.length; i++){
				googClosureKeyDownHandler[i](event);
			}
		};
  };
  
  var moveCursorLeft = function(details) {
		if(isPresentation)initHandlers();
		var event = createKeyboardEvent({
			type: KEYDOWN_EVENTTYPE,
			defaultPrevented: false,
			window: docstexteventtargetiframe.contentWindow,
			document: docstexteventtargetiframe.contentDocument
		});

		var charsToLeft = details.count;
		while (charsToLeft > 0) {
			event.keyCodeVal = LEFTARROW_KEYCODE;
			event.whichVal = event.keyCode;		
			charsToLeft--;
			for (var i = 0; i < googClosureKeyDownHandler.length; i++){
				googClosureKeyDownHandler[i](event);
			}
		};
  };
  
  var moveCursorToWordStart = function(details) {
  
  		if(isPresentation)initHandlers();
		var event = createKeyboardEvent({
			type: KEYDOWN_EVENTTYPE,
			defaultPrevented: false,
			window: docstexteventtargetiframe.contentWindow,
			document: docstexteventtargetiframe.contentDocument
		});
		if(isMac) 
			event.altKeyVal = true;
		else
			event.ctrlKeyVal = true;
		event.keyCodeVal = RIGHTARROW_KEYCODE;
		event.whichVal = event.keyCode;		
		
		for (var i = 0; i < googClosureKeyDownHandler.length; i++){
			googClosureKeyDownHandler[i](event);
		}		
		
		if(isMac && !details){
			event.keyCodeVal = LEFTARROW_KEYCODE;
			event.whichVal = event.keyCode;		
		
			for (var i = 0; i < googClosureKeyDownHandler.length; i++){
				googClosureKeyDownHandler[i](event);
			}		
		}
  };
   var highlightWord = function(details) {
  
	if(isPresentation)initHandlers();
		var event = createKeyboardEvent({
			type: KEYDOWN_EVENTTYPE,
			defaultPrevented: false,
			window: docstexteventtargetiframe.contentWindow,
			document: docstexteventtargetiframe.contentDocument
		});
		if(isMac) 
			event.altKeyVal = true;
		else
			event.ctrlKeyVal = true;
		event.shiftKeyVal = true;
		event.keyCodeVal = RIGHTARROW_KEYCODE;
		event.whichVal = event.keyCode;		
		
		for (var i = 0; i < googClosureKeyDownHandler.length; i++){
			googClosureKeyDownHandler[i](event);
		}		
  };
  
	document.getElementById('itw_predictionsmain').addEventListener('pastePrediction', function(e){
		e.stopPropagation();
		e.preventDefault();
		pastePrediction(e.detail);
	});
		
	document.getElementById('itw_predictionsmain').addEventListener('moveCursorRight', function(e){
		e.stopPropagation();
		e.preventDefault();
		moveCursorRight(e.detail);
	});
	
	document.getElementById('itw_predictionsmain').addEventListener('moveCursorLeft', function(e){
		e.stopPropagation();
		e.preventDefault();
		moveCursorLeft(e.detail);
	});
	
	document.getElementById('itw_predictionsmain').addEventListener('moveCursorToWordStart', function(e){
		e.stopPropagation();
		e.preventDefault();
		moveCursorToWordStart(e.detail);
	});
	document.getElementById('itw_predictionsmain').addEventListener('highlightWord', function(e){
		e.stopPropagation();
		e.preventDefault();
		highlightWord(e.detail);
	});

	document.getElementById('itw_predictionsmain').addEventListener('test', function(e){
		e.stopPropagation();
		e.preventDefault();
		//highlightWord(e.detail);

		//CursorUtils.getActiveElement().addEventListener( 'keypress', function( event ){
        //            console.log( event.keyCode );
        //        }, false);    
                
                var a = window.crossBrowser_initKeyboardEvent("keypress", {"key": 1, "char": "!", shiftKey: false});
                //alert(a.type + " | " + a.key + " | " + a.char + " | " + a.shiftKey);
                document.activeElement.dispatchEvent( a );
	});

	
		
	setTimeout(function() {
		initHandlers();
	},0);
})();

void function() {//closure

var global = this
  , _initKeyboardEvent_type = (function( e ) {
		try {
			e.initKeyboardEvent(
				"keyup" // in DOMString typeArg
				, false // in boolean canBubbleArg
				, false // in boolean cancelableArg
				, global // in views::AbstractView viewArg
				, "+" // [test]in DOMString keyIdentifierArg | webkit event.keyIdentifier | IE9 event.key
				, 3 // [test]in unsigned long keyLocationArg | webkit event.keyIdentifier | IE9 event.location
				, true // [test]in boolean ctrlKeyArg | webkit event.shiftKey | old webkit event.ctrlKey | IE9 event.modifiersList
				, false // [test]shift | alt
				, true // [test]shift | alt
				, false // meta
				, false // altGraphKey
			);
			
			
			
			/*
			// Safari and IE9 throw Error here due keyCode, charCode and which is readonly
			// Uncomment this code block if you need legacy properties
			delete e.keyCode;
			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
			delete e.charCode;
			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
			delete e.which;
			_Object_defineProperty(e, {writable: true, configurable: true, value: 9})
			*/
			
			return ((e["keyIdentifier"] || e["key"]) == "+" && (e["keyLocation"] || e["location"]) == 3) && (
				e.ctrlKey ?
					e.altKey ? // webkit
						1
						:
						3
					:
					e.shiftKey ?
						2 // webkit
						:
						4 // IE9
				) || 9 // FireFox|w3c
				;
		}
		catch ( __e__ ) { _initKeyboardEvent_type = 0 }
	})( document.createEvent( "KeyboardEvent" ) )

	, _keyboardEvent_properties_dictionary = {
		"char": "",
		"key": "",
		"location": 0,
		"ctrlKey": false,
		"shiftKey": false,
		"altKey": false,
		"metaKey": false,
		"repeat": false,
		"locale": "",

		"detail": 0,
		"bubbles": false,
		"cancelable": false,
		
		//legacy properties
		"keyCode": 0,
		"charCode": 0,
		"which": 0
	}

	, own = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

	, _Object_defineProperty = Object.defineProperty || function(obj, prop, val) {
		if( "value" in val ) {
			obj[prop] = val["value"];
		}
	}
;

function crossBrowser_initKeyboardEvent(type, dict) {
	var e;
	if( _initKeyboardEvent_type ) {
		e = document.createEvent( "KeyboardEvent" );
	}
	else {
		e = document.createEvent( "Event" );
	}
	var _prop_name
		, localDict = {};

	for( _prop_name in _keyboardEvent_properties_dictionary ) if(own(_keyboardEvent_properties_dictionary, _prop_name) ) {
		localDict[_prop_name] = (own(dict, _prop_name) && dict || _keyboardEvent_properties_dictionary)[_prop_name];
	}

	var _ctrlKey = localDict["ctrlKey"]
		, _shiftKey = localDict["shiftKey"]
		, _altKey = localDict["altKey"]
		, _metaKey = localDict["metaKey"]
		, _altGraphKey = localDict["altGraphKey"]

		, _modifiersListArg = _initKeyboardEvent_type > 3 ? (
			(_ctrlKey ? "Control" : "")
				+ (_shiftKey ? " Shift" : "")
				+ (_altKey ? " Alt" : "")
				+ (_metaKey ? " Meta" : "")
				+ (_altGraphKey ? " AltGraph" : "")
			).trim() : null

		, _key = localDict["key"] + ""
		, _char = localDict["char"] + ""
		, _location = localDict["location"]
		, _keyCode = localDict["keyCode"] || (localDict["keyCode"] = _key && _key.charCodeAt( 0 ) || 0)
		, _charCode = localDict["charCode"] || (localDict["charCode"] = _char && _char.charCodeAt( 0 ) || 0)

		, _bubbles = localDict["bubbles"]
		, _cancelable = localDict["cancelable"]

		, _repeat = localDict["repeat"]
		, _locale = localDict["locale"]
		, _view = global
	;
	
	localDict["which"] || (localDict["which"] = localDict["keyCode"]);

	if( "initKeyEvent" in e ) {//FF
		//https://developer.mozilla.org/en/DOM/event.initKeyEvent
		e.initKeyEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
	}
	else if(  _initKeyboardEvent_type && "initKeyboardEvent" in e ) {//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
		if( _initKeyboardEvent_type == 1 ) { // webkit
			//http://stackoverflow.com/a/8490774/1437207
			//https://bugs.webkit.org/show_bug.cgi?id=13368
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _shiftKey, _altKey, _metaKey, _altGraphKey );
		}
		else if( _initKeyboardEvent_type == 2 ) { // old webkit
			//http://code.google.com/p/chromium/issues/detail?id=52408
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _ctrlKey, _altKey, _shiftKey, _metaKey, _keyCode, _charCode );
		}
		else if( _initKeyboardEvent_type == 3 ) { // webkit
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _ctrlKey, _altKey, _shiftKey, _metaKey, _altGraphKey );
		}
		else if( _initKeyboardEvent_type == 4 ) { // IE9
			//http://msdn.microsoft.com/en-us/library/ie/ff975297(v=vs.85).aspx
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _key, _location, _modifiersListArg, _repeat, _locale );
		}
		else { // FireFox|w3c
			//http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent-initKeyboardEvent
			//https://developer.mozilla.org/en/DOM/KeyboardEvent#initKeyboardEvent()
			e.initKeyboardEvent( type, _bubbles, _cancelable, _view, _char, _key, _location, _modifiersListArg, _repeat, _locale );
		}
	}
	else {
		e.initEvent(type, _bubbles, _cancelable)
	}

	for( _prop_name in _keyboardEvent_properties_dictionary )if( own( _keyboardEvent_properties_dictionary, _prop_name ) ) {
		if( e[_prop_name] != localDict[_prop_name] ) {
			try {
				delete e[_prop_name];
				_Object_defineProperty( e, _prop_name, { writable: true, "value": localDict[_prop_name] } );
			}
			catch(e) {
				//Some properties is read-only
			}
			
		}
	}
	
	return e;
}

//export
global.crossBrowser_initKeyboardEvent = crossBrowser_initKeyboardEvent;

}.call(this);