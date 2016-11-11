/*
 * author: alex2wong
 *  DRONE.JS
 */

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
}

var Bullet = function() {
    this.spoint = {};
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
    if (this.firing) {
        console.warn('you are firing.. hold your horses');
        return;
    }
    var bullet = new Bullet();
    var sx, sy;
    bullet.spoint = this.point;
    bullet.direction = this.direction;
    this.bullet = bullet;
    this.firing = true;
    sx = bullet.spoint.coordinates[0];
    sy = bullet.spoint.coordinates[1];
    // console.log("fire from: " +   sx, sy);
    sx += bullet.range * Math.sin(this.direction);
    sy += bullet.range * Math.cos(this.direction);
    // console.log("target At: " +   sx, sy);
    var target = {
        "type": "Point",
        "coordinates": [sx, sy]
    }
    //// timer for each drone to calculate it's bullets coordinates.
    // var privateTimer = setInterval(function(){
    //     var that = this;
    //     if (count > duration/interval) {
    //             // this timer should be cleared when count over or hitted!
    //             that.firing = false;
    //             clearInterval(privateTimer);
    //             // console.warn('bullet reach destination!');
    //         } else {
    //             that.bullet.spoint.coordinates[0] += Math.sin(bullet.direction)*ratio*range;
    //             that.bullet.spoint.coordinates[1] += Math.cos(bullet.direction)*ratio*range;

    //             count += 1;
    //         }
    // }, interval);
};