
function Controller () {
    this.ele = null;
    this.divId = "";
    this.className = "";
    this.width = 100;
    this.height = 50;
}

Controller.prototype.init = function (ele) {
    this.ele = ele || null;
    document.body.appendChild(this.ele);
    this.ele.style.position = "absolute";
    this.ele.style.left = "10px";
    this.ele.style.bottom = "180px";
    this.ele.style.width = this.width + "px";
    this.ele.style.height = this.height + "px";
    this.ele.style.background = "rgba(200,200,200,0.4)";
    this.ele.innerHTML = "<span></span>";
    this.ele.className = "panel";
    return this;
}

Controller.prototype.setDOM = function (ele) {
    this.ele = ele || null;
    return this;
}

Controller.prototype.enableDrag = function() {
    this.ele.draggable = true
    return this;
}

// var dashboard = document.createElement("div");
// dashboard.

function Dashboard () {
    Controller.call(this);
    this.width = 150;
    this.height = 70;
    this.obj = null;
    this.dataTimer = null;
    this.updateData = function () {
        if (this.obj && this.obj.name) {
            var htmlContent = "";
            htmlContent += "NAME: <span class='warn'>" + this.obj.name + "</span><br>";
            htmlContent += "SPEED: <span class='primary'>" + (this.obj.speed * 10000).toFixed(0) + "</span> KM/h<br>";
            var degree = (this.obj.direction*180/Math.PI)%360;
            htmlContent += "DIRECT: <span class='primary'>" + degree.toFixed(0) + "</span> Degree<br>";
            this.ele.innerHTML = htmlContent;
        }
    }
}

// 继承自控件类
Dashboard.prototype = new Controller();
Dashboard.prototype.bindObj = function (obj) {
    if (!obj) {
        console.warn("obj format incorrect.");
        return;
    }
    this.obj = obj;
    if (this.dataTimer) {
        clearInterval(this.dataTimer);
    }
    this.dataTimer = setInterval(() => this.updateData(), 500);
    this.enableDrag();
    return this;
}

Dashboard.prototype.unbind = function () {
    if (this.boundObj) {
        clearInterval(this.boundObj);
        console.warn("binding removed..");
    }
    return this;
}

/**
 * draw speed bar depend on obj.speed.
 */
Dashboard.prototype.updateChart = function () {
    if (this.obj && this.obj.name) {

    }
}
