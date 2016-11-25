var tileSize,
    everyOther = true,
    drawElev = false;

L.mapbox.accessToken = 'pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';

var map = L.map('map_canvas', {
    worldCopyJump: true,
    doubleClickZoom: false,
    center: [38, -120],
    zoom: 13,
    scrollWheelZoom: false
    });

var hash = L.hash(map);

L.mapbox.tileLayer('mapbox.outdoors').addTo(map);

var elevTiles = new L.TileLayer.Canvas({
    unloadInvisibleTiles:true,
    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});


elevTiles.on('tileunload', function(e){
    //Send tile unload data to elevWorker to delete un-needed pixel data
    elevWorker.postMessage({'data':e.tile._tilePoint.id,'type':'tileunload'});
});

var elevWorker = new Worker('js/imagedata.js');

var tileContextsElev = {};

var locs = location.search.split('?');

if (locs.length > 1) {
    locs = locs[1].split('=');
} else {
    locs = ['no']
}

if (locs[0] == 'elev') {
    elev_filter = parseInt(locs[1]);
} else {
    elev_filter = 10;
}

elevWorker.postMessage({
    data: elev_filter,
    type:'setfilter'}
);

elevTiles.drawTile = function (canvas, tile, zoom) {
    tileSize = this.options.tileSize;
    
    var context = canvas.getContext('2d'),
        imageObj = new Image(),
        tileUID = ''+zoom+'/'+tile.x+'/'+tile.y;

    var drawContext = canvas.getContext('2d');
        
    // To access / delete elevTiles later
    tile.id = tileUID;

    tileContextsElev[tileUID] = drawContext;
    
    imageObj.onload = function() {
        // Draw Image Tile
        context.drawImage(imageObj, 0, 0);

        // Get Image Data
        var imageData = context.getImageData(0, 0, tileSize, tileSize);

        elevWorker.postMessage({
            data:{
                tileUID:tileUID,
                tileSize:tileSize,
                array:imageData.data,
                drawElev: drawElev
            },
                type:'tiledata'},
            [imageData.data.buffer]);
    };

    // Source of image tile
    imageObj.crossOrigin = 'Anonymous';
    imageObj.src = 'https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/'+zoom+'/'+tile.x+'/'+tile.y+'.pngraw?access_token=pk.eyJ1IjoibWF0dCIsImEiOiJTUHZkajU0In0.oB-OGTMFtpkga8vC48HjIg';     
    
};

elevWorker.addEventListener('message', function(response) {
    if (response.data.type === 'tiledata') {
        var dispData = tileContextsElev[response.data.data.tileUID].createImageData(tileSize,tileSize);
        dispData.data.set(response.data.data.array);
        tileContextsElev[response.data.data.tileUID].putImageData(dispData,0,0);
    }
}, false);

elevTiles.addTo(map);


map.touchZoom.disable();
map.doubleClickZoom.disable();


function formatElev(elev) {
    return Math.round(elev)+' m';
}
function formatTemp(temp) {
    return Math.round(temp)+'° f';
}

