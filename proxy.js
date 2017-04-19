/**
 * proxy to receive client CROSS ORIGIN request,
 * then request resource and response to client.
 */
var http = require("http");

var Proxy = function () {
    // just proxy the client request.
    this.get = function(req, res) {
        console.log("receive client req : "+ req);
        // this.keywords; 
        http.get(this.baseUrl + this.key + "=" + this.keywords, function(response) {  
            console.log("Proxy got response: " + response.statusCode);
            res.setHeader("Content-Type","application/json");
            response.on('data', function(data) {
                // what typeof data..?? Object||String                
                res.end(JSON.stringify(data));
            });
        }).on('error', function(e) {  
            console.error("Proxy got error: " + e.message);
        });
    }

    this.baseUrl = "http://ditu.amap.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&\
        cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true&zoom=17&city=310000&"
    this.queryString = "";
    this.key = "keywords";
    this.keywords = "937路";
}

module.exports = Proxy;
