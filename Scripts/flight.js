// require('./drone.js');

// start speed generally about 0.5rad/h. speed range(0, 2)
var direction = 0, manual = false, speed = 0.01, locking = true;
// front-end drones pool.
var drones = [];

var drone = new Drone();
var point = {
    "type":"Point",
    "coordinates": [121.321,30.112]
};
drone.name = "";
drone.direction = direction;
drone.speed = speed;
drone.point = point;

drones.push(drone);
var featureCol = {
        "type": "FeatureCollection",
        "features": [
            {
              "type": "Feature",
              "geometry": point,
              "properties": {
                "name": drone.name,
                "gradius": 22,
                "gopacity": 0.5
              }
          }]
      };

var totalKill = 0, bulletTimer;
var statusBar = document.querySelector('#status');
var statsBar = document.querySelector('#totalkill');
var defeatedMsg = document.querySelector("#message");
var playerList = document.querySelector("#playerlist");
var audio = document.querySelector("#fireBgm");
var defeatedAudio = document.querySelector("#crashBgm");

// time for bullet fly.
var firingTime = 600;

function randomName() {
    return "Player" + (Math.random()*10000).toFixed(0);
}

var socket;
// config socket connection.
try {
    // locally test.. 192.168.1.107.  LAN test.
    // 127.0.0.1
    // locally test.. 10.103.14.66
    // deploy to Server use 123.206.201.245 !important
    socket = io.connect("http://123.206.201.245:3002");
    socket.on('open', function(){
        statusBar.innerText = "Connected to server..";
        var randName = randomName();
        while(!drone.name) {
            var askName = prompt("Name your drone with a special one", randName);
            if(askName && !findInDrones(askName)){
                if (drone) {
                    drone.name = askName;
                }
            }
        }
        
        // upload drone status to other client.
        window.setInterval(function() {
            socket.send(drone);
        }, 100);
    });

    socket.on('system', function(json) {
        var p = "";
        if(json.type === "welcome") {
            // welcome other client and render it in feautreCol
            statusBar.innerText = "system@" + json.time + ': welcom, ' + json.text.name;            
        } else if(json.type === "disconnect") {
            statusBar.innerText = "system@" + json.time + ': bye, ' + json.text;
            delInDrones(json.text);
            delInFeatureCol(json.text);
        }
    });

    // update specific droneStatus.
    socket.on("message", function(json) {
        if (json.type === "welcome" && json.text.name) {
            statusBar.innerText = "system@" + json.time + ': welcom, ' + json.text.name;
        } else if(json.type === "disconnect" && json.text.name) {
            statusBar.innerText = "system@" + json.time + ': bye, ' + json.text;
        } else if(json.type === "defeat") {
            statusBar.innerText = "system@" + json.time + ": " + json.author +
                "defeated " + json.text.name;
            // if myDrone defeated. reset the DroneStatus
            if (json.text.name == drone.name) {
                defeatedMsg.innerHTML = 'You are defeated by <span style="color:orange">'+ json.author + "</span> !\n" + "\n";
                defeatedMsg.style.display = "block";
                defeatedAudio.src = "Asset/crash.mp3";
                var curPlace = drone.point.coordinates.concat();
                var bornPlace = [121.321,30.112];
                locking = false;
                lockViewBtn.innerHTML = "<span>Lock</span>";
                speed = 0.001;
                setTimeout(function() {
                    map.flyTo({
                        center: bornPlace,
                        bearing: 0,
                        zoom: 10,
                        pitch: 60
                    });
                    drone.point.coordinates = bornPlace;
                    drone.life = true;
                }, 1500);
                
                setTimeout(function(){
                    defeatedMsg.style.display = "none";
                }, 4500);
                // fly2position(curPlace, bornPlace);
                
            } else {
                delInDrones(json.text.name);
                delInFeatureCol(json.text.name);
            }

        } else if(json.type === "message" && json.text.name === "敌机") {
            statusBar.innerText = "system@" + json.time + ': enemy found！' +
              json.text.coordinates[0] + ',' + json.text.coordinates[1];
            // new Drone()!!
            var robot = new Drone();
            var point = {
                "type":"Point",
                "coordinates": json.text.coordinates
            };
            robot.name = json.text.name;
            robot.direction = 0;
            robot.point = point;
            drones.push(robot);
            // 将敌机状态直接加入用于渲染的geojson对象
            var feature = {
                "type": "feature",
                "geometry": point,
                "properties": {
                    "name" : robot.name,
                    "direction": robot.direction,
                    "gradius": 18,
                    "gopacity": 0.4
                }
            };
            featureCol.features.push(feature);
        } else if (drone && json.text.name != drone.name 
            && json.text.message) {
            // display other's chat msg.
            if (chatOutput) {
                chatOutput.innerHTML += json.text.name + ": " + json.text.message + "\n";
            } else {
                console.error("can't find chatOutput div");
            }
        }
        // if drone info from server is not Me!! 
        else if (drone && json.text.name != drone.name) {
            // statusBar.innerText = "system@" + json.time + ': 收到其他用户战机位置';
            var droneName = json.text.name;
            var current_location = {
                "type":"Point",
                "coordinates": json.text.coordinates
            };
            var existed = false, j = 0, droneModelIndex = 0;
            // found in drones.. update status!
            var whichDrone = findInDrones(droneName);
            
            if (whichDrone) {
                // update the droneStatus in drones.
                updateDrone(whichDrone, json.text);

                if (whichDrone.firing && !whichDrone.bullet) {
                    whichDrone.fire();
                    console.warn('Multi client bullet created and ready2 render...');
                    setTimeout(function(){
                        whichDrone.firing = false;
                        whichDrone.bullet = null;
                    }, firingTime);
                }
            }

            // if found specific drone, update the status.
            var index = 0, droneIndex = 0, newStatus = {};
            featureCol.features.forEach(function(drone) {
                if (drone.properties.name == droneName) {
                    // found droneIndex.
                    droneIndex = index;
                    existed = true;
                }
                index += 1;
            });
            if (droneIndex > 0) {
                var drone2Update = featureCol.features[droneIndex];
                drone2Update.properties.direction = json.text.direction;
                drone2Update.geometry.coordinates = json.text.coordinates;
            }

            // if not found, add!
            if (!existed) {
                // new login drone.
                var tmpdrone = new Drone();
                tmpdrone.name = droneName;
                tmpdrone.direction = json.text.direction;
                tmpdrone.point = current_location;
                // push to drones !
                drones.push(tmpdrone);
                // add client drones status to featureCol for render.
                var feature = {
                    "type": "feature",
                    "geometry": tmpdrone.point,
                    "properties": {
                        "name" : tmpdrone.name,
                        "direction": tmpdrone.direction,
                        "gradius": 18,
                        "gopacity": 0.4
                    }
                };
                featureCol.features.push(feature);
            }
        } 
    });
}
catch(e) {
    console.log(e);
}

function findInDrones(name) {
    var droneIndex = -1;
    for (var i = 0; i < drones.length; i++) {
        if (drones[i].name == name) {
            droneIndex = i;
            return drones[i];
        }
    }
}

// delete Drone in drones by name
function delInDrones(name) {
    var droneIndex = -1;
    for (var i = 0; i < drones.length; i++) {
        if (drones[i].name == name) {
            droneIndex = i;
        }
    }
    drones.splice(droneIndex, 1);
    console.warn("Delete drone: " + name + " in drones.");
}

function delInFeatureCol(name) {
    var index = 0, damagedIndex =0;
    featureCol.features.forEach(function(feature) {
        if (feature.properties.name == name) {
            damagedIndex = index;
        }
        index += 1;
    });
    if (damagedIndex > 0) {
        // delete the damaged drone in this location!
        featureCol.features.splice(damagedIndex, 1);
    }
}

// update drone status..
function updateDrone(drone2Update, text) {
    drone2Update.point.coordinates[0] = text.coordinates[0];
    drone2Update.point.coordinates[1] = text.coordinates[1];
    drone2Update.direction = text.direction;
    drone2Update.firing = text.firing;
    drone2Update.life = text.life ? text.life: 0;
}

// smoothly move viewport 2 born place.  not Finished .
function fly2position(curCoords, targetCoords) {
    var duration = 3500, inter = 20, ratio = inter/duration;
    var dist = calcDist(curCoords, targetCoords);
    var realCoords = curCoords.concat();
    var direction = calcDirection(curCoords, targetCoords);
    var counter = 0;
    deadflyTimer = setInterval(function() {
        if (counter > 1/ratio) {
            defeatedMsg.style.display = "none";
            clearInterval(deadflyTimer);
            return;
        }
        realCoords[0] -= Math.sin(direction) * ratio * dist;
        realCoords[1] -= Math.cos(direction) * ratio * dist;
        map.setCenter(realCoords);
        counter += 1;
    }, inter);
}

// north is 0. east is Math.PI/2.  return dir in Rad.
function calcDirection(source, target) {
    var dir = Math.atan((target[0] - source[0])/(target[1] - source[1]));
    return dir;
}

// setPostion is to update Mydrone position.
function setPosition() {
    // direction in Rad. Generally, 1 Rad stands for 100km
    var current_rotate = map.getBearing();
    if (!manual && Math.random() > 0.95) {
        // direction += (Math.random() - 0.5) /5;
    }
    
    point.coordinates[0] += speed * Math.sin(direction) / 100;
    point.coordinates[1] += speed * Math.cos(direction) / 100;

    current_rotate = (-current_rotate) + direction * (180 / Math.PI);

    if (featureCol.features.length>0){
        featureCol.features[0].geometry = point;
        featureCol.features[0].properties.name = drone.name;
        featureCol.features[0].properties.rotate = current_rotate;
    }
    // update other drones status.
    updateDrones();
    map.getSource('drone').setData(featureCol);
    if (miniMap && miniMap.getSource("drone") && featureCol){
        miniMap.getSource("drone").setData(featureCol);
        miniMap.getSource("myDrone").setData(point);
    }
    // map.setLayoutProperty('drone', 'icon-rotate', current_rotate);

    
    if (window.locking) {
        if (miniMap) {
            miniMap.setCenter(point.coordinates);
        }
        map.setCenter(point.coordinates);
        // console.warn('calc current_rotate in deg: ' + current_rotate, " cur_drone_direction: "+ direction);
    }

    // sync Mydrone status..
    drone.direction = direction;
    drone.speed = speed;
    drone.point = point;
    // console.log("drone direction: " + drone.direction);
}

function easing(t) {
    return t * (2 - t);
}

// update non-ego drones status
function updateDrones() {
    var index = 0;

    for (var i = featureCol.features.length - 1; i > 0; i--) {
        var current_rotate = map.getBearing();
        var feature = featureCol.features[i];
        if (feature.properties.name === "敌机") {
            var enemySpeed = Math.random() * 0.05 + 0.01;
            // this is great!! which changes direction 5 times every 100 times updates !
            if (Math.random() > 0.95) {
                feature.properties.direction += (Math.random() - 0.5) /2;
            }
            feature.geometry.coordinates[0] += enemySpeed * Math.sin(feature.properties.direction) / 100;
            feature.geometry.coordinates[1] += enemySpeed * Math.cos(feature.properties.direction) / 100;
            current_rotate = (-current_rotate) + feature.properties.direction * (180 / Math.PI);
            feature.properties.rotate = current_rotate;
        } else {
            // 其他客户端飞机的坐标是在socket.on('message', func) 中更新了，这里只根据bearing(deg)校正显示方向
            current_rotate = (-current_rotate) + feature.properties.direction * (180 / Math.PI);
            feature.properties.rotate = current_rotate;
        }
    }

}

mapboxgl.accessToken = false;
var miniMap = null;
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
    "transition": {
        "duration": 2500,
        "delay": 0
    },
    // bearing: 45,
    pitch: 60,
    light: {
        'anchor':'viewport',
        'color':'white',
        'intensity':0.4
    },
    zoom: 10,
    center: [121.00, 31.0892]
});

function turnLeft() {
    direction -= 0.1;
    manual = true;
    // map.easeTo({
    //     bearing: map.getBearing() - 0.1 * (180 / Math.PI),
    //     easing: easing
    // });
}

function turnRight() {
    direction += 0.1;
    manual = true;
    // map.easeTo({
    //     bearing: map.getBearing() + 0.1 * (180 / Math.PI),
    //     easing: easing
    // });
}

function accelerate() {
    // limit the max speed to 2.8 ╭(╯^╰)╮!
    speed = Math.min(speed + 0.01, 2.8/map.getZoom());
        manual = true;
        if (arguments[0]) {
            arguments[0].preventDefault();
        }
}

function brake() {
    speed = Math.max(speed - 0.01, 0);
        manual = true;
        if (arguments[0]) {
            arguments[0].preventDefault();
        }
}

function fire() {
    console.warn('Firing!');
    if (drone.firing) {
        console.warn('Master, do not rush..slow down');
        return;
    }
    pointCopy = {"type": "Point", 'coordinates': [0, 0]};    
    audio.src = "Asset/fire.mp3";
    // firing, create bullet for drone.
    drone.fire();
    setTimeout(function(){
        drone.firing = false;
        drone.bullet = null;
    }, firingTime);

    drone.firing = true;
    // upload firestatus..
    socket.send(drone);
    if (arguments[0]) {
        arguments[0].preventDefault();
    }
}



// report current drones status every 1 seconds.
function updateStatusBar() {
    var drone_number = drones.length -1;
    statusBar.innerText = "system: "+ drone_number + " drones in battle field right now";
    // print player names in list
    playerList.innerHTML = "&nbsp;PlayerList:<br>";
    drones.forEach(function(thisDrone){
        if (thisDrone.name != "敌机") {
            playerList.innerHTML += "<a class='item'>" + thisDrone.name + "</a>";
        }
    });
}
window.setInterval(updateStatusBar, 4000);

/* 
 * 简化的碰撞检测.
 * coordinates: bulvar coordinates
 */
function testCrash(coordinates) {
    // all other drones! calc distance between bulvar and drones..
    // here we add zoom into calculation as a ratio.
    var zoom = map.getZoom();
    var distance, volume = 0.15/zoom, index = 0, damagedIndex = 0, hitted = false;
    featureCol.features.forEach(function(drone) {
        if (index > 0){
            distance = calcDist(coordinates, drone.geometry.coordinates);
            // if distance less than the Volume of drone, Damage it!
            if (distance < volume ) {
                damagedIndex = index;
                defeatedAudio.src = "Asset/crash.mp3";
                // defeatedMsg.innerHTML = 'You defeated <span style="color:orange">'+ drone.properties.name + "</span> !\n" + "\n";
                // defeatedMsg.style.display = "block";
                // setTimeout(function() {
                //     defeatedMsg.style.display = 'none';
                // }, 2500);
            }
        }
        index += 1;
    });

    if (damagedIndex > 0){
        console.warn('ready to remove damaged drone with index: '+ damagedIndex +
            "current zoom "+ zoom +', crash tolerance in Rad: '+ volume);
        totalKill += 1;
        statsBar.innerText = "Kill " + totalKill;

        // try to send damageDrone info to server. 
        // shallowCopy ?? explode on damagedFeature directly
        var damagedFeature = featureCol.features[damagedIndex];
        var damagedDrone = new Drone();
        damagedDrone.name = damagedFeature.properties.name;
        damagedDrone.point = damagedFeature.geometry;
        damagedDrone.life = false;
        if (socket) {
            socket.send(damagedDrone);
        }

        // explode effect on damagedFeature.
        explode(damagedFeature, 1500);
        
        setTimeout(function(){
            delInDrones(damagedDrone.name);
            featureCol.features.splice(damagedIndex, 1);
        }, 1500);

        hitted = true;
    }
    return hitted;
}
// source, target is coordinates. return distance in Rad.
function calcDist(source, target) {
    return  Math.sqrt(Math.pow((source[0] - target[0]), 2) + Math.pow((source[1] - target[1]), 2));
}

// bullet particles
var particles = {
    'type': "MultiPoint",
    'coordinates': []
};
var bulletSource;
// global unique bulletTimer
var bulletTimer = setInterval(renderBullet, 30);

// common function for render myDrone and other client's fire
function renderBullet() {
    var zoom = map.getZoom(), steplength = 0.01
    particles.coordinates = [];
    // if drone is firing, it's bullet coordiantes be calculated and rendered.
    for (var j = 0; j < drones.length; j++) {
        var hitted = false;
        if (drones[j].firing && drones[j].bullet) {

            drones[j].bullet.spoint.coordinates[0] += Math.sin(drones[j].bullet.direction)*steplength;
            drones[j].bullet.spoint.coordinates[1] += Math.cos(drones[j].bullet.direction)*steplength;
            var real_point = drones[j].bullet.spoint;

            // calculate MyDrone if it's bullet hit any enemy
            if (!hitted && drone.name && drones[j].name == drone.name){
                hitted = testCrash(real_point.coordinates);
            }
            particles.coordinates.push(real_point.coordinates);
            for (var i = 0; i < 9; i++) {
                var particle = [];
                // 0.01 is step length of bullet each frames..
                particle.push(real_point.coordinates[0] - Math.sin(drones[j].bullet.direction)*steplength*i/zoom);
                particle.push(real_point.coordinates[1] - Math.cos(drones[j].bullet.direction)*steplength*i/zoom);
                particles.coordinates.push(particle);
            }
        }
    }

    bulletSource = map.getSource('drone-target');
    if (bulletSource) {
        bulletSource.setData(particles);
    }
}

/*
 * calc surrounding particles based on center and direct.
 */
function calcParticles(centerPoint, direction) {
    var particles = [], numbers = 5, zoom = map.getZoom();
    // for (var i = 5; i >= 0; i--) {
    //     [i]
    // }
    // centerPoint[0]
}

// add control interaction or event listener.
document.body.addEventListener('keydown', function(e) {
    if (e.which === 37||e.which === 65) {
        turnLeft();
    }
    if (e.which === 39||e.which === 68) {
        turnRight();
    }
    if (e.which === 38 ||e.which === 87) { // faster
        accelerate(e);
    }
    if (e.which === 40||e.which === 83) { // slower
        brake(e);
    }
    if (e.which === 32) {
        fire(e);
    }
    if (e.which === 66) {
        // drone.bomb(e);
    }
    // console.log(e.which);
})

// Animate the glow color and radius before disappear..
function explode(droneObj, duration) {
    console.error("Exploding!")
    if (droneObj.properties.gradius > 18) return;
    var count = 0, explodeInter, steps = 40, inter = parseInt(duration/steps);    
    if (droneObj.properties && droneObj.properties.gradius && droneObj.properties.gopacity) {
        explodeInter = setInterval(function() {
            // enlarge radius and darker color.
            // droneObj.properties.gcolor = droneObj.properties.gcolor
            if (count > steps) {
                droneObj.properties.gradius = 18;
                droneObj.properties.gopacity = 0.5;
                clearInterval(explodeInter);
            } else {
                // console.error("Explode effect.. radius: " + droneObj.properties.gradius);
                droneObj.properties.gradius += 1;
                droneObj.properties.gopacity -= 0.01;
                count += 1;
            }
        }, inter);
    }
    return droneObj;
}

// sprite contain json and png.
map.on('load', function() {
    var nav = new mapboxgl.NavigationControl({position: 'top-left'}); // position is optional
    map.addControl(nav);
    map.addControl(new mapboxgl.GeolocateControl({position: 'bottom-left'}));

    map.addSource('drone', {
        type: 'geojson',
        data: featureCol
    });
    map.addSource('drone-target', {
        type: 'geojson',
        data: point
    })

    map.addLayer({
        'id' :'drone-glow-strong',
        'type': 'circle',
        'source': 'drone',
        'paint': {
            "circle-radius": {
                "property": "gradius",
                "type": "identity"
            },
            "circle-color": "#fff",
            "circle-opacity": {
                "property": "gopacity",
                "type": "identity"
            }
        }
    })
    map.addLayer({
        "id": "drone-glow",
        "type": "circle",
        "source": "drone",
        "paint": {
            "circle-radius": 40,
            "circle-color": "#fff",
            "circle-opacity": 0.1
        }
    });
    map.addLayer({
        "id": "drone",
        "type": "symbol",
        "source": "drone",
        'paint': {
            "text-halo-width": 2,
            // "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.7)",
            "text-color": "#222"
        },
        "layout": {
            "icon-image": "airport-15",
            "icon-size": 1.2,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-optional": true,
            "icon-rotate": {
                "property": "rotate",
                "type": "identity"
            },
            "text-field": "{name}",
            "text-font": ["Noto Sans Hans Light"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "text-optional": true
        }
    });
    map.addLayer({
        "id": "drone-fire",
        "type": "circle",
        "source": "drone-target",
        "paint": {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': 2,
            // color circles by ethnicity, using data-driven styles
            'circle-color': '#FFFD0C',
            'circle-opacity':0.8
        }
    });
    // map.addLayer({
    //     "id": "drone-fire2",
    //     "type": "circle",
    //     "source": "drone-target",
    //     "paint": {
    //         // make circles larger as the user zooms from z12 to z22
    //         'circle-radius': 6,
    //         // color circles by ethnicity, using data-driven styles
    //         'circle-color': '#f00',
    //         'circle-opacity':0.4
    //     }
    // });
    window.setInterval(setPosition, 40);
    
    // sourcetype: ['geojson', 'vector', 'raster', 'image', 'video']
    // use 'data' for geojson, 'url' and 'tiles' for vector|raster to set the datasource.
    map.addSource("locations", {
        "type":"geojson",
        // for geojson. set Opts.buffer for extent preCache, Opts.tolerance for simply,
        // Opts.cluster, clusterRadius
        "data": {
            "type": "FeatureCollection",
            "features": [{
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [121.2454, 31.2]
              },
              "properties": {
                "title": "上海",
                "icon": ""
              }
              }, {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [120.414, 29.976]
              },
              "properties": {
                "title": "浙江",
                "icon": ""
              }
              }]
          }
    });

    // layertype: ['fill', 'line', 'symbol', 'circle', 'raster']
    /**
     * paint layout.visibility, fill.fill-opacity, fill-color,  fill-pattern(Name of image in sprite).
     * symbol layout.symbol-placement(point, line), symbol-spacing, icon-image, icon-rotate
     * icon-offset, text-field({title}), paint.icon-color, icon-halo-color,
     */
    map.addLayer({
        'id': 'location',
        'type': 'symbol',
        'source': 'locations',
        'paint': {
            "text-halo-width": 2,
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.4)",
            "text-color": "#4466AA"
        },
        'layout': {
            "icon-image": "{icon}-15",
            "icon-size": 2,
            "text-field": "{title}",
            "text-font": ["Noto Sans Hans Light"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });

    map.addLayer({
        "id":'location-hover',
        "type": "symbol",
        'source': 'locations',
        'layout':{
            "text-field": "{title}",
            // Noto Sans Hans Light, Open Sans Regular
            "text-font": ["Noto Sans Hans Light"],
            "text-offset": [0.2, 0.8],
            "text-anchor": "top"
        },
        'paint': {},
        "filter": ["==", "title", ""]
    });

    // map.addSource('population', {
    //     type: 'vector',
    //     url: 'mapbox://examples.8fgz4egr'
    // });
    // map.addLayer({
    //     'id': 'population',
    //     'type': 'circle',
    //     'source': 'population',
    //     'source-layer': 'sf2010',
    //     'paint': {
    //         // make circles larger as the user zooms from z12 to z22
    //         'circle-radius': {
    //             'base': 1.75,
    //             'stops': [[12, 2], [22, 180]]
    //         },
    //         // color circles by ethnicity, using data-driven styles
    //         'circle-color': {
    //             property: 'ethnicity',
    //             type: 'categorical',
    //             stops: [
    //                 ['White', '#fbb03b'],
    //                 ['Black', '#223b53'],
    //                 ['Hispanic', '#e55e5e'],
    //                 ['Asian', '#3bb2d0'],
    //                 ['Other', '#ccc']]
    //         }
    //     }
    // });

    map.on("mousedown", function(e) {
        var features = map.queryRenderedFeatures(e.point, {layers: ["location"]});
        if (features.length) {
            map.setFilter("location-hover", ["==", "title", features[0].properties.title]);
        } else {
            map.setFilter("location-hover", ["==", "title", ""]);
        }
    });

    // PosAnimation

});


var lockViewBtn = document.querySelector("#lockview");
lockViewBtn.addEventListener('click', function(){
    if (window.locking) {
        window.locking = false;
        this.innerHTML = "<span>Lock</span>";
    } else {
        window.locking = true;
        this.innerHTML = "<span>Unlock</span>";
    }
}, false);

var strategy = {
    "up": accelerate,
    "down": brake,
    "left": turnLeft,
    "right": turnRight,
    "W": accelerate,
    "S": brake,
    "A": turnLeft,
    "D": turnRight
}

var controller = document.querySelector("#controller");
controller.addEventListener("click", function(evt){
    var btn = evt.target||evt.srcElement;
    var func;
    if (btn.id){
        func = strategy[btn.id];
    } else {
        func = strategy[btn.innerText];
    }
    console.log(btn.id);
    func(evt);
}, false);

var firebtn = document.querySelector("#fire");
firebtn.addEventListener('click', function(evt) {
    fire(evt);
})

// for Mobile device..
controller.addEventListener("touchstart", function(evt){
    var btn = evt.target||evt.srcElement;
    var func;
    if (btn.id){
        func = strategy[btn.id];
    } else {
        func = strategy[btn.innerText];
    }
    var touchInter = setInterval(func, 100);
    controller.addEventListener("touchend", function(){
        clearInterval(touchInter);
    });
    
}, false);

firebtn.addEventListener('touchstart', function(evt) {
    try {
        var touchInter = setInterval(fire, 500);
        firebtn.addEventListener('touchend', function(){
            clearInterval(touchInter);
        });
    } catch(e) {
        console.error(e.message);
    }
})

