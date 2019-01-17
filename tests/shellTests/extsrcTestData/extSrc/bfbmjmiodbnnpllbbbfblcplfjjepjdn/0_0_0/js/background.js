//================================================
/*

Turn Off the Lights
The entire page will be fading to dark, so you can watch the video as if you were in the cinema.
Copyright (C) 2018 Stefan vd
www.stefanvd.net
www.turnoffthelights.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


To view a copy of this license, visit http://creativecommons.org/licenses/GPL/2.0/

*/
//================================================

chrome.runtime.onMessage.addListener(function request(request,sender,sendResponse){
// eye protection & autoplay & shortcut
if (request.name == "automatic") {chrome.tabs.executeScript(sender.tab.id, {file: "js/light.js"});}
else if (request.name == "screenshot") {
var checkcapturewebsite = "https://www.turnoffthelights.com/extension/capture-screenshot-of-video.html";
var capturewebsiteisopen = false;
    chrome.tabs.query({}, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
        if(tab.url == checkcapturewebsite){
            capturewebsiteisopen = true;
            chrome.tabs.remove(tab.id, function() { chrome.tabs.create({url: checkcapturewebsite});});
        }
	}
if(capturewebsiteisopen == false){chrome.tabs.create({url: checkcapturewebsite});}
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
   if (changeInfo.status == 'complete') {   
          chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, {action: "receivescreenshot", value: request.value}, function(response) {});  
            }
        }
    );
   }
});    
}
// contextmenu
else if (request.name == "contextmenuon") {checkcontextmenus();}
else if (request.name == "contextmenuoff") {removecontexmenus();}
else if (request.name == 'currenttabforblur') {
        chrome.tabs.captureVisibleTab(null, {format: "jpeg", quality: 50}, function(dataUrl) {
            sendResponse({ screenshotUrl: dataUrl });
        });
}
else if (request.name == "sendautoplay") {

	var oReq = new XMLHttpRequest();
	oReq.onreadystatechange = function (e) { if (oReq.readyState == 4) {chrome.tabs.sendMessage(sender.tab.id, {name: "injectvideostatus",message: oReq.responseText});} };
	oReq.open("GET","/js/video-player-status.js",true);oReq.send();

}
else if (request.name == "sendfps") {

	var oReq = new XMLHttpRequest();
	oReq.onreadystatechange = function (e) { if (oReq.readyState == 4) {chrome.tabs.sendMessage(sender.tab.id, {name: "injectfps",message: oReq.responseText});} };
	oReq.open("GET","/js/fpsinject.js",true);oReq.send();

}
else if (request.name == "sendlightcss") {

	var oReq = new XMLHttpRequest();
	oReq.onreadystatechange = function (e) { if (oReq.readyState == 4) {chrome.tabs.sendMessage(sender.tab.id, {name: "injectlightcss",message: oReq.responseText});} };
	oReq.open("GET","/css/light.css",true);oReq.send();

}
else if (request.name == "emergencyalf") {
chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.executeScript(tabs[i].id, {file: "js/light.js"});
            }
        }
    );
}
else if (request.name == "eyesavemeOFF") {
if(request.value == true){chrome.storage.sync.set({"eyea": true});chrome.storage.sync.set({"eyen": false});}
else{chrome.storage.sync.set({"eyea": false});chrome.storage.sync.set({"eyen": true});}
chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { action: "gorefresheyedata" });
                chrome.tabs.executeScript(tabs[i].id, {file: "js/removelight.js"});
            }
        }
    );
}
else if (request.name == "eyesavemeON") {
if(request.value == true){chrome.storage.sync.set({"eyea": true});chrome.storage.sync.set({"eyen": false});}
else{chrome.storage.sync.set({"eyea": false});chrome.storage.sync.set({"eyen": true});}
chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if(tabs[i].url != totloptionspage){
                    chrome.tabs.sendMessage(tabs[i].id, { action: "gorefreshlight" });
                }
            }
        }
    );
}
else if (request.name == "adddarkyoutube") {
chrome.tabs.query({}, function (tabs) {
        chrome.tabs.executeScript(sender.tab.id, {allFrames: true, file: "js/youtubedark.js"});
        }
    );
}
else if (request.name == "addnormalyoutube") {
chrome.tabs.query({}, function (tabs) {
        chrome.tabs.executeScript(sender.tab.id, {allFrames: true, file: "js/youtubewhite.js"});
        }
    );
}
else if (request.name == "nmcustomx") {
if(request.value){chrome.storage.sync.set({"nmcustomx": request.value});}
}
else if (request.name == "nmcustomy") {
if(request.value){chrome.storage.sync.set({"nmcustomy": request.value});}
}
else if (request.name == "mastertabdark") {
if(request.value == true){
	chrome.tabs.query({}, function (tabs) {
				for (var i = 0; i < tabs.length; i++) {
					chrome.tabs.executeScript(tabs[i].id, {file: "js/removelight.js"});
				}
			}
		);
}
else{
	chrome.tabs.query({}, function (tabs) {
				for (var i = 0; i < tabs.length; i++) {
					chrome.tabs.executeScript(tabs[i].id, {file: "js/golight.js"});
				}
			}
		);
}
}
else if (request.name == "browsertheme") {
if(request.value == "dark"){
    if(typeof browser !== 'undefined'){
    var qtest = browser.theme.update;
    if(typeof qtest !== 'undefined'){
		browser.theme.update({
			images: {
			headerURL: '',
		},
		colors: {
			accentcolor: '#333333',
			textcolor: '#fff'
		}
 		});
    }
    }
// set white icon
chrome.tabs.query({}, function (tabs){
    for (var i = 0; i < tabs.length; i++){
    chrome.browserAction.setIcon({tabId : tabs[i].id, path : {"19": "icons/iconwhite19.png","38": "icons/iconwhite19@2x.png"}});
    }
});
}
else{
    if(typeof browser !== 'undefined'){
    var qtest = browser.theme.update;
    if(typeof qtest !== 'undefined'){
		browser.theme.update({
			images: {
			headerURL: '',
		},
		colors: {
			accentcolor: '#fff',
			textcolor: '#000'
		}
 		});
    }
    }
// return default icon
chrome.storage.sync.get(['icon'], function(items){
if(items["icon"] == undefined){items["icon"] = "icons/iconstick19@2x.png";}
chrome.tabs.query({}, function (tabs){
    for (var i = 0; i < tabs.length; i++){
        chrome.browserAction.setIcon({tabId : tabs[i].id, path : {"19": items["icon"],"38": items["icon"]}});
    }
});
});// chrome storage end
}
}
else if (request.name == "badgeon") {checkbadge();}
else if (request.name == "sendnightmodeindark") {
    chrome.tabs.sendMessage(sender.tab.id, {action: "goinnightmode", value:request.value});
}
return true;
});

chrome.tabs.onActivated.addListener(function (activeInfo){
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        chrome.storage.sync.get(['icon'], function(items){
            if(items["icon"] == undefined){items["icon"] = "icons/iconstick19@2x.png";}
            chrome.browserAction.setIcon({tabId : activeInfo.tabId, path : {"19": items["icon"],"38": items["icon"]}});
        });// chrome storage end
        // for all tabs
        // update the badge value
        checkbadge();
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		chrome.storage.sync.get(['icon'], function(chromeset){
            if(chromeset["icon"] == undefined){chromeset["icon"] = "icons/iconstick19@2x.png";}
            chrome.browserAction.setIcon({tabId : tabId, path : {"19": chromeset["icon"],"38": chromeset["icon"]}});

            if(tab.url){
			if((tab.url.match(/^http/i)||tab.url.match(/^file/i)||tab.url==browsernewtab)) {
                chrome.browserAction.setPopup({tabId : tabId, popup:''});
				if(tabId != null){
                    if((new URL(tab.url)).origin==browserstore||(new URL(tab.url))==totloptionspage){
                        chrome.browserAction.setPopup({tabId : tabId, popup:'popup.html'});
                    }
				}
            }
            }else{
                if(tabId != null){
                chrome.browserAction.setPopup({tabId : tabId, popup:'popup.html'});
				}
            }
        });
        // for all tabs
        // update the badge value
        checkbadge();
});

chrome.tabs.onHighlighted.addListener(function(o) { tabId = o.tabIds[0];
    chrome.tabs.get(tabId, function(tab) {
        if(tab.url){
			if((tab.url.match(/^http/i)||tab.url.match(/^file/i)||tab.url==browsernewtab)) {
				chrome.browserAction.setPopup({tabId : tabId, popup:''});
                if(tabId != null){
                    if((new URL(tab.url)).origin==browserstore||(new URL(tab.url))==totloptionspage){
                        chrome.browserAction.setPopup({tabId : tabId, popup:'popup.html'});
                    }
				}
            }
        }else{
                if(tabId != null){
                chrome.browserAction.setPopup({tabId : tabId, popup:'popup.html'});
				}
            }
        // for highlighted tab
        // update the badge value
        checkbadge();
    });
});


// Set click to false at beginning
var alreadyClicked = false;
// Declare a timer variable
var timer;
var popupcreated = false;
chrome.browserAction.onClicked.addListener(function(tabs) {
            if((tabs.url.match(/^http/i)||tabs.url.match(/^file/i)||tabs.url==browsernewtab)){
                if((tabs.url==totloptionspage)){
                    chrome.browserAction.setPopup({tabId: tabs.id, popup:"popup.html"});
                }else{

                // Check for previous click
                if(alreadyClicked) {
                    // console.log("Doubleclick");
                    // Yes, Previous Click Detected
                    // Clear timer already set in earlier Click
                    window.clearTimeout(timer);
                    // Show the popup window
                    // Clear all Clicks
                    alreadyClicked = false;
                    chrome.browserAction.setPopup({tabId: tabs.id, popup:""});
                    return;
                }


                //Set Click to  true
                alreadyClicked = true;
                chrome.browserAction.setPopup({tabId: tabs.id, popup:"palette.html"});

                // Add a timer to detect next click to a sample of 250
                timer = window.setTimeout(function () {
                    // console.log("Singelclick");
                    var popups = chrome.extension.getViews({type: "popup"});
                    if (popups.length != 0) { // popup exist

                    }else{ // not exist
                    chrome.storage.sync.get(['alllightsoff','mousespotlights'], function(chromeset){
                    if((chromeset["mousespotlights"]!=true)){ // regular lamp
                        if((chromeset["alllightsoff"]!=true)){
                            chrome.tabs.executeScript(tabs.id, {file: "js/light.js"}, function() {if (chrome.runtime.lastError) {
                            // console.error(chrome.runtime.lastError.message);
                            }});
                        }else{
                            chrome.tabs.executeScript(tabs.id, {file: "js/mastertab.js"}, function() {if (chrome.runtime.lastError) {
                            // console.error(chrome.runtime.lastError.message);
                            }});
                        }
                    }else{ // all tabs
                            chrome.tabs.executeScript(tabs.id, {file: "js/mastertab.js"}, function() {if (chrome.runtime.lastError) {
                            // console.error(chrome.runtime.lastError.message);
                            }});
                    }
                    });
                    }

                    // Clear all timers
                    window.clearTimeout(timer);
                    // Ignore clicks
                    alreadyClicked = false;
                    chrome.browserAction.setPopup({tabId: tabs.id, popup:""});
                }, 250);

                }
            } else{
                chrome.browserAction.setPopup({tabId: tabs.id, popup:"popup.html"});
            }
});

chrome.commands.onCommand.addListener(function(command) {
if(command == "toggle-feature-nightmode"){
    chrome.tabs.executeScript(null,{code:"if(document.getElementById('stefanvdnightthemecheckbox')){document.getElementById('stefanvdnightthemecheckbox').click();}"});
}
});

// contextMenus
function onClickHandler(info, tab) {
var str = info.menuItemId;var resvideo = str.substring(0, 9);var respage = str.substring(0, 8);
if (resvideo == "totlvideo" || respage == "totlpage") {chrome.tabs.executeScript(tab.id, {file: "js/light.js"});}
else if (info.menuItemId == "totlguideemenu") {chrome.tabs.create({url: linkguide, active:true})}
else if (info.menuItemId == "totldevelopmenu") {chrome.tabs.create({url: donatewebsite, active:true})}
else if (info.menuItemId == "totlratemenu") {chrome.tabs.create({url: writereview, active:true})}
else if (info.menuItemId == "totlsharemenu") {chrome.tabs.create({url: linkshare, active:true})}
else if (info.menuItemId == "totlshareemail") {var sturnoffthelightemail = "mailto:your@email.com?subject="+chrome.i18n.getMessage("sharetexta")+"&body="+chrome.i18n.getMessage("sharetextb")+" "+turnoffthelightsproduct;chrome.tabs.create({url: sturnoffthelightemail, active:true})}
else if (info.menuItemId == "totlsharetwitter") {var sturnoffthelightsproductcodeurl = encodeURIComponent(chrome.i18n.getMessage("sharetextc")+" "+turnoffthelightsproduct);chrome.tabs.create({url: "https://twitter.com/home?status="+sturnoffthelightsproductcodeurl, active:true})}
else if (info.menuItemId == "totlsharefacebook") {chrome.tabs.create({url: "https://www.facebook.com/sharer/sharer.php?u="+turnoffthelightsproduct, active:true})}
else if (info.menuItemId == "totlsharegoogleplus") {chrome.tabs.create({url: "https://plus.google.com/share?url="+turnoffthelightsproduct, active:true})}
else if (info.menuItemId == "totlsubscribe") {chrome.tabs.create({url: linkyoutube, active:true})}
}

// check to remove all contextmenus
chrome.contextMenus.removeAll(function() {
//console.log("contextMenus.removeAll callback");
});

var sharemenusharetitle = chrome.i18n.getMessage("sharemenusharetitle");
var sharemenuwelcomeguidetitle = chrome.i18n.getMessage("sharemenuwelcomeguidetitle");
var sharemenutellafriend = chrome.i18n.getMessage("sharemenutellafriend");
var sharemenusendatweet = chrome.i18n.getMessage("sharemenusendatweet");
var sharemenupostonfacebook = chrome.i18n.getMessage("sharemenupostonfacebook");
var sharemenupostongoogleplus = chrome.i18n.getMessage("sharemenupostongoogleplus");
var sharemenuratetitle = chrome.i18n.getMessage("sharemenuratetitle");
var sharemenudonatetitle = chrome.i18n.getMessage("sharemenudonatetitle");
var sharemenusubscribetitle = chrome.i18n.getMessage("desremyoutube");

var contexts = ["browser_action"];
try{
    // try show web browsers that do support "icons"
    // Firefox, Opera, Microsoft Edge
    chrome.contextMenus.create({"title": sharemenuwelcomeguidetitle, "type":"normal", "id": "totlguideemenu", "contexts": contexts, "icons": {"16": "images/IconGuide.png","32": "images/IconGuide@2x.png"}});
    chrome.contextMenus.create({"title": sharemenudonatetitle, "type":"normal", "id": "totldevelopmenu", "contexts": contexts, "icons": {"16": "images/IconDonate.png","32": "images/IconDonate@2x.png"}});
    chrome.contextMenus.create({"title": sharemenuratetitle, "type":"normal", "id": "totlratemenu", "contexts": contexts, "icons": {"16": "images/IconStar.png","32": "images/IconStar@2x.png"}});
}
catch(e){
    // catch web browsers that do NOT show the icon
    // Google Chrome
    chrome.contextMenus.create({"title": sharemenuwelcomeguidetitle, "type":"normal", "id": "totlguideemenu", "contexts": contexts});
    chrome.contextMenus.create({"title": sharemenudonatetitle, "type":"normal", "id": "totldevelopmenu", "contexts": contexts});
    chrome.contextMenus.create({"title": sharemenuratetitle, "type":"normal", "id": "totlratemenu", "contexts": contexts});
}

// Create a parent item and two children.
try{
    // try show web browsers that do support "icons"
    // Firefox, Opera, Microsoft Edge
    var parent = chrome.contextMenus.create({"title": sharemenusharetitle, "id": "totlsharemenu", "contexts": contexts, "icons": {"16": "images/IconShare.png","32": "images/IconShare@2x.png"}});
    var child1 = chrome.contextMenus.create({"title": sharemenutellafriend, "id": "totlshareemail", "contexts": contexts, "parentId": parent, "icons": {"16": "images/IconEmail.png","32": "images/IconEmail@2x.png"}});
    chrome.contextMenus.create({"title": "", "type":"separator", "id": "totlsepartorshare", "contexts": contexts, "parentId": parent});
    var child2 = chrome.contextMenus.create({"title": sharemenusendatweet, "id": "totlsharetwitter", "contexts": contexts, "parentId": parent, "icons": {"16": "images/IconTwitter.png","32": "images/IconTwitter@2x.png"}});
    var child3 = chrome.contextMenus.create({"title": sharemenupostonfacebook, "id": "totlsharefacebook", "contexts": contexts, "parentId": parent, "icons": {"16": "images/IconFacebook.png","32": "images/IconFacebook@2x.png"}});
    var child4 = chrome.contextMenus.create({"title": sharemenupostongoogleplus, "id": "totlsharegoogleplus", "contexts": contexts, "parentId": parent, "icons": {"16": "images/IconGoogle.png","32": "images/IconGoogle@2x.png"}});
}
catch(e){
    // catch web browsers that do NOT show the icon
    // Google Chrome
    var parent = chrome.contextMenus.create({"title": sharemenusharetitle, "id": "totlsharemenu", "contexts": contexts});
    var child1 = chrome.contextMenus.create({"title": sharemenutellafriend, "id": "totlshareemail", "contexts": contexts, "parentId": parent});
    chrome.contextMenus.create({"title": "", "type":"separator", "id": "totlsepartorshare", "contexts": contexts, "parentId": parent});
    var child2 = chrome.contextMenus.create({"title": sharemenusendatweet, "id": "totlsharetwitter", "contexts": contexts, "parentId": parent});
    var child3 = chrome.contextMenus.create({"title": sharemenupostonfacebook, "id": "totlsharefacebook", "contexts": contexts, "parentId": parent});
    var child4 = chrome.contextMenus.create({"title": sharemenupostongoogleplus, "id": "totlsharegoogleplus", "contexts": contexts, "parentId": parent});
}

chrome.contextMenus.create({"title": "", "type":"separator", "id": "totlsepartor", "contexts": contexts});
try{
    // try show web browsers that do support "icons"
    // Firefox, Opera, Microsoft Edge
    chrome.contextMenus.create({"title": sharemenusubscribetitle, "type":"normal", "id": "totlsubscribe", "contexts":contexts, "icons": {"16": "images/IconYouTube.png","32": "images/IconYouTube@2x.png"}});
}
catch(e){
    // catch web browsers that do NOT show the icon
    // Google Chrome
    chrome.contextMenus.create({"title": sharemenusubscribetitle, "type":"normal", "id": "totlsubscribe", "contexts":contexts});
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// context menu for page and video
var menupage = null;
var menuvideo = null;
var contextmenuadded = false;
var contextarrayvideo = [];
var contextarraypage = [];
function checkcontextmenus(){
    if(contextmenuadded == false){
    contextmenuadded = true;

    // video
    var contexts = ["video"];
    for (var i = 0; i < contexts.length; i++){
    var context = contexts[i];
    var videotitle = chrome.i18n.getMessage("videotitle");
    menuvideo = chrome.contextMenus.create({"title": videotitle, "type":"normal", "id": "totlvideo"+i, "contexts":[context]});
    contextarrayvideo.push(menuvideo);
    }

    // page
    var contexts = ["page","selection","link","editable","image","audio"];
    for (var i = 0; i < contexts.length; i++){
    var context = contexts[i];
    var pagetitle = chrome.i18n.getMessage("pagetitle");
    menupage = chrome.contextMenus.create({"title": pagetitle, "type":"normal", "id": "totlpage"+i, "contexts":[context]});
    contextarraypage.push(menupage);
    }
    
    }
}

function removecontexmenus(){
    if (contextarrayvideo.length > 0) {
        for (var i=0;i<contextarrayvideo.length;i++) {
            if (contextarrayvideo[i] === undefined || contextarrayvideo[i] === null){}else{
            chrome.contextMenus.remove(contextarrayvideo[i]);
            }
        }
    }
    if (contextarraypage.length > 0) {
        for (var i=0;i<contextarraypage.length;i++) {
            if (contextarraypage[i] === undefined || contextarraypage[i] === null){}else{
            chrome.contextMenus.remove(contextarraypage[i]);
            }
        }
    }
    contextarrayvideo = [];
    contextarraypage = [];
    contextmenuadded = false;
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
        if(changes['contextmenus']){if(changes['contextmenus'].newValue == true){checkcontextmenus()}else{removecontexmenus()}}
        if(changes['icon']){if(changes['icon'].newValue){
            chrome.tabs.query({}, function (tabs){
                        for (var i = 0; i < tabs.length; i++) {
                            chrome.browserAction.setIcon({tabId : tabs[i].id,
                                path : {
                                    "19": changes['icon'].newValue,
                                    "38": changes['icon'].newValue
                                }
                            });

                        }
                    }
            );
            }
        }
        if(changes['ecosaver']){
            if(changes['ecosaver'].newValue){
            chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    var protocol = tabs[i].url.split(":")[0];
                    if(protocol == "http" || protocol == "https"){
                        if(tabs[i].url != totloptionspage){
                            chrome.tabs.sendMessage(tabs[i].id, { action: "gorefreshlight" });
                        }
                    }
                }
            });
            }
        }
        if(changes['ecosavertime']){
            if(changes['ecosavertime'].newValue){
            chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    var protocol = tabs[i].url.split(":")[0];
                    if(protocol == "http" || protocol == "https"){
                    chrome.tabs.sendMessage(tabs[i].id, { action: "gonewecosavetime",message: changes['ecosavertime'].newValue });
                    }
                }
            });
            }
        }
        if(changes['badge']) {
            if(changes['badge'].newValue == true){checkbadge()}else{checkbadge()}
        }
})


// date today
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!

var yyyy = today.getFullYear();
if(dd<10){dd='0'+dd;}
if(mm<10){mm='0'+mm;}
var today = dd+'/'+mm+'/'+yyyy;

function search(nameKey, myArray){
  for (var i=0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
          return myArray[i];
      }
  }
}

var analytics;var rest;
function checkbadge(){
    chrome.storage.sync.get(['analytics','badge'], function(items){
        if(items["analytics"]){
            analytics = items["analytics"];
            var resultObject = search(today, analytics);
            if (typeof resultObject === "undefined"){
                rest = "";
            }else{
                rest = JSON.stringify(resultObject["details"]["active"]);
            }
            if(items["badge"] == true){chrome.browserAction.setBadgeText({ text: rest }) }else{chrome.browserAction.setBadgeText({ text: "" })}
            chrome.browserAction.setBadgeBackgroundColor({ color: "#43A047"});
        }else{chrome.browserAction.setBadgeText({ text: "" })} // no data found, automatically clean this
    })
}

chrome.runtime.setUninstallURL(linkuninstall);

function initwelcome(){
chrome.storage.sync.get(['firstRun'], function(chromeset){
if ((chromeset["firstRun"]!="false") && (chromeset["firstRun"]!=false)){
  chrome.tabs.create({url: linkwelcomepage, active:true});
  chrome.tabs.create({url: linkguide, active:false});
  var crrinstall = new Date().getTime();
  chrome.storage.sync.set({"firstRun": false, "version": "2.4", "firstDate": crrinstall});
}
});
}
initwelcome();

// first run - check the badge new value for this day
chrome.runtime.onStartup.addListener(checkbadge);
chrome.runtime.onInstalled.addListener(checkbadge);
checkbadge();