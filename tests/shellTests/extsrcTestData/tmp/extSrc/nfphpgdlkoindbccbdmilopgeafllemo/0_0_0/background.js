var signonService = new SignonService();
var disabled = localStorage.getItem('mv_itw_disabled') == null || localStorage.getItem('mv_itw_disabled') === 'true';

localStorage.setItem('mv_session_id', null);

var hideActionRegex = new RegExp(/^https\:\/\/online\.intowords\.com|https\:\/\/mv-login\.mv-nordic\.com|http\:\/\/.*\.valhalla\.local|https\:\/\/login\.emu\.dk|https\:\/\/idp\.feide\.no|https\:\/\/mv-login\.mv-nordic\.com/i);/*|chrome:\/\/newtab\/*/

var getSessionFromCookies = function (callback) {
  var mvLoginCookie = {
    name: "mv_session_id",
    domain: "mv-login.mv-nordic.com"
  }

  var itwOnlineCookie = {
    name: "mv_session_id",
    domain: "online.intowords.com"
  }

  // Always use the cookie from mv-login if present.
  // Otherwise attempt to use the cookie from online intowords.
  chrome.cookies.getAll(mvLoginCookie, function(cookies) {
    if (cookies.length) {
      callback(cookies[0].value);
    } else {
      chrome.cookies.getAll(itwOnlineCookie, function(cookies) {
        callback(cookies.length ? cookies[0].value : null);
      });
    }
	});
};

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (hideActionRegex.test(tab.url)) {
		chrome.pageAction.hide(tabId);	
	} else  { 
		chrome.pageAction.show(tabId);
		if(disabled) {
			chrome.pageAction.setIcon({path: 'icon_disabled.png', tabId: tabId});			
		}
		else {			
			chrome.pageAction.setIcon({path: 'icon.png', tabId: tabId});
		}
	}
  
  if (changeInfo.status == 'complete' && tab.active) {
    getSessionFromCookies(function (mv_session_id) {
      localStorage.setItem('mv_session_id', mv_session_id);
    });
  }
  if(tab.url.indexOf("https://mv-login.mv-nordic.com/mvid-login/stop.php")>-1){	
		chrome.tabs.remove(tab.id, function(){});
	}
});

chrome.tabs.onActivated.addListener( function(activeInfo) {
  getSessionFromCookies(function (mv_session_id) {
    chrome.tabs.executeScript(activeInfo.tabId, {allFrames: true, code: 'if(!(typeof mainViewModel === "undefined") && (document.getElementById("itw_panel_bar") != null || document.getElementById("itw_panel") != null)) { mainViewModel.onActivate("'+mv_session_id+'", '+disabled+'); }'});
  });

	if(disabled) {
		chrome.pageAction.setIcon({path: 'icon_disabled.png', tabId: activeInfo.tabId});			
	}
	else {			
		chrome.pageAction.setIcon({path: 'icon.png', tabId: activeInfo.tabId});
	}
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
	if(windowId>0){
			chrome.tabs.getSelected(windowId, function(tab){

            var tabId = tab.id;
			
            if (hideActionRegex.test(tab.url)) {
				chrome.pageAction.hide(tabId);
			} else  { 
				chrome.pageAction.show(tabId);
			}
		  
		  if (tab.active) {
        getSessionFromCookies(function (mv_session_id) {
          localStorage.setItem('mv_session_id', mv_session_id);
				  chrome.tabs.executeScript(tabId, {allFrames: true, code: 'if(!(typeof mainViewModel === "undefined") && (document.getElementById("itw_panel_bar") != null || document.getElementById("itw_panel") != null)) { mainViewModel.onActivate("'+mv_session_id+'", '+disabled+'); }'});
        });
		  }
	});
	}
});
/*
if(disabled) {
	chrome.pageAction.setIcon({path: 'icon_disabled.png'});			
}
else {			
	chrome.pageAction.setIcon({path: 'icon.png'});
}
*/

var disableEnablePlugin = function(tab) {
	disabled = !disabled;
	localStorage.setItem('mv_itw_disabled', disabled);

	if(disabled) {
		chrome.pageAction.setIcon({path: 'icon_disabled.png', tabId: tab.id});			
	}
	else {			
		chrome.pageAction.setIcon({path: 'icon.png', tabId: tab.id});
	}

  getSessionFromCookies(function (mv_session_id) {
    chrome.tabs.executeScript(tab.tabId, {allFrames: true, code: 'if(document.getElementById("itw_panel_bar") != null || document.getElementById("itw_panel") != null) { mainViewModel.onActivate("'+mv_session_id+'", '+disabled+'); }'});
  });
};

chrome.pageAction.onClicked.addListener(
	function(tab) {		
		disableEnablePlugin(tab);
	}
);

var copyToClipboard = function (text) {
  var copyBuffer = document.createElement("textarea");
  copyBuffer.textContent = text;
  document.body.appendChild(copyBuffer);
  copyBuffer.select();
  document.execCommand('copy');
  document.body.removeChild(copyBuffer);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.mv_profile_id){
		if (request.mv_profile_id.method == 'set'){
			set_mv_profile_id(request.mv_profile_id.value);
		}else{
			sendResponse({data: { mv_profile_id: get_mv_profile_id()}});
		}
	}
  else if (request == 'clearCookies') {
    localStorage.setItem('mv_session_id', null);
    chrome.cookies.getAll({ domain: "mv-login.mv-nordic.com" }, function(cookies) {
      for (var i in cookies) {		
        removeCookie(cookies[i]);
      }
    });
    chrome.cookies.getAll({ domain: "signon.mv-nordic.com" }, function(cookies) {
      for (var i in cookies) {		
        removeCookie(cookies[i]);
      }
    });
    chrome.cookies.getAll({ domain: "signon.vitec-mv.com" }, function (cookies) {
        for (var i in cookies) {
            removeCookie(cookies[i]);
        }
    });
    chrome.cookies.getAll({ domain: ".emu.dk" }, function(cookies) {
      for (var i in cookies) {		
        removeCookie(cookies[i]);
      }
    });
    chrome.cookies.getAll({ domain: "idp.feide.no" }, function(cookies) {
      for (var i in cookies) {		
        removeCookie(cookies[i]);
      }
    });

    chrome.cookies.getAll({ name: "mv_session_id" }, function(cookies) {
      for (var i in cookies) {		
        removeCookie(cookies[i]);
      }
    });

    /*
    chrome.cookies.getAll({ name:"mv_session_hash"}, function(cookies) {

    for (var i in cookies) {		

    removeCookie(cookies[i]);
    }
    });	
    chrome.cookies.getAll({ name:"mv_login_id"}, function(cookies) {

    for (var i in cookies) {		

    removeCookie(cookies[i]);
    }
    });	*/
  }
  else if(request == 'disablePlugin') {
    chrome.tabs.query({active: true}, function(tab){
    	if(tab && tab.length >= 1)
    		disableEnablePlugin(tab[0]);
  });
  }
  else if(request == 'onRequest'){
    sendResponse({data: { sessionId: localStorage.getItem('mv_session_id'), disabled: disabled }});
  }
  else if (request.action && request.action == 'copyToClipboard') {
    copyToClipboard(request.payload);
    sendResponse({data: "OK"});
  } else if (request.action === 'Background.isLoggingAllowed') {
    signonService.setup(localStorage.getItem('mv_session_id'), function() {
      signonService.whoami(function(whoamiResponse) {
        sendResponse(whoamiResponse && whoamiResponse.LoggingAllowed);
      }, function(error) {
        console.error('Failed getting whoami', error);
        sendResponse(false);      
      });
    }, function(error) {
      console.error('Failed to setup signon service.', error);
      sendResponse(false);      
    });

    return true; // The sendResponse callback is only valid if used synchronously, or if the event handler returns true to indicate that it will respond asynchronously. The sendMessage function's callback will be invoked automatically if no handlers return true or if the sendResponse callback is garbage-collected.
  }
  else if (request.action && request.action === 'Background.serviceClient') {
    let serviceClients = ClientBackgroundManager.getInstance(localStorage.getItem('mv_session_id'));
    serviceClients.loadDescrioptions(function () {
      serviceClients[request.payload.client][request.payload.method](request.payload.request, request.payload.mirror ? request.payload.mirror : null, function (result, reflection, res) {
        sendResponse({success: true, result, reflection, res});
      }, function (error) {
        console.error('Service error.', error);
        sendResponse({success: false, error});
      });
    });

    return true;
  }
});

function removeCookie(cookie) {

  var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
            cookie.path;
			
  chrome.cookies.remove({"url": url, "name": cookie.name});
  
}

function get_mv_profile_id() {
	return localStorage.getItem('mv_profile_id');  
}

function set_mv_profile_id(value) {
	localStorage.setItem('mv_profile_id', value);  
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
  var headers = details.requestHeaders,
  blockingResponse = {};

  for( var i = 0, l = headers.length; i < l; ++i ) {
    if( headers[i].name ===  'Referer' ) {
      headers[i].value = '';
      break;
    }
  }

  blockingResponse.requestHeaders = headers;
  return blockingResponse;
},
// ToDo: Remove "https://devintowords.mv-nordic.com/*"
    {
        urls: ["https://online.intowords.com/*", "https://signon.vitec-mv.com/*", "https://signon-test.vitec-mv.com/*", "https://signon-dev.vitec-mv.com/*", "https://signon.mv-nordic.com/*", "https://mvid-services.mv-nordic.com/*",
	"https://dictionary.intowords.com/*", "https://api.logger.mv-nordic.com/*", "https://devintowords.mv-nordic.com/*"]
}, ['requestHeaders', 'blocking']);
