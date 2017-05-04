/**
 * proxy to receive client CROSS ORIGIN request,
 * then request resource and response to client.
 */
var http = require("http");

var Proxy = function (req, res) { 
    // just proxy the client request.
    (function() {
        console.log("receive client req : "+ req);
        // this.keywords = req.queryString;
        var target = req.query['proxyURI'];
        for(var k in req.query) {
            if (k !== 'proxyURI') {
                target += "&" + k.trim() + "=" + req.query[k].trim();
            }
        }
        http.get(target, function(response) {  
            console.log("Proxy got response: " + response.statusCode);
            res.setHeader("Content-Type","application/json");
            var buffer = [];
            response.on('data', (chunk) => {
                // typeof chunk ?? Buffer?
                buffer.push(chunk);                
            });
            response.on('end', () => {
                // Buffer toString. 'ascii'/'base64'
                var buff = Buffer.concat(buffer);
                res.end(buff.toString());
            })
        }).on('error', function(e) {  
            console.error("Proxy got error: " + e.message);
        });
    })()
}

module.exports = Proxy;
