// require('./flight.js');
// add_controls.js

var selectedDrone = null;
var chatInput = document.querySelector("#chatInput");
var chatOutput = document.querySelector("#chatOutput");
chatInput.addEventListener('keyup',handleChat);

function handleChat(evt){
    if (evt.keyCode == 13 && chatInput.value.trim() != "") {
        chatOutput.innerHTML += drone.name + ": " + chatInput.value.trim() + '\n';
        chatOutput.scrollTop = chatOutput.scrollHeight;
        drone.message = chatInput.value.trim();
        socket.send(drone);

        // pass copy lnglat.
        var lnglat = point.coordinates.concat();
        addPopup(drone.message, lnglat);
        drone.message = null;
        chatInput.value = "";
    }
}

if (Dashboard && drone) {
    dashboard = new Dashboard();
    dashboard.init(document.createElement("div")).bindObj(drone);
}

var help = true;

var helpBtn = document.querySelector("#help-btn");
var helpDiv = document.querySelector("#help");
var helpClose = document.querySelector("#close");

var displayMini = false;
var miniBtn = document.querySelector("#miniBtn");
var miniDiv = document.querySelector("#miniMap");

// close help
helpClose.addEventListener("click", function(){
    helpDiv.style.display = "none";
    help = false;
});

// toggle help
helpBtn.addEventListener("click", function() {
    if (help) {
        helpDiv.style.display = "none";
        help = false;
    } else {
        helpDiv.style.display = "block";
        help = true;
    }
})

miniBtn.addEventListener("click", function() {
    audio.src = "Asset/flight_board.wav";
    if (displayMini) {
        displayMini = !displayMini;
        // hide the miniMap div
        miniBtn.style.left = "10px";
        miniDiv.style.visibility = "hidden";
    } else {
        displayMini = !displayMini;
        miniBtn.style.left = "133px";
        miniDiv.style.visibility = "visible";
    }
});

miniMap = new mapboxgl.Map({
    container: 'miniMap',
    style: {
        "version": 8,
        "sprite": './Asset/sprite',
        "glyphs": "./{fontstack}/{range}.pbf",
        "sources": {
            "custom-tms": {   
                'type': 'raster',
                'tiles': [
                    "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}"
                ],
                'tileSize': 256
            },
        },
        "layers": [
            {
                'id': 'custom-tms',
                'type': 'raster',
                'source': 'custom-tms',
                'paint': {}
            },
        ]
    },
    zoom: 2,
    // center: [121.00, 31.0892]
});

miniMap.on('load', function() {
    miniMap.addSource('drone', {
        type: 'geojson',
        data: featureCol
    })
    miniMap.addSource('myDrone', {
        type: 'geojson',
        data: point
    })
    // var droneSource = map.getSource('drone');
    miniMap.addLayer({
        'id': 'drones',
        'type': 'circle',
        'source': 'drone',
        'paint': {
            "circle-radius": 4,
            "circle-color": "#fff",
            "circle-opacity": 0.7
        }
    });

    miniMap.addLayer({
        'id': 'drone',
        'type': 'circle',
        'source': 'myDrone',
        'paint': {
            "circle-radius": 5,
            "circle-color": "#f00",
            "circle-opacity": 0.8
        }
    });

    // add drone DIRECTION ARC!
    // miniMap.addLayer();
})

if(typeof myTween !=undefined)
    myTween.fps = 40;
// add Map Click to bind chosen drone to dashboard..hhh
map.on("mousemove", function(e) {
    var foundDrone = null, features = [];
    // this func return deep copy
    if (map.getSource('drone')) {
        features = map.queryRenderedFeatures(e.point, { layers: ['drone'] });   
    }
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    if (features.length) {
        var featureName = features[0].properties.name;
        var curFeature = findInFeatures(featureName);
        if (audio) {
            audio.src = "Asset/flight_click.mp3";
        }
        // clear last selectedDrone's style.
        if (selectedDrone && curFeature && selectedDrone.properties.name !== curFeature.properties.name) {
            setTimeout(function(){
                var lastFeature = findInFeatures(selectedDrone.properties.name);
                if (lastFeature) {
                    lastFeature.properties = selectedDrone.properties;
                }                
            }, 50);
        } else if (selectedDrone) {
            // The same one drone, do nothing.
            return;
        }
        // After clean the last selected..this backUp can be set new Value..
        // this selectedDrone is deep copy of map.queryRenderedFeatures[0]
        setTimeout(function() {
            selectedDrone = features[0];
            curFeature.properties.gradius = 26;
            curFeature.properties.gopacity = 0.6;
            foundDrone = findInDrones(featureName);
            if (foundDrone) {
                dashboard.bindObj(foundDrone);
            }
        }, 60) 
    }
});

// add Cloud Layer..
function bindClouds(map, clouds) {
    map.on('move', function(){
        // set Animation Paused true
        myTween.toggleAni(true);
        render(clouds);
        map.on('moveend', function(){
            // keep Animation
            myTween.toggleAni(false);
        });
    });
}

var img, initZoom = map.getZoom();
(function cloudInit() {
    var objNum = 10, canvasOverlay = null;
    canvasOverlay = createOverlay();
    canvasOverlay.style.opacity = 0.1;
    var clouds = rdObjs(objNum);
    bindClouds(map, clouds);
    img = new Image();
    img.onload = function() {
        myTween.get(clouds).to(rdObjs(objNum), 120000, render);
    }
    img.src = clouds[0].url;
})()

// random point objs with given number
function rdObjs(num) {
    var objs = [], index = 0;
    if (!mapCenter) return objs;
    for(var i=0;i<num;i++) {
        objs.push({
            name: "cloud" + i.toString(),
            lon: parseInt(((Math.random()*8)+mapCenter[0]-4).toFixed(2)),
            lat: parseInt(((Math.random()*4)+mapCenter[1]-2).toFixed(2)),
            url: "../Asset/images/cloud2.png",
        });
    }
    objs.push({
        name: "label" + i.toString(),
        lon: mapCenter[0],
        lat: mapCenter[1],
        text: "World of cloud created by Alex",
    });
    return objs;
}

/*
 * render cloud with 2d context
 */
function render(objs, fadeOut, fadeIn) {
    if (canvasOverlay) {
        if (fadeOut) canvasOverlay.style.opacity = 0;
        if (fadeIn) canvasOverlay.style.opacity = 0.6;
        // calc cloud display ratio...
        var pow = initZoom - map.getZoom();
        ratio = Math.pow(2, pow)*0.2;
        ctx = canvasOverlay.getContext("2d");
        ctx.fillStyle = "rgba(250,250,250,0.9)";
        ctx.font = "30px Verdana";
        ctx.clearRect(0,0,canvasOverlay.width, canvasOverlay.height);
        for (var i=0;i<objs.length;i++) {
            var x = objs[i]['lon'], y = objs[i]['lat'], url = objs[i]['url'], text = objs[i]['text'];
                pix = trans2pix(x, y);
            if (pix == null) continue;
            ctx.beginPath();
            ctx.drawImage(img, pix[0], pix[1], img.width/ratio, img.height/ratio);
            if (text) ctx.fillText(text, pix[0], pix[1]);
            ctx.fill();
            ctx.closePath();
        }
    }
}
