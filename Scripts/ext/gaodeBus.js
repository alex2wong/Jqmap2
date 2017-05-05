// utility to get gaode bus line geometry..
// author: alex2wong

function XHR() {
    this._xhr = new XMLHttpRequest();
    this._url = '';
    this._err = null;

    /*
        * XHR.send
        * @url: url response data
        * @err: function to handle err when get data
    */
    this.get = function (url, callback, err) {
        this._url = url;
        const tmpxhr = this._xhr;
        this._xhr.onreadystatechange = function () {
            if (tmpxhr.readyState === 4) {
                if (tmpxhr.status === 200) {
                    const responseText = tmpxhr.responseText;
                    if (callback) {
                        callback(responseText);
                    }
                    return responseText;
                }
                return err;
            }
            return err;
        };
        tmpxhr.open('GET', url);
        tmpxhr.send(null);
    };
}

function wrapHandler(ctx, fn, fn2) {
    return function(res) {
        fn.apply(ctx, [res]);
        if (fn2) fn2(ctx.features);
    }
}

function Fetcher(opt) {
    this.lngs = [];
    this.lats = [];
    this.baseUrl = "http://ditu.amap.com/service/poiInfo?query_type=TQUERY&pagesize=20&pagenum=1&qii=true&\
        cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true&zoom=17&city=310000&"
    this.queryString = "";
    this.key = "keywords";
    this.keywords = "";
    this.features = [];
    // "http://123.206.201.245:3002/proxy/";
    this.proxyAddr = opt.proxyAddr || "http://127.0.0.1:3002/proxy/";
}

Fetcher.prototype.setKeywords = function (value) {
    this.keywords = value;
    return this;
}

// get Gaode busline then add lineFeature to this.features
Fetcher.prototype.getBus = function(busName, callback) {
    if (busName.length < 1) {
        console.warn("use default value 937路 for busName");
        busName = "937路";
    }
    this.setKeywords(busName);
    // send ajax GET request..    
    var xhr = new XHR(), finalUrl = this.proxyAddr + "?proxyURI=" + this.baseUrl + this.key + "=" + this.keywords; 
    xhr.get(encodeURI(finalUrl), wrapHandler(this,this.json2lnglats,callback));
}

// get binary octen-stream resource by proxy...
Fetcher.prototype.getBinary = function(url, callback) {
    var xhr = new XHR(), finalUrl = this.proxyAddr + "?proxyURI=" + url;
    xhr.get(encodeURI(finalUrl), wrapHandler(this, callback));
}

// transfer xhr response JSON to lngs and lats array..
Fetcher.prototype.json2lnglats = function (content) {
    try {
        var resObj = JSON.parse(content);
        if ("data" in resObj && "busline_list" in resObj["data"]) {
            var buslines = resObj["data"]["busline_list"];
            var lngs = buslines[0]["xs"].split(",");
            var lats = buslines[0]["ys"].split(",");
            var resFeature = this.lnglat2line(lngs, lats);
            this.features = [];
            this.features.push(resFeature);
        } else {
            console.warn("#debug: can not find busline with your keyword:" + this.keywords);
        }
    } catch (error) {
        console.warn("#debug: can not find busline with your keyword:" + this.keywords);
    }
}

// change lngs,lats to lineFeature
Fetcher.prototype.lnglat2line = function (lngs, lats) {
    var lineFeature = new ol.Feature(), geometry = null;
    if (!geometry) {
        geometry = new ol.geom.LineString(null);
    }

    var start = [parseFloat(lngs[0]), parseFloat(lats[0])];
    var coordinates = [];
    for (var index = 0; index < lngs.length; index++) {
        var point = [parseFloat(lngs[index]), parseFloat(lats[index])];
        coordinates.push(point);
    }
    console.warn("This line has coordinates number: " + coordinates.length);
    geometry.setCoordinates(coordinates);
    lineFeature.setGeometry(geometry.clone().transform("EPSG:4326", "EPSG:3857"));
    return lineFeature;
}
