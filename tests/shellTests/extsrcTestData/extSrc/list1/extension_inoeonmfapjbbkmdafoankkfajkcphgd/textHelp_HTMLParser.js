(function(z){
var Ek=function(a){this.N=window.document;this.h=this.we=window;this.R=a;new z.xd;this.ra=!1;this.nc=this.Cb=null;this.U=[];this.Dc=!1;this.G={};this.G.wa=0;this.G.Il="";this.G.Hl="";this.G.pc=null;this.Od=this.Nd=0;this.ed=/\w/i;this.F={};this.F.parentId="WACDocumentPanelContent";this.F.positionId="Selected";this.F.seq="1";this.F.words=[];this.F.words.push("The");this.F.words.push("In");this.F.words.push("I");this.F.words.push("It");this.F.words.push("He");this.F.words.push("This");this.F.words.push("A");
this.F.words.push("But");this.F.words.push("As");this.F.words.push("For");this.qf=z.S.a().bind(this,this.Af);this.rf=z.S.a().bind(this,this.Qh);this.Ka=this.ia=null};
var Fk=function(a,b){var c=window.document;void 0!==b&&(c=b.contentDocument);var d=z.S.a().bind(a,a.hd);c.addEventListener("mousedown",d,!0);d=z.S.a().bind(a,a.sh);c.addEventListener("mousemove",d,!0);c.addEventListener("keydown",a.gd.bind(a),!0);c.addEventListener("keyup",a.ye.bind(a),!0);d=z.S.a().bind(a,a.th);c.addEventListener("mouseup",d,!0);c=z.S.a().bind(a,a.lf);window.addEventListener("scroll",c,!1);c=z.S.a().bind(a,a.ph);z.E(window,"resize",c)};
var Gk=function(){this.Rb="rwGooglePredictionDictionaryDetails";this.rc="rwGooglePredictionResponseDetails";window.m_webReaderElem=window.document.getElementById("webReaderModule");window.m_extensionPath=window.m_webReaderElem.getAttribute("data-root");Hk(window.m_extensionPath+"assets/distiller/domdistiller.js");Hk(window.m_extensionPath+"assets/HTMLParser/HTMLParser.js",this.Ko.bind(this));this.$={};this.ma=this.Ha=null;var a=[];a.push("Web");a.push(window.location.href);window.window.thPostMessage({type:"1757FROM_PAGERW4G",
key:"function",method:"BarShown",parameters:a},"*")};var Hk=function(a,b){var c=window.document.documentElement.getElementsByTagName("body")[0];if(null==c||void 0==c)c=window.document.body;var d=window.document.createElement("script");d.src=a;d.async=!0;d.onload=d.onreadystatechange=function(){this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState||(d.onload=d.onreadystatechange=null,c.removeChild(d),void 0!=b&&b())};c.appendChild(d)};
var Ik=function(a,b){b.addEventListener("load",function(){this.$.stop();this.$.addEventsToFrame(b);Fk(this.ma,b)}.bind(a))};var Jk=function(a,b,c){a.$.mouseOverEvent(b,c)};var Kk=function(){return new window.Promise(function(a){window.result=window.org.chromium.distiller.DomDistiller.applyWithOptions({});a({title:window.result[1],html:window.result[2][1]})})};var Lk=function(a){return a.$.getPredictionCoordinates()};var Mk=function(a){a.$.isEditable()};z.f=Ek.prototype;
z.f.hd=function(a){null!==this.Ka&&((0,window.clearTimeout)(this.Ka),this.Ka=null);var b=this;this.Ka=(0,window.setTimeout)(function(){b.qf(a)},300)};z.f.play=function(){z.T.a().u("onWRPlay",!0)};
z.f.sh=function(a){try{var b=this;Jk(this.R,a,function(){b.play()});-1==a.target.className.indexOf("texthelp-toolbarbutton")&&-1==a.target.parentNode.className.indexOf("texthelp-toolbarbutton")&&-1==a.target.className.indexOf("th-RW4GC-toolbar")&&-1==a.target.parentNode.className.indexOf("th-RW4GC-toolbar")||this.R.$.clearHoverSpeak()}catch(c){}};
z.f.gd=function(a){if(a.ctrlKey&&47<a.keyCode&&58>a.keyCode){var b=[];b.push(a);null!==this.mb&&((0,window.clearTimeout)(this.mb),this.mb=null);this.mb=(0,window.setTimeout)(function(){window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionKeyDown(b)}.bind(this),10);z.Pj()&&(a.preventDefault(),a.stopPropagation());this.R.gd(a);if(Mk(this.R))window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionClose();else{a=Lk(this.R);var c=window.document.getElementById("rwGooglePredictionDictionaryDetails");
c&&(c.style.left=a.left,c.style.top=a.top);this.ra&&this.Ma("")}}};z.f.ye=function(a){var b=[];b.push(a.keyCode);z.T.a().u("onKeyUpEvent",b);null!==this.ia&&((0,window.clearTimeout)(this.ia),this.ia=null);17===a.keyCode?this.Ye=this.Mh?!1:!0:(this.ia=(0,window.setTimeout)(this.rf,100),this.Ye=!1)};z.f.Qn=function(a){window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionKeyDown(a)};
z.f.Ma=function(){null!==this.ia&&((0,window.clearTimeout)(this.ia),this.ia=null);this.ia=(0,window.setTimeout)(this.rf,0)};
z.f.Qh=function(){this.ia=null;if(this.ra){var a=this.R.Pe();if(null==a)window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionClose();else{var b=z.V.a().O().prediction.results,c=z.V.a().O().language.services;this.G.wa++;999<this.G.wa&&(this.G.wa=0);var d='"'+z.S.a().og(a.context)+'","'+b+'","en_US"',e='{ "parent":"document.body", "position":"'+this.R.Rb+'","addSpace":false,"seq":"'+this.G.wa+'"}';z.S.a().Fh(this.G.wa);this.G.pc=a;e=z.od(e);d=[];d[0]=a.context;d[1]=b;d[2]=c;if(null!==z.K("kix-selection-overlay"))window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionClose();
else e.context=d,window.thPostMessage({method:"thPrediction",type:"1757FROM_PAGERW4G",payload:e},"*")}}};z.f.th=function(){var a=window.document.getElementById("th-RW4GC-picture-dictionary"),b=window.document.getElementById("th-RW4GC-translator");if(null!=window.document.getElementById("th-RW4GC-dictionary")||null!=a||null!=b)a=this.R.xb(),null!=a&&""!=a&&z.T.a().u("onWordChanged",[])};
z.f.lf=function(){var a=this.R.Ba();if(null!==a)window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionPositionUpdate(a,"document.body")};z.f.ph=function(){var a=this.R.Ba();if(null!==a)window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionPositionUpdate(a,"document.body")};
z.f.Af=function(a){this.R.hd(a);if(Mk(this.R))window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionClose();else{a=Lk(this.R);var b=window.document.getElementById("rwGooglePredictionDictionaryDetails");b&&(b.style.left=a.left,b.style.top=a.top);this.ra&&this.Ma("")}};
z.f.mf=function(a){try{this.R.$.predictionInsertText(a[0]);var b=z.S.a().Ra();a=[];a.push("prediction insert");a.push(b.Email);a.push(b.Email.split("@")[1]);window.thPostMessage({type:"1757FROM_PAGERW4G",key:"function",method:"SendEvent",parameters:a},"*");this.Ma("")}catch(c){z.S.a().b(c)}};
z.f.nf=function(a){try{var b=window.document.getElementById("rwGooglePredictionDictionaryDetails");if(!b){var c=window.document.body,b=window.document.createElement("div");b.setAttribute("id","rwGooglePredictionDictionaryDetails");b.className="rwGooglePredictionDictionaryDetails";b.style.position="absolute";c.appendChild(b);var d=window.document.createElement("div");d.setAttribute("id","rwGooglePredictionResponseDetails");d.className="rwGooglePredictionResponseDetails";c.appendChild(d)}this.ra=a[0];
if(Mk(this.R)){var e=Lk(this.R);b.style.left=e.left;b.style.top=e.top;this.ra&&(a=[],a.push("kix-appview-editor"),this.Ma(""),z.T.a().u("onOpenPredictionWindow",a))}else window.texthelp.RW4GC.thToolbarStoreInstance.onPredictionClose()}catch(g){z.S.a().b(g)}};z.f.rj=function(){try{var a=z.K("kix-cursor-caret",this.h);null!==a&&(z.S.a().fireEvent(a,"click"),a.focus())}catch(b){z.S.a().b(b)}};z.f.Xo=function(a){a=a[0];this.R.$.hoverSpeakEnabled(a);a||z.T.a().u("onWRStop",!0)};z.Yj.vj="HTMLParser";z.B(Gk,z.Mj);z.f=Gk.prototype;z.f.yq=function(a){var b=[];a.forEach(function(a){a.addedNodes.forEach(function(a){if("IFRAME"==a.nodeName)b.push(a);else if(0<a.childNodes.length)for(var c=0;c<a.childNodes.length;c++)"IFRAME"==a.childNodes[c].nodeName&&b.push(a.childNodes[c])}.bind(this))}.bind(this));for(a=0;a<b.length;a++)Ik(this,b[a])};
z.f.Ko=function(){var a=window.document.querySelector("#thSpeechStreamTBPlaceHolder").getAttribute("data-root"),b=window.document.querySelector("#thWebReaderPlaceHolder").getAttribute("dynamic-frames");this.$=new window.textHelp.parsers.HTMLParserAPI(!0,a+"assets/HTMLParser/");var a=this.ma=new Ek(this),c=window.frames;if(0<c.length)for(var d=0;d<c.length;d++)try{Fk(a,c[d])}catch(e){}c=z.S.a().bind(a,a.hd);a.N.addEventListener("mousedown",c,!0);c=z.S.a().bind(a,a.sh);a.N.addEventListener("mousemove",
c,!0);a.N.addEventListener("keydown",a.gd.bind(a),!0);a.N.addEventListener("keyup",a.ye.bind(a),!0);c=z.S.a().bind(a,a.th);a.N.addEventListener("mouseup",c,!0);z.T.a().j("onclicktospeak",a.Xo,a);z.T.a().j("onPredictionChange",a.mf,a);z.T.a().j("onWRPredictionStateChanged",a.nf,a);"true"==b&&(this.at=window.document.body,this.xq=new window.MutationObserver(this.yq.bind(this)),this.xq.observe(this.at,{childList:!0,subtree:!0}))};z.f.Pg=function(){return this.$.hiliteSelection()};z.f.$c=function(a){this.$.highlightSelection(a)};
z.f.Lf=function(){return this.$.hasSelection()};z.f.Ts=function(){if(!(-1<window.location.href.indexOf(".texthelp.com/simplify/"))){var a=window.textHelp.webreader.UserSettingsSingleton.getInst().getUserSettings().language.services;window.open("https://rw.texthelp.com/simplify/home/simplify?locale\x3d"+(0,window.encodeURIComponent)(a)+"\x26simplify\x3d"+window.location.href,"_newtab")}};z.f.xb=function(){return this.$.getWord()};z.f.getSelection=function(){return this.$.getSelection()};z.f.yb=function(a){try{this.$.hiliteWord(a)}catch(b){}};
z.f.xg=function(){this.$.clearBrowserSelection()};
z.f.Rc=function(a,b,c){a=this.$.collectHighlights(b,c);b=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("ch_documentTitle");a={highlights:a,title:window.document.getElementsByTagName("title")[0].innerHTML,url:window.location.href,docTitle:b};this.vk=window.textHelp.webreaderapi.EventBusSingleton.getInst().subscribe("onCollectHighlightsWeb",this.ml,this);window.window.thPostMessage({type:"1757FROM_PAGERW4G",key:"function",method:"CollectHighlights",parameters:a},"*")};
z.f.ml=function(){try{window.textHelp.webreaderapi.EventBusSingleton.getInst().unsubscribe(this.vk),this.ot.focus()}catch(a){window.console.error(a.stack)}};z.f.stop=function(){this.$.stop()};z.f.le=function(a,b){var c=window.textHelp.webreader.UserSettingsSingleton.getInst().getUserSettings().speechoptions.continousreading;b(this.$.hiliteNextSentence(c))};z.f.vc=function(){this.$.clearHighlights()};
z.f.Gf=function(a,b,c){a=this.$.collectVocabs(a,b,c);b=window.textHelp.webreader.ConfigurationSingleton.getInst().getConfiguration();c={};c.words=a;c.locale=b.locale;c.user=b.serversettings.user;c.translations={};c.translations.docTitle=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("vocab_document_title");c.translations.title=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("vocab_title");c.translations.heading=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("vocab_word_heading");
c.translations.symbol=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("vocab_word_symbol");c.translations.notes=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("vocab_word_notes");c.translations.meaning=window.textHelp.webreader.LocaleSingleton.getInst().getLocaleString("vocab_word_meaning");c.locale=window.textHelp.webreader.UserSettingsSingleton.getInst().getUserSettings().language.services;window.window.thPostMessage({type:"1757FROM_PAGERW4G",key:"function",
method:"Vocab",parameters:c},"*")};z.f.Yc=function(a){a(this.$.getSelectionLocal())};z.f.zi=function(a){Kk().then(this.tp).then(function(b){window.title=b.title;window.html=b.html;a({documentTitle:window.title,html:window.html})})};z.f.tp=function(a){var b=window.document.createElement("body");b.innerHTML=a.html;for(var c=b.querySelectorAll("img"),d=0;d<c.length;d++){var e=c[d];"https:"!==e.getAttribute("src").substr(0,6).toLowerCase()&&b.removeChild(e)}return Object.assign({},a,{html:b.innerHTML})};
z.f.na=function(){this.$.clearSelection_()};z.f.kd=function(){throw Error("Not implemented");};z.f.jd=function(){throw Error("Not implemented");};z.f.Yc=function(a){a(this.$.getSelectionLocal())};z.f.Ni=function(a){this.$.predictionInsertText(a)};z.f.Pe=function(){try{var a=[];a.context="";a.word="";a.cursorindex="";a.spaceatstart=!1;a.spaceatend=!1;a.prepunc="";a.postpunc="";a.selectRight=0;a.selectLeft=0;a.prechar="";a.currentchar="";a.postchar="";a.context=this.$.getPredictionSentence()}catch(b){}return a};
z.f.th=function(a){this.$.onMouseUp(a)};z.f.hd=function(a){this.$.onMouseDown(a)};z.f.gd=function(a){this.$.onKeyDown(a)};z.f.sh=function(a){try{this.$.onMouseOver(a)}catch(b){}};z.f.Eh=function(a){try{this.Ha=a}catch(b){z.S.a().b(b)}};z.f.Xb=function(){try{return this.Ha.name}catch(a){z.S.a().b(a)}};z.f.Vb=function(){try{return this.Ha.bar}catch(a){z.S.a().b(a)}};
z.f.Ba=function(){try{var a=this.$.getPredictionCoordinates(),b={x:10,y:10};b.x=(0,window.parseInt)(a.left.substring(0,a.left.length-2))-32;b.y=(0,window.parseInt)(a.top.substring(0,a.top.length-2))+2;return b}catch(c){z.S.a().b(c)}};z.u("textHelp.parsers.HTMLParser",Gk);Gk.prototype.getParserName=Gk.prototype.Xb;Gk.prototype.getBarConfigFromParser=Gk.prototype.Vb;Gk.prototype.setParserConfig=Gk.prototype.Eh;Gk.prototype.getPredictionPosition=Gk.prototype.Ba;z.Kf("HTMLParser");})(__textHelp__);
//@ sourceURL=chrome-extension://inoeonmfapjbbkmdafoankkfajkcphgd/textHelp_HTMLParser.js