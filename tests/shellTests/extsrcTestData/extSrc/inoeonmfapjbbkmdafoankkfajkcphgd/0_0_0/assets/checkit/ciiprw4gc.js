(function(a,b){'object'==typeof exports&&'object'==typeof module?module.exports=b():'function'==typeof define&&define.amd?define([],b):'object'==typeof exports?exports.texthelpcheckit=b():a.texthelpcheckit=b()})('undefined'==typeof self?this:self,function(){return function(a){function b(d){if(c[d])return c[d].exports;var e=c[d]={i:d,l:!1,exports:{}};return a[d].call(e.exports,e,e.exports,b),e.l=!0,e.exports}var c={};return b.m=a,b.c=c,b.d=function(a,c,d){b.o(a,c)||Object.defineProperty(a,c,{configurable:!1,enumerable:!0,get:d})},b.n=function(a){var c=a&&a.__esModule?function(){return a['default']}:function(){return a};return b.d(c,'a',c),c},b.o=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)},b.p='',b(b.s=3)}([function(a,b){'use strict';Object.defineProperty(b,'__esModule',{value:!0});class c{constructor(a,b){this._currentPageURL=a,this._extensionID=b,this._itemsToIgnore={},this._itemsToIgnore.ignoredWords=[],this._itemsToIgnore.dictionaryWords=[],this._itemsToIgnore.ignoredRules=[],texthelp.CheckitLib.disabledRules=[],null==texthelp.CheckitLib.PubSub&&(texthelp.CheckitLib.PubSub=texthelp.CheckitLib.CheckItPubSub()),this._currentCheckItToShow=null,this._ciManager=new texthelp.CheckitLib.GDocsManager;var c=document.createElement('style');c.appendChild(document.createTextNode('')),document.head.appendChild(c),this.m_sheet=c.sheet,this.m_checkItArrowPositionRuleID=null,window.addEventListener('resize',()=>this._onResizeBrowserWindow(event)),this._getIgnoreItems(),this._langauge='en-US'}checkItOn(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:!0,b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:!0;null==this._unsub&&texthelp.CheckitLib.PubSub!==void 0&&(this._unsub=texthelp.CheckitLib.PubSub.sub(this._onPubSubEvent.bind(this))),this._ciManager.checkItOn(a,b,this.productString)}checkItOff(){null==this._unsub||(this._unsub(),this._unsub=null),this._ciManager.checkItOff()}clearOtherProductHighlights(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:'';1>a.length||this._ciManager.clearOtherProductHighlights(a)}get productString(){return''}set language(a){if(-1<['en_US','en_GB'].indexOf(a)){this._langauge=a;var b={};b.method='onLanguageChanged',b.type='FR_P_1342_CK',b.language=a,chrome.runtime.sendMessage(this._extensionID,b)}}get language(){return this._langauge}getAllDocumentText(){return this._ciManager.getAllDocumentText()}reCheckPages(){this._ciManager.reCheckPages()}_onPubSubEvent(a,b){try{this['_on'+a]!==void 0&&this['_on'+a](b)}catch(a){console.log(a)}}_onCheckItText(a,b,c,d){var e={};e.textDetails=a,e.method='onCheckitRequest',e.type='FR_P_1342_CK',e.id=b,e.hash=c,e.metaData=d,chrome.runtime.sendMessage(this._extensionID,e,function(a){texthelp.CheckitLib.PubSub!==void 0&&texthelp.CheckitLib.PubSub.pub('TPSOnCheckit',a)}.bind(this)),this._sendAnalyticsEvent('checkit lookup')}_onTPSDoCheckit(a){this._onCheckItText(a[0],a[1],a[2],a[3])}_getIgnoreItems(){var a={};a.method='onGetSavedIgnoreLists',a.type='FR_P_1342_CK',chrome.runtime.sendMessage(this._extensionID,a,function(a){try{this._itemsToIgnore.dictionaryWords=a.payload.dictionaryWords,this._saveItemsToIgnore()}catch(a){}}.bind(this))}_updateDomWithIgnoredWord(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:!0,c=[].slice.call(document.querySelectorAll('.th-checkit-word-'+this._ciManager._toHash(a.toString())));c.forEach((a)=>{a.classList.add('th-checkit-ignore')})}_addToDictionaryWords(a){if(!(-1<this._itemsToIgnore.dictionaryWords.indexOf(a))){this._itemsToIgnore.dictionaryWords.push(a),this._saveItemsToIgnore();var b={};b.method='onAddToDictionaryWords',b.type='FR_P_1342_CK',b.wordToIgnore=this.trimPuncOffStartAndEndOfString(a),chrome.runtime.sendMessage(this._extensionID,b)}}_are_arrs_different(a,b){return a.sort().toString()!==b.sort().toString()}_get_arr1_not_arr2(a,b){return a.filter((a)=>!b.includes(a))}_onTPSCheckitDictionaryChanged(a){var b=this._itemsToIgnore.dictionaryWords.length!==a.length;if(b||(b=this._are_arrs_different(this._itemsToIgnore.dictionaryWords,a)),!!b){var c=this._get_arr1_not_arr2(a,this._itemsToIgnore.dictionaryWords),d=this._get_arr1_not_arr2(this._itemsToIgnore.dictionaryWords,a);if(0<d.length){var e=[];d.forEach((a)=>{e=[].slice.call(document.querySelectorAll('.th-checkit-word-'+this._ciManager._toHash(a.toString()))),e.forEach((a)=>{a.classList.remove('th-checkit-ignore')})})}if(0<c.length){var f=[];c.forEach((a)=>{f=[].slice.call(document.querySelectorAll('.th-checkit-word-'+this._ciManager._toHash(a).toString())),f.forEach((a)=>{a.classList.add('th-checkit-ignore')})})}this._itemsToIgnore.dictionaryWords=a,this._saveItemsToIgnore()}}_saveItemsToIgnore(){var a=this._itemsToIgnore.dictionaryWords.concat(this._itemsToIgnore.ignoredWords);this._ciManager.setItemsToIgnore(a,this._itemsToIgnore.ignoredRules);var b={};b.method='onUpdateDictionaryItems',b.type='FR_P_1342_CK',b.dictionary=this._itemsToIgnore.dictionaryWords,chrome.runtime.sendMessage(this._extensionID,b)}_setIgnoreGrammarRule(a){0>this._itemsToIgnore.ignoredRules.indexOf(a)&&(this._itemsToIgnore.ignoredRules.push(a),this._ciManager.setIgnoreGrammarRule(a))}_ignoreCurrentGrammarMistake(){try{var a=this._ciManager.ignoreCurrentGrammarMistake();this._sendAnalyticsEvent('ignoregrammarrule:'+this._langauge+':'+a.rule.id)}catch(a){}}_ignoreAllSpellingMistake(){try{var a=this._ciManager.ignoreAllSpellingMistake();0>this._itemsToIgnore.ignoredWords.indexOf(a)&&(this._itemsToIgnore.ignoredWords.push(a),this._saveItemsToIgnore(),this._sendAnalyticsEvent('ignoreall:'+this._langauge+':'+a))}catch(a){}}_addSpellingMistakeToDictionary(){try{var a=this._ciManager.ignoreAllSpellingMistake();this._addToDictionaryWords(a),this._sendAnalyticsEvent('addtodictionary:'+this._langauge+':'+a)}catch(a){}}_changeToSuggestion(a,b){try{this._ciManager.changeToSuggestion(a,b),this._sendAnalyticsEvent('changetosuggestion:'+this._langauge+':'+b.word.substr(0,b.length)+':'+a)}catch(a){}}_closeCheckItUI(){0<arguments.length&&arguments[0]!==void 0?arguments[0]:null}_onResizeBrowserWindow(){null==this._unsub&&texthelp.CheckitLib.PubSub.pub('TPSOnCheckit',null),this._closeCheckItUI()}_getElemsWithClassFromPoint(a,b,c){var d=document.elementsFromPoint(b,c);return d=d.filter((b)=>b.classList.contains(a)),0<d.length?d:[]}_sendAnalyticsEvent(a){var b=textHelp.webreaderapi.HelpersSingleton.getInst().getLicense(),c=[];c.push(a),c.push(b.Email),c.push(b.Email.split('@')[1]),window.thPostMessage({type:'1757FROM_PAGERW4G',key:'function',method:'SendEvent',parameters:c},'*')}}b.default=c},,,function(a,b,c){'use strict';var d=c(4),e=function(a){return a&&a.__esModule?a:{default:a}}(d);window.texthelp=window.texthelp||{},window.texthelp.CheckitLib=window.texthelp.CheckitLib||{},window.texthelp.CheckitLib.CheckItManagerRW4GC=e.default},function(a,b,c){'use strict';Object.defineProperty(b,'__esModule',{value:!0});var d=c(0),e=function(a){return a&&a.__esModule?a:{default:a}}(d);class f extends e.default{constructor(a,b){super(a,b),this._unsub=null,window.addEventListener('message',(a)=>{if('https://docs.google.com'===a.origin&&void 0!=a.data&&void 0!=a.data.msg)switch(a.data.msg){case'th-rw4gc-checkitoff-42839':{this.setRW4GCCheckit({enabled:!1});break}}})}checkItOn(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:!0,b=1<arguments.length&&arguments[1]!==void 0&&arguments[1];window.postMessage({msg:'th-wriq-checkitoff-5968'},'https://docs.google.com'),this._getIgnoreItems(),super.checkItOn(a,b)}checkItOff(){super.checkItOff(),this._closeCheckItUI()}setRW4GCCheckit(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=a.enabled;texthelp.RW4GC.toolbarHandlerInstance.setCheckit(b!==void 0&&b)}get productString(){return'RW4GC'}getItemsToIgnore(){return this._itemsToIgnore}trimPuncOffStartAndEndOfString(a){return this._ciManager.trimPuncOffStartAndEndOfString(a)}_closeCheckItUI(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:null,b=document.querySelector('.checkit-panel-wrapper');if(null!=b){null==a&&b.parentElement.removeChild(b);var c=null;if(null!==a){var d=document.elementsFromPoint(a.x,a.y);if(d=d.filter((a)=>a.classList.contains('th-checkit-overlay-error')),0<d.length&&(c=d[0]),null!==c&&'mouseenter'!==a.type&&(null!==c.closest('.checkit-panel-wrapper')||null!==c.closest('.th-checkit-overlay-container')))return;if(null==c)b.parentElement.removeChild(b);else if('mouseenter'!==a.type&&null!==a.toElement.closest('.th-checkit-overlay-container'))return}var e=Array.prototype.slice.call(document.querySelectorAll('.checkit-panel-wrapper'));e.forEach(function(a){a.parentElement.removeChild(a)}),this._ciManager.onCheckItPanelClosed()}}_onTPSCloseCheckit(a){this._closeCheckItUI(a)}_onIngnoreAll(){this._ignoreAllSpellingMistake()}_onTPSMouseDownCheckit(a){this._onShowPanel(a)}_onAddToDictionary(){this._addSpellingMistakeToDictionary()}_onIgnore(){this._ignoreCurrentGrammarMistake()}_onShowPanel(a){var b=document.querySelector('#checkit-panel-wrapper');if((this.m_currentCheckit!=a||null===b)&&(null!=b&&b.parentElement.removeChild(b),this.m_currentCheckit=a,null!=this.m_currentCheckit)){var c=this.m_currentCheckit.querySelector('.th-checkit-overlay-meta').getAttribute('th-checkit-meta');if(void 0!=c)return 0==c.length?void 0:(this.m_checkit=JSON.parse(c),'misspelling'==this.m_checkit.rule.issueType&&0==this.m_checkit.replacements.length&&void 0==this.m_checkit.suggestions?void this.onGetSpellingSuggestions(this.m_checkit.word,function(a){a.suggestions.forEach(function(a){this.m_checkit.replacements.push({value:a})}.bind(this)),this.m_checkit.suggestions=!0;var b=JSON.stringify(this.m_checkit);this.m_currentCheckit.querySelector('.th-checkit-overlay-meta').setAttribute('th-checkit-meta',b),this._updateSuggestions(this.m_checkit)}.bind(this)):void this._updateSuggestions(this.m_checkit))}}onGetSpellingSuggestions(a,b){var c={};c.method='onGetSpellingSuggestions',c.type='FR_P_1342_CK',c.word=a,chrome.runtime.sendMessage(this._extensionID,c,function(a){var c=a.payload;b(c)}.bind(this))}_updateSuggestions(a){void 0==this.m_currentCheckit.parentElement||(a.attachElement=this.m_currentCheckit.parentElement.closest('.kix-appview-editor'),a.pageElement=this.m_currentCheckit.parentElement.closest('.kix-page'),a.attachElement.rect=a.attachElement.getBoundingClientRect(),a.checkIt=this.m_currentCheckit,a.checkIt.rect=this.m_currentCheckit.getBoundingClientRect(),this._ciManager.clearAllHighlights(),this.m_currentCheckit.classList.add('th-highlight'),this.onShowCheckIt(a))}onShowCheckIt(a){this._currentCheckItToShow=a;var b=a.attachElement.rect,c=a.checkIt.rect,d=c.width/2-11;11>d&&(d=11),d+=20,null!==this.m_checkItArrowPositionRuleID&&this.m_sheet.deleteRule(this.m_checkItArrowPositionRuleID),this.m_checkItArrowPositionRuleID=this.m_sheet.insertRule('.checkit-panel.arrowup:before, .checkit-panel.arrowup:after {left:'+d+'px;}',0);var e=document.createElement('div');e.id='checkit-panel-wrapper',e.className='checkit-panel-wrapper';var f=document.createElement('div');f.id='checkit-panel',f.className='checkit-panel arrowup',e.appendChild(f);var g='',h=c.y-b.y,i=c.x-b.x;g+='top: '+(c.height+h+-4+a.attachElement.scrollTop)+'px; left: '+(i+a.attachElement.scrollLeft-20)+'px;',e.setAttribute('style',g);var j='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><g fill="#fff" stroke="#d8d8d8"><circle cx="15" cy="15" r="15" stroke="none"/><circle cx="15" cy="15" r="14.5" fill="none"/></g><path fill="#9f5dff" d="M19.243 9.343L15 13.585l-4.243-4.242-1.414 1.414L13.586 15l-4.243 4.242 1.414 1.414L15 16.414l4.243 4.242 1.414-1.414L16.414 15l4.243-4.243z"/></svg>',k='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><g fill="#fff" stroke="#d8d8d8"><circle cx="15" cy="15" r="15" stroke="none"/><circle cx="15" cy="15" r="14.5" fill="none"/></g><path fill="#9f5dff" d="M15 21.375a.11.11 0 0 0 .125-.125.11.11 0 0 0-.125-.125 1.082 1.082 0 0 1-.793-.332 1.082 1.082 0 0 1-.332-.793.11.11 0 0 0-.125-.125.11.11 0 0 0-.125.125 1.325 1.325 0 0 0 .4.973 1.325 1.325 0 0 0 .975.402zm-4.07-3.836l6.851-5.939a2.786 2.786 0 0 0-1.035-1.143A3.152 3.152 0 0 0 15 10a3.446 3.446 0 0 0-1.324.246 2.617 2.617 0 0 0-.949.629 2.985 2.985 0 0 0-.539.8A2.013 2.013 0 0 0 12 12.5a10.75 10.75 0 0 1-1.07 5.039zM21.5 19a.961.961 0 0 1-.3.7.961.961 0 0 1-.7.3H17a1.927 1.927 0 0 1-.586 1.414A1.927 1.927 0 0 1 15 22a1.921 1.921 0 0 1-1.41-.582 1.948 1.948 0 0 1-.59-1.41L14.164 19h5.914a7.894 7.894 0 0 1-1.778-3.586l.867-.758A7.005 7.005 0 0 0 21.5 19zm.672-10.875l.656.75a.268.268 0 0 1 .059.184.239.239 0 0 1-.082.176L8.18 21.906a.253.253 0 0 1-.18.055.227.227 0 0 1-.168-.086l-.656-.75a.268.268 0 0 1-.063-.184.215.215 0 0 1 .087-.168l1.448-1.257A1 1 0 0 1 8.5 19a6.862 6.862 0 0 0 .711-.687 6.2 6.2 0 0 0 .664-.934 7.018 7.018 0 0 0 .582-1.238 9.117 9.117 0 0 0 .391-1.609A12.779 12.779 0 0 0 11 12.5a3.248 3.248 0 0 1 .914-2.207 3.863 3.863 0 0 1 2.4-1.238.778.778 0 0 1-.062-.3.723.723 0 0 1 .219-.531A.723.723 0 0 1 15 8a.723.723 0 0 1 .531.219.723.723 0 0 1 .219.531.778.778 0 0 1-.062.3 4.031 4.031 0 0 1 1.712.65 3.688 3.688 0 0 1 1.156 1.23l3.266-2.836A.253.253 0 0 1 22 8.039a.227.227 0 0 1 .172.086z"/></svg>';if(0==a.replacements.length)f.innerHTML+=0<a.shortMessage.length?'<li class="checkit-li checkit-info">'+a.shortMessage+'</li>':'<li class="checkit-li checkit-info">'+a.message+'</li>',0==a.rule.id.indexOf('MORFOLOGIK_RULE_')?(f.innerHTML+='<li class="checkit-li checkit-functions checkit-ignore-all"><div class="checkit-menu-icon">'+j+'</div><div class="checkit-command-menu checkit-ignore-all-command checkit-action">Ignore All</div></li>',f.innerHTML+='<li class="checkit-li checkit-functions checkit-add-dictionary"><div class="checkit-menu-icon">'+k+'</div><div class="checkit-command-menu checkit-add-dictionary-command checkit-action">Add To Dictionary</div</li>'):f.innerHTML+='<li class="checkit-li checkit-functions checkit-ignore"><div class="checkit-menu-icon">'+k+'</div><div class="checkit-command-menu checkit-ignore-command checkit-action">Ignore</div</li>';else{var l='<ul class="th-checkit-list">';a.replacements.forEach(function(a){f.innerHTML+='<li class="checkit-li checkit-suggestion ">'+a.value+'</li>'}.bind(this)),0==a.rule.id.indexOf('MORFOLOGIK_RULE_')?(f.innerHTML+='<li class="checkit-li checkit-functions checkit-ignore-all"><div class="checkit-menu-icon">'+j+'</div><div class="checkit-command-menu checkit-ignore-all-command checkit-action">Ignore All</div></li>',f.innerHTML+='<li class="checkit-li checkit-functions checkit-add-dictionary"><div class="checkit-menu-icon">'+k+'</div><div class="checkit-command-menu checkit-add-dictionary-command checkit-action">Add To Dictionary</div</li>'):f.innerHTML+='<li class="checkit-li checkit-functions checkit-ignore"><div class="checkit-menu-icon">'+k+'</div><div class="checkit-command-menu checkit-ignore-command checkit-action">Ignore</div</li>',l+='</ul>'}a.attachElement.appendChild(e),[].slice.call(document.querySelectorAll('.checkit-li')).forEach(function(a){a.addEventListener('mouseenter',function(a){this._hoverCheckitTimeout=setTimeout(function(){if(a.target.classList.contains('checkit-suggestion')){var b=[];b.push(a.target.textContent),textHelp.webreaderapi.EventBusSingleton.getInst().publish('onWordChanged',b)}}.bind(this),300)}.bind(this)),a.addEventListener('mouseleave',function(){clearTimeout(this._hoverCheckitTimeout)}.bind(this)),a.addEventListener('click',function(a){if(a.preventDefault(),a.stopPropagation(),!a.target.classList.contains('checkit-info'))return a.target.closest('.checkit-ignore-all')?this._onIngnoreAll():a.target.closest('.checkit-add-dictionary')?this._onAddToDictionary():a.target.closest('.checkit-ignore')?this._onIgnore():this._changeToSuggestion(a.target.textContent,this._currentCheckItToShow),this._closeCheckItUI(),!1}.bind(this)),a.addEventListener('mousedown',function(a){return a.preventDefault(),a.stopPropagation(),!1}.bind(this)),a.addEventListener('mouseup',function(a){return a.preventDefault(),a.stopPropagation(),!1}.bind(this))}.bind(this))}}b.default=f}])});