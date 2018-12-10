var isProduction = true;
var isIntowordsDictionary = (location.host == "dictionary.intowords.com" || location.host == "devdictionary.mv-nordic.com");
var isGoogle = (location.host == "docs.google.com");
var isGoogleSpreadsheet = isGoogle && document.URL.indexOf('/spreadsheets/') > 0;
var isGooglePdf = isGoogle && document.URL.indexOf('/file/') > 0;
var isGooglePresentation = "docs.google.com" === location.host && location.pathname.match(/^\/presentation\/d/);
var isGoogleDrawing = "docs.google.com" === location.host && location.pathname.match(/^\/drawings\/d/);
var isGoogleDocs = isGoogle && (document.getElementsByClassName("kix-cursor").length > 0 );
var isFacebook = (location.host == "www.facebook.com");
var isWordOnline = location.host.indexOf("word-edit.officeapps.live.com")>=0 && location.pathname.match(/^\/we\/wordeditorframe\.aspx/)||"word-view.officeapps.live.com" === location.host ; //$('iframe#WebApplicationFrame').length > 0;
var isPowerPoint = location.host.indexOf("powerpoint.officeapps.live.com")>=0  && location.pathname.match(/^\/p\/PowerPointFrame\.aspx/) && location.search.indexOf("PowerPointView=ReadingView")<0;
var isOneNote = location.host.indexOf("onenote.officeapps.live.com")>=0 && location.pathname.match(/^\/o\/onenoteframe\.aspx/);
var isExcel = location.host.indexOf("excel.officeapps.live.com")>=0 && location.pathname.match(/^\/x\/_layouts\/xlviewerinternal\.aspx/);
isWordOnline = isWordOnline||isPowerPoint||isOneNote;
var officePreview = "word-view.officeapps.live.com" === location.host || location.search && location.search.indexOf("PowerPointView=ReadingView")>=0;
var oneDriveAbout = location.host==="onedrive.live.com"&&location.pathname.match(/^\/about\//)/* || location.pathname.match(/\/onedrive\.aspx/)*/;
//var isWordOnline = $('#sdx_ow_iframe_loader').length > 0;
var predictionsRequired = true;
var currentTextNode = null;
var noUserAccess = false;
var loadInFrame = window.location == window.parent.location && $('iframe#WebApplicationFrame').length==0 && $('iframe#sdx_ow_iframe').length==0;
var isWordOnlineEditMode = false;
var isElevTestTasks = (location.host === "elev.xn--testogprver-ngb.dk");
//var isOutlook = location.host.indexOf("mail.live.com") && location.pathname.match(/^\/mail\/RteFrameResources\.aspx/);

var themes = {
	light: { css: 'css/light/main.css',
			docs_css: 'css/light/main_docs.css',
			main_html: 'html/light/itwpanel.html',
			docs_html: 'html/light/itwpanel_docs.html',
			predict_html: 'html/light/predictionspanel.html' },
	main: { css: 'css/main/main_docs.css',
			docs_css: 'css/main/main_docs.css',
			jquery_ui_css: 'css/main/jquery-ui-1.10.4.custom.css',
			dict_css: 'css/main/dictionarytool.css',
			main_html: 'html/main/itwpanel_docs.html',
			docs_html: 'html/main/itwpanel_docs.html',
			predict_html: 'html/main/predictionspanel.html',
			dict_html: 'html/main/dictionarypanel.html' }
};

var theme = themes.main;

(function($){
    $.fn.offsetRelative = function(top){
        var $this = $(this);
        var $parent = $this.offsetParent();
        var offset = $this.position();
        if(!top) return offset;
        else if($parent.get(0).tagName == "BODY" || $parent.get(0).tagName == "HTML") return offset;
        else if($parent[0] == $(top)[0]) return offset;
        else {
            var parent_offset = $parent.offsetRelative(top);
            offset.top += parent_offset.top;
            offset.left += parent_offset.left;
            return offset;
        }
    };
    $.fn.positionRelative = function(top){
        return $(this).offsetRelative(top);
    };
}(jQuery));

var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, tagName, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if(tagName){
                	if(mutations && mutations.length > 0) {
	                	for (i = 0; i < mutations.length; i++) {
						    var mutation = mutations[i];

						    if(mutation.addedNodes && mutation.addedNodes.length > 0) {
						    	for (j = 0; j < mutation.addedNodes.length; j++) {
						    		if(mutation.addedNodes[j].nodeName == tagName || $(mutation.addedNodes[j]).find(tagName).length > 0) {
						    			callback();
						    			break;
						    		}
					    		}
						    }
						}
	                }
                }
                else {
                	callback();
                }
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    }
})();

chrome.runtime.sendMessage('onRequest',function(response){
	if(oneDriveAbout) return true;
	if(!isWordOnline && !isExcel && !loadInFrame || officePreview) {		
		return true;
	}
	var sessionId = response.data.sessionId;
	var disabled = response.data.disabled;
	
	if(sessionId != 'null'){
		Settings.getInstance().setSessionID(sessionId);
	}
	
	//if(isProduction && location.href.match(/.pdf$/)) return;
	//if(!isProduction){
	//if(!isGoogleDocs && !isGoogleSpreadsheet) {
				//if($('input').length+$('textarea').length+$('[contenteditable="true"]').length<=0||isGooglePdf){
				//	predictionsRequired = false;
				//}
	//		}
	//}else{
	//	predictionsRequired = isGoogleDocs || isGoogleSpreadsheet;
	//} t
	var script = document.createElement('script'); script.type = 'text/javascript';
	script.async = true;
	script.src = chrome.extension.getURL("js/Utils/KnockoutStopBinding.js");
	script.onload = function(){ };
	document.body.appendChild(script);

	predictionsRequired = true;
	if(isGooglePdf||predictionsRequired) {
		var cssNode = document.createElement('link'); 
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = chrome.extension.getURL(theme.docs_css);;
		cssNode.media = 'all';
		document.body.appendChild(cssNode);
		
		var dictCss = document.createElement('link'); 
		dictCss.type = 'text/css';
		dictCss.rel = 'stylesheet';
		dictCss.href = chrome.extension.getURL(theme.dict_css);;
		dictCss.media = 'all';
		document.body.appendChild(dictCss);
		
		
		$.get(chrome.extension.getURL(theme.docs_html), {}, function(data) {
			var itwpaneldestination = $('#docs-primary-toolbars');
			if(itwpaneldestination.length <= 0) itwpaneldestination = $('#buttonElements');
			$('body').append(data);
			
			$.get(chrome.extension.getURL(theme.dict_html), {}, function(data) {
				$('body').append(data);

				if(predictionsRequired) {
					$.get(chrome.extension.getURL(theme.predict_html), {}, function(data) {
						var predictionsdestination = (isGoogleDocs) ? $('div.kix-appview-editor').parent():$('body') ;
						predictionsdestination.append(data); 
						MainViewModel.init(disabled);}, 'html');
					
				}else{
				//itwpaneldestination.append(data);
					MainViewModel.init(disabled);
				}
			}, 'html');


			$(".plugin-version").text($(".plugin-version").text().replace('$Revision: ', 'v.1.').replace(' $',''));
			}
		, 'html');
			
		
	}
	else {
		var cssNode = document.createElement('link'); 
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = chrome.extension.getURL(theme.css);;
		cssNode.media = 'all';
		document.body.appendChild(cssNode);

		var dictCss = document.createElement('link'); 
		dictCss.type = 'text/css';
		dictCss.rel = 'stylesheet';
		dictCss.href = chrome.extension.getURL(theme.dict_css);;
		dictCss.media = 'all';
		document.body.appendChild(dictCss);

		$.get(chrome.extension.getURL(theme.main_html), {}, function(data) {
			$('body').append(data);
			if(theme == themes.main) $('div#itw_panel a#itw_predictionsonoff').parent().remove();
			MainViewModel.init(disabled); 
									
			}
		, 'html');
	}
	/*
	if (theme.jquery_ui_css) {
	var cssNode = document.createElement('link'); 
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.href = chrome.extension.getURL(theme.jquery_ui_css);;
		cssNode.media = 'screen';
		document.body.appendChild(cssNode);		
	};*/
	
});
$(document).ready(function(){
	if((isGoogleDocs && !isGoogleSpreadsheet)||isGooglePresentation||isGoogleDrawing) {
		setTimeout(function() { 
			var script = document.createElement('script'); script.type = 'text/javascript';
			script.async = true;
			script.src = chrome.extension.getURL("js/Utils/GoogleDocsHelper.js");
			script.onload = function(){ };
			document.body.appendChild(script);
			},1000);
	}

	if(isWordOnline) {
		setTimeout(function() { 
			var script = document.createElement('script'); script.type = 'text/javascript';
			script.async = true;
			script.src = chrome.extension.getURL("js/Utils/Office365Helper.js");
			script.onload = function(){ };
			document.body.appendChild(script);
			},1000);
	}
});

String.prototype.trimAll = function(){
	return this.replace(/\u200B/g, '').trim();
};

window.addEventListener("message", function (event) {
	if (event.source != window) {
		return;
	}

	if (event.data.action && event.data.action == 'clipboardCopyPaste') {
		chrome.runtime.sendMessage({
			action: 'copyToClipboard',
			payload: event.data.payload
		}, function (response) {
			// Background copy does not currently work in Edge.
			// However, Edge will accept a string payload to paste directly.
			// Chrome will simply ignore the payload.
			document.execCommand("paste", false, event.data.payload);
		});
	}
});
