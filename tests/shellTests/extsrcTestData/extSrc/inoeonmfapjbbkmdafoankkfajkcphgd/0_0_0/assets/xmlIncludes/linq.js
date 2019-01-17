(function(e){var t=Math.floor,r={Identity:function(e){return e},True:function(){return!0},Blank:function(){}},n={Boolean:"boolean",Number:"number",String:"string",Object:"object",Undefined:"undefined",Function:"function"},o={createLambda:function(e){if(null==e)return r.Identity;if(typeof e==n.String){if(""==e)return r.Identity;if(-1==e.indexOf("=>")){for(var t,o,a=/[$]+/g,d=0;t=a.exec(e);)o=t[0].length,o>d&&(d=o);for(var u,p=[],c=1;c<=d;c++){u="";for(var i=0;i<c;i++)u+="$";p.push(u)}var l=Array.prototype.join.call(p,",");return new Function(l,"return "+e)}var s=e.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);return new Function(s[1],"return "+s[2])}return e},isIEnumerable:function(e){if(typeof Enumerator!==n.Undefined)try{return new Enumerator(e),!0}catch(t){}return!1},defineProperty:null==Object.defineProperties?function(e,t,r){e[t]=r}:function(e,t,r){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,writable:!0,value:r})},compare:function(e,t){return e===t?0:e>t?1:-1},dispose:function(e){null!=e&&e.dispose()}},a={Before:0,Running:1,After:2},d=function(e,t,r){var n=new i,o=a.Before;this.current=n.current,this.moveNext=function(){try{switch(o){case a.Before:o=a.Running,e();case a.Running:return!!t.apply(n)||(this.dispose(),!1);case a.After:return!1;}}catch(t){throw this.dispose(),t}},this.dispose=function(){if(o==a.Running)try{r()}finally{o=a.After}}},i=function(){var e=null;this.current=function(){return e},this.yieldReturn=function(t){return e=t,!0},this.yieldBreak=function(){return!1}},u=function(e){this.getEnumerator=e};u.Utils={},u.Utils.createLambda=function(e){return o.createLambda(e)},u.Utils.createEnumerable=function(e){return new u(e)},u.Utils.createEnumerator=function(e,t,r){return new d(e,t,r)},u.Utils.extendTo=function(e){var t,r=e.prototype;for(var n in e===Array?(t=s.prototype,o.defineProperty(r,"getSource",function(){return this})):(t=u.prototype,o.defineProperty(r,"getEnumerator",function(){return u.from(this).getEnumerator()})),t){var a=t[n];if(r[n]!=a){if(null!=r[n]&&(n+="ByLinq",r[n]==a))continue;a instanceof Function&&o.defineProperty(r,n,a)}}},u.choice=function(){var e=arguments;return new u(function(){return new d(function(){e=e[0]instanceof Array?e[0]:null==e[0].getEnumerator?e:e[0].toArray()},function(){return this.yieldReturn(e[t(Math.random()*e.length)])},r.Blank)})},u.cycle=function(){var e=arguments;return new u(function(){var t=0;return new d(function(){e=e[0]instanceof Array?e[0]:null==e[0].getEnumerator?e:e[0].toArray()},function(){return t>=e.length&&(t=0),this.yieldReturn(e[t++])},r.Blank)})},u.empty=function(){return new u(function(){return new d(r.Blank,function(){return!1},r.Blank)})},u.from=function(e){if(null==e)return u.empty();if(e instanceof u)return e;if(typeof e==n.Number||typeof e==n.Boolean)return u.repeat(e,1);if(typeof e==n.String)return new u(function(){var t=0;return new d(r.Blank,function(){return!!(t<e.length)&&this.yieldReturn(e.charAt(t++))},r.Blank)});if(typeof e!=n.Function){if(typeof e.length==n.Number)return new s(e);if(!(e instanceof Object)&&o.isIEnumerable(e))return new u(function(){var t,n=!0;return new d(function(){t=new Enumerator(e)},function(){return n?n=!1:t.moveNext(),!t.atEnd()&&this.yieldReturn(t.item())},r.Blank)});if(typeof Windows===n.Object&&typeof e.first===n.Function)return new u(function(){var t,n=!0;return new d(function(){t=e.first()},function(){return n?n=!1:t.moveNext(),t.hasCurrent?this.yieldReturn(t.current):this.yieldBreak()},r.Blank)})}return new u(function(){var t=[],n=0;return new d(function(){for(var r in e){var n=e[r];!(n instanceof Function)&&Object.prototype.hasOwnProperty.call(e,r)&&t.push({key:r,value:n})}},function(){return!!(n<t.length)&&this.yieldReturn(t[n++])},r.Blank)})},u.make=function(e){return u.repeat(e,1)},u.matches=function(e,t,n){return null==n&&(n=""),t instanceof RegExp&&(n+=t.ignoreCase?"i":"",n+=t.multiline?"m":"",t=t.source),-1===n.indexOf("g")&&(n+="g"),new u(function(){var o;return new d(function(){o=new RegExp(t,n)},function(){var t=o.exec(e);return!!t&&this.yieldReturn(t)},r.Blank)})},u.range=function(e,t,n){return null==n&&(n=1),new u(function(){var o,a=0;return new d(function(){o=e-n},function(){return a++<t?this.yieldReturn(o+=n):this.yieldBreak()},r.Blank)})},u.rangeDown=function(e,t,n){return null==n&&(n=1),new u(function(){var o,a=0;return new d(function(){o=e+n},function(){return a++<t?this.yieldReturn(o-=n):this.yieldBreak()},r.Blank)})},u.rangeTo=function(e,t,n){return null==n&&(n=1),e<t?new u(function(){var o;return new d(function(){o=e-n},function(){var e=o+=n;return e<=t?this.yieldReturn(e):this.yieldBreak()},r.Blank)}):new u(function(){var o;return new d(function(){o=e+n},function(){var e=o-=n;return e>=t?this.yieldReturn(e):this.yieldBreak()},r.Blank)})},u.repeat=function(e,t){return null==t?new u(function(){return new d(r.Blank,function(){return this.yieldReturn(e)},r.Blank)}):u.repeat(e).take(t)},u.repeatWithFinalize=function(e,t){return e=o.createLambda(e),t=o.createLambda(t),new u(function(){var r;return new d(function(){r=e()},function(){return this.yieldReturn(r)},function(){null!=r&&(t(r),r=null)})})},u.generate=function(e,t){return null==t?(e=o.createLambda(e),new u(function(){return new d(r.Blank,function(){return this.yieldReturn(e())},r.Blank)})):u.generate(e).take(t)},u.toInfinity=function(e,t){return null==e&&(e=0),null==t&&(t=1),new u(function(){var n;return new d(function(){n=e-t},function(){return this.yieldReturn(n+=t)},r.Blank)})},u.toNegativeInfinity=function(e,t){return null==e&&(e=0),null==t&&(t=1),new u(function(){var n;return new d(function(){n=e+t},function(){return this.yieldReturn(n-=t)},r.Blank)})},u.unfold=function(e,t){return t=o.createLambda(t),new u(function(){var n,o=!0;return new d(r.Blank,function(){return o?(o=!1,n=e,this.yieldReturn(n)):(n=t(n),this.yieldReturn(n))},r.Blank)})},u.defer=function(e){return new u(function(){var t;return new d(function(){t=u.from(e()).getEnumerator()},function(){return t.moveNext()?this.yieldReturn(t.current()):this.yieldBreak()},function(){o.dispose(t)})})},u.prototype.traverseBreadthFirst=function(e,t){var r=this;return e=o.createLambda(e),t=o.createLambda(t),new u(function(){var n,a=0,i=[];return new d(function(){n=r.getEnumerator()},function(){for(;;){if(n.moveNext())return i.push(n.current()),this.yieldReturn(t(n.current(),a));var r=u.from(i).selectMany(function(t){return e(t)});if(!r.any())return!1;a++,i=[],o.dispose(n),n=r.getEnumerator()}},function(){o.dispose(n)})})},u.prototype.traverseDepthFirst=function(e,t){var r=this;return e=o.createLambda(e),t=o.createLambda(t),new u(function(){var n,a=[];return new d(function(){n=r.getEnumerator()},function(){for(;;){if(n.moveNext()){var r=t(n.current(),a.length);return a.push(n),n=u.from(e(n.current())).getEnumerator(),this.yieldReturn(r)}if(0>=a.length)return!1;o.dispose(n),n=a.pop()}},function(){try{o.dispose(n)}finally{u.from(a).forEach(function(e){e.dispose()})}})})},u.prototype.flatten=function(){var e=this;return new u(function(){var t,n=null;return new d(function(){t=e.getEnumerator()},function(){for(;;){if(null!=n){if(n.moveNext())return this.yieldReturn(n.current());n=null}if(t.moveNext())if(t.current()instanceof Array){o.dispose(n),n=u.from(t.current()).selectMany(r.Identity).flatten().getEnumerator();continue}else return this.yieldReturn(t.current());return!1}},function(){try{o.dispose(t)}finally{o.dispose(n)}})})},u.prototype.pairwise=function(e){var t=this;return e=o.createLambda(e),new u(function(){var r;return new d(function(){r=t.getEnumerator(),r.moveNext()},function(){var t=r.current();return!!r.moveNext()&&this.yieldReturn(e(t,r.current()))},function(){o.dispose(r)})})},u.prototype.scan=function(e,t){var r;null==t?(t=o.createLambda(e),r=!1):(t=o.createLambda(t),r=!0);var n=this;return new u(function(){var a,i,u=!0;return new d(function(){a=n.getEnumerator()},function(){if(u){if(u=!1,!!r)return this.yieldReturn(i=e);if(a.moveNext())return this.yieldReturn(i=a.current())}return!!a.moveNext()&&this.yieldReturn(i=t(i,a.current()))},function(){o.dispose(a)})})},u.prototype.select=function(e){if(e=o.createLambda(e),1>=e.length)return new y(this,null,e);var t=this;return new u(function(){var r,n=0;return new d(function(){r=t.getEnumerator()},function(){return!!r.moveNext()&&this.yieldReturn(e(r.current(),n++))},function(){o.dispose(r)})})},u.prototype.selectMany=function(e,t){var r=this;return e=o.createLambda(e),null==t&&(t=function(e,t){return t}),t=o.createLambda(t),new u(function(){var n,a=void 0,i=0;return new d(function(){n=r.getEnumerator()},function(){if(void 0===a&&!n.moveNext())return!1;do{if(null==a){var r=e(n.current(),i++);a=u.from(r).getEnumerator()}if(a.moveNext())return this.yieldReturn(t(n.current(),a.current()));o.dispose(a),a=null}while(n.moveNext());return!1},function(){try{o.dispose(n)}finally{o.dispose(a)}})})},u.prototype.where=function(e){if(e=o.createLambda(e),1>=e.length)return new m(this,e);var t=this;return new u(function(){var r,n=0;return new d(function(){r=t.getEnumerator()},function(){for(;r.moveNext();)if(e(r.current(),n++))return this.yieldReturn(r.current());return!1},function(){o.dispose(r)})})},u.prototype.choose=function(e){e=o.createLambda(e);var t=this;return new u(function(){var r,n=0;return new d(function(){r=t.getEnumerator()},function(){for(;r.moveNext();){var t=e(r.current(),n++);if(null!=t)return this.yieldReturn(t)}return this.yieldBreak()},function(){o.dispose(r)})})},u.prototype.ofType=function(e){var t;switch(e){case Number:t=n.Number;break;case String:t=n.String;break;case Boolean:t=n.Boolean;break;case Function:t=n.Function;break;default:t=null;}return null===t?this.where(function(t){return t instanceof e}):this.where(function(e){return typeof e===t})},u.prototype.zip=function(){var e=arguments,t=o.createLambda(arguments[arguments.length-1]),r=this;if(2==arguments.length){var n=arguments[0];return new u(function(){var e,a,i=0;return new d(function(){e=r.getEnumerator(),a=u.from(n).getEnumerator()},function(){return e.moveNext()&&a.moveNext()&&this.yieldReturn(t(e.current(),a.current(),i++))},function(){try{o.dispose(e)}finally{o.dispose(a)}})})}return new u(function(){var n,a=0;return new d(function(){var t=u.make(r).concat(u.from(e).takeExceptLast().select(u.from)).select(function(e){return e.getEnumerator()}).toArray();n=u.from(t)},function(){if(n.all(function(e){return e.moveNext()})){var e=n.select(function(e){return e.current()}).toArray();return e.push(a++),this.yieldReturn(t.apply(null,e))}return this.yieldBreak()},function(){u.from(n).forEach(o.dispose)})})},u.prototype.merge=function(){var e=arguments,t=this;return new u(function(){var r,n=-1;return new d(function(){r=u.make(t).concat(u.from(e).select(u.from)).select(function(e){return e.getEnumerator()}).toArray()},function(){for(;0<r.length;){n=n>=r.length-1?0:n+1;var e=r[n];if(e.moveNext())return this.yieldReturn(e.current());e.dispose(),r.splice(n--,1)}return this.yieldBreak()},function(){u.from(r).forEach(o.dispose)})})},u.prototype.join=function(e,t,n,a,i){t=o.createLambda(t),n=o.createLambda(n),a=o.createLambda(a),i=o.createLambda(i);var p=this;return new u(function(){var c,l,s=null,m=0;return new d(function(){c=p.getEnumerator(),l=u.from(e).toLookup(n,r.Identity,i)},function(){for(;;){if(null!=s){var e=s[m++];if(e!==void 0)return this.yieldReturn(a(c.current(),e));e=null,m=0}if(c.moveNext()){var r=t(c.current());s=l.get(r).toArray()}else return!1}},function(){o.dispose(c)})})},u.prototype.groupJoin=function(e,t,n,a,i){t=o.createLambda(t),n=o.createLambda(n),a=o.createLambda(a),i=o.createLambda(i);var p=this;return new u(function(){var c=p.getEnumerator(),l=null;return new d(function(){c=p.getEnumerator(),l=u.from(e).toLookup(n,r.Identity,i)},function(){if(c.moveNext()){var e=l.get(t(c.current()));return this.yieldReturn(a(c.current(),e))}return!1},function(){o.dispose(c)})})},u.prototype.all=function(e){e=o.createLambda(e);var t=!0;return this.forEach(function(r){if(!e(r))return t=!1,!1}),t},u.prototype.any=function(e){e=o.createLambda(e);var t=this.getEnumerator();try{if(0==arguments.length)return t.moveNext();for(;t.moveNext();)if(e(t.current()))return!0;return!1}finally{o.dispose(t)}},u.prototype.isEmpty=function(){return!this.any()},u.prototype.concat=function(){var e=this;if(1==arguments.length){var t=arguments[0];return new u(function(){var r,n;return new d(function(){r=e.getEnumerator()},function(){if(null==n){if(r.moveNext())return this.yieldReturn(r.current());n=u.from(t).getEnumerator()}return!!n.moveNext()&&this.yieldReturn(n.current())},function(){try{o.dispose(r)}finally{o.dispose(n)}})})}var r=arguments;return new u(function(){var t;return new d(function(){t=u.make(e).concat(u.from(r).select(u.from)).select(function(e){return e.getEnumerator()}).toArray()},function(){for(;0<t.length;){var e=t[0];if(e.moveNext())return this.yieldReturn(e.current());e.dispose(),t.splice(0,1)}return this.yieldBreak()},function(){u.from(t).forEach(o.dispose)})})},u.prototype.insert=function(e,t){var r=this;return new u(function(){var n,a,i=0,p=!1;return new d(function(){n=r.getEnumerator(),a=u.from(t).getEnumerator()},function(){return i==e&&a.moveNext()?(p=!0,this.yieldReturn(a.current())):n.moveNext()?(i++,this.yieldReturn(n.current())):!p&&a.moveNext()&&this.yieldReturn(a.current())},function(){try{o.dispose(n)}finally{o.dispose(a)}})})},u.prototype.alternate=function(e){var t=this;return new u(function(){var r,n,a,i;return new d(function(){a=e instanceof Array||null!=e.getEnumerator?u.from(u.from(e).toArray()):u.make(e),n=t.getEnumerator(),n.moveNext()&&(r=n.current())},function(){for(;;){if(null!=i){if(i.moveNext())return this.yieldReturn(i.current());i=null}if(null==r&&n.moveNext()){r=n.current(),i=a.getEnumerator();continue}else if(null!=r){var e=r;return r=null,this.yieldReturn(e)}return this.yieldBreak()}},function(){try{o.dispose(n)}finally{o.dispose(i)}})})},u.prototype.contains=function(e,t){t=o.createLambda(t);var r=this.getEnumerator();try{for(;r.moveNext();)if(t(r.current())===e)return!0;return!1}finally{o.dispose(r)}},u.prototype.defaultIfEmpty=function(e){var t=this;return void 0===e&&(e=null),new u(function(){var r,n=!0;return new d(function(){r=t.getEnumerator()},function(){return r.moveNext()?(n=!1,this.yieldReturn(r.current())):!!n&&(n=!1,this.yieldReturn(e))},function(){o.dispose(r)})})},u.prototype.distinct=function(e){return this.except(u.empty(),e)},u.prototype.distinctUntilChanged=function(e){e=o.createLambda(e);var t=this;return new u(function(){var r,n,a;return new d(function(){r=t.getEnumerator()},function(){for(;r.moveNext();){var t=e(r.current());if(a)return a=!1,n=t,this.yieldReturn(r.current());if(n!==t)return n=t,this.yieldReturn(r.current())}return this.yieldBreak()},function(){o.dispose(r)})})},u.prototype.except=function(e,t){t=o.createLambda(t);var r=this;return new u(function(){var n,a;return new d(function(){n=r.getEnumerator(),a=new f(t),u.from(e).forEach(function(e){a.add(e)})},function(){for(;n.moveNext();){var e=n.current();if(!a.contains(e))return a.add(e),this.yieldReturn(e)}return!1},function(){o.dispose(n)})})},u.prototype.intersect=function(e,t){t=o.createLambda(t);var r=this;return new u(function(){var n,a,i;return new d(function(){n=r.getEnumerator(),a=new f(t),u.from(e).forEach(function(e){a.add(e)}),i=new f(t)},function(){for(;n.moveNext();){var e=n.current();if(!i.contains(e)&&a.contains(e))return i.add(e),this.yieldReturn(e)}return!1},function(){o.dispose(n)})})},u.prototype.sequenceEqual=function(e,t){t=o.createLambda(t);var r=this.getEnumerator();try{var n=u.from(e).getEnumerator();try{for(;r.moveNext();)if(!n.moveNext()||t(r.current())!==t(n.current()))return!1;return!n.moveNext()}finally{o.dispose(n)}}finally{o.dispose(r)}},u.prototype.union=function(e,t){t=o.createLambda(t);var r=this;return new u(function(){var n,a,i;return new d(function(){n=r.getEnumerator(),i=new f(t)},function(){var t;if(a===void 0){for(;n.moveNext();)if(t=n.current(),!i.contains(t))return i.add(t),this.yieldReturn(t);a=u.from(e).getEnumerator()}for(;a.moveNext();)if(t=a.current(),!i.contains(t))return i.add(t),this.yieldReturn(t);return!1},function(){try{o.dispose(n)}finally{o.dispose(a)}})})},u.prototype.orderBy=function(e){return new p(this,e,!1)},u.prototype.orderByDescending=function(e){return new p(this,e,!0)},u.prototype.reverse=function(){var e=this;return new u(function(){var t,n;return new d(function(){t=e.toArray(),n=t.length},function(){return!!(0<n)&&this.yieldReturn(t[--n])},r.Blank)})},u.prototype.shuffle=function(){var e=this;return new u(function(){var n;return new d(function(){n=e.toArray()},function(){if(0<n.length){var e=t(Math.random()*n.length);return this.yieldReturn(n.splice(e,1)[0])}return!1},r.Blank)})},u.prototype.weightedSample=function(e){e=o.createLambda(e);var n=this;return new u(function(){var o,a=0;return new d(function(){o=n.choose(function(t){var r=e(t);return 0>=r?null:(a+=r,{value:t,bound:a})}).toArray()},function(){if(0<o.length){for(var e=t(Math.random()*a)+1,r=-1,n=o.length;1<n-r;){var d=t((r+n)/2);o[d].bound>=e?n=d:r=d}return this.yieldReturn(o[n].value)}return this.yieldBreak()},r.Blank)})},u.prototype.groupBy=function(e,t,r,n){var a=this;return e=o.createLambda(e),t=o.createLambda(t),null!=r&&(r=o.createLambda(r)),n=o.createLambda(n),new u(function(){var i;return new d(function(){i=a.toLookup(e,t,n).toEnumerable().getEnumerator()},function(){for(;i.moveNext();)return null==r?this.yieldReturn(i.current()):this.yieldReturn(r(i.current().key(),i.current()));return!1},function(){o.dispose(i)})})},u.prototype.partitionBy=function(e,t,r,n){var a=this;e=o.createLambda(e),t=o.createLambda(t),n=o.createLambda(n);var i;return null==r?(i=!1,r=function(e,t){return new h(e,t)}):(i=!0,r=o.createLambda(r)),new u(function(){var p,c,l,s=[];return new d(function(){p=a.getEnumerator(),p.moveNext()&&(c=e(p.current()),l=n(c),s.push(t(p.current())))},function(){for(var o;!0==(o=p.moveNext())&&l===n(e(p.current()));)s.push(t(p.current()));if(0<s.length){var a=i?r(c,u.from(s)):r(c,s);return o?(c=e(p.current()),l=n(c),s=[t(p.current())]):s=[],this.yieldReturn(a)}return!1},function(){o.dispose(p)})})},u.prototype.buffer=function(e){var t=this;return new u(function(){var r;return new d(function(){r=t.getEnumerator()},function(){for(var t=[],n=0;r.moveNext();)if(t.push(r.current()),++n>=e)return this.yieldReturn(t);return!!(0<t.length)&&this.yieldReturn(t)},function(){o.dispose(r)})})},u.prototype.aggregate=function(e,t,r){return r=o.createLambda(r),r(this.scan(e,t,r).last())},u.prototype.average=function(e){e=o.createLambda(e);var t=0,r=0;return this.forEach(function(n){t+=e(n),++r}),t/r},u.prototype.count=function(e){e=null==e?r.True:o.createLambda(e);var t=0;return this.forEach(function(r,n){e(r,n)&&++t}),t},u.prototype.max=function(e){return null==e&&(e=r.Identity),this.select(e).aggregate(function(e,t){return e>t?e:t})},u.prototype.min=function(e){return null==e&&(e=r.Identity),this.select(e).aggregate(function(e,t){return e<t?e:t})},u.prototype.maxBy=function(e){return e=o.createLambda(e),this.aggregate(function(t,r){return e(t)>e(r)?t:r})},u.prototype.minBy=function(e){return e=o.createLambda(e),this.aggregate(function(t,r){return e(t)<e(r)?t:r})},u.prototype.sum=function(e){return null==e&&(e=r.Identity),this.select(e).aggregate(0,function(e,t){return e+t})},u.prototype.elementAt=function(e){var t,r=!1;if(this.forEach(function(n,o){if(o==e)return t=n,r=!0,!1}),!r)throw new Error("index is less than 0 or greater than or equal to the number of elements in source.");return t},u.prototype.elementAtOrDefault=function(e,t){void 0===t&&(t=null);var r,n=!1;return this.forEach(function(t,o){if(o==e)return r=t,n=!0,!1}),n?r:t},u.prototype.first=function(e){if(null!=e)return this.where(e).first();var t,r=!1;if(this.forEach(function(e){return t=e,r=!0,!1}),!r)throw new Error("first:No element satisfies the condition.");return t},u.prototype.firstOrDefault=function(e,t){if(void 0===t&&(t=null),null!=e)return this.where(e).firstOrDefault(null,t);var r,n=!1;return this.forEach(function(e){return r=e,n=!0,!1}),n?r:t},u.prototype.last=function(e){if(null!=e)return this.where(e).last();var t,r=!1;if(this.forEach(function(e){r=!0,t=e}),!r)throw new Error("last:No element satisfies the condition.");return t},u.prototype.lastOrDefault=function(e,t){if(void 0===t&&(t=null),null!=e)return this.where(e).lastOrDefault(null,t);var r,n=!1;return this.forEach(function(e){n=!0,r=e}),n?r:t},u.prototype.single=function(e){if(null!=e)return this.where(e).single();var t,r=!1;if(this.forEach(function(e){if(!r)r=!0,t=e;else throw new Error("single:sequence contains more than one element.")}),!r)throw new Error("single:No element satisfies the condition.");return t},u.prototype.singleOrDefault=function(e,t){if(void 0===t&&(t=null),null!=e)return this.where(e).singleOrDefault(null,t);var r,n=!1;return this.forEach(function(e){if(!n)n=!0,r=e;else throw new Error("single:sequence contains more than one element.")}),n?r:t},u.prototype.skip=function(e){var t=this;return new u(function(){var r,n=0;return new d(function(){for(r=t.getEnumerator();n++<e&&r.moveNext(););},function(){return!!r.moveNext()&&this.yieldReturn(r.current())},function(){o.dispose(r)})})},u.prototype.skipWhile=function(e){e=o.createLambda(e);var t=this;return new u(function(){var r,n=0,a=!1;return new d(function(){r=t.getEnumerator()},function(){for(;!a;)if(r.moveNext()){if(!e(r.current(),n++))return a=!0,this.yieldReturn(r.current());continue}else return!1;return!!r.moveNext()&&this.yieldReturn(r.current())},function(){o.dispose(r)})})},u.prototype.take=function(e){var t=this;return new u(function(){var r,n=0;return new d(function(){r=t.getEnumerator()},function(){return n++<e&&r.moveNext()&&this.yieldReturn(r.current())},function(){o.dispose(r)})})},u.prototype.takeWhile=function(e){e=o.createLambda(e);var t=this;return new u(function(){var r,n=0;return new d(function(){r=t.getEnumerator()},function(){return r.moveNext()&&e(r.current(),n++)&&this.yieldReturn(r.current())},function(){o.dispose(r)})})},u.prototype.takeExceptLast=function(e){null==e&&(e=1);var t=this;return new u(function(){if(0>=e)return t.getEnumerator();var r,n=[];return new d(function(){r=t.getEnumerator()},function(){for(;r.moveNext();){if(n.length==e)return n.push(r.current()),this.yieldReturn(n.shift());n.push(r.current())}return!1},function(){o.dispose(r)})})},u.prototype.takeFromLast=function(e){if(0>=e||null==e)return u.empty();var t=this;return new u(function(){var r,n,a=[];return new d(function(){r=t.getEnumerator()},function(){for(;r.moveNext();)a.length==e&&a.shift(),a.push(r.current());return null==n&&(n=u.from(a).getEnumerator()),!!n.moveNext()&&this.yieldReturn(n.current())},function(){o.dispose(n)})})},u.prototype.indexOf=function(e){var t=null;return typeof e===n.Function?this.forEach(function(r,n){if(e(r,n))return t=n,!1}):this.forEach(function(r,n){if(r===e)return t=n,!1}),null===t?-1:t},u.prototype.lastIndexOf=function(e){var t=-1;return typeof e===n.Function?this.forEach(function(r,n){e(r,n)&&(t=n)}):this.forEach(function(r,n){r===e&&(t=n)}),t},u.prototype.asEnumerable=function(){return u.from(this)},u.prototype.toArray=function(){var e=[];return this.forEach(function(t){e.push(t)}),e},u.prototype.toLookup=function(e,t,r){e=o.createLambda(e),t=o.createLambda(t),r=o.createLambda(r);var n=new f(r);return this.forEach(function(r){var o=e(r),a=t(r),d=n.get(o);void 0===d?n.add(o,[a]):d.push(a)}),new g(n)},u.prototype.toObject=function(e,t){e=o.createLambda(e),t=o.createLambda(t);var r={};return this.forEach(function(n){r[e(n)]=t(n)}),r},u.prototype.toDictionary=function(e,t,r){e=o.createLambda(e),t=o.createLambda(t),r=o.createLambda(r);var n=new f(r);return this.forEach(function(r){n.add(e(r),t(r))}),n},u.prototype.toJSONString=function(e,t){if(typeof JSON===n.Undefined||null==JSON.stringify)throw new Error("toJSONString can't find JSON.stringify. This works native JSON support Browser or include json2.js");return JSON.stringify(this.toArray(),e,t)},u.prototype.toJoinedString=function(e,t){return null==e&&(e=""),null==t&&(t=r.Identity),this.select(t).toArray().join(e)},u.prototype.doAction=function(e){var t=this;return e=o.createLambda(e),new u(function(){var r,n=0;return new d(function(){r=t.getEnumerator()},function(){return!!r.moveNext()&&(e(r.current(),n++),this.yieldReturn(r.current()))},function(){o.dispose(r)})})},u.prototype.forEach=function(e){e=o.createLambda(e);var t=0,r=this.getEnumerator();try{for(;r.moveNext()&&!(!1===e(r.current(),t++)););}finally{o.dispose(r)}},u.prototype.write=function(e,t){null==e&&(e=""),t=o.createLambda(t);var r=!0;this.forEach(function(n){r?r=!1:document.write(e),document.write(t(n))})},u.prototype.writeLine=function(e){e=o.createLambda(e),this.forEach(function(t){document.writeln(e(t)+"<br />")})},u.prototype.force=function(){var e=this.getEnumerator();try{for(;e.moveNext(););}finally{o.dispose(e)}},u.prototype.letBind=function(e){e=o.createLambda(e);var t=this;return new u(function(){var r;return new d(function(){r=u.from(e(t)).getEnumerator()},function(){return!!r.moveNext()&&this.yieldReturn(r.current())},function(){o.dispose(r)})})},u.prototype.share=function(){var e,t=this,n=!1;return new l(function(){return new d(function(){null==e&&(e=t.getEnumerator())},function(){if(n)throw new Error("enumerator is disposed");return!!e.moveNext()&&this.yieldReturn(e.current())},r.Blank)},function(){n=!0,o.dispose(e)})},u.prototype.memoize=function(){var e,t,n=this,a=!1;return new l(function(){var o=-1;return new d(function(){null==t&&(t=n.getEnumerator(),e=[])},function(){if(a)throw new Error("enumerator is disposed");return o++,e.length<=o?!!t.moveNext()&&this.yieldReturn(e[o]=t.current()):this.yieldReturn(e[o])},r.Blank)},function(){a=!0,o.dispose(t),e=null})},u.prototype.catchError=function(t){t=o.createLambda(t);var e=this;return new u(function(){var r;return new d(function(){r=e.getEnumerator()},function(){try{return!!r.moveNext()&&this.yieldReturn(r.current())}catch(r){return t(r),!1}},function(){o.dispose(r)})})},u.prototype.finallyAction=function(e){e=o.createLambda(e);var t=this;return new u(function(){var r;return new d(function(){r=t.getEnumerator()},function(){return!!r.moveNext()&&this.yieldReturn(r.current())},function(){try{o.dispose(r)}finally{e()}})})},u.prototype.log=function(e){return e=o.createLambda(e),this.doAction(function(t){typeof console!==n.Undefined&&console.log(e(t))})},u.prototype.trace=function(e,t){return null==e&&(e="Trace"),t=o.createLambda(t),this.doAction(function(r){typeof console!==n.Undefined&&console.log(e,t(r))})};var p=function(e,t,r,n){this.source=e,this.keySelector=o.createLambda(t),this.descending=r,this.parent=n};p.prototype=new u,p.prototype.createOrderedEnumerable=function(e,t){return new p(this.source,e,t,this)},p.prototype.thenBy=function(e){return this.createOrderedEnumerable(e,!1)},p.prototype.thenByDescending=function(e){return this.createOrderedEnumerable(e,!0)},p.prototype.getEnumerator=function(){var e,t,n=this,o=0;return new d(function(){e=[],t=[],n.source.forEach(function(r,n){e.push(r),t.push(n)});var r=c.create(n,null);r.GenerateKeys(e),t.sort(function(e,t){return r.compare(e,t)})},function(){return!!(o<t.length)&&this.yieldReturn(e[t[o++]])},r.Blank)};var c=function(e,t,r){this.keySelector=e,this.descending=t,this.child=r,this.keys=null};c.create=function(e,t){var r=new c(e.keySelector,e.descending,t);return null==e.parent?r:c.create(e.parent,r)},c.prototype.GenerateKeys=function(e){for(var t=e.length,r=this.keySelector,n=Array(t),o=0;o<t;o++)n[o]=r(e[o]);this.keys=n,null!=this.child&&this.child.GenerateKeys(e)},c.prototype.compare=function(e,t){var r=o.compare(this.keys[e],this.keys[t]);return 0==r?null==this.child?o.compare(e,t):this.child.compare(e,t):this.descending?-r:r};var l=function(e,t){this.dispose=t,u.call(this,e)};l.prototype=new u;var s=function(e){this.getSource=function(){return e}};s.prototype=new u,s.prototype.any=function(e){return null==e?0<this.getSource().length:u.prototype.any.apply(this,arguments)},s.prototype.count=function(e){return null==e?this.getSource().length:u.prototype.count.apply(this,arguments)},s.prototype.elementAt=function(e){var t=this.getSource();return 0<=e&&e<t.length?t[e]:u.prototype.elementAt.apply(this,arguments)},s.prototype.elementAtOrDefault=function(e,t){t===void 0&&(t=null);var r=this.getSource();return 0<=e&&e<r.length?r[e]:t},s.prototype.first=function(e){var t=this.getSource();return null==e&&0<t.length?t[0]:u.prototype.first.apply(this,arguments)},s.prototype.firstOrDefault=function(e,t){if(void 0===t&&(t=null),null!=e)return u.prototype.firstOrDefault.apply(this,arguments);var r=this.getSource();return 0<r.length?r[0]:t},s.prototype.last=function(e){var t=this.getSource();return null==e&&0<t.length?t[t.length-1]:u.prototype.last.apply(this,arguments)},s.prototype.lastOrDefault=function(e,t){if(void 0===t&&(t=null),null!=e)return u.prototype.lastOrDefault.apply(this,arguments);var r=this.getSource();return 0<r.length?r[r.length-1]:t},s.prototype.skip=function(e){var t=this.getSource();return new u(function(){var n;return new d(function(){n=0>e?0:e},function(){return!!(n<t.length)&&this.yieldReturn(t[n++])},r.Blank)})},s.prototype.takeExceptLast=function(e){return null==e&&(e=1),this.take(this.getSource().length-e)},s.prototype.takeFromLast=function(e){return this.skip(this.getSource().length-e)},s.prototype.reverse=function(){var e=this.getSource();return new u(function(){var t;return new d(function(){t=e.length},function(){return!!(0<t)&&this.yieldReturn(e[--t])},r.Blank)})},s.prototype.sequenceEqual=function(e,t){return(e instanceof s||e instanceof Array)&&null==t&&u.from(e).count()!=this.count()?!1:u.prototype.sequenceEqual.apply(this,arguments)},s.prototype.toJoinedString=function(e,t){var r=this.getSource();return null==t&&r instanceof Array?(null==e&&(e=""),r.join(e)):u.prototype.toJoinedString.apply(this,arguments)},s.prototype.getEnumerator=function(){var e=this.getSource(),t=-1;return{current:function(){return e[t]},moveNext:function(){return++t<e.length},dispose:r.Blank}};var m=function(e,t){this.prevSource=e,this.prevPredicate=t};m.prototype=new u,m.prototype.where=function(e){if(e=o.createLambda(e),1>=e.length){var t=this.prevPredicate,r=function(r){return t(r)&&e(r)};return new m(this.prevSource,r)}return u.prototype.where.call(this,e)},m.prototype.select=function(e){return e=o.createLambda(e),1>=e.length?new y(this.prevSource,this.prevPredicate,e):u.prototype.select.call(this,e)},m.prototype.getEnumerator=function(){var e,t=this.prevPredicate,r=this.prevSource;return new d(function(){e=r.getEnumerator()},function(){for(;e.moveNext();)if(t(e.current()))return this.yieldReturn(e.current());return!1},function(){o.dispose(e)})};var y=function(e,t,r){this.prevSource=e,this.prevPredicate=t,this.prevSelector=r};y.prototype=new u,y.prototype.where=function(e){return e=o.createLambda(e),1>=e.length?new m(this,e):u.prototype.where.call(this,e)},y.prototype.select=function(e){if(e=o.createLambda(e),1>=e.length){var t=this.prevSelector,r=function(r){return e(t(r))};return new y(this.prevSource,this.prevPredicate,r)}return u.prototype.select.call(this,e)},y.prototype.getEnumerator=function(){var e,t=this.prevPredicate,r=this.prevSelector,n=this.prevSource;return new d(function(){e=n.getEnumerator()},function(){for(;e.moveNext();)if(null==t||t(e.current()))return this.yieldReturn(r(e.current()));return!1},function(){o.dispose(e)})};var f=function(){var e=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t=function(e){return null===e?"null":void 0===e?"undefined":typeof e.toString===n.Function?e.toString():Object.prototype.toString.call(e)},o=function(e,t){this.key=e,this.value=t,this.prev=null,this.next=null},a=function(){this.first=null,this.last=null};a.prototype={addLast:function(e){null==this.last?this.first=this.last=e:(this.last.next=e,e.prev=this.last,this.last=e)},replace:function(e,t){null==e.prev?this.first=t:(e.prev.next=t,t.prev=e.prev),null==e.next?this.last=t:(e.next.prev=t,t.next=e.next)},remove:function(e){null==e.prev?this.first=e.next:e.prev.next=e.next,null==e.next?this.last=e.prev:e.next.prev=e.prev}};var i=function(e){this.countField=0,this.entryList=new a,this.buckets={},this.compareSelector=null==e?r.Identity:e};return i.prototype={add:function(r,n){var a=this.compareSelector(r),d=t(a),u=new o(r,n);if(e(this.buckets,d)){for(var p=this.buckets[d],c=0;c<p.length;c++)if(this.compareSelector(p[c].key)===a)return this.entryList.replace(p[c],u),void(p[c]=u);p.push(u)}else this.buckets[d]=[u];this.countField++,this.entryList.addLast(u)},get:function(r){var n=this.compareSelector(r),o=t(n);if(e(this.buckets,o))for(var a,d=this.buckets[o],u=0;u<d.length;u++)if(a=d[u],this.compareSelector(a.key)===n)return a.value},set:function(r,n){var a=this.compareSelector(r),d=t(a);if(e(this.buckets,d))for(var u=this.buckets[d],p=0;p<u.length;p++)if(this.compareSelector(u[p].key)===a){var i=new o(r,n);return this.entryList.replace(u[p],i),u[p]=i,!0}return!1},contains:function(r){var n=this.compareSelector(r),o=t(n);if(!e(this.buckets,o))return!1;for(var a=this.buckets[o],d=0;d<a.length;d++)if(this.compareSelector(a[d].key)===n)return!0;return!1},clear:function(){this.countField=0,this.buckets={},this.entryList=new a},remove:function(r){var n=this.compareSelector(r),o=t(n);if(e(this.buckets,o))for(var a=this.buckets[o],d=0;d<a.length;d++)if(this.compareSelector(a[d].key)===n)return this.entryList.remove(a[d]),a.splice(d,1),0==a.length&&delete this.buckets[o],void this.countField--},count:function(){return this.countField},toEnumerable:function(){var e=this;return new u(function(){var t;return new d(function(){t=e.entryList.first},function(){if(null!=t){var e={key:t.key,value:t.value};return t=t.next,this.yieldReturn(e)}return!1},r.Blank)})}},i}(),g=function(e){this.count=function(){return e.count()},this.get=function(t){return u.from(e.get(t))},this.contains=function(t){return e.contains(t)},this.toEnumerable=function(){return e.toEnumerable().select(function(e){return new h(e.key,e.value)})}},h=function(e,t){this.key=function(){return e},s.call(this,t)};h.prototype=new s,typeof define===n.Function&&define.amd?define("linq",[],function(){return u}):typeof module!==n.Undefined&&module.exports?module.exports=u:e.Enumerable=u})(this);