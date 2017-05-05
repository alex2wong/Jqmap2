/**
 * proxy to receive client CROSS ORIGIN request,
 * then request resource and response to client.
 */
var http = require("http");
var fs = require("fs");

var strategies = {
    "image": 1,
    "stream": 1,
    "pro": 1,
}

var Proxy = function (req, res) { 
    // just proxy the client request.
    (function() {
        console.log("receive client req : "+ req.query['proxyURI']);
        // this.keywords = req.queryString;
        var target = req.query['proxyURI'];
        for(var k in req.query) {
            if (k !== 'proxyURI') {
                target += "&" + k.trim() + "=" + req.query[k].trim();
            }
        }
        // thisPlace should first check localFile if exists, res localFile directly..
        http.get(target, function(response) {  
            console.log("Proxy got response: " + response.statusCode);
            var resContentType = response.headers["content-type"];
            res.setHeader("Content-Type", resContentType);
            var buffer = [];
            response.on('data', (chunk) => {
                // typeof chunk ?? Buffer?
                buffer.push(chunk);                
            });
            response.on('end', () => {
                // Buffer toString. 'ascii'/'base64'
                var buff = Buffer.concat(buffer);
                for(var k in strategies) {
                    if (resContentType.indexOf(k) > -1) {
                        // ready to save buffer to localFile..
                        try {
                            var ext = resContentType.split("/")[1];
                            // var fileName = encodeURIComponent(target.replace("/", "_")) + "." + ext;
                            var tmpArr = target.split("/");
                            var fileName = tmpArr[tmpArr.length-2] + "_" + tmpArr[tmpArr.length-1] + "." + ext;
                            var finalName = "./Asset/tiles/" + fileName;
                            fs.exists(finalName, function(exists) {
                                if (exists) {
                                    res.sendFile(finalName, {
                                        root: __dirname
                                    });
                                } else {
                                    fs.writeFileSync("./Asset/tiles/" + fileName, buff);
                                    res.sendFile(finalName, {
                                        root: __dirname
                                    });
                                }
                            });
                            
                            return;
                        } catch (error) {
                            console.error("proxyImage error.");
                            res.end("proxyImage error.");
                        }                        
                    }
                }
                res.end(buff.toString());
            });
        }).on('error', function(e) {  
            console.error("Proxy got error: " + e.message);
        });
    })()
}

module.exports = Proxy;
