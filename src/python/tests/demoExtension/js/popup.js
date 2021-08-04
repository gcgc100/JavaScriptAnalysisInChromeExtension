var b = "I'm popup";
var bg = chrome.extension.getBackgroundPage();   //获取background页面,popup与background通信
if(bg){
    $(".btn").click(function(){
        if(!bg.flag.begin) {   //选择未开始
            bg.flag.begin = 1;
            bg.flag.change = 1;
        } else {         //已选择
            bg.flag.begin = 0;
            bg.flag.change = 1;
        }
    })
} 
$(document).ready(function(){
    if(bg.flag.begin)
        $(".btn").html("选择结束");
    else
        $(".btn").html("请开始选择"); 
})