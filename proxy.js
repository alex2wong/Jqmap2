/**
 * proxy to receive client CROSS ORIGIN request,
 * then request resource and response to client.
 */
var http = require("http");

var Proxy = function (req, res) { 

    this.baseUrl = "http://ditu.amap.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&\
        cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true&zoom=17&city=310000&"
    this.queryString = "";
    this.key = "keywords";
    this.keywords = "937路";
    let that = this;

    // just proxy the client request.
    (function() {
        console.log("receive client req : "+ req);
        // this.keywords = req.queryString;
        http.get(that.baseUrl + that.key + "=" + that.keywords, function(response) {  
            console.log("Proxy got response: " + response.statusCode);
            res.setHeader("Content-Type","application/json");
            let buffer = [];
            response.on('data', (chunk) => {
                // typeof chunk ?? Buffer?
                buffer.push(chunk);                
            });
            response.on('end', () => {
                let buff = Buffer.concat(buffer);
                // Buffer toString. 'ascii'/'base64'
                res.end(buff.toString());
            })
        }).on('error', function(e) {  
            console.error("Proxy got error: " + e.message);
        });
    })()
}

module.exports = Proxy;
