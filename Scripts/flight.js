
// start speed generally about 0.5rad/h. speed range(0, 2)
var direction = 0, manual = false, speed = 0.01, locking = true;
// front-end drones pool.
var drones = [];

var drone = new Drone();
var point = {
    "type":"Point",
    "coordinates": [121.321,30.112]
};
drone.name = "无名氏"
drone.direction = direction;
drone.speed = speed;
drone.point = point;

let featureCol = {
        "type": "FeatureCollection",
        "features": [
            {
              "type": "Feature",
              "geometry": point,
              "properties": {
                "name": drone.name
              }
          }]
      };

var totalKill = 0;
var statusBar = document.querySelector('#status');
var statsBar = document.querySelector('#totalkill');

// config socket connection.
try {
    var socket = io.connect("http://127.0.0.1:3002");
    socket.on('open', function(){
        statusBar.innerText = "已经连上服务器..";
        var askName = prompt("来，取个名字", "");
        if(askName){
            drone.name = askName;
        }
        socket.send(drone);
    });

    // socket.on('system', function(json) {
    //     var p = "";
    //     if(json.type === "welcome") {
    //         statusBar.innerText = "system@" + json.time + ': Welcome' + json.text;
    //     } else if(json.type === "disconnect") {
    //         statusBar.innerText = "system@" + json.time + ': Bye' + json.text;
    //     } else if(json.type === "message" && json.text.name === "敌机") {
    //         statusBar.innerText = "system@" + json.time + ': 发现敌机！！位置 ' +
    //          json.text.coordinates[0] + ',' + json.text.coordinates[1];
    //     }
    // });

    // update specific droneStatus.
    socket.on("message", function(json) {
        console.log("received message @"+ json.time);
        if (json.type === "welcome" && json.text.name) {
            statusBar.innerText = "system@" + json.time + ': Welcome' + json.text.name;
        } else if(json.type === "disconnect" && json.text.name) {
            statusBar.innerText = "system@" + json.time + ': Bye' + json.text;
        } else if(json.type === "message" && json.text.name === "敌机") {
            statusBar.innerText = "system@" + json.time + ': 发现敌机！' +
              json.text.coordinates[0] + ',' + json.text.coordinates[1];
            // new Drone()!!
            let robot = new Drone();
            let point = {
                "type":"Point",
                "coordinates": json.text.coordinates
            };
            robot.name = json.text.name;
            robot.direction = 0;
            robot.point = point;
            drones.push(robot);
            // 将敌机状态直接加入用于渲染的geojson对象
            let feature = {
                "type": "feature",
                "geometry": point,
                "properties": {
                    "name" : robot.name,
                    "direction": robot.direction
                }
            };
            featureCol.features.push(feature);
        }
        // if drone info from server is not Me!! 
        else if (json.text.name != drone.name) {
            statusBar.innerText = "system@" + json.time + ': 收到其他用户战机位置';
            let droneName = json.text.name;
            let current_location = {
                "type":"Point",
                "coordinates": json.text.coordinates
            };
            let existed = false;
            drones.forEach((drone) => {
                // find existed drone, sync this drone Status!!
                if (drone.name == droneName) {
                    drone.direction = json.text.direction;
                    drone.point = current_location;
                    existed = true;
                }
            });
            if (!existed) {
                // new login drone.
                let drone = new Drone();
                drone.name = droneName;
                drone.direction = json.text.direction;
                drone.point = current_location;
                // push to drones !
                drones.push(drone);
            }
        }
    });
}
catch(e) {
    console.log(e);
}

// setPostion is to update Mydrone position.
function setPosition() {
    // direction in Rad. Generally, 1 Rad stands for 100km
    let current_rotate = map.getBearing();
    
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
    // map.setLayoutProperty('drone', 'icon-rotate', current_rotate);

    if (!manual && Math.random() > 0.95) {
        direction += (Math.random() - 0.5) /5;
    }
    if (window.locking) {
        map.setCenter(point.coordinates);
    }

    // sync Mydrone status..
    drone.direction = direction;
    drone.speed = speed;
    drone.point = point;
    // console.log("drone direction: " + drone.direction);
}

// update non-ego drones status
function updateDrones() {
    let index = 0;
    let current_rotate = map.getBearing();

    featureCol.features.forEach((feature) => {
        // 跳过本客户端所操作的飞机
        if (index > 0){
            let enemySpeed = Math.random() * 0.05 + 0.01;
            // this is great!! which changes direction 5 times every 100 times updates !
            if (Math.random() > 0.95) {
                feature.properties.direction += (Math.random() - 0.5) /2;
            }
            feature.geometry.coordinates[0] += enemySpeed * Math.sin(feature.properties.direction) / 100;
            feature.geometry.coordinates[1] += enemySpeed * Math.cos(feature.properties.direction) / 100;
            current_rotate = (-current_rotate) + feature.properties.direction * (180 / Math.PI);
            feature.properties.rotate = current_rotate;
        }
        
        // map.setLayoutProperty('drone', 'icon-rotate', current_rotate);      
        
        index += 1;
    });
}

mapboxgl.accessToken = false;
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
                    "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        "duration": 400,
        "delay": 0
    },
    // bearing: 45,
    pitch: 30,
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
}

function turnRight() {
    direction += 0.1;
        manual = true;
}

function accelerate(e) {
    speed = Math.min(speed + 0.01, 1);
        manual = true;
        e.preventDefault();
}

function brake(e) {
    speed = Math.max(speed - 0.01, 0);
        manual = true;
        e.preventDefault();
}

function fire(e) {
    var target = {}, pointCopy = {"type": "Point", 'coordinates': [0, 0]};
    var audio = document.querySelector("#fireBgm");
    audio.src = "Asset/fire.mp3";
    target = drone.fire();
    pointCopy.coordinates[0] = drone.point.coordinates[0];
    pointCopy.coordinates[1] = drone.point.coordinates[1];
    renderBullet(pointCopy, target, drone.direction, 400);
        e.preventDefault();
}

// report current drones status every 1 seconds.
function updateStatusBar() {
    let drone_number = featureCol.features.length -1;
    statusBar.innerText = "system: 目前战场中有敌机"+ drone_number + "架";
}
window.setInterval(updateStatusBar, 2000);

/* 
 * 简化的碰撞检测.
 * coordinates: bullet coordinates
 */
function testCrash(coordinates) {
    // all other drones! calc distance between bullet and drones..
    // here we add zoom into calculation as a ratio.
    let zoom = map.getZoom();
    let distance, volume = 0.2/zoom, index = 0, damagedIndex = 0, hitted = false;
    featureCol.features.forEach((drone) => {
        if (index > 0){
            distance = calcDist(coordinates, drone.geometry.coordinates);
            // if distance less than the Volume of drone, Damage it!
            if (distance < volume) {
                damagedIndex = index;
                statusBar.innerText = "system: 厉害！你击中第"+ damagedIndex +'号敌机！';
            }
        }
        index += 1;
    });

    if (damagedIndex > 0){
        console.warn('ready to remove damaged drone with index: '+ damagedIndex +
            "current zoom "+ zoom +', crash tolerance in Rad: '+ volume);
        totalKill += 1;
        statsBar.innerText = "击" + totalKill + "架"; 
        featureCol.features.splice(damagedIndex, 1);
        hitted = true;
    }
    return hitted;
}
// source, target is coordinates. return distance in Rad.
function calcDist(source, target) {
    return  Math.sqrt(Math.pow((source[0] - target[0]), 2) + Math.pow((source[1] - target[1]), 2));
}

function renderBullet(start, target, direction, duration) {
    // target is geojson POINT, add Temp point in layer.. 
    var interval = 20, ratio = interval/duration, real_point = start, range = 0.4, count = 0, hitted = false;
    if (target.coordinates) {
        var targetSource = map.getSource('drone-target');
        window.setInterval(function(){
            if (count > duration/interval) {

            } else {
                real_point.coordinates[0] += Math.sin(direction)*ratio*range;
                real_point.coordinates[1] += Math.cos(direction)*ratio*range;
                targetSource.setData(real_point);
                // test
                if (!hitted){
                    hitted = testCrash(real_point.coordinates);
                }
                count += 1;
            }
        }, interval);
    } else {
        console.log('something wrong with args');
    }
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
        drone.bomb(e);
    }
    // console.log(e.which);
})



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
            "circle-radius": 18,
            "circle-color": "#fff",
            "circle-opacity": 0.5
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
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.4)",
            "text-color": "#4466AA"
        },
        "layout": {
            "icon-image": "airport-15",
            "icon-rotate": {
                "property": "rotate",
                "type": "identity"
            },
            "text-field": "{name}",
            "text-font": ["Noto Sans Hans Light"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });
    map.addLayer({
        "id": "drone-fire",
        "type": "circle",
        "source": "drone-target",
        "paint": {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': 4,
            // color circles by ethnicity, using data-driven styles
            'circle-color': '#f00',
            'circle-opacity':0.8
        }
    });
    map.addLayer({
        "id": "drone-fire2",
        "type": "circle",
        "source": "drone-target",
        "paint": {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': 6,
            // color circles by ethnicity, using data-driven styles
            'circle-color': '#f00',
            'circle-opacity':0.4
        }
    });
    window.setInterval(setPosition, 20);
    
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
                "icon": "monument"
              }
              }, {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [120.414, 29.976]
              },
              "properties": {
                "title": "Mapbox Zhejiang",
                "icon": "harbor"
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
        this.innerHTML = "<span>锁定</span>";
    } else {
        window.locking = true;
        this.innerHTML = "<span>解锁</span>";
    }
}, false);

var strategy = {
    "up": accelerate,
    "down": brake,
    "left": turnLeft,
    "right": turnRight,
    "U": accelerate,
    "D": brake,
    "L": turnLeft,
    "R": turnRight
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

