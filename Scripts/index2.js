mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhbmd5aXhpdSIsImEiOiI2WjVWR1hFIn0.1P90Q-tkbHS38BvnrhTI6w';
var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/mapbox/light-v9',
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
                    "http://www.google.cn/maps/vt?lyrs=s@702&gl=cn&x={x}&y={y}&z={z}"
                    // 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0'
                    // 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=' + mapboxgl.accessToken
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
    bearing: -0,
    pitch: 0,
    interactive: false,
    zoom: 10,
    center: [120.447303, 29.753574]
});

// pixels the map pans when the up or down arrow is clicked
var deltaDistance = 1, MAXSPEED = 50, FIRINGTIME = 400, steplength = 0.01;
var droneView = document.querySelector("#drone");
var crashBgm = document.querySelector("#crashBgm");
// degrees the map rotates when the left or right arrow is clicked
var deltaDegrees = 15;
var dronePoint = map.getCenter();
var droneDirection = map.getBearing();

// for display Bullets
var particles = {
    'type': "MultiPoint",
    'coordinates': []
};
var bulletCoords;

var firing = false;

function easing(t) {
    return t * (2 - t);
}

function mainRender() {
    map.panBy([0, -deltaDistance], {
                    easing: easing
    });

    updateDronefromMap();
    renderBullet();
}

function updateDronefromMap() {
    dronePoint = map.getCenter();
    // droneDirection = map.getBearing();
}

function updateMapfromDrone() {

}

function renderBullet() {
    // calculate var particles from mapCenter to destination.
    particles.coordinates = [];
    
    if (bulletCoords && bulletCoords instanceof Array) {
        bulletCoords[0] += Math.sin(droneDirection)*steplength;
        bulletCoords[1] += Math.cos(droneDirection)*steplength;
    } else {
        return;
    }
    var real_point = bulletCoords;
    particles.coordinates.push(real_point);

    for (var i = 0; i < 19; i++) {
        var particle = [];
        // 0.02 is step length of bullet each frames..
        particle.push(real_point[0] - Math.sin(droneDirection)*steplength*i*0.1);
        particle.push(real_point[1] - Math.cos(droneDirection)*steplength*i*0.1);
        particles.coordinates.push(particle);
    }

    bulletSource = map.getSource("drone-target")
    if (bulletSource) {
        bulletSource.setData(particles);
    }
}

function releaseRotate() {
    droneView.style.transform = "rotateZ(0deg)";
}

function viewRotateUp() {
    droneView.style.transform = "rotateX(25deg)";
    console.warn("rotateX(15deg)");
    // setTimeout(releaseRotate, 500);
}

function viewRotateBrake() {
    droneView.style.transform = "rotateX(-20deg)";
    console.warn("rotateX(-10deg)");
    // setTimeout(releaseRotate, 500);
}

function viewRotateLeft() {
    droneView.style.transform = "rotateZ(-4deg)";
    // setTimeout(releaseRotate, 500);
}

function viewRotateRight() {
    droneView.style.transform = "rotateZ(2deg)";
    // setTimeout(releaseRotate, 500);
}

function fire() {
    if (!firing) {
        droneDirection = map.getBearing();
        droneDirection = (droneDirection * Math.PI)/180.0 - 0.15;
        firing = true;
        //// test Pass pixel to Mapbox.. wanna transform to lngLat
        // map.fire("doubleclick", {
        //     'top': droneView.offsetTop,
        //     'left': droneView.offsetLeft + 150
        // });

        // transform dronePixel to LngLat.
        bulletCoords = pixel2Lnglat();

        //// create bullet from ViewCenter..
        // bulletCoords = [];
        // bulletCoords.push(map.getCenter().lng);
        // bulletCoords.push(map.getCenter().lat);

        console.warn("Firing....Direction: " + droneDirection, 
            " Fire from: " + bulletCoords[0], bulletCoords[1]);
                
        setTimeout(function () {
            firing = false;
            bulletCoords = null;
        }, FIRINGTIME);
        crashBgm.src = '../Asset/fire2.mp3';
    }
}

setInterval(mainRender, 20);

droneView.addEventListener("mousemove", function(e){
    // wanna pass event to Map!! drill Down
    // e.preventDefault();
    
});

// calculate MapLnglat from Drone in Screen. Must Consider Pitch this circumstance !!!
function pixel2Lnglat() {
    var droneLnglat = [];
    var pitch = map.getPitch()*Math.PI/180;
    var mapDiv = map.getContainer();
    var xratio = (droneView.offsetLeft + 150)/parseInt(getComputedStyle(mapDiv).width);
    var yratio = 1 - (droneView.offsetTop)/parseInt(getComputedStyle(mapDiv).height);
    var bounds = map.getBounds();
    if (bounds._sw && bounds._ne) {
        console.warn("xratio is what: " + xratio, "yratio is: " + yratio);
        droneLnglat.push(bounds._sw.lng + xratio * (bounds._ne.lng - bounds._sw.lng)); 
        // droneLnglat.push(map.getCenter().lng);  Math.sin(pitch) *
        droneLnglat.push(bounds._sw.lat + yratio * (bounds._ne.lat - bounds._sw.lat)); 
    }
    return droneLnglat;
}

// map.on("mousemove", function(e){
//     if (!bulletCoords) {
//         // ready to get bulletCoords from drone Head Pixel.
//         bulletCoords = [];
//         bulletCoords.push(e.lngLat.lng);
//         bulletCoords.push(e.lngLat.lat);
//         console.log("firing pixel : " + e.point.x, e.point.y);
//         console.log("firing lnglat : " + e.lngLat.lng, e.lngLat.lat);
//     }
// });

map.on('load', function () {
    var nav = new mapboxgl.NavigationControl({position: 'top-left'}); // position is optional
    map.addControl(nav);
    // map.addControl(new mapboxgl.GeolocateControl({position: 'bottom-left'}));

    map.getCanvas().focus();
    console.warn("Flight control ready...");
    map.getCanvas().addEventListener('keydown', function(e) {
            e.preventDefault();
            if (e.which === 38) { // up
                if (deltaDistance < MAXSPEED) {
                    deltaDistance += 0.2;
                    viewRotateUp();
                } else {
                    console.warn("Has reached MAXSPEED...");
                }
                
            } else if (e.which === 40) { // down
                if (deltaDistance > 2) {
                    deltaDistance -= 0.2;
                    viewRotateBrake();
                }
                
            } else if (e.which === 37) { // left
                map.easeTo({
                    bearing: map.getBearing() - deltaDegrees,
                    easing: easing
                });
                viewRotateLeft();
            } else if (e.which === 39) { // right
                map.easeTo({
                    bearing: map.getBearing() + deltaDegrees,
                    easing: easing
                });
                viewRotateRight();
            } else if (e.which === 32) {
                fire();
            }
        }, true);

        map.addSource('drone-target', {
            type: 'geojson',
            data: particles
        });

        map.addLayer({
            "id": "drone-fire-glow",
            "type": "circle",
            "source": "drone-target",
            "paint": {
                // make circles larger as the user zooms from z12 to z22
                'circle-radius': 2,
                // color circles by ethnicity, using data-driven styles
                'circle-color': '#FFF',
                'circle-opacity':0.5
            }
        });

        map.addLayer({
            "id": "drone-fire",
            "type": "circle",
            "source": "drone-target",
            "paint": {
                // make circles larger as the user zooms from z12 to z22
                'circle-radius': 1,
                // color circles by ethnicity, using data-driven styles
                'circle-color': '#FEEE11',
                'circle-opacity':0.8
            }
        });

    // map.addSource('height',{
    //     type: 'raster',
    //     tiles: 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=' + mapboxgl.accessToken
    // });
    // map.addLayer({
    //     'id': 'heightLayer',
    //     'type': 'raster',
    //     'source': 'height'
    // });

});
