// require('./flight.js');
// add_controls.js

var chatInput = document.querySelector("#chatInput");
var chatOutput = document.querySelector("#chatOutput");
chatInput.addEventListener('keyup',handleChat);

function handleChat(evt){
    if (evt.keyCode == 13 && chatInput.value.trim() != "") {
        chatOutput.innerHTML += drone.name + ": " + chatInput.value.trim() + '\n';
        chatOutput.scrollTop = chatOutput.scrollHeight;
        drone.message = chatInput.value.trim();
        socket.send(drone);

        drone.message = null;
        chatInput.value = "";
    }
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
    if (displayMini) {
        displayMini = !displayMini;
        // hide the miniMap div
        miniDiv.style.display = "none";
    } else {
        displayMini = !displayMini;
        miniDiv.style.display = "block";
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
                    // "http://127.0.0.1:8080/Tiles/{z}/{x}/{y}.png"
                    // "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    // 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
                    "http://www.google.cn/maps/vt?lyrs=s@702&gl=cn&x={x}&y={y}&z={z}"
                ],
                'tileSize': 256
            }
        },
        "layers": [{
        'id': 'custom-tms',
        'type': 'raster',
        'source': 'custom-tms',
        'paint': {}
        }]
    },
    zoom: 2,
    center: [121.00, 31.0892]
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
    
})