var CoFund={};CoFund.Store={getCompositeKey:function(t){return"_cofund."+t},isset:function(t){return null!==sessionStorage.getItem(this.getCompositeKey(t))},set:function(t,e){sessionStorage.setItem(this.getCompositeKey(t),JSON.stringify(e))},get:function(t){try{return JSON.parse(sessionStorage.getItem(this.getCompositeKey(t)))}catch(e){return null}}},CoFund.Info={extId:null,user:null,preferences:{worksHere:!0},savings:0,getExtId:function(){return this.extId},setExtId:function(t){this.extId=t},getUser:function(){return this.user},setUser:function(t){this.user=t},getPreferences:function(){return this.preferences},setPreferences:function(t){this.preferences=t},getSavings:function(){return this.savings},setSavings:function(t){this.savings=t}},CoFund.Cookie={cookie:{name:"_cofund.ext",expires:7200,path:"/"},setDomain:function(t){this.cookie.domain=t},set:function(t,e){var n,s;try{n=JSON.parse(this._getJson())}catch(i){n={}}e?n[t]=e:delete n[t],s=new Date,s.setSeconds(s.getSeconds()+this.cookie.expires),document.cookie=[encodeURIComponent(this.cookie.name)+"="+encodeURIComponent(JSON.stringify(n)),s?"; expires="+s.toUTCString():"",this.cookie.path?"; path="+this.cookie.path:"",this.cookie.domain?"; domain="+this.cookie.domain:"",this.cookie.secure?"; secure":""].join("")},get:function(t){try{return JSON.parse(this._getJson())[t]}catch(e){return null}},getAll:function(){try{return JSON.parse(this._getJson())}catch(t){return{}}},isset:function(t){var e=this._getJson();if(e){var n=JSON.parse(e);if(n.hasOwnProperty(t))return!0}return!1},clear:function(t){this.set(t,null)},clearAll:function(){var t=this;Object.keys(this.getAll()).forEach(function(e){t.set(e,null)})},getExternal:function(t){for(var e=document.cookie.split("; "),n=0,s=e.length;s>n;n++){var i=e[n].split("=");if(i[0]="undefined"!==i[0]?decodeURIComponent(i[0].replace(/\+/g," ")):"",i[1]="undefined"!==i[1]?decodeURIComponent(i[1].replace(/\+/g," ")):"",i[0]===t)return i[1]}},_getJson:function(){for(var t=document.cookie.split("; "),e=0,n=t.length;n>e;e++){var s=t[e].split("=");if(s[0]="undefined"!==s[0]?decodeURIComponent(s[0].replace(/\+/g," ")):"",s[1]="undefined"!==s[1]?decodeURIComponent(s[1].replace(/\+/g," ")):"",s[0]===this.cookie.name)return s[1]}}},CoFund.State={PENDING:0,STATE_RECEIVED:1,CODES_PRESENTED:2,CODES_PROCESSED:3,get:function(){return CoFund.Store.get("state")},set:function(t){CoFund.Store.set("state",t)},clear:function(){this.set(null)}},CoFund.Slider={show:function(){CoFund.Cookie.set("slider","true")},hasShown:function(){return"true"===CoFund.Cookie.get("slider")}},CoFund.Cashback={FIRE_ON_30:1,FIRE_ON_CODES_FOUND:2,FIRE_ON_CODES_PRESENTED:4,FIRE_ON_CODES_SUCCESSFUL:8,FIRE_ON_CODES_ACTIVATED:16,FIRE_ON_DRAWER_CLOSED:32,FIRE_ON_SLIDER_CLOSED:64,FIRE_ON_CASHBACK_ACTIVATED:128,FIRE_ON_CODES_COPIED:256,FIRE_ON_120:512,FIRE_ON_180:1024,refCodes:[],tracker:null,fireOnActions:null,isButtonABTest:!1,buttonABRef:null,init:function(t){CoFund.Store.isset("cb")?(this.loadTracker(),this.tracker={init:this.getTimestamp(),pageCount:this.getPageCount()+(t?0:1),hasFired:this.hasFired()}):this.tracker={init:(new Date).getTime()/1e3,pageCount:1,hasFired:!1},this.updateTracker(),this.checkForSchedule(),this.refCodes[this.FIRE_ON_30]="30",this.refCodes[this.FIRE_ON_CODES_FOUND]="cf",this.refCodes[this.FIRE_ON_CODES_PRESENTED]="cp",this.refCodes[this.FIRE_ON_CODES_SUCCESSFUL]="cs",this.refCodes[this.FIRE_ON_CODES_ACTIVATED]="ca",this.refCodes[this.FIRE_ON_DRAWER_CLOSED]="dc",this.refCodes[this.FIRE_ON_SLIDER_CLOSED]="sc",this.refCodes[this.FIRE_ON_CASHBACK_ACTIVATED]="cb",this.refCodes[this.FIRE_ON_CODES_COPIED]="cc",this.refCodes[this.FIRE_ON_120]="120",this.refCodes[this.FIRE_ON_180]="180"},loadTracker:function(){CoFund.Store.isset("cb")&&(this.tracker=CoFund.Store.get("cb"))},updateTracker:function(){CoFund.Store.set("cb",this.tracker)},getTimestamp:function(){return this.tracker?this.tracker.init:(new Date).getTime()/1e3},getPageCount:function(){return this.tracker?this.tracker.pageCount:0},hasFired:function(){return this.tracker?this.tracker.hasFired:!1},getActions:function(){if(this.fireOnActions)return this.fireOnActions;var t=CoFund.Store.get("cashback");return t&&t.hasOwnProperty("action")?(this.fireOnActions=t.action,this.fireOnActions):null},hasAction:function(t){var e=this.getActions();return e?(e&t)===t:void 0},checkForSchedule:function(){if(!this.hasFired()&&(this.hasAction(this.FIRE_ON_30)||this.hasAction(this.FIRE_ON_120)||this.hasAction(this.FIRE_ON_180))){var t=this.hasAction(this.FIRE_ON_30)?30:this.hasAction(this.FIRE_ON_120)?120:180,e=(new Date).getTime()/1e3,n=e-parseInt(this.getTimestamp()),s=this.getPageCount(),i=this;s>=2&&(t>n?setTimeout(function(){i.fire(i["FIRE_ON_"+t])},1e3*(t-n)):i.fire(i["FIRE_ON_"+t]))}},fire:function(t,e){if(!this.hasFired()){var n=this;this.tracker.hasFired=!0,this.updateTracker();var s=CoFund.Store.get("cashback"),i=CoFund.Store.get("codeDetails"),o=null,r=null;s.hasOwnProperty("s")&&(o=s.s),e&&i&&i.hasOwnProperty(e)&&i[e].hasOwnProperty("o")&&(r=i[e].o),$.ajax({type:"GET",url:Config.server+"/toolbar/cashback?s="+(o?o:"")+"&o="+(r?r:"")+"&ref1="+n.refCodes[t]+"&ref3=cof"+(CoFund.Cashback.isButtonABTest?"&ref4="+CoFund.Cashback.buttonABRef:"")+(CoFund.Info.getExtId()?"&app_uid="+CoFund.Info.getExtId():""),cache:!1,dataType:"json",success:function(t,e,n){t.hasOwnProperty("url")&&t.url?(chrome.runtime.sendMessage({action:"openTab",url:t.url}),CoFund.Events.logCashbackFired()):CoFund.Events.logCashbackFireFailed(t.url?"Invalid response from /toolbar/cashback for store "+(o?o:""):"No url for store "+(o?o:""))},error:function(t,e,n){CoFund.Events.logCashbackFireFailed("tcb:"+t.status+" ("+t.responseText+")")}})}}},CoFund.Events={TYPE_CODES_PRESENTED:1,TYPE_CODE_SUCCESS:2,TYPE_CODE_FAILURE:3,TYPE_NO_CODES:4,TYPE_CASHBACK_FIRED:5,TYPE_CASHBACK_FIRE_FAILED:6,TYPE_NO_CODES_NO_CASHBACK:7,TYPE_PROVIDER_ERROR:8,TYPE_CASHBACK_BUTTON_DISMISSED:9,TYPE_DRAWER_CLOSED:10,log:function(t,e){var n;n="function"==typeof chrome.runtime.getManifest?chrome.runtime.getManifest():{version:0},$.ajax({type:"POST",url:Config.server+"/toolbar/events?app_uid="+CoFund.Info.getExtId(),data:{v:n.version,type:t,currentState:CoFund.State.get(),message:e}})},logCodesPresented:function(t){this.log(this.TYPE_CODES_PRESENTED,t)},logCodeSuccess:function(t){this.log(this.TYPE_CODE_SUCCESS,t)},logCodeFailure:function(t){this.log(this.TYPE_CODE_FAILURE,t)},logNoCodes:function(t){this.log(this.TYPE_NO_CODES,t)},logCashbackFired:function(t){this.log(this.TYPE_CASHBACK_FIRED,t)},logCashbackFireFailed:function(t){this.log(this.TYPE_CASHBACK_FIRE_FAILED,t)},logNoCodesNoCashback:function(t){this.log(this.TYPE_NO_CODES_NO_CASHBACK,t)},logProviderError:function(t){this.log(this.TYPE_PROVIDER_ERROR,t)},logCashbackButtonDismissed:function(t){this.log(this.TYPE_CASHBACK_BUTTON_DISMISSED,t)},logDrawerClosed:function(t){this.log(this.TYPE_DRAWER_CLOSED,t)}};
//# sourceMappingURL=chrome-minified/src/inject/cofund.js.map