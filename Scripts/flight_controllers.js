
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
    this.ele.style.left = "10%";
    this.ele.style.bottom = "40%";
    this.ele.style.width = this.width + "px";
    this.ele.style.height = this.height + "px";
    this.ele.style.background = "rgba(200,200,200,0.4)";
    this.ele.innerHTML = "<span>controller</span>";
    this.ele.className = "panel";
    return this;
}

Controller.prototype.setDOM = function (ele) {
    this.ele = ele || null;
    return this;
}

Controller.prototype.enableDrag = function() {
    console.log("ready to install draggable attri");
    this.ele.setAttr("draggable", "true");
    return this;
}

// var dashboard = document.createElement("div");
// dashboard.

function Dashboard () {
    Controller.call(this);
    this.width = 140;
    this.height = 100;
    this.obj = null;
    this.updateData = function () {
        if (this.obj && this.obj.name) {
            var htmlContent = "";
            htmlContent += "NAME: " + this.obj.name + "<br>";
            htmlContent += "SPEED: " + (this.obj.speed * 10).toFixed(0) + "000KM/h<br>"; 
            htmlContent += "DIRECT: " + this.obj.direction.toFixed(1) + " Degree<br>";
            this.ele.innerHTML = htmlContent;
        }
        console.log("get the latest Status Data..");
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
    setInterval(() => this.updateData(), 2000);
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
