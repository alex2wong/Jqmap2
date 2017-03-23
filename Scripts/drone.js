/*
 * author: alex2wong
 *  DRONE.JS
 */
var MAXSPEED = 0.15;
var ATTACKRANGE = 0.4;
var BULLETOFFSET =  0.04;

var Drone = function() {
    this.name;
    this.direction = 0;
    this.speed = 0.01;
    this.manual = false;
    this.point = {
        "type":"Point",
        "coordinates": [121.321,30.112]
    };
    this.weapon = {};
    this.life = true;
    this.firing = false;
}

var Bullet = function() {
    this.spoint = {
        'type': "Point",
        'coordinates': []
    };
    this.direction = 0;
    this.speed = 0.1
    // range in rad/h
    this.range = 0.4;
}


/*
        offsetX
        ____
        |d /       offsetX = range*Math.sin(d)
 offsetY| /range   offsetY = range*Math.cos(d)
        |/   

    Try to calc bullet coordinates for each drone with private timer.. 
    not interupt other drone's calculation. 

    if to render, just flush all the drone's bullet coordinates 
    in bulletSource in a global renderTimer.
*/
Drone.prototype.fire = function() {
    // body... direction in Rad !! this represent current Drone
    if (this.firing && this.bullet) {
        return;
    }
    var bullet = new Bullet();
    var sx, sy;
    // Bug !!! here should be deepCopy.. not shallow. fixed
    bullet.spoint.coordinates[0] = this.point.coordinates[0] + BULLETOFFSET * Math.sin(this.direction);
    bullet.spoint.coordinates[1] = this.point.coordinates[1] + BULLETOFFSET * Math.cos(this.direction);
    bullet.direction = this.direction;
    this.bullet = bullet;
    // setTimeout(function(){
    //     this.firing = false;
    //     this.bullet = null;
    // }, 600);
    // drone.firing = true;
};

Drone.prototype.turnLeft = function() {
    this.direction -= 0.1;
}

Drone.prototype.turnRight = function() {
    this.direction += 0.1;
}

Drone.prototype.accelerate = function() {
    if (this.speed < MAXSPEED) {
        this.speed += 0.01;
    }
}

Drone.prototype.brake = function () {
    if (this.speed > 0.01) {
        this.speed -= 0.01;
    }
}

/**
 * autofire by robot drone.
 * ..robot drone need a input drone to fire at..
 */
Drone.prototype.attack = function (drone) {
    this.follow(drone);
    if (calcDist(this.point.coordinates, drone.point.coordinates) > ATTACKRANGE) return; 
    if (this.firing) return;
    this.fire();
    var that = this;
    setTimeout(function(that) {
            that.firing = false;
            that.bullet = null;
        }, firingTime - 100);
    this.firing = true;
}

/**
 * searchNearest drone from this one.
 * take care of timer .. cause this searchNearest cost too much performance.
 */
Drone.prototype.searchNearest = function (drones) {
    var nDrone = null;
    var minDist = 10000;
    if (drones instanceof Array) {
        // calc distance between this drone and Others.
        for (var i = 0; i < drones.length; i ++) {
            var curDist = calcDist(this.point.coordinates, drones[i].point.coordinates);
            if (curDist < minDist && curDist !== 0 && drones[i].name.indexOf("敌机") < 0) {
                // nearest drone is found.
                nDrone = drones[i];
                minDist = curDist;
            }
        }
    }
    return nDrone;
}

/**
 * adjust direction and follow at distance.
 */
Drone.prototype.follow = function (drone, targetDist) {
    if (!targetDist) {
        targetDist = ATTACKRANGE;
    }
    if (drone instanceof Drone) {
        var theta = calcSlope(this.point.coordinates, drone.point.coordinates);
        var dist = calcDist(this.point.coordinates, drone.point.coordinates);
        // then try to turn..
        // if (!isNaN(theta) && theta > 0) {
        //     this.turnLeft();
        // } else if (!isNaN(theta)) {
        //     this.turnRight();
        // }
        if (!isNaN(theta) && theta > (-2 * Math.PI)) {
            this.direction = theta;
            // accelerate following target
            if (dist > targetDist && this.name.indexOf("敌机") > -1 && this.speed < MAXSPEED/2) {
                this.speed += 0.01;
            } else if (dist > targetDist && this.speed < (MAXSPEED - 0.02)) {
                this.speed += 0.01;
            }
            else if (dist < targetDist) {
                this.speed = drone.speed;
            }
            // console.log("Debug: following " + drone.name + " at degree " + theta*180/Math.PI.toFixed(1));
        }
        return; 
    }
    console.warn("Input drone not instanceof Drone.");
}

/**
 * calc the connectino line slope of two drones in RAD.
 */
function calcSlope(coordinates1, coordinates2) {
    var theta = -10000;
    if (coordinates1 instanceof Array && coordinates2 instanceof Array 
        && coordinates1.length === 2 && coordinates2.length === 2) {
        theta = Math.atan((coordinates2[0]-coordinates1[0])/(coordinates2[1] - coordinates1[1]));
        // if targets at south of this drone.
        if (coordinates2[1] < coordinates1[1]) {
            theta += Math.PI;
        }
    }
    return theta;
}

// source, target is coordinates. return distance in Rad.
function calcDist(source, target) {
    return  Math.sqrt(Math.pow((source[0] - target[0]), 2) + Math.pow((source[1] - target[1]), 2));
}
