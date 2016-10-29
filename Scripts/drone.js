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
*/
Drone.prototype.fire = function() {
    // body... direction in Rad !!
    var bullet = new Bullet();
    var sx, sy;
    bullet.spoint = this.point;
    bullet.direction = this.direction;
    sx = bullet.spoint.coordinates[0];
    sy = bullet.spoint.coordinates[1];
    // console.log("fire from: " +   sx, sy);
    sx += bullet.range * Math.sin(this.direction);
    sy += bullet.range * Math.cos(this.direction);
    // console.log("target At: " +   sx, sy);
    return {
        "type": "Point",
        "coordinates": [sx, sy]
    }
};