!function(e){function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var r={};t.m=e,t.c=r,t.i=function(e){return e},t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=1)}([function(e,t,r){var n=!1,o=r(2),i=r(3);e.exports={licenseCheck:function(e,t){var r=!1,a=!1,u=!1,s=!1,c=!1,f=!1,l=!1,d=!1,p=!1,g=!1,h=!1,y=!1,m=!1,v=function(e,t,n){if(y=t,!1!==e)if(h=JSON.parse(e),"Group"===h.licence_type)i.s3Req(i.getGroupFilename(h.group),y,C);else{r=e;var o=JSON.parse(e);u&&"Freemium"==o.licence_type?s?(l=!0,w()):_():"Freemium"==o.licence_type?(l=!0,w()):q()}else l=!0,w(n)},w=function(e){if(c){var t=i.platformFlagToCheck(g),r=i.getDomainsListFilename(t,c);i.s3Req(r,y,O)}else _(e)},_=function(e){u&&!s?i.s3Req(i.getUserFilename(u,g),y,T):r?q():a?N(e):(d=Error("User or product code not set"),t(d,!1))},O=function(e,t,r){y=t,!1!==e?S(e,x):_(r)},x=function(e){0!=e?i.s3Req("groups/"+e+".json",y,F):_()},S=function(e,t){var r=JSON.parse(e),n=!1;"rw4gc"==g||"equatio"==g||"ft4g"==g||!1!==f?null!=r.unlimited_oauth&&null!=r.unlimited_oauth[c]&&(n=r.unlimited_oauth[c]):!1!==u&&!0===s&&null!=r.unlimited&&(null!=r.unlimited[u]?n=r.unlimited[u]:d=Error("Product code invalid")),!n&&u&&!0===s&&null!=r.limited&&(null!=r.limited[u]?n=r.limited[u]:d=Error("Product code invalid")),n||null!=r.hide_unlicensed&&null!=r.hide_unlicensed[c]&&(p=!0),t(n)},F=function(e,t){y=t,!1!==e?D(e):_()},D=function(e){i.verifyUserCanEnrolInGroup(e,y,g)?(r=e,q(),R(e)):(d=Error("Unable to enrol in group"),_())},R=function(e){var t=JSON.parse(e),r={};r.user=a,r.group=t.guid,r.auth_code=t.auth_code,r.product=g,i.sugarReq("group",r,function(e){})},T=function(e,n,o){y=n;try{if(!1!==e)if(a){var s=!0;0==f&&(s=!1,d=Error("Login type not set"));var c=JSON.parse(e);i.dateInFuture(c.expiry,y)||(s=!1,d=Error("License expired"));var l=i.getSoftwareEnabledProp(g);if(!s||c.hasOwnProperty(l)&&0!=c[l]||(s=!1,d=Error("Product not enabled")),s&&""!=c[f+"_login"]?(s=!1,d=Error("This product code is already tied to a user for this login type")):c[f+"_login"]=a,!0===s){r=JSON.stringify(c),q();var p={};p.user=a,p.user_encrypted=!0,p.auth_code=u,p.login_type=f,p.licence_id=c.guid,i.sugarReq("single",p,function(e){})}else N()}else r=e,q();else{if(!a)throw new Error("Not a valid product code");d=Error("Not a valid product code"),N(o)}}catch(e){t(e,r)}},C=function(e,t){if(y=t,!1===e)throw"Group file not found";var n=JSON.parse(e);if(8==n.auth_code.length&&(n.auth_code=o.hashAuthCode(n.auth_code)),h.auth_code==n.auth_code){r=e;var a=i.getSoftwareEnabledProp(g),u=i.getProductExpiryProp(g);i.dateInFuture(n.expiry,y)?1!=n[a]?(n[u]=i.getTodaysDate(y),r=JSON.stringify(n),i.s3Req(i.getFeaturesFilename(g,"freemium"),y,J)):q():i.s3Req(i.getFeaturesFilename(g,"freemium"),y,J)}else d=Error("Group product code has changed, reverting to freemium"),l=!0,E()},N=function(e){if(void 0==e&&(e=!1),!1===r)if(r=i.freemium(a,y,g),e){var t=JSON.parse(r);t.lt=Math.floor(899999*Math.random()+1e5),r=JSON.stringify(t)}else P();q()},E=function(){!1===r&&(r=i.expiredFreemium(a,y,g),P()),q()},P=function(){if(a){var e={};e.user=a,e.product=g,i.sugarReq("freemium",e,function(e){})}},q=function(){var e=JSON.parse(r),t=!1;if("Group"!=e.licence_type){var n=i.getProductExpiryProp(g),o=i.getSoftwareEnabledProp(g);e.hasOwnProperty(o)&&0!=e[o]||e.hasOwnProperty(n)?!e.hasOwnProperty(o)||1!=e[o]||i.dateInFuture(e.expiry,y)||e.hasOwnProperty(n)||(e[n]=i.get30DaysDate(y),r=JSON.stringify(e),t=!0):(e[n]=i.get30DaysDate(y),r=JSON.stringify(e),t=!0),"Freemium"==e.licence_type&&(e.hide_unlicensed=p,r=JSON.stringify(e));var a=!1;e.hasOwnProperty(o)&&1==e[o]&&i.dateInFuture(e.expiry,y)?a=!0:e.hasOwnProperty(n)&&i.dateInFuture(e[n],y)&&(a=!0),!0===a?i.s3Req(i.getFeaturesFilename(g,"premium"),y,J):i.s3Req(i.getFeaturesFilename(g,"freemium"),y,J)}else H(r);if(!0===t&&P(),"Group"!=e.licence_type&&!0!==l&&null!=c){var u=!1;if("Single"==e.licence_type?i.dateInFuture(e.expiry,y)||(u=!0):u=!0,!0===u){var s=i.platformFlagToCheck(g),f=i.getDomainsListFilename(s,c);i.s3Req(f,y,b)}}},J=function(e,t){if(y=t,!1!==e){var n=JSON.parse(r),o=JSON.parse(e);n.features=o,r=JSON.stringify(n),H(r)}else H(r)},b=function(e,t){y=t,!1!==e&&S(e,M)},M=function(e){0!=e&&i.s3Req("groups/"+e+".json",y,I)},I=function(e,t){y=t,!1!==e&&i.verifyUserCanEnrolInGroup(e,y,g)&&R(e)},H=function(e){var r=JSON.parse(e);r.today=i.getTodaysDate(y),r.currentDateTime=i.getCurrentDateTime(y);var n=i.getSoftwareEnabledProp(g),o=i.getProductExpiryProp(g);if(r.hasOwnProperty(n)&&1==r[n]?(r.license_expiry=r.expiry,i.dateInFuture(r.expiry,y)||r.hasOwnProperty(o)&&i.dateInFuture(r[o],y)&&(r.license_expiry=r[o],r.trial=!0)):(r.license_expiry=r[o],i.dateInFuture(r.license_expiry,y)?r.trial=!0:r.trial=!1),"Group"!=r.licence_type)if("equatio"==g){var u=i.getSoftwareEnabledProp("rw4gc");"Single"==r.licence_type&&r.hasOwnProperty(u)&&1==r[u]?r.upgrade_link="http://www.texthelp.com/products/equatio/existing-customer":r.upgrade_link="https://my.texthelp.com/Purchase/Index?productCode=eq"}else r.upgrade_link="http://www.texthelp.com/products/read-write/premium-features/";r.daysleft=i.dateDiff(r.today,r.license_expiry,"days"),void 0===r.user&&0!=a&&(r.user=a),t(d,r)};try{if(void 0!=e.authCode&&""!=e.authCode){var U=e.authCode;if(!function(e){return 8==e.length&&(e=e.toUpperCase(),i.isGroupAuthCode(e)&&(s=!0),u=o.hashAuthCode(e),!0)}(U))throw new Error("Product code invalid")}if(void 0!=e.product&&""!=e.product){var G=e.product;if(!function(e){return!(["mac","rw4gc","windows","ipad","android","equatio","edge","ft4g"].indexOf(e)<0||(g=e,0))}(G))throw new Error("Invalid product")}if(void 0!==e.debug&&""!=e.debug?(n=e.debug,i.thDebugMode=n):n=!1,void 0!==e.cacheBypass&&""!=e.cacheBypass?(m=e.cacheBypass,i.thCloudFrontBypass=m,m&&console.log("[DEBUG]: Bypassing CloudFront due to configuration option!")):m=!1,void 0!=e.user&&""!=e.user){var A=e.user.toLowerCase(),j=!1;if(void 0!=e.disableUserHash&&!0===e.disableUserHash&&(j=!0),!function(e,t){if(null!=e){if(!i.isValidUser(e))throw new Error("No domain found....stopping");a=!0===t?e:o.hashEmail(e);var r=a.split("@"),n=r[1];return c=o.hashDomain(n),!0}return!1}(A,j))throw new Error("Invalid user")}if(void 0!=e.loginType&&""!=e.loginType){var k=e.loginType;if(!function(e){return!(["google","microsoft","facebook","twitter","linkedin","yahoo"].indexOf(e)<0||(f=e,0))}(k))throw new Error("Invalid login type")}if(!a&&!u)throw new Error("User or product code must be set");if(0==g)throw new Error("Product not set");a?i.s3Req(i.getUserFilename(a,g),y,v):_()}catch(e){t(e,r)}}}},function(e,t,r){thAuth=r(0)},function(e,t,r){var n={};n.getS=function(){return"hfdu9b89';JHK7898hbh;';[/"},n.hashEmail=function(e){e=e.toLowerCase(),e=e.trim();try{var t=n.getS(),r=e.split("@"),o=r[0].replace("%",""),i=r[1];return o+=t,n.hash(o)+"@"+i}catch(e){}},n.hashAuthCode=function(e){e=e.toUpperCase(),e=e.trim();try{var t=n.getS(),r=e+=t;return n.hash(r)}catch(e){}},n.hashDomain=function(e){e=e.toLowerCase(),e=e.trim();try{var t=n.getS(),r=e+=t;return n.hash(r)}catch(e){}},n.hash=function(e){e=unescape(encodeURIComponent(e));var t=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],r=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];e+=String.fromCharCode(128);for(var o=e.length/4+2,i=Math.ceil(o/16),a=new Array(i),u=0;i>u;u++){a[u]=new Array(16);for(var s=0;16>s;s++)a[u][s]=e.charCodeAt(64*u+4*s)<<24|e.charCodeAt(64*u+4*s+1)<<16|e.charCodeAt(64*u+4*s+2)<<8|e.charCodeAt(64*u+4*s+3)}a[i-1][14]=8*(e.length-1)/Math.pow(2,32),a[i-1][14]=Math.floor(a[i-1][14]),a[i-1][15]=8*(e.length-1)&4294967295;for(var c,f,l,d,p,g,h,y,m=new Array(64),u=0;i>u;u++){for(var v=0;16>v;v++)m[v]=a[u][v];for(var v=16;64>v;v++)m[v]=n.o1(m[v-2])+m[v-7]+n.o0(m[v-15])+m[v-16]&4294967295;c=r[0],f=r[1],l=r[2],d=r[3],p=r[4],g=r[5],h=r[6],y=r[7];for(var v=0;64>v;v++){var w=y+n.e1(p)+n.Ch(p,g,h)+t[v]+m[v],_=n.e0(c)+n.Maj(c,f,l);y=h,h=g,g=p,p=d+w&4294967295,d=l,l=f,f=c,c=w+_&4294967295}r[0]=r[0]+c&4294967295,r[1]=r[1]+f&4294967295,r[2]=r[2]+l&4294967295,r[3]=r[3]+d&4294967295,r[4]=r[4]+p&4294967295,r[5]=r[5]+g&4294967295,r[6]=r[6]+h&4294967295,r[7]=r[7]+y&4294967295}return n.toHexStr(r[0])+n.toHexStr(r[1])+n.toHexStr(r[2])+n.toHexStr(r[3])+n.toHexStr(r[4])+n.toHexStr(r[5])+n.toHexStr(r[6])+n.toHexStr(r[7])},n.ROTR=function(e,t){return t>>>e|t<<32-e},n.e0=function(e){return n.ROTR(2,e)^n.ROTR(13,e)^n.ROTR(22,e)},n.e1=function(e){return n.ROTR(6,e)^n.ROTR(11,e)^n.ROTR(25,e)},n.o0=function(e){return n.ROTR(7,e)^n.ROTR(18,e)^e>>>3},n.o1=function(e){return n.ROTR(17,e)^n.ROTR(19,e)^e>>>10},n.Ch=function(e,t,r){return e&t^~e&r},n.Maj=function(e,t,r){return e&t^e&r^t&r},n.toHexStr=function(e){for(var t,r="",n=7;n>=0;n--)t=e>>>4*n&15,r+=t.toString(16);return r},e.exports=n},function(e,t,r){var n={};n.thDebugMode=!1,n.thCloudFrontBypass=!1,n.s3Req=function(e,t,r){var o=function(e,t,r){var o=new XMLHttpRequest;o.onload=function(){200==o.status&&""!=o.responseText?(!1===t&&(t=n.setToday(o)),r(o.responseText,t,!1)):404==o.status||403==o.status?r(404,t,!1):r(!1,t,!1)},o.onerror=function(){setTimeout(function(){r(!1,t,!0)},3e3)},o.ontimeout=function(){setTimeout(function(){r(!1,t,!0)},3e3)},o.open("GET",e+"?cbp="+Math.random()),o.timeout=3e4,o.send()},i=function(e,t,n){!1!==e&&404!=e?r(e,t,!1):404==e?r(!1,t,!1):o(u,t,a)},a=function(e,t,n){!1!==e&&404!=e?r(e,t,!1):r(!1,t,n)};if(n.thCloudFrontBypass)var u="https://s3.amazonaws.com/rwfamilylive/"+e;else var u="https://licensing.texthelp.com/"+e;o(u,t,i)},n.setToday=function(e){var t=e.getResponseHeader("Date"),r=e.getResponseHeader("Age");if(!isNaN(parseFloat(r))&&isFinite(r))var n=new Date(t),o=new Date(n.getTime()+parseInt(1e3*r)),i=new Date(o);else var i=new Date(t);return i},n.sugarReq=function(e,t,r){var n="https://ist.texthelp.com/queue/licensing/push/"+e,o=new XMLHttpRequest;o.onreadystatechange=function(){4==o.readyState&&200==o.status?r(""!=o.responseText&&o.responseText):4==o.readyState&&o.status},o.onerror=function(){r(!1)},o.ontimeout=function(){r(!1)};var i=JSON.stringify(t);o.timeout=3e4,o.open("POST",n),o.setRequestHeader("Content-Type","application/json"),o.send(i)},n.freemium=function(e,t,r){var o="expiry_"+r,i={};return i.user=e,i.start=n.getTodaysDate(t),i[o]=n.get30DaysDate(t),i.licence_type="Freemium",JSON.stringify(i)},n.expiredFreemium=function(e,t,r){var o="expiry_"+r,i={};return i.user=e,i.start=n.getTodaysDate(t),i[o]=n.getTodaysDate(t),i.licence_type="Freemium",JSON.stringify(i)},n.getTodaysDate=function(e){if(e instanceof Date)var t=new Date(e).toJSON().slice(0,10);else var t=(new Date).toJSON().slice(0,10);return t},n.getCurrentDateTime=function(e){if(e instanceof Date)var t=new Date(e).toJSON();else var t=(new Date).toJSON();return t},n.dateInFuture=function(e,t){var e=new Date(e);return new Date(t).getTime()<=e.getTime()},n.get30DaysDate=function(e){var t=new Date(n.getTodaysDate(e)),r=(new Date).setDate(t.getDate()+30);return new Date(r).toJSON().slice(0,10)},n.dateDiff=function(e,t,r){e=new Date(e),t=new Date(t);var n=t-e;if(isNaN(n))return NaN;switch(r){case"years":return t.getFullYear()-e.getFullYear();case"months":return 12*t.getFullYear()+t.getMonth()-(12*e.getFullYear()+e.getMonth());case"weeks":return Math.floor(n/6048e5);case"days":return Math.floor(n/864e5);case"hours":return Math.floor(n/36e5);case"minutes":return Math.floor(n/6e4);case"seconds":return Math.floor(n/1e3);default:return}},n.platformFlagToCheck=function(e){return"equatio"==e?"equatio":"ft4g"==e?"ft4g":"read_and_write"},n.verifyUserCanEnrolInGroup=function(e,t,r){var o=JSON.parse(e),i=o[n.platformFlagToCheck(r)];if(!0===n.dateInFuture(o.expiry,t)&&1==i){if(1==o.unlimited)return!0;if(o.user_count>o.enrolled_seats&&1!=o.using_admin_tool)return!0}return!1},n.getUserFilename=function(e,t){if("equatio"==t)var r="users_equatio";else if("ft4g"==t)var r="users_ft4g";else var r="users";return r+"/"+e+".json"},n.getGroupFilename=function(e){return"groups/"+e+".json"},n.getFeaturesFilename=function(e,t){return"new_"+t+"_features_"+e+".json"},n.getDomainsListFilename=function(e,t){return"domains/"+e+"/"+t+".json"},n.getProductExpiryProp=function(e){return"expiry_"+e},n.getSoftwareEnabledProp=function(e){return"equatio"==e?"equatio":"ft4g"==e?"ft4g":"read_and_write"},n.isGroupAuthCode=function(e){return"G"==e.substring(0,1)},n.isValidUser=function(e){return e.indexOf("@")>=0},n.setDebugMode=function(e){n.debug=e},e.exports=n}]);