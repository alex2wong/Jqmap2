// routelayer

function RouteLayer(opt.coords, opt.map) {
    this.coords = opt.coords || [];
    this.segs = [];
    this.map = opt.map;
    this.length = 0;
}

RouteLayer.prototype.setMap = function (map){
    this.map = map;
    return this;
}

RouteLayer.prototype.getNodes = function (){
    return this.coords;
}

/*
* generate tempPoints for each seg by current mapZoom.
* each zoomend, generate new tempPoint !! 
*/
RouteLayer.prototype.generateArr = function (pixel){
    // forEach this.segs, calc how many tempPoints would be generate by total length..

    if (pixel) {
        // return projected pixel coords of each tempPoints..
    } else {
        // return geo coords of tempPoints
    }
}

/*
 * render with 2d context, render objs with lon, lat props.
 * Thought ! render func should be included in canvasLayer Class, with trans2pix func..
 */
RouteLayer.prototype.render = function(objs) {
    if (canvasOverlay && _preSetCtx && trans2pix) {        
        ctx = canvasOverlay.getContext("2d");
        // ctx.clearRect(0,0,canv.width, canv.height);
        _preSetCtx(ctx);
        ctx.save();
        ctx.fillStyle = "rgba(20,200,240,.6)";
        // ctx.fillRect(0,0,canv.width, canv.height);
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(255,255,255,.4)";
        // start to render Line..
        ctx.beginPath();
        for(var i=0;i<objs.length;i++) {
            var x = objs[i]['lon'], y = objs[i]['lat'], radius = objs[i]['radius'] || 2;
                pix = this.project(x, y);
            if (pix == null) continue;
            ctx.fillStyle = objs[i]['color'];
            
            ctx.arc(pix[0], pix[1], radius, 0, Math.PI*2);
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();
    }
}

RouteLayer.prototype.project = function(lon, lat) {
    var x = 0, y = 0;
    if (this.map != undefined && this.map.project instanceof Function) {
        var lnglat = this.map.project(new mapboxgl.LngLat(
            lng, lat));
        var x = lnglat.x;
        var y = lnglat.y;
        return [x, y];
    }
    return null;
}
