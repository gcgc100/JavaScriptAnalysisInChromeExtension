/*jshint browser:true*/

(function sendMsg2Background(){
    chrome.runtime.sendMessage({ module: 'content-scripts', action: 'installed' }, function(response) {
        if(response === null){
            window.setTimeout(function(){
                sendMsg2Background();
            }, 250);
        }
        else {
            var oneId = response.domInfo.one_id;
            if(oneId) {
                if(localStorage.getItem('FRAMEWORK_CHROME_EXT_ID_' + oneId) === null) {
                    if(!!window.chrome && response.domInfo.ext_id) {
                        localStorage.setItem('FRAMEWORK_CHROME_EXT_ID_' + oneId, response.domInfo.ext_id);
                    }
                }
                
                var sNode = document.createElement('section');
                sNode.setAttribute('style', 'display: none;');
                sNode.setAttribute('data-my' + 'start' + '-one', 'new-tab');
                for(var y in response.domInfo) {
                    sNode.setAttribute('data-' + y.replace(/[^a-z0-9]+/ig, '-'), response.domInfo[y] !== null ? response.domInfo[y] : '');
                }
                document.documentElement.insertBefore(sNode, null);
            }
        }
    });
}());