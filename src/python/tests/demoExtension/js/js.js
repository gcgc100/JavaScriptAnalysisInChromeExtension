(function(){
    $(document).ready(function(){        //使用 ready() 来使函数在文档加载后是可用的：  
        chrome.extension.onConnect.addListener(function(cab) {    //监听是否连接
            cab.onMessage.addListener(function(msg) {      //监听是否收到消息
                if(msg.flag){
                    $("body").find("*").mouseenter(function(){   //鼠标指针进入（穿过）元素
                        event.stopPropagation();   //停止事件的传播
                        $(this).css({"box-shadow":"0 0 5px 5px #3AB2FF"});  //获得元素css属性并添加阴影
                        $(this).one("click", function(){      //确保鼠标点击只触发一次
                            event.stopPropagation();
                            $(this).hide();     //隐藏元素
                            return false;
                        })
                    });
                    $("body").find("*").mouseout(function(){    //鼠标指针从元素上移开后
                        event.stopPropagation();
                        $(this).css("box-shadow", "none");
                    })
                } else {
                    $("body").find("*").unbind("mouseenter").unbind("mouseout").unbind("click");  //移除被选元素的事件处理程序。
                }
            })
        })
        
    });
})();
