var breakBetween = 2000;
// myTween.js
var myTween = {
    fps: 30,
    objs : null,
    get : function(models) {
        this.objs = models;
        return this;
    },
    to : function(targets, duration, cb) {
        this.lastAniParams = [targets, duration];
        if (targets != undefined && duration != undefined && myTween.objs != null) {
            var inter = 1000/myTween.fps,
                stepNum = (duration/1000)*myTween.fps,
                stepIndex =0,
                objsCopy = [],
                props = [];
            console.log("animation params init complete...");

            // tranverse targetStatus props then calculate status of each frame
            for(var i=0;i<myTween.objs.length;i++){
                for(var k in targets[i]) {
                    if(typeof(targets[i][k]) == 'number'){
                        // deepCopy original status..
                        if (typeof objsCopy[i] != 'object') objsCopy[i] = {};
                        if (typeof props[i] != 'object') props[i] = {};
                        objsCopy[i][k] = myTween.objs[i][k];
                        props[i][k] = parseFloat(((targets[i][k] - myTween.objs[i][k]) * (1/stepNum)).toFixed(3)); 
                    }
                }
            }

            function animation() {
                var fadeIn = false, fadeOut = false;
                // animation end related handling.
                if (stepIndex >= stepNum) {
                    // reset objs 2 original status.
                    if (myTween.loop) {
                        stepIndex = 0;
                        for (var i = 0; i < myTween.objs.length; i++) {
                            myTween.objs[i] = Object.assign([], myTween.objs[i], objsCopy[i]);
                        }
                        // myTween.objs = Object.assign([], myTween.objs, objsCopy);
                        console.warn("animation reset ...");
                    } else {
                        myTween.paused = true;
                        clearInterval(myTween.timer);
                        myTween.timerOn = false;
                        console.warn("animation end !!!");
                    }
                    return;
                }
                if (stepIndex == 0) {
                    fadeIn = true;
                } else if (stepIndex == stepNum - 1) {
                    fadeOut = true;
                }
                if (myTween.speed != 1) {

                }
                // animation pause related.  record current params..
                if (myTween.paused) {
                    return;
                }
                for(var i=0;i<myTween.objs.length;i++){
                    for(var key in props[i]) {
                        // currently animation is controlled by stepIndex..
                        myTween.objs[i][key] += props[i][key];
                        // console.log("obj " +  myTween.objs[i]['name'] +' changed,' + key + ": " + myTween.objs[i][key]);
                    }
                }
                if (cb && cb instanceof Function) {
                    cb.call(this, myTween.objs, fadeOut, fadeIn);
                }
                stepIndex += 1;
            }
            // if last timer is still On, register later.. use async alike process controller.
            this.timer = setInterval(animation, inter);
            this.timerOn = true;
            myTween.paused = false;
        }
        return this;
    },
    loop : true,
    speed: 1,
    timerOn: false,
    timer : null,
    paused: false,
    wait: function(targets, duration) {
        var duration = duration || 0;        
        setTimeout(function() {
            if (targets instanceof Object)
                myTween.objs = Object.assign(myTween.objs, targets);
            else if (targets instanceof Function)
                console.log("execute Func await..");
                targets.call(this);
        }, duration);
    },
    toggleAni: function(paused) {
        if (paused != undefined) {
            this.paused = paused;
            var status = paused? "paused": "playing";
            return;
        }
        this.paused = !this.paused;
    },
    toggleLoop: function(loop) {
        if (loop != undefined) {
            this.loop = loop;
            return;
        }
        this.loop = !this.loop;
    },
    lastAniParams: [undefined, undefined]
}

var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};
