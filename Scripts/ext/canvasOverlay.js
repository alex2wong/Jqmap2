// createOverlayer
function createOverlay(domElement) {
    var canvasContainer = document.querySelector(".mapboxgl-canvas-container"),
        mapboxCanvas = document.querySelector(".mapboxgl-canvas");
        if (domElement && domElement.tagName == "CANVAS") {
            canvasOverlay = domElement;
        } else {
            canvasOverlay = document.createElement("canvas");
        }
        canvasOverlay.style.position = "absolute";
        canvasOverlay.className = "overlay-canvas";
        canvasOverlay.width = parseInt(mapboxCanvas.style.width);
        canvasOverlay.height = parseInt(mapboxCanvas.style.height);
        canvasContainer.appendChild(canvasOverlay);
    return canvasOverlay;
}

function trans2pix(lng, lat) {
    if (map != undefined && map.project instanceof Function) {
        var lnglat = map.project(new mapboxgl.LngLat(
            lng, lat));
        var x = lnglat.x;
        var y = lnglat.y;
        return [x, y];
    }
    return null;
}

function _preSetCtx(context) {
  //默认值为source-over
    var prev = context.globalCompositeOperation;
    //只显示canvas上原图像的重叠部分 source-in, source, destination-in
    context.globalCompositeOperation = 'destination-in';
    //设置主canvas的绘制透明度
    context.globalAlpha = 0.95;
    //这一步目的是将canvas上的图像变的透明
    // context.fillStyle = "rgba(0,0,0,.95)";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    //在原图像上重叠新图像
    context.globalCompositeOperation = prev;
}
