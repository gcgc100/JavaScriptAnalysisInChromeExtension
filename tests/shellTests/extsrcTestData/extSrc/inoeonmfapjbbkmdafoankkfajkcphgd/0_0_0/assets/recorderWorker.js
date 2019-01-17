/*License (MIT)

Copyright © 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of 
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
*/var sampleRate,recLength=0,recBuffersL=[],recBuffersR=[];this.onmessage=function(a){switch(a.data.command){case'init':init(a.data.config);break;case'record':record(a.data.buffer);break;case'exportWAV':exportWAV(a.data.type);break;case'exportMonoWAV':exportMonoWAV(a.data.type);break;case'getBuffers':getBuffers();break;case'clear':clear();}};function init(a){sampleRate=a.sampleRate}function record(a){recBuffersL.push(a[0]),recBuffersR.push(a[1]),recLength+=a[0].length}function exportWAV(a){var b=mergeBuffers(recBuffersL,recLength),c=mergeBuffers(recBuffersR,recLength),d=interleave(b,c),e=encodeWAV(d),f=new Blob([e],{type:a});this.postMessage(f)}function exportMonoWAV(a){var b=mergeBuffers(recBuffersL,recLength),c=encodeWAV(b,!0),d=new Blob([c],{type:a});this.postMessage(d)}function getBuffers(){var a=[];a.push(mergeBuffers(recBuffersL,recLength)),a.push(mergeBuffers(recBuffersR,recLength)),this.postMessage(a)}function clear(){recLength=0,recBuffersL=[],recBuffersR=[]}function mergeBuffers(a,b){for(var c=new Float32Array(b),d=0,e=0;e<a.length;e++)c.set(a[e],d),d+=a[e].length;return c}function interleave(a,b){for(var c=a.length+b.length,d=new Float32Array(c),e=0,f=0;e<c;)d[e++]=a[f],d[e++]=b[f],f++;return d}function interleaveForceMono(a){for(var b=a.length,c=new Float32Array(b),d=0,e=0;d<b;)c[d++]=0.25*(a[e++]+a[e++]+a[e++]+a[e++]);return c}function floatTo16BitPCM(a,b,c){for(var d,e=0;e<c.length;e++,b+=2)d=Math.max(-1,Math.min(1,c[e])),a.setInt16(b,0>d?32768*d:32767*d,!0)}function writeString(a,b,c){for(var d=0;d<c.length;d++)a.setUint8(b+d,c.charCodeAt(d))}function encodeWAV(a,b){var c=new ArrayBuffer(44+2*a.length),d=new DataView(c);return writeString(d,0,'RIFF'),d.setUint32(4,32+2*a.length,!0),writeString(d,8,'WAVE'),writeString(d,12,'fmt '),d.setUint32(16,16,!0),d.setUint16(20,1,!0),d.setUint16(22,b?1:2,!0),d.setUint32(24,sampleRate,!0),d.setUint32(28,2*sampleRate,!0),d.setUint16(32,2,!0),d.setUint16(34,16,!0),writeString(d,36,'data'),d.setUint32(40,2*a.length,!0),floatTo16BitPCM(d,44,a),d}