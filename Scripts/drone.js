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
        console.warn('clients are firing..');
        return;
    }
    var bullet = new Bullet();
    var sx, sy;
    // Bug !!! here should be deepCopy.. not shallow. fixed
    bullet.spoint.coordinates[0] = this.point.coordinates[0];
    bullet.spoint.coordinates[1] = this.point.coordinates[1];
    bullet.direction = this.direction;
    this.bullet = bullet;

};