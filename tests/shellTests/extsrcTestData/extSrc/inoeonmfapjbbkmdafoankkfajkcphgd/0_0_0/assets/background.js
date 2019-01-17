SETTING_CONTAINER="texthelpSpeechStreamTBSettings",PORT_NAME="texthelpSpeechStreamTB",STORAGE=chrome.storage.sync,LOCALSTORAGE=localStorage,extensionInstallTabID="",disabledSites=JSON.parse("[\"www.google.com/calendar\", \"docs.google.com/drawings\",\"drive.google.com\",\"www.mergeagency.com\",\"cloud.feedly.com\",\"outlook.com\",\"rw.texthelp.com/pdfviewer/\",\"rw.texthelp.com/epubviewer/\",\"appsqa.texthelp.com/pdfviewer/\",\"appsqa.texthelp.com/epubviewer/\",\"maddensbar.com/\",\"www.awinfosys.com\"]"),this.messages=JSON.parse("{\"p\":{\"m\":{\"link\":\"\",\"message\":\"\",\"messagedatenumerical\":0,\"expires\":0}},\"t\":{\"m\":{\"link\":\"\",\"message\":\"\",\"messagedatenumerical\":0,\"expires\":0}},\"f\":{\"m\":{\"link\":\"https://www.texthelp.com/en-us/company/education-blog/october-2016/practice-reading-aloud-with-read-write-for-google\",\"message\":\"New Practice Reading Aloud feature now available! Click here to learn more.\",\"messagedatenumerical\":20170309000000,\"expires\":0}}}"),tab=null,settings=null,settingsCookiePosition=null,clickHoverOn=!0,this.license=null,this.lastGoogleID="",this.encryptedID="",this.lastDate=0,this.enabled=!0,this.licensed=!1;/*chrome.identity.getProfileUserInfo((userInfo) => {
    userInfo.email = '';
    if (userInfo.email.length > 0){
        texthelp.RW4GC.authenticator.getLicense(userInfo.email, function (license) {
            console.log(license);
        });
    }
    else{
        texthelp.RW4GC.authenticator.getEmail(false, (email) => {
            if (email.length == 0){
                return;
            }
            
            texthelp.RW4GC.authenticator.getLicense(email,  (license)=> {
                console.log(license);
            });
        });
    }
});*/function updateChromeOptions(e){chrome.storage.sync.get({enabledRW4GC:!0},function(t){try{window.enabled=t.enabledRW4GC,window.enabled&&e?chrome.browserAction.setIcon({path:chrome.extension.getURL("/assets/24.png")}):chrome.browserAction.setIcon({path:chrome.extension.getURL("/assets/24disabled.png")})}catch(e){console.log(e)}})}function onPageAction(e){onPageActionHandler(e,!1)}function onPageActionHandler(e){window.enabled&&(chrome.storage.sync.set({enabledRW4GC:!0}),texthelp.RW4GC.IdentityManagerInstance.getLicense(!0,(t)=>{if(void 0!=t&&void 0===t.error&&!(t.HideUnlicensed&&!1==t.Valid&&"group"==t.licence_type.toLowerCase())&&!(t.HideUnlicensed&&!1==t.Valid&&"single"==t.licence_type.toLowerCase())){for(var o=!1,s=e.url,n=0;n<disabledSites.length;n++)-1!=s.indexOf(disabledSites[n])&&(o=!0);chrome.tabs.sendMessage(e.id,{type:"1757FROM_BGRW4G",command:"connected",settingcookies:settingsCookiePosition,isClickHoverOn:getClickHoverOn(),forceInject:e.url,blockList:o})}}))}function authTokenCallback(e,t){if(void 0!=e){for(var o=!1,s=t[1],n=0;n<disabledSites.length;n++)-1!=s.indexOf(disabledSites[n])&&(o=!0);chrome.tabs.sendMessage(t[0],{type:"1757FROM_BGRW4G",command:"connected",settingcookies:settingsCookiePosition,isClickHoverOn:getClickHoverOn(),forceInject:t[1],blockList:o})}}function onStorageChange(e){try{eachTab(function(t){chrome.tabs.sendRequest(t.id,{method:"onGetthRWFGSettings",type:"1757FROM_BGRW4G",payload:e})})}catch(t){alert("Couldn't update settings for all tabs. Exception:"+t)}}function getAuthTokenCallback(e,t){t({method:"onGetOAuthToken",type:"1757FROM_BGRW4G",payload:e})}function getAuthTokenCallbackSilent(e,t){t({method:"onGetOAuthTokenSilent",type:"1757FROM_BGRW4G",payload:e})}function eachTab(e){chrome.windows.getAll(null,function(t){for(var o=0;o<t.length;o++)chrome.tabs.getAllInWindow(t[o].id,function(s){for(var n=0;n<s.length;n++)e(s[n],t[o])})})}try{}catch(t){}try{function e(e,t){return e.slice(0,t.length)==t}function t(e,t){return""==t||e.slice(-t.length)==t}var _AnalyticsCode="UA-35861859-4",_gaq=_gaq||[];_gaq.push(["_setAccount",_AnalyticsCode]),_gaq.push(["_trackPageview"]),function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://ssl.google-analytics.com/ga.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}(),chrome.browserAction.onClicked.addListener(onPageAction),chrome.tabs.onUpdated.addListener(function(o,s,n){try{if("complete"==s.status){if("chrome://identity-internals/"==n.url)return;texthelp.RW4GC.IdentityManagerInstance.getId(!1,(o)=>{if(null!=o&&0!=n.url.indexOf("https://docs.google.com/document")){if(t(o,"@qaheroes.com")&&e(o,"chromepc"));else if("smores01@scary.docsplustesting.com"==o);else return;onPageActionHandler(n,!0),chrome.tabs.sendRequest(n.id,{method:"thGetType"})}})}}catch(e){console.log(e)}});var getAccessToken=function(e){chrome.identity.getAuthToken({interactive:!0,scopes:["profile","email","https://www.googleapis.com/auth/classroom.courses.readonly","https://www.googleapis.com/auth/classroom.rosters.readonly","https://www.googleapis.com/auth/classroom.profile.emails","https://www.googleapis.com/auth/classroom.profile.photos"]},function(t){null==e,e({token:t})})},getProfileAccessToken=function(e){chrome.identity.getAuthToken({interactive:!0,scopes:["profile","email"]},function(t){null==e,e({token:t})})},getClassroomAccessToken=function(e){chrome.identity.getAuthToken({interactive:!0,scopes:["https://www.googleapis.com/auth/classroom.courses.readonly","https://www.googleapis.com/auth/classroom.rosters.readonly","https://www.googleapis.com/auth/classroom.profile.emails","https://www.googleapis.com/auth/classroom.profile.photos"]},function(t){null==e,e({token:t})})},revokeAccessToken=function(e,t){chrome.identity.removeCachedAuthToken({token:e},function(){t({value:!0})})};chrome.runtime.onMessageExternal.addListener(function(e,t,o){if(e&&"ft4g"==e.app){if("get_access_token"===e.type)return getAccessToken(o),!0;if("get_classroom_token"===e.type)return getClassroomAccessToken(o),!0;if("get_profile_token"===e.type)return getProfileAccessToken(o),!0;if("revoke_access_token"===e.type)return revokeAccessToken(e.custom,o),!0}});var g_lang=chrome.i18n.getUILanguage(),g_voices="",gc_voices="";chrome.runtime.onMessage.addListener(function(e,t,o){"thChromeOptionsChanged"==e.method&&updatePageAction(e,t,o)}),chrome.idle.onStateChanged.addListener(function(e){"active"==e&&texthelp.RW4GC.MessagingManagerInstance.checkIfStalled(!0,1.2e5)}),chrome.extension.onRequest.addListener(function(e,t,o){var s="https://script.google.com/macros/s/AKfycbyPhfA6NYF8msRlb7BF4aR8Ax_JWSDM6eAj3tjR2CpkXUMfjhk/exec";if(void 0!=e.key&&"function"===e.key)return void this.thFunctions["on"+e.method](e.parameters,o,t.tab,t);/*
        if (request.method === "thMsgBaseLicense") {
            if (request.type == '1757FROM_PAGERW4G') {
                // if ((this.backupFeatures == undefined) || (this.backupFeatures == null)) {
                    console.log('setting backup license');
                    console.log(request.license);
                    this.backupFeatures = request.license;
                // }
            }
        }
        */if("thChromeOptionsChanged"===e.method&&"1757FROM_PAGERW4G"==e.type&&updateChromeOptions(e.enabled),"thCheckExtension"===e.method){var n=e.payload.Lang;void 0==n&&(n=g_lang);var a="https://text.help/z5IXmF"+"?locale="+n;if(void 0==e.payload.defaultsettings){e.payload.defaultsettings={};var i={"en-AU":"Karen","en-GB":"Serena","en-US":"Ava",fr:"Audrey","fr-CA":"Amelie",pt:"Luciana","pt-BR":"ScanSoft Raquel_Full_22kHz","pt-PT":"Luciana",es:"Monica","es-419":"Paulina"};e.payload.defaultsettings.voice="Ava",void 0!=i[n]&&(e.payload.defaultsettings.voice=i[n]),e.payload.defaultsettings.speed=50}window.texthelp.RW4GC.ssrdefaults=e.payload.defaultsettings;try{chrome.management.get(e.payload.ChromeExtId,function(){chrome.runtime.lastError?""==extensionInstallTabID?chrome.tabs.create({url:a,active:!0},function(e){extensionInstallTabID=e.id}):chrome.tabs.get(extensionInstallTabID,function(){chrome.runtime.lastError?chrome.tabs.create({url:a,active:!0},function(e){extensionInstallTabID=e.id}):chrome.tabs.update(extensionInstallTabID,{url:a,active:!0})}):chrome.storage.sync.get("thRWFGSettings",function(t){var o=null;void 0==t.thRWFGSettings?(o={},o.voice=window.texthelp.RW4GC.ssrdefaults.voice,o.speed=window.texthelp.RW4GC.ssrdefaults.speed):(o=JSON.parse(t.thRWFGSettings),typeof o!=Object&&0<o.length&&(o=JSON.parse(o)),void 0!==o.speechoptions&&(o=o.speechoptions));var s={};s.command="startScreenShotReader",s.voice=o.voice,s.speed=o.speed,s.speechServerURL="https://rwforg.speechstream.net/SpeechServices/index.html",s.user="rwforgdocs6",chrome.runtime.sendMessage(e.payload.ChromeExtId,s)})})}catch(e){console.log(e)}}if("thStopScreenShotReader"===e.method)try{chrome.management.get(e.payload.ChromeExtId,function(){chrome.runtime.lastError||chrome.storage.sync.get("thRWFGSettings",function(){var t={};t.command="stopScreenShotReader",chrome.runtime.sendMessage(e.payload.ChromeExtId,t)})})}catch(e){console.log(e)}if("thStopScreenShotReaderSpeech"===e.method)try{chrome.management.get(e.payload.ChromeExtId,function(){chrome.runtime.lastError||chrome.storage.sync.get("thRWFGSettings",function(){var t={};t.command="stopScreenShotReaderSpeech",chrome.runtime.sendMessage(e.payload.ChromeExtId,t)})})}catch(e){console.log(e)}if("getLang"===e.method&&o({method:"onLanguage",type:"1757FROM_BGRW4G",payload:g_lang.toString()}),"collectHighlightsRequest"===e.method&&"1757FROM_PAGERW4G"==e.type){var r=new XMLHttpRequest,l=new Date().getTime(),d="style.css?ver="+l;r.open("POST",s+"?ver="+l,!0),r.onreadystatechange=function(){var e="";4==this.readyState&&200==this.status&&(e=this.getResponseHeader("Content-Type"),"application/json"==e.substr(0,16)&&o({method:"onCollectHighlights",type:"1757FROM_BGRW4G",payload:this.responseText.toString()}),-1<this.responseText.indexOf("<title>Error</title>")||o({method:"onCollectHighlights",type:"1757FROM_BGRW4G",payload:JSON.stringify({auth:this.responseText.toString()})}))};var c=new FormData;e.sort=2>e.sort?0:1;var p=JSON.stringify(e.colors),g="{\"newHighlightsDocument\":\""+e.docTitle+"\",\"cmd\":\"collectHighlights\", \"sort\":\""+e.sort+"\", \"docsToCollect\":[\""+e.payload+"\"],\"colors\":"+p+"}";c.append("payload",g),r.send(c)}if("vocabWordsRequest"===e.method&&"1757FROM_PAGERW4G"==e.type){var r=new XMLHttpRequest,l=new Date().getTime(),d="style.css?ver="+l;r.open("POST",s+"?ver="+l,!0),r.onreadystatechange=function(){var e="";4==this.readyState&&200==this.status&&(e=this.getResponseHeader("Content-Type"),"application/json"==e.substr(0,16)&&o({method:"onVocabWords",type:"1757FROM_BGRW4G",payload:this.responseText.toString()}),-1<this.responseText.indexOf("<title>Error</title>")||o({method:"onVocabWords",type:"1757FROM_BGRW4G",payload:JSON.stringify({auth:this.responseText.toString()})}))};var c=new FormData,p=JSON.stringify(e.colors),h=JSON.stringify(e.translations),g="{\"newVocabDocument\":\""+e.translations.docTitle+"\",\"cmd\":\"vocab\",\"docsToCollect\":[\""+e.payload+"\"],\"colors\":"+p+", \"translations\":"+h+"}";c.append("payload",g),r.send(c)}if("authenticate"===e.method&&"1757FROM_PAGERW4G"==e.type){var m=[];window.thFunctions.onAuthenticate(m);var r=new XMLHttpRequest,l=new Date().getTime(),d="style.css?ver="+l;r.open("GET",s+"?ver="+l,!0),r.onreadystatechange=function(){var e="";4==this.readyState&&200==this.status&&(e=this.getResponseHeader("Content-Type"),"text/html"==e.substr(0,9)&&o({method:"onAuthenticate",type:"1757FROM_BGRW4G",payload:this.responseText.toString()}))},r.send()}if("collectHighlightsWeb"!==e.method||"1757FROM_PAGERW4G"!=e.type,"vocabWeb"===e.method&&"1757FROM_PAGERW4G"==e.type&&(e.payload.sendResponse=o,this.texthelp.RW4GC.authenticator.writeVocabDocument(e.payload)),"getOAuthToken"===e.method&&"1757FROM_PAGERW4G"==e.type&&texthelp.RW4GC.IdentityManagerInstance.getLicense(!0,(e)=>{o({method:"onGetOAuthToken",type:"1757FROM_BGRW4G",payload:e})}),"getOAuthTokenSilent"===e.method&&"1757FROM_PAGERW4G"==e.type&&"1757FROM_PAGERW4G"==e.type&&texthelp.RW4GC.IdentityManagerInstance.getLicense(!1,(e)=>{o({method:"onGetOAuthTokenSilent",type:"1757FROM_BGRW4G",payload:e})}),"thSetType"===e.method,"GAE"===e.method&&"1757FROM_PAGERW4G"==e.type){var y=e.payload.category;try{-1<e.payload.category.indexOf("@")&&(y=thHash.hashEmail(e.payload.category))}catch(e){}_gaq.push(["_trackEvent",y,e.payload.action,e.payload.label])}if("highlightSelection"===e.method&&"1757FROM_PAGERW4G"==e.type){var r=new XMLHttpRequest,l=new Date().getTime(),d="style.css?ver="+l;r.open("POST",s+"?ver="+l,!0);var c=new FormData,g="{\"cmd\":\"highlightSelection\", \"range\":"+JSON.stringify(e.payload)+"}";c.append("payload",g),r.send(c)}if("clearHighlights"===e.method&&"1757FROM_PAGERW4G"==e.type){var r=new XMLHttpRequest,l=new Date().getTime(),d="style.css?ver="+l;r.open("POST",s+"?ver="+l,!0);var c=new FormData,g="{\"cmd\":\"clearHighlights\", \"range\":"+JSON.stringify(e.payload)+"}";c.append("payload",g),r.send(c)}if("thRWFGSettings"===e.method&&"1757FROM_PAGERW4G"==e.type){var u=JSON.stringify(e.payload);onStorageChange(u),chrome.storage.sync.set({thRWFGSettings:u})}if("thRWFGGetSettings"===e.method&&"1757FROM_PAGERW4G"==e.type&&chrome.storage.sync.get("thRWFGSettings",function(e){o({method:"onGetthRWFGSettings",type:"1757FROM_BGRW4G",payload:e})}),"thPrediction"===e.method&&"1757FROM_PAGERW4G"==e.type){r=new XMLHttpRequest;var n=e.payload.context[2],f=e.payload.context[0].replace(/ /g," "),R="{"+"\"u\":\"rwfordocs6\",\"p\":\""+f+"\",\"c\":\""+e.payload.context[1]+"\",\"l\":\""+n+"\",\"s\":\""+e.payload.seq+"\",\"e\":\"n4T7Y2AjS4\""+"}",b="";b="https://rwgoogle-webservices-7.texthelp.com/v1.11.0/prediction?json="+encodeURIComponent(R),parent=e.payload.parent,position=e.payload.position,r.open("POST",b,!0),r.onreadystatechange=function(e,t){return function(){var s="";if(4==this.readyState&&200==this.status){var n=[];if(n.push("prediction request timer"),window.thFunctions.onEndTiming(n),s=this.getResponseHeader("Content-Type"),"application/json"==s.substr(0,16)){var a=JSON.parse(this.responseText.toString());o({method:"thPrediction",type:"1757FROM_BGRW4G",payload:{words:a.predictions,seq:a.sequenceID,parentId:e,positionId:t}})}}}}(parent,position),r.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");var m=[];m.push("prediction request timer"),m.push(this.texthelp.RW4GC.IdentityManagerInstance.id),m.push(this.texthelp.RW4GC.IdentityManagerInstance.id.split("@")[1]),this.thFunctions.onStartTiming(m),r.send()}/*    if (request.method === "thDoPopupLicenseMessage") {
            if (request.type == '1757FROM_PAGERW4G') {
                return;

                //           chrome.storage.sync.set({ 'thRWFGPopup': '1010111' });
                var payload = request.payload;
                chrome.storage.sync.get('thRWFGPopup', (function (data) {
                    return function (settings) {

                        var messages = JSON.parse('{"p":{"m":{"link":"","message":"","messagedatenumerical":20170311000000,"expires":30}},"t":{"m":{"link":"","message":"","messagedatenumerical":0,"expires":0}},"f":{"m":{"link":"https://www.texthelp.com/en-us/company/education-blog/october-2016/practice-reading-aloud-with-read-write-for-google","message":"New Practice Reading Aloud feature now available! Click here to learn more.","messagedatenumerical":20170310000000,"expires":0}}}');

                        var last = '0';

                        // we can only get an old license on the fallback from family licensing.
                        // this can only happen if the old licensing returns a premium license.
                        // so set a premium license
                        var notificationForClient = messages['p'];
                        if (data.daysleft < 0) {
                            if (data.daysleft !== undefined) {
                                notificationForClient = messages['f'];
                            }
                        }
                        else if (data.trial !== undefined) {
                            if (data.trial){
                                notificationForClient = messages['t'];
                            }
                        }

                         var notifyDate = notificationForClient['m']['messagedatenumerical'];

                         if (notificationForClient['m']['expires'] > 0) {
                            var todayDate = parseInt(moment().format('YYYYMMDD') + '000000');
                            if ((todayDate - notifyDate) > notificationForClient['m']['expires']) {
                                return;
                            }
                        }

               //         var curr = data['PromoMessage']['MessageDateNumerical'];

                        if (settings['thRWFGPopup'] == undefined) {
                            chrome.storage.sync.set({
                                'thRWFGPopup': ''
                            });
                        }

                        if (settings['thRWFGPopup'] !== undefined) {
                            if (settings['thRWFGPopup']['last'] !== undefined) {
                                last = settings['thRWFGPopup']['last'];
                            }
                        }

                        if (last >= notifyDate) {
                            return;
                        }

                        var hideUnlicensed = false;
                        if (data["Valid"] !== undefined) {
                            if (data["HideUnlicensed"] !== undefined) {
                                hideUnlicensed = data["HideUnlicensed"];
                            }
                        }
                        else {
                            if (data["hide_unlicensed"] !== undefined) {
                                hideUnlicensed = data["hide_unlicensed"];
                            }
                        }

                        if (hideUnlicensed) {
                            return;
                        }

                        chrome.storage.sync.set({
                            'thRWFGPopup': {
                                'last': notifyDate
                            }
                        });


                        sendResponse({
                            'method': 'onthRWFGPopup',
                            'type': '1757FROM_BGRW4G',
                            'payload': notificationForClient
                        });
                

                    }
             
                })(payload));
            }
        }*/if("trialValidation"===e.method&&"1757FROM_PAGERW4G"==e.type)/*         texthelp.RW4GC.authenticator.getEmail(false, function (email) {
                    texthelp.RW4GC.authenticator.getLicense(email, function (license) {
                        //         this.license = JSON.parse(this.responseText.toString());

                        sendResponse({
                            'method': 'trialValidation',
                            'type': '1757FROM_BGRW4G',
                            'payload': license
                        });
                        
                        return;

                    }.bind(this)
                    , function (license) {
                        sendResponse({
                            'method': 'trialValidation',
                            'type': '1757FROM_BGRW4G',
                            'payload': undefined
                        });
                    });
                }.bind(this));*/return void texthelp.RW4GC.IdentityManagerInstance.getLicense(!1,(e)=>{o({method:"trialValidation",type:"1757FROM_BGRW4G",payload:e})});/*         
                          var todaysDate = new Date();
                          
                          var todaysDateNumber = (todaysDate.getDay()*100) + todaysDate.getHours();
                  //        var todaysDateNumber = todaysDate.getYear() + todaysDate.getYear() + todaysDate.getYear();
                     /*     if (this.oAuth._profile !== null) {
                              sendResponse({
                                  'method': 'trialValidation',
                                  'type': '1757FROM_BGRW4G',
                                  'payload': license
                              });
                          }
                          else*//*               if (this.license == null || this.lastGoogleID !== currentEmail ||
                                   todaysDateNumber !== this.lastDate || currentEmail.length == 0) {
               
                                   this.lastGoogleID = currentEmail;
                                   // store the encrypted version for analytics
                                   this.encryptedID = thHash.hashEmail(currentEmail);
                                   
                                   this.lastDate = todaysDateNumber;
                                   var xhr = new XMLHttpRequest();
                                   xhr.open("GET", trialURL + currentEmail + trialSuffux + '&lang=' + g_lang, true);
                            //       xhr.token = this.oAuth._token;
                                   
                                   // if the id is screenscraped its for analytics no liccensing. Do not
                                   // respond with a license. 
                                   if (!request["screenScraped"]) {
                                       xhr.onreadystatechange = function () {
                                           var contentType = '';
                                           if (this.readyState == 4) {
                                               if (this.status == 200) {
               
                                           /*        var parameters = [];
                                                   parameters.push('license request timer');
                                                   window.thFunctions['onEndTiming'](parameters);*//*                                  contentType = this.getResponseHeader("Content-Type");
                                                  if (contentType.substr(0, 16) == 'application/json') {
              
                                                      this.license = JSON.parse(this.responseText.toString());
              
                                                      sendResponse({
                                                          'method': 'trialValidation',
                                                          'type': '1757FROM_BGRW4G',
                                                          'payload': this.license
                                                      });
                                                      // sendResponse({ 'method': 'trialValidation', 'type': '1757FROM_BGRW4G', 'payload': this.responseText.toString() });
                                                  }
                                              }
                                          }
                                      }
                                  }
              
                              
                       /*           var parameters = [];
                                  parameters.push('license request timer');
                                  parameters.push(this.oAuth.getProfileDetails().email);
                                  parameters.push(this.oAuth.getProfileDetails().email['split']('@')[1]);
              
                                  this.thFunctions['onStartTiming'](parameters);*//*                xhr.send();
                            }
                            else {
                                sendResponse({
                                    'method': 'trialValidation',
                                    'type': '1757FROM_BGRW4G',
                                    'payload': this.license
                                });
                            }
                        
                            /*
                            var responseJSON = null;
                        
                            var responseJSON = {
                            "daysLeft": "29"
                            }
                        
                            sendResponse({ 'method': 'trialValidation', 'type': '1757FROM_BGRW4G', 'payload': responseJSON });
                            */if("gdocsTrialValidation"===e.method&&"1757FROM_PAGERW4G"==e.type){var c=e.payload,G=new Date,w=G.getYear()+G.getYear()+G.getYear();/*     if (this.oAuth._profile !== null) {
                         sendResponse({
                             'method': 'trialValidation',
                             'type': '1757FROM_BGRW4G',
                             'payload': license
                         });
                     }
                     else*/if(null==this.license||this.lastGoogleID!==c.email||w!==this.lastDate){this.lastGoogleID=c.email,this.encryptedID=thHash.hashEmail(this.lastGoogleID),this.lastDate=w;var r=new XMLHttpRequest;r.open("GET","https://rw.texthelp.com/access/access/getaccess?id="+c.email+"&type=0",!0),r.onreadystatechange=function(){var e="";4==this.readyState&&200==this.status&&(e=this.getResponseHeader("Content-Type"),"application/json"==e.substr(0,16)&&(this.license=JSON.parse(this.responseText.toString()),o({method:"trialValidation",type:"1757FROM_BGRW4G",payload:this.license})))},r.send()}else o({method:"trialValidation",type:"1757FROM_BGRW4G",payload:this.license})}if("connect"==e.command&&o({type:"1757FROM_BGRW4G",command:"connected",settingcookies:settingsCookiePosition,isClickHoverOn:getClickHoverOn()}),"isRWRunning"==e.command&&chrome.identity.getProfileUserInfo((e)=>{var t="";0<e.email.length&&(t=e.email),o({type:"1757FROM_BGRW4G",command:"isRWRunning",email:t,running:this.socketManager.isOpen()})}),"getLicense"==e.command&&o({type:"1757FROM_BGRW4G",command:"getLicense"//          license: this.oAuth._profile
}),"isDefaultOn"==e.command&&chrome.storage.sync.get("thRWFGSettings",function(e){var t={visible:!0};void 0==e.thRWFGSettings?t.visible="true":(t=JSON.parse(e.thRWFGSettings),void 0==t.visible&&(t.visible="true")),o({method:"thToolbarVisibility",type:"1757FROM_BGRW4G",visible:t.visible})}),"save"==e.command&&saveSettings(e.settings),"saveCookiePosition"==e.command&&saveCookiePosition(e.cookiex,e.cookiey,e.cookieBarx,e.cookieBary),"trackEvent"==e.command){if("FromWebReader"==e.settings.category)return void trackEvent(this.encryptedID,e.settings.action,e.settings.label);trackEvent(e.settings.category,e.settings.action,e.settings.label)}"saveOnClickHover"==e.command&&setClickHoverOn(e.settings.clickHoverOn)})}catch(e){console.log(e)}function writeVocabDoc(e,t){var o=t[0].words,s=t[0].locale,n=t[0].user,a="https://rwgoogle-webservices-7.texthelp.com/v1.11.0/vocab?json={\"t\":\"5\",\"i\":\"f\",\"g\":\"t\",\"u\":\"rwfordocs6\",\"e\":\"n4T7Y2AjS4\",\"b\":[";("fr"==s||"pt"==s||"es"==s||"nl"==s)&&(a="https://rwgoogle-webservices-7.texthelp.com/v1.11.0/vocabHTML?json={\"t\":\"5\",\"i\":\"f\",\"g\":\"t\",\"u\":\"rwfordocs6\",\"e\":\"n4T7Y2AjS4\",\"b\":[");for(var r=0;r<o.length;r++)a+="\""+o[r]+"\"",r<o.length-1&&(a+=", ");a+="],\"l\":\""+s+"\"}";var i=new XMLHttpRequest;i.params=t,i.open("POST",a,!0),i.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var o=JSON.parse(this.response);if(t[0].response=o,void 0!==o.service)return void writeVocabHTMLResponse(e,t);writeVocabResponse(e,t)}},i.send()}function getWordIndex(e,t){for(var o=0;o<t.length;++o)if(e<t[o])return o;return 0}function getChromeWordIndex(e,t){for(var o=0;o<t.length;++o)if(e<=t[o])return o;return 0}function oddOrEven(e){return 1&e?"odd":"even"}function writeVocabHTMLResponse(e,t){var o=t[0].response.words,s=t[0].translations,n="<!DOCTYPE html><html><head><style>";n+="p {padding-top: 10px;}\r\nh1,th {font-family: \"Open Sans\", sans-serif; font-size: 1em;}\r\ntable {width: 100%;}\r\n.oddrow {background-color: #99ccff;}\r\n.evenrow {background-color: #ffffff;}\r\nh1 {text-align:center;}\r\n.VocabWord {font-family: \"Open Sans\", sans-serif; width:17%;}\r\n.VocabMeaning {font-family: \"Open Sans\", sans-serif; width:35%;}\r\n.VocabSymbol {font-family: \"Open Sans\", sans-serif; width:16%;}\r\n.VocabNotes {font-family: \"Open Sans\", sans-serif; width:32%;}\r\nth,td {font-family: \"Open Sans\", sans-serif; padding:5px;}\r\n.wordContainer,.BoldText {font-weight:bold; font-family: \"Open Sans\", sans-serif;}",n+="</style></head><body>",n+="<h1 class=\"vocabTitle\">"+s.title+"</h1><table id=\"vocabTable\">",n+="<tr>",n+="  <th class=\"VocabWord\">"+s.heading+"</th>",n+="  <th class=\"VocabMeaning\">"+s.meaning+"</th>",n+="  <th class=\"VocabSymbol\">"+s.symbol+"</th>",n+="  <th class=\"VocabNotes\">"+s.notes+"</th>",n+="</tr>";for(var a=0;a<o.length;a++){n+="<tr class=\""+oddOrEven(a+1)+"row\">",n+="   <td class=\"wordContainer\">"+o[a].word+"</td>",n+="   <td class=\"meaningContainer\">",n+=o[a].definition,n+="   </td>",n+="   <td class=\"picContainer\">";for(var i=0;i<o[a].symbols.length;i++)n+="<img src=\""+o[a].symbols[i]+"\" /><br />";n+="   </td>",n+="   <td class=\"notesContainer\">&nbsp;</td>",n+="</tr>"}n+="</body></html>";var r="--rw4g\nContent-Type: application/json; charset=UTF-8\n\n{\"title\": \""+s.docTitle+"\", \"description\": \"Read&Write for Google Chrome\u2122\"}\n--rw4g\nContent-Type: text/html\n\n"+n+"\n--rw4g--\n",l=new XMLHttpRequest;l.open("POST","https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true",!0),l.setRequestHeader("Content-type","multipart/related; boundary=\"rw4g\""),l.setRequestHeader("Authorization","Bearer "+e.token),l.sendResponse=t[1],l.onreadystatechange=function(){4==this.readyState&&200==this.status&&this.sendResponse({method:"onVocabWeb",type:"1757FROM_BGRW4G",payload:JSON.parse(this.response).alternateLink})},l.send(r)}function writeVocabResponse(e,t){var o=t[0].response.words,s=t[0].translations,n="<!DOCTYPE html><html><head><style>";n+="p {padding-top: 10px;}\r\nh1,th {font-family: \"Open Sans\", sans-serif; font-size: 1em;}\r\ntable {width: 100%;}\r\n.oddrow {background-color: #99ccff;}\r\n.evenrow {background-color: #ffffff;}\r\nh1 {text-align:center;}\r\n.VocabWord {font-family: \"Open Sans\", sans-serif; width:17%;}\r\n.VocabMeaning {font-family: \"Open Sans\", sans-serif; width:35%;}\r\n.VocabSymbol {font-family: \"Open Sans\", sans-serif; width:16%;}\r\n.VocabNotes {font-family: \"Open Sans\", sans-serif; width:32%;}\r\nth,td {font-family: \"Open Sans\", sans-serif; padding:5px;}\r\n.wordContainer,.BoldText {font-weight:bold; font-family: \"Open Sans\", sans-serif;}",n+="</style></head><body>",n+="<h1 class=\"vocabTitle\">"+s.title+"</h1><table id=\"vocabTable\">",n+="<tr>",n+="  <th class=\"VocabWord\">"+s.heading+"</th>",n+="  <th class=\"VocabMeaning\">"+s.meaning+"</th>",n+="  <th class=\"VocabSymbol\">"+s.symbol+"</th>",n+="  <th class=\"VocabNotes\">"+s.notes+"</th>",n+="</tr>";for(var a=0;a<o.length;a++){n+="<tr class=\""+oddOrEven(a+1)+"row\">",n+="   <td class=\"wordContainer\">"+o[a].word+"</td>",n+="   <td class=\"meaningContainer\">";for(var i=0;i<o[a].inflections.length;i++)for(var r=0;r<o[a].inflections[i].definitions.length;r++)n+=o[a].inflections[i].definitions[r].definition+"<br><br>";n+="   </td>",n+="   <td class=\"picContainer\">";for(var i=0;i<o[a].inflections.length;i++)for(var r=0;r<o[a].inflections[i].symbols.length;r++)n+="<img src=\""+o[a].inflections[i].symbols[r]+"\" /><br />";n+="   </td>",n+="   <td class=\"notesContainer\">&nbsp;</td>",n+="</tr>"}n+="</body></html>";var l="--rw4g\nContent-Type: application/json; charset=UTF-8\n\n{\"title\": \""+s.docTitle+"\", \"description\": \"Read&Write for Google Chrome\u2122\"}\n--rw4g\nContent-Type: text/html\n\n"+n+"\n--rw4g--\n",d=new XMLHttpRequest;d.open("POST","https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true",!0),d.setRequestHeader("Content-type","multipart/related; boundary=\"rw4g\""),d.setRequestHeader("Authorization","Bearer "+e.token),d.sendResponse=t[1],d.onreadystatechange=function(){4==this.readyState&&200==this.status&&this.sendResponse({method:"onVocabWeb",type:"1757FROM_BGRW4G",payload:JSON.parse(this.response).alternateLink})},d.send(l)}function trackPageView(){_gaq.push(["_trackPageview"])}function trackEvent(e,t,o){_gaq.push(["_trackEvent",e,t,o])}function getClickHoverOn(){return void 0!=LOCALSTORAGE.texthelpClickHoverOn&&(clickHoverOn=LOCALSTORAGE.texthelpClickHoverOn),clickHoverOn}function setClickHoverOn(e){clickHoverOn=e,LOCALSTORAGE.texthelpClickHoverOn=e}function loadCookieSettings(){settingsCookiePosition=null;try{null!=LOCALSTORAGE.texthelpSWASettingsPopupPositions&&(settingsCookiePosition=JSON.parse(LOCALSTORAGE.texthelpSWASettingsPopupPositions))}catch(t){console.log("Could not load settings for texthelpSWA. Resetting to default."),settingsCookiePosition=null}return null==settingsCookiePosition&&(settingsCookiePosition=createDefaultSettingsCookiePosition()),settingsCookiePosition}function checkExtensions(){var e={id:"ifajfiofeifbbhbionejdliodenmecna",desc:"DJDJDJ"},t=new Date().getTime();chrome.storage.sync.get("thRWFGExtensionCheck",function(o){var s=!1,n=o.thRWFGExtensionCheck;if(n===void 0)s=!0,chrome.storage.sync.set({thRWFGExtensionCheck:t});else{var a=new Date().getTime()-604800000;n<a?(s=!0,chrome.storage.sync.set({thRWFGExtensionCheck:t})):s=!1}s&&chrome.identity.getProfileUserInfo((t)=>{var o="";if(0<t.email.length){o=t.email;try{chrome.management.get(e.id,function(t){if(chrome.runtime.lastError&&t==void 0);else{var s=[];s.push(e.desc),s.push(o),s.push(o.split("@")[1]),window.thFunctions.onSendEvent(s)}})}catch(e){}}})})}function createDefaultSettingsCookiePosition(){return settingsCookiePosition={g_afDivPosX:[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],g_afDivPosY:[0,0,0,0,0,0,0,0,0,0,0,0,0.2,0.2,0.2,0.2],g_fBarPosX:1,g_fBarPosY:0.01},settingsCookiePosition}function saveCookiePosition(e,t,o,s){var n=null;console.log("Saving the setting of popups cookies: "+e+t),settingsCookiePosition.g_afDivPosX=e,settingsCookiePosition.g_afDivPosY=t,settingsCookiePosition.g_fBarPosX=o,settingsCookiePosition.g_fBarPosY=s,n=JSON.stringify(settingsCookiePosition),LOCALSTORAGE.texthelpSWASettingsPopupPositions=n}function writeDocumentHighlightsToDocs(e,t){var o=t[0],s=t[2],n=t[3],a="<!DOCTYPE html><html><head><style>";a+="p{padding-bottom:10px}.blue{background-color:#0ff}.pink{background-color:#f0f}.green{background-color:#adff2f}.yellow{background-color:#ff0}.boldText{font-weight:700}",a+="</style></head><body>";var r=0;for(r=0;r<o.highlights.length;r++)"#FFFF00"==o.highlights[r].color&&(a+="<p><span class=\"yellow\">"),"#ADFF2F"==o.highlights[r].color&&(a+="<p><span class=\"green\">"),"#00FFFF"==o.highlights[r].color&&(a+="<p><span class=\"blue\">"),"#FF00FF"==o.highlights[r].color&&(a+="<p><span class=\"pink\">"),a+=o.highlights[r].text+"</span></p>";a+="<br><p><span class=\"boldText\"><a href=\""+o.url,a+="\">"+o.title+"</a></span></p>",a+="<p><span class=\"user\">"+s+"<br>"+n+"</span></p>",a+="</body></html>";var i="--rw4g\nContent-Type: application/json; charset=UTF-8\n\n{\"title\": \""+o.docTitle+"\", \"description\": \"Read&Write for Google Chrome\u2122\"}\n--rw4g\nContent-Type: text/html\n\n"+a+"\n--rw4g--\n",l=new XMLHttpRequest;l.open("POST","https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&convert=true",!0),l.setRequestHeader("Content-type","multipart/related; boundary=\"rw4g\""),l.setRequestHeader("Authorization","Bearer "+e.token),l.sendResponse=t[1],l.onreadystatechange=function(){4==this.readyState&&200==this.status&&this.sendResponse({method:"onCollectHighlightsWeb",type:"1757FROM_BGRW4G",payload:JSON.parse(this.response).alternateLink})},l.send(i)}function init(){checkExtensions(),loadCookieSettings(),chrome.alarms.onAlarm.addListener(onMessagingAlarm),texthelp.RW4GC.MessagingManagerInstance.onMessage((e)=>{try{texthelp.RW4GC.IdentityManagerInstance.getLicense(!1,(t)=>{// clone license 
let o=JSON.parse(JSON.stringify(t));for(var s in e.features)o.features.hasOwnProperty(s)&&!1==e.features[s]&&(o.features[s]=!1);eachTab(function(e){chrome.tabs.sendRequest(e.id,{method:"onGetthRWFGMessage",type:"1757FROM_BGRW4G",payload:o})})})}catch(t){console.error("Couldn't update messages for all tabs. Exception:"+t)}})}function onMessagingAlarm(e){switch(e.name){case"MessageExpired":revertLicence();break;default:}}function revertLicence(){try{texthelp.RW4GC.IdentityManagerInstance.getLicense(!0,(e)=>{var t;t!=void 0&&(e.features=JSON.parse(JSON.stringify(t)),console.log("License Reverted"),console.log(e.features)),eachTab(function(t){chrome.tabs.sendRequest(t.id,{method:"onGetthRWFGMessage",type:"1757FROM_BGRW4G",payload:e})})})}catch(t){console.error("Couldn't update messages for all tabs. Exception:"+t)}}function updatePageAction(e){try{if(null!==this.license&&!1==this.license.Valid&&"Group"==this.license.licence_type&&!0==this.license.HideUnlicensed)return void updateChromeOptions(!1);updateChromeOptions(e.enabled)}catch(e){console.log(e)}}init();