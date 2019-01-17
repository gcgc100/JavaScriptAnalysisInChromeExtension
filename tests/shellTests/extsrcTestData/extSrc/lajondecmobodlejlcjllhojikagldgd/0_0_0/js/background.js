//================================================
/*

Zoom
Zoom in or out on web content using the zoom button for more comfortable reading.
Copyright (C) 2018 Stefan vd
www.stefanvd.net

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

var currentURL;var allzoom;var allzoomvalue;var badge;var lightcolor;var zoomchrome;var zoomweb;var zoomdoubleclick;var backgroundnumber;var zoombydomain;var zoombypage;var defaultallscreen;var defaultsinglescreen;var websitezoom;var zoomfont;var goturlinside = false;var currentscreen;var screenzoom;
chrome.runtime.onMessage.addListener(function request(request,sender,sendResponse){
if(request.action == 'getallRatio'){
currentURL = request.website;
currentscreen = request.screen;
chrome.storage.sync.get(['allzoom','allzoomvalue','websitezoom','badge','lightcolor','zoomchrome','zoomweb','zoombydomain','zoombypage','defaultallscreen','defaultsinglescreen','screenzoom','zoomfont'], function(response){
allzoom = response.allzoom;if(allzoom == null)allzoom = false; // default allzoom false
allzoomvalue = response.allzoomvalue;if(allzoomvalue == null)allzoomvalue = 1; // default allzoomvalue value
badge = response.badge;if(badge == null)badge = false;
lightcolor = response.lightcolor;if(lightcolor == null)lightcolor = '#3cb4fe';
zoomchrome = response.zoomchrome;if(zoomchrome == null)zoomchrome = false;
zoomweb = response.zoomweb;if(zoomweb == null)zoomweb = true;
zoomfont = response.zoomfont;if(zoomfont == null)zoomfont = false;
zoombydomain = response.zoombydomain;if(zoombydomain == null)zoombydomain = true;
zoombypage = response.zoombypage;if(zoombypage == null)zoombypage = false;
if(zoombydomain == true){currentURL = currentURL.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
else{currentURL = currentURL;}
defaultallscreen = response.defaultallscreen;if(defaultallscreen == null)defaultallscreen = true;
defaultsinglescreen = response.defaultsinglescreen;if(defaultsinglescreen == null)defaultsinglescreen = false;
websitezoom = response['websitezoom'];
// if empty use this
if(typeof websitezoom == "undefined" || websitezoom == null){
    websitezoom = JSON.stringify({'https://www.example.com': ["90"], 'https://www.nytimes.com': ["85"]});
}
websitezoom = JSON.parse(websitezoom);

//---
if(defaultallscreen == true){} // no change
else if(defaultsinglescreen == true){

    var screenzoom = response['screenzoom'];
    screenzoom = JSON.parse(screenzoom);
    var satbbuf = [];
    for(var domain in screenzoom)
        satbbuf.push(domain);
        satbbuf.sort();
        for(var i = 0; i < satbbuf.length; i++){
        if(satbbuf[i] == currentscreen){
            allzoomvalue = screenzoom[satbbuf[i]]/100;
        }
        }

}
//---
if(allzoom == true) {
        chrome.tabs.query({ active: true, currentWindow: true},
        function (tabs) {
            if(tabs[0]){
            chrome.tabs.getZoom(tabs[0].id, function (zoomFactor) {
                //console.log("Stefan zoom is now:"+zoomFactor + " "+allzoomvalue);
                if(zoomFactor != editzoom){
                    if(zoomchrome == true){
                        chrome.tabs.setZoom(tabs[0].id, allzoomvalue); // needed for the default zoom value such as 110%
                    }else if(zoomweb == true){
                        // Check for transform support so that we can fallback otherwise
                        var supportsZoom = 'zoom' in document.body.style;
                        if(supportsZoom){
                            chrome.tabs.executeScript(tabs[0].id,{code:"document.body.style.zoom=" + allzoomvalue});
                        }else{
                            chrome.tabs.executeScript(tabs[0].id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + allzoomvalue + ")'"});
                        }
                    }else if(zoomfont == true){
                        chrome.tabs.sendMessage(tabs[0].id,{ text: 'setfontsize' });
                        chrome.tabs.sendMessage(tabs[0].id,{ text: 'changefontsize', value: Math.round(allzoomvalue*100) });
                    }
                    if(badge == true){
                        chrome.browserAction.setBadgeBackgroundColor({color:lightcolor});
                        chrome.browserAction.setBadgeText ( { text: ""+Math.round(allzoomvalue*100)+"" } );
                    } else{
                        chrome.browserAction.setBadgeText ( { text: "" } );
                    }
                }
            });
        }
        });
}
else{
    var atbbuf = [];
    for(var domain in websitezoom){atbbuf.push(domain);atbbuf.sort();}
    for(var i = 0; i < atbbuf.length; i++){
      if(atbbuf[i] == currentURL){
        var tempatbbuf = atbbuf[i];
        var editzoom = websitezoom[atbbuf[i]]/100;
              chrome.tabs.query({},
              function (tabs) {
                  tabs.forEach(function(tab){
                        var tor = tab.url;
                        if(zoombydomain == true){var webtor = tor.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
                        else{var webtor = tor;}
                        if(webtor == tempatbbuf){
                            if(zoomchrome == true){
                                chrome.tabs.getZoom(sender.tab.id, function (zoomFactor) {
                                //console.log("Stefan zoom is now:"+zoomFactor + " "+editzoom);
                                if(zoomFactor != editzoom){
                                    // this to keep to zoom level by tab and not the whole domain (= automatic)
                                    chrome.tabs.setZoomSettings(sender.tab.id, { mode: 'automatic', scope: 'per-tab' },
                                        function(){
                                          if (chrome.runtime.lastError) {
                                          //console.log('[ZoomDemoExtension] doSetMode() error: ' + chrome.runtime.lastError.message);
                                          }
                                        });
                                    chrome.tabs.setZoom(sender.tab.id, editzoom); // needed for the default zoom value such as 110%
                                }
                                });
                            }else if(zoomweb == true){
                                // Check for transform support so that we can fallback otherwise
                                var supportsZoom = 'zoom' in document.body.style;
                                if(supportsZoom){
                                    chrome.tabs.executeScript(tab.id,{code:"document.body.style.zoom=" + editzoom});
                                }else{
                                    chrome.tabs.executeScript(tab.id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + editzoom + ")'"});
                                }
                            }else if(zoomfont == true){
                                chrome.tabs.sendMessage(tab.id,{ text: 'setfontsize' });
                                chrome.tabs.sendMessage(tab.id,{ text: 'changefontsize', value: Math.round(editzoom*100) });
                            }
                            if(badge == true){
                                chrome.browserAction.setBadgeBackgroundColor({ color: lightcolor });
                                chrome.browserAction.setBadgeText({ text: "" + Math.round(editzoom * 100) + "", tabId: tab.id });
                            }else{
                                chrome.browserAction.setBadgeText({ text: "" });
                            }
                        }
                  });
              });
        goturlinside = true;
      }
    }
// reset got inside
  if(goturlinside == true){}
  else{
  // use default zoom from the Options page -- normal is 100%
  chrome.tabs.query({ active: true, currentWindow: true},
    function (tabs) {
        chrome.tabs.getZoom(sender.tab.id, function (zoomFactor) {
            //console.log("Stefan zoom is now:"+zoomFactor + " "+allzoomvalue);
            if(zoomFactor != allzoomvalue){
                if(zoomchrome == true){
                    // this to keep to zoom level by tab and not the whole domain (= automatic)
                    chrome.tabs.setZoomSettings(sender.tab.id, { mode: 'automatic', scope: 'per-tab' },
                    function() {
                      if (chrome.runtime.lastError) {
                      //console.log('[ZoomDemoExtension] doSetMode() error: ' + chrome.runtime.lastError.message);
                      }
                    });
                    chrome.tabs.setZoom(sender.tab.id, allzoomvalue); // needed for the default zoom value such as 110%
                }else if(zoomweb == true){
                    // Check for transform support so that we can fallback otherwise
                    var supportsZoom = 'zoom' in document.body.style;
                    if(supportsZoom){
                        chrome.tabs.executeScript(sender.tab.id,{code:"document.body.style.zoom=" + allzoomvalue});
                    }else{
                        chrome.tabs.executeScript(sender.tab.id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + allzoomvalue + ")'"});
                    }
                }else if(zoomfont == true){
                    chrome.tabs.sendMessage(sender.tab.id,{ text: 'setfontsize' });
                    chrome.tabs.sendMessage(sender.tab.id,{ text: 'changefontsize', value: Math.round(allzoomvalue*100) });
                }
                if(badge == true){
                    chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                    chrome.browserAction.setBadgeText ( { text: ""+Math.round(allzoomvalue*100)+"" } );
                } else{
                    chrome.browserAction.setBadgeText ( { text: "" } );
                }
            }else{
                if(badge == true){
                    chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                    chrome.browserAction.setBadgeText ( { text: ""+Math.round(allzoomvalue*100)+"" } );
                } else{
                    chrome.browserAction.setBadgeText ( { text: "" } );
                }
            }
        });
    });
  }
  goturlinside = false;
}

});
}
// contextmenu
else if (request.name == "contextmenuon") {checkcontextmenus();}
else if (request.name == "contextmenuoff") {removecontexmenus();}
// from context
else if (request.name == "contentzoomin") {zoomview(+1);}
else if (request.name == "contentzoomout") {zoomview(-1);}
});

// Begin zoom engine ---
var currentRatio = 1; var ratio = 1; var job = null;
var allzoom; var allzoomvalue; var webjob; var websitezoom = {}; var badge; var steps; var lightcolor; var zoomchrome; var zoomweb; var zoomfont;

function zoom(ratio){
currentRatio = ratio / 100;
chrome.tabs.query({ active: true, currentWindow: true}, function(tabs) {zoomtab(tabs[0].id,currentRatio);});
}

function zoomtab(a,b){
    backgroundnumber=Math.round(b*100);

    if(zoomchrome == true){
        if(allzoom == true){
                chrome.tabs.query({},
                function (tabs) {
                    tabs.forEach(function(tab){
                        chrome.tabs.setZoom(tab.id, b);
                    });
                });
        }else{
            try{
                chrome.tabs.setZoom(a, b);
            }
            catch(e){}
        }
    }else if(zoomweb == true){
        if(allzoom == true){
                chrome.tabs.query({},
                function (tabs) {
                    tabs.forEach(function(tab){
                        try{
                            var supportsZoom = 'zoom' in document.body.style;
                            if(supportsZoom){
                                chrome.tabs.executeScript(tab.id,{code:"document.body.style.zoom=" + b});
                            }else{
                                chrome.tabs.executeScript(tab.id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + b + ")'"});
                            }
                        }
                        catch(e){}
                        if(badge == true){
                            chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                            chrome.browserAction.setBadgeText ( { text: ""+parseInt(b*100)+"" } ); }
                        else { chrome.browserAction.setBadgeText({ text: "" }); }
                    });
                });
        }else{
            chrome.tabs.query({},
                function (tabs) {
                    tabs.forEach(function(tab){
                        var pop = tab.url;
                        if(zoombydomain == true){var webpop = pop.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
                        else{var webpop = pop;}
                        if(webpop == webjob){
                            try{
                                var supportsZoom = 'zoom' in document.body.style;
                                if(supportsZoom){
                                    chrome.tabs.executeScript(tab.id,{code:"document.body.style.zoom=" + b});
                                }else{
                                    chrome.tabs.executeScript(tab.id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + b + ")'"});
                                }
                            }
                            catch(e){}
                            if(badge == true){
                                chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                                chrome.browserAction.setBadgeText ( { text: ""+parseInt(b*100)+"", tabId: tab.id } ); }
                            else { chrome.browserAction.setBadgeText({ text: "" }); }
                        }
                    });
                });
        }
    }else if(zoomfont == true){
        if(allzoom == true){
            chrome.tabs.query({},
            function (tabs) {
                tabs.forEach(function(tab){
                        chrome.tabs.sendMessage(tab.id,{ text: 'changefontsize', value: Math.round(b*100) });
                    if(badge == true){
                        chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                        chrome.browserAction.setBadgeText ( { text: ""+parseInt(b*100)+"" } ); }
                    else { chrome.browserAction.setBadgeText({ text: "" }); }
                });
            });
    }else{
        chrome.tabs.query({},
            function (tabs) {
                tabs.forEach(function(tab){
                    var pop = tab.url;
                    if(zoombydomain == true){var webpop = pop.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
                    else{var webpop = pop;}
                    if(webpop == webjob){
                            chrome.tabs.sendMessage(tab.id,{ text: 'changefontsize', value: Math.round(b*100) });
                        if(badge == true){
                            chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                            chrome.browserAction.setBadgeText ( { text: ""+parseInt(b*100)+"", tabId: tab.id } ); }
                        else { chrome.browserAction.setBadgeText({ text: "" }); }
                    }
                });
            });
        }
    }

    // saving feature
    if(allzoom == true){
        // save for all zoom feature
        chrome.storage.sync.set({"allzoomvalue": b});
    }else{
            var atbbuf = [];
            for(var domain in websitezoom){atbbuf.push(domain);atbbuf.sort();}
            for(var i = 0; i < atbbuf.length; i++){
                if (atbbuf[i] == webjob) { //update
                    if (b == 1) {
                        // remove from list
                        delete websitezoom['' + atbbuf[i] + ''];
                        atbbuf = websitezoom;
                    } else {
                        // update ratio
                        websitezoom['' + atbbuf[i] + ''] = parseInt(b * 100);
                    }
                } else {
                    // add to list
                    websitezoom['' + webjob + ''] = parseInt(b * 100);
                }
            }
            // save for zoom feature
            chrome.storage.sync.set({ "websitezoom": JSON.stringify(websitezoom) });
    }
}
function zoomview(direction){zoom(nextratio(currentRatio*100,direction));}

function nextratio(ratio,direction){
ratio = Math.round(ratio);
var prevratio = parseInt(ratio)-parseInt(steps);
var nextratio = parseInt(ratio)+parseInt(steps);
if(direction==-1){
    if(ratio == 10){prevratio = 100;nextratio = 100;}
}else{
    if(ratio == 400){prevratio = 100;nextratio = 100;}
}
return (direction==-1)?prevratio:nextratio;
}
// End zoom engine ---

//Set click to false at beginning
var alreadyClicked = false;
//Declare a timer variable
var timer;

var openactionbrowserclick = function() {
    //Check for previous click
    if (alreadyClicked) {
        //console.log("Doubleclick");
        //Yes, Previous Click Detected
        //Clear timer already set in earlier Click
        window.clearTimeout(timer);
        // zoom in
        zoomview(+1);
        //Clear all Clicks
        alreadyClicked = false;
        return;
    }

    //Set Click to  true
    alreadyClicked = true;

    //Add a timer to detect next click to a sample of 250
    timer = window.setTimeout(function () {
        //console.log("Singelclick");
        //No more clicks so, this is a single click
        // zoom out
        zoomview(-1);
        //Clear all timers
        window.clearTimeout(timer);
        //Ignore clicks
        alreadyClicked = false;
    }, 250);
};

function doubleclickaction(){
chrome.browserAction.setPopup({popup:''});
chrome.browserAction.onClicked.addListener(openactionbrowserclick);
}

function regularaction(){
chrome.browserAction.onClicked.removeListener(openactionbrowserclick);
chrome.browserAction.setPopup({popup:"popup.html"});
}

function backgroundrefreshzoom(){
chrome.storage.sync.get(['allzoom','allzoomvalue','websitezoom','badge','steps','lightcolor','zoomchrome','zoomweb','zoombydomain','zoombypage','zoomfont'], function(response){
allzoom = response.allzoom;if(allzoom == null)allzoom = false; // default allzoom false
allzoomvalue = response.allzoomvalue;if(allzoomvalue == null)allzoomvalue = 1; // default allzoomvalue value
badge = response.badge;if(badge == null)badge = false;
lightcolor = response.lightcolor;if(lightcolor == null)lightcolor = "#3cb4fe";
steps = response.steps;if(steps == null)steps = 10;
zoomchrome = response.zoomchrome;if(zoomchrome == null)zoomchrome = false;
zoomweb = response.zoomweb;if(zoomweb == null)zoomweb = true;
zoomfont = response.zoomfont;if(zoomfont == null)zoomfont = false;
websitezoom = response.websitezoom;
zoombydomain = response.zoombydomain;if(zoombydomain == null)zoombydomain = true;
zoombypage = response.zoombypage;if(zoombypage == null)zoombypage = false;
// if empty use this
if(typeof websitezoom == "undefined" || websitezoom == null){
websitezoom = JSON.stringify({'https://www.example.com': ["90"], 'https://www.nytimes.com': ["85"]});
}
websitezoom = JSON.parse(websitezoom);

    chrome.tabs.query({ active: true, currentWindow: true},
    function (tabs) {
        if(tabs[0]){
        var job = tabs[0].url;
        if(zoombydomain == true){webjob = job.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
        else{webjob = job;}
        if(zoomchrome == true){
            chrome.tabs.getZoom(tabs[0].id,function(zoomFactor){
                ratio = zoomFactor;
                if(ratio == null) { ratio = 1 }
                currentRatio = ratio;
                backgroundnumber = Math.round(ratio * 100);
                if(badge == true){
                chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                chrome.browserAction.setBadgeText ( { text: ""+Math.round(currentRatio*100)+"", tabId: tabs[0].id } ); }
                else { chrome.browserAction.setBadgeText({ text: "" }); }
            });
        }else if(zoomweb == true){
            chrome.tabs.sendMessage(tabs[0].id,{ text: 'getwebzoom' },function(info){
                if(info == null || info == ""){ info = 1 }
                ratio = info;
                currentRatio = ratio;
                backgroundnumber = Math.round(ratio * 100);
                if(badge == true){
                chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                chrome.browserAction.setBadgeText ( { text: ""+Math.round(currentRatio*100)+"", tabId: tabs[0].id } ); }
                else { chrome.browserAction.setBadgeText({ text: "" }); }
            });
        }else if(zoomfont == true){
            chrome.tabs.sendMessage(tabs[0].id,{ text: 'getfontsize' },function(info){
                if(info == null || info == ""){ info = 1 }
                ratio = info;
                currentRatio = ratio;
                backgroundnumber = Math.round(ratio * 100);
                if(badge == true){
                chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
                chrome.browserAction.setBadgeText ( { text: ""+Math.round(currentRatio*100)+"", tabId: tabs[0].id } ); }
                else { chrome.browserAction.setBadgeText({ text: "" }); }
            });
        }
    }
    });

});
}

// update when click on the tab
chrome.tabs.onHighlighted.addListener(function(){
    backgroundrefreshzoom();
});

chrome.commands.onCommand.addListener(function(command) {
if(command == "toggle-feature-zoomin"){
    zoomview(+1);
}else if(command == "toggle-feature-zoomout"){
    zoomview(-1);
}else if(command == "toggle-feature-zoomreset"){
    zoom(allzoomvalue*100);
}
});

// contextMenus
function onClickHandler(info, tab) {
var str = info.menuItemId;var respage = str.substring(0, 8);var czl = str.substring(8);
if (respage == "zoompage") {
    chrome.storage.sync.get(['allzoom','allzoomvalue','badge','zoomchrome','zoomweb','websitezoom','zoombydomain','zoombypage','zoomfont'], function(response){
    allzoom = response.allzoom;
    allzoomvalue = response.allzoomvalue;if(allzoomvalue == null)allzoomvalue = 1; // default allzoomvalue value
    badge = response.badge;if(badge == null)badge = false;
    zoomchrome = response.zoomchrome;if(zoomchrome == null)zoomchrome = false;
    zoomweb = response.zoomweb;if(zoomweb == null)zoomweb = true;
    zoomfont = response.zoomfont;if(zoomfont == null)zoomfont = false;
    websitezoom = response.websitezoom;websitezoom = JSON.parse(websitezoom);
    zoombydomain = response.zoombydomain;if(zoombydomain == null)zoombydomain = true;
    zoombypage = response.zoombypage;if(zoombypage == null)zoombypage = false;
    chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
        if(zoomchrome == true){
            chrome.tabs.setZoom(tabs[0].id, czl/100);
        }else if(zoomweb == true){
            var supportsZoom = 'zoom' in document.body.style;
            if(supportsZoom){
                 chrome.tabs.executeScript(tabs[0].id,{code:"document.body.style.zoom=" + czl/100});
            }else{
                chrome.tabs.executeScript(tabs[0].id,{code:"document.body.style.transformOrigin='left top';document.body.style.transform='scale(" + czl/100 + ")'"});
            }
        }else if(zoomfont == true){
            chrome.tabs.sendMessage(sender.tab.id,{ text: 'setfontsize' });
            chrome.tabs.sendMessage(sender.tab.id,{ text: 'changefontsize', value: Math.round(czl) });
        }
        if(badge == true){
            chrome.browserAction.setBadgeBackgroundColor({color:lightcolor}); 
            chrome.browserAction.setBadgeText ( { text: ""+Math.round(czl)+"" } ); }else{chrome.browserAction.setBadgeText ( { text: "" } );
        }
        var job = tabs[0].url;
        if(zoombydomain == true){var webjob = job.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[0];}
        else{var webjob = job;}
        if(allzoom == true){
            // save for all zoom feature
            chrome.storage.sync.set({"allzoomvalue": czl/100});
        }else{
                var atbbuf = [];
                for(var domain in websitezoom){atbbuf.push(domain);atbbuf.sort();}
                for(var i = 0; i < atbbuf.length; i++){
                    if(atbbuf[i] == webjob){ //update
                        if(parseInt(czl/100) == 1){
                        // remove from list
                        delete websitezoom[''+atbbuf[i]+''];
                        } else {
                        // update ratio
                        websitezoom[''+atbbuf[i]+''] = parseInt(czl);
                        }
                    }else{
                        // add to list
                        websitezoom[''+webjob+''] = parseInt(czl);
                    }
                }
                // save for zoom feature
                chrome.storage.sync.set({"websitezoom": JSON.stringify(websitezoom) });
        }
    });
    });
}
else if (info.menuItemId == "totlguideemenu") {window.open(linkguide, "_blank");}
else if (info.menuItemId == "totldevelopmenu") {window.open(donatewebsite, "_blank");}
else if (info.menuItemId == "totlratemenu") {window.open(writereview, "_blank");}
else if (info.menuItemId == "totlsharemenu") {window.open(zoomwebsite, "_blank");}
else if (info.menuItemId == "totlshareemail") {window.open("mailto:youremail?subject=Zoom extension&body=Hé, This is amazing. I just tried today this Zoom Browser extension"+zoomproduct+"", "_blank");}
else if (info.menuItemId == "totlsharetwitter") {var szoomproductcodeurl = encodeURIComponent("The Best and Amazing Zoom Browser extension "+zoomproduct+"");window.open("https://twitter.com/home?status="+szoomproductcodeurl+"", "_blank");}
else if (info.menuItemId == "totlsharefacebook") {window.open("https://www.facebook.com/sharer/sharer.php?u="+zoomproduct, "_blank");}
else if (info.menuItemId == "totlsharegoogleplus") {window.open("https://plus.google.com/share?url="+zoomproduct, "_blank");}
else if (info.menuItemId == "totlsubscribe") {chrome.tabs.create({url: linkyoutube, active:true})}
}

// check to remove all contextmenus
chrome.contextMenus.removeAll(function() {
//console.log("contextMenus.removeAll callback");
});

// pageaction
var sharemenusharetitle = chrome.i18n.getMessage("sharemenusharetitle");
var sharemenuwelcomeguidetitle = chrome.i18n.getMessage("sharemenuwelcomeguidetitle");
var sharemenutellafriend = chrome.i18n.getMessage("sharemenutellafriend");
var sharemenusendatweet = chrome.i18n.getMessage("sharemenusendatweet");
var sharemenupostonfacebook = chrome.i18n.getMessage("sharemenupostonfacebook");
var sharemenupostongoogleplus = chrome.i18n.getMessage("sharemenupostongoogleplus");
var sharemenuratetitle = chrome.i18n.getMessage("sharemenuratetitle");
var sharemenudonatetitle = chrome.i18n.getMessage("sharemenudonatetitle");
var sharemenusubscribetitle = chrome.i18n.getMessage("desremyoutube");

var contexts = ["page_action", "browser_action"];
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

chrome.storage.sync.get(['contextmenus','steps'], function(items){
    if(items['steps']){steps = items.steps;if(steps == null)steps = 10;}
    if(items['contextmenus'] == true){checkcontextmenus();}
});

// context menu for page and video
var menupage = null;
var contextmenuadded = false;
var contextarraypage = [];
var contextdefault = "100";
var book = [];

function checkcontextmenus(){
    //---
    chrome.storage.sync.get(['allzoomvalue','screenzoom','defaultallscreen','defaultsinglescreen'], function(items){
        if(items['allzoomvalue']){allzoomvalue = items.allzoomvalue;if(allzoomvalue == null)allzoomvalue = 1;}
        if(items['screenzoom']){screenzoom = items.screenzoom;}
        if(items['defaultallscreen']){defaultallscreen = items.defaultallscreen;if(defaultallscreen == null)defaultallscreen = true;}
        if(items['defaultsinglescreen']){defaultsinglescreen = items.defaultsinglescreen;if(defaultsinglescreen == null)defaultsinglescreen = false;}

        contextdefault = allzoomvalue*100;//get the default zoom value for that screen

        var currentscreen = screen.width+"x"+screen.height;

        if(defaultallscreen == true){} // no change
        else if(defaultsinglescreen == true){
            screenzoom = JSON.parse(screenzoom);
            var satbbuf = [];
            for(var domain in screenzoom)
                satbbuf.push(domain);
                satbbuf.sort();
                for(var i = 0; i < satbbuf.length; i++){
                if(satbbuf[i] == currentscreen){
                    contextdefault = screenzoom[satbbuf[i]];
                }
                }
        }
        //---
    
        if(contextmenuadded == false){
        contextmenuadded = true;
        var contexts = ["page","selection","link","editable","image","audio","video"];
        var pagetitle = chrome.i18n.getMessage("name");
    
            book = Array();
    
            for(var k = 100; k <= 200; k =k + +steps) {
                // skip the first value -> 100 
                if(k != 100){
                    book.push(k);
                }
            }
    
            for (var j = 100; j >= 10; j=j-steps) {
                book.push(j);
            }

            // if the default zoom value is inside, then do nothing
            // else add this value in the context menu
            var mySet = new Set(book);
            var hascont = mySet.has(parseInt(contextdefault, 10)); // true
            if(hascont){}else{
                book.push(contextdefault);
            }
    
            book.sort(function(a, b){return b - a});
    
            for (var i = 0; i < book.length; i++) {
                if(contextdefault && contextdefault == book[i]){
                    menupage = chrome.contextMenus.create({"type":"radio", "checked" : true, "id": "zoompage"+book[i]+"", "title": "Zoom: "+ (book[i]) + "%", "contexts":contexts});
                }else{
                    menupage = chrome.contextMenus.create({"type":"radio","id": "zoompage"+book[i]+"","title": "Zoom: "+ (book[i]) + "%", "contexts":contexts});
                } 
            }
            contextarraypage.push(menupage);

        }

    });

}

function removecontexmenus(){
    for (var i = 0; i < book.length; i++) {
        menupage = chrome.contextMenus.remove("zoompage"+book[i]+"");
    }
    book = [];
    contextarraypage = [];
    contextmenuadded = false;
}

function refreshcontexmenus(){
    for (var i = 0; i < book.length; i++) {
        menupage = chrome.contextMenus.remove("zoompage"+book[i]+"");
    }
    book = [];
    contextarraypage = [];
    contextmenuadded = false;
    chrome.storage.sync.get(['contextmenus'], function(items){
        if(items['contextmenus'] == true){checkcontextmenus();}
    });
}

function handleZoomed(zoomChangeInfo) {
    //console.log("Tab: " + zoomChangeInfo.tabId + " zoomed");
    //console.log("Old zoom: " + zoomChangeInfo.oldZoomFactor);
    //console.log("New zoom: " + zoomChangeInfo.newZoomFactor);
    chrome.storage.sync.get(['badge','zoomchrome'], function(response){
        badge = response.badge;if(badge == null)badge = false; // default badge false
        zoomchrome = response.zoomchrome;if(zoomchrome == null)zoomchrome = false; // default zoomchrome false
        if(zoomchrome == true){
            if(badge == true){
                // zoom changed
                // set the badge for the browser built-in zoom
                chrome.browserAction.setBadgeText ( { text: ""+Math.round(zoomChangeInfo.newZoomFactor*100)+"", tabId: zoomChangeInfo.tabId } );
            }
        }
    });
}
chrome.tabs.onZoomChange.addListener(handleZoomed);

document.addEventListener('DOMContentLoaded', function () {
chrome.storage.sync.get(['zoomdoubleclick'], function(response){
zoomdoubleclick = response.zoomdoubleclick;if(zoomdoubleclick == null)zoomdoubleclick = false; // default zoomdoubleclick false

if(zoomdoubleclick == true){doubleclickaction();}else{regularaction();}
backgroundrefreshzoom();

});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(changes['steps']){if(changes['steps'].newValue){steps=changes['steps'].newValue;refreshcontexmenus()}}
    if(changes['allzoomvalue']){if(changes['allzoomvalue'].newValue){allzoomvalue=changes['allzoomvalue'].newValue;refreshcontexmenus()}}
    if(changes['contextmenus']){if(changes['contextmenus'].newValue == true){checkcontextmenus()}else{removecontexmenus()}}
    if(changes['defaultallscreen']){if(changes['defaultallscreen'].newValue == true){
        defaultallscreen=changes['defaultallscreen'].newValue;
        defaultsinglescreen=false;
        refreshcontexmenus();
        }
    }
    if(changes['defaultsinglescreen']){if(changes['defaultsinglescreen'].newValue == true){
        defaultsinglescreen=changes['defaultsinglescreen'].newValue;
        defaultallscreen=false;
        refreshcontexmenus();
        }
    }
    if(changes['badge']) {
        if(changes['badge'].newValue == true) { chrome.browserAction.setBadgeText({ text: "100" }) } else { chrome.browserAction.setBadgeText({ text: "" }) }
    }
    if(changes['lightcolor']) {
        if(changes['lightcolor'].newValue) { chrome.browserAction.setBadgeBackgroundColor({ color: changes['lightcolor'].newValue }) }
    }
    if(changes['zoomdoubleclick']){if(changes['zoomdoubleclick'].newValue == true){doubleclickaction();backgroundrefreshzoom();}else{regularaction();backgroundrefreshzoom();}}
})

chrome.runtime.setUninstallURL(linkuninstall);

// convert from the chrome.local to chrome.sync
chrome.storage.local.get(['firstRun','version'], function(chromeset){
    // if yes, it use the chrome.local setting
    if (chromeset["firstRun"] == "false"){
        // move all settings from the local to sync
        if(chromeset["firstRun"] == "false"){ chrome.storage.sync.set({"firstRun": false}); }
        if(chromeset["version"] == "2.1"){ chrome.storage.sync.set({"version": "2.1"}); }
          
        // when done, clear the local
        chrome.storage.local.clear();
    } else {
        // already done converting the 'firstrun' (from chrome.local to chrome.sync) to false
        // or no firstrun found in chrome.local (empty value), then do the 'welcome page'
        initwelcome();
    }
});

function initwelcome(){
chrome.storage.sync.get(['firstRun'], function(chromeset){
if ((chromeset["firstRun"]!="false") && (chromeset["firstRun"]!=false)){
  chrome.tabs.create({url: linkwelcomepage});
  var crrinstall = new Date().getTime();
  chrome.storage.sync.set({"firstRun": false, "version": "2.1", "firstDate": crrinstall});  
}
});
}