var flag = {   //开始结束的标志
    begin : 0,
    change : 0
};//当前未开始
setInterval(function(){        //按照指定的周期（以毫秒计）来调用函数或计算表达式。
    var pop = chrome.extension.getViews({type:'popup'})[0];    //获取popup界面
    if (pop) {
        console.log(pop.b);
    }
}, 1000)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {    //获取当前tab
    setInterval(function(){
        if (flag.change) {
            var cab = chrome.tabs.connect(tabId);   //建立通道，指定tabID
            cab.postMessage({ flag: flag.begin});   //利用通道发送消息
           
            flag.change = 0;
        }
    },100);
});
