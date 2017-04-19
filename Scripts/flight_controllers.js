
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


/**
 *  Apature control to apply filter: blur on mapDiv
 */
function Apature (opt) {
    Controller.call(this);
    this.mapDiv = opt.mapDiv;
    this.blurRatio = opt.ratio || 0.2;
    this.blurPix = opt.blurPix||4;
    this.setMap(opt.mapDiv);
}

// 继承自控件类
Apature.prototype = new Controller();
// bind with mapDiv.
Apature.prototype.setMap = function (mapDiv) {
    var mapDiv = document.querySelector(""+mapDiv);
    if (!mapDiv) {
        console.warn("mapDiv not exist.");
        return;
    }
    this.mapDiv = mapDiv;
    var topBlur = document.createElement("div");
    var bottomBlur = document.createElement("div");
    // need Hack !!
    topBlur.style.height = parseInt(getComputedStyle(mapDiv).height) * this.blurRatio + "px";
    bottomBlur.style.height = parseInt(getComputedStyle(mapDiv).height) * this.blurRatio + "px";
    topBlur.style.width = getComputedStyle(mapDiv).width;
    bottomBlur.style.width = getComputedStyle(mapDiv).width;
    topBlur.style.filter = "blur(" + this.blurPix + "px)";
    bottomBlur.style.filter = "blur(" + this.blurPix + "px)";
    topBlur.style.position = "absolute";
    bottomBlur.style.position = "absolute";
    // bottomBlur.innerHTML = "<img src='Asset/' width='100%'>";
    // bottomBlur.style.background = "url('Asset/pb_google.png')";
    // bottomBlur.style.backgroundRepeat = "repeat";
    // bottomBlur.style.opacity = ".8";
    mapDiv.appendChild(topBlur);
    mapDiv.appendChild(bottomBlur);
    mapDiv.style.filter = "blur(" + this.blurPix + "px)";
    console.log("blur control bind with map");
    return this;
}

// blurify control using canvas!
function Blurify(options) {
    this.options = options;
    this.blur = options.blur || 4;
    this.mode = options.mode || 'auto';
    this.ratio = options.ratio || 0.2;
    this.blurStep = options.blurStep || 1;
    this.blurOffset = options.blurOffset || 1;
    this.imageType = options.imageType || `image/jpeg`;
    this.image = options.image;
    // get canvas element which used to render map.
    this.$els = [options.ele];

    if (this.mode == 'auto') {
        this.useCanvasMode();
        // cssSupport('filter', 'blur(1px)') ? this.useCSSMode() : this.useCanvasMode();
    } else if (this.mode == 'css') {
        this.useCSSMode();
    } else {
        this.useCanvasMode();
    }
}

Blurify.prototype.useCSSMode = function() {
    this.$els.map(el => {
        el.style['filter'] = el.style['-webkit-filter'] = `blur(${this.options.blur}px)`;
    });
}

Blurify.prototype.useCanvasMode = function() {
    this.blurCanvas();
}

Blurify.prototype.blurify = function(canvas, blur) {
    let ctx = canvas.getContext('2d'), blurStep = this.blurStep, blurOffset = this.blurOffset,
        topImageData, blurImg = new Image(), tmpCanv = document.createElement("canvas"), tmpCtx, bottomImageData;
    tmpCanv.width = canvas.width;
    tmpCanv.height = parseInt(canvas.height* this.ratio);
    tmpCtx = tmpCanv.getContext("2d")

    try {
        // get top partial image then fill into tmpCanv
        topImageData = ctx.getImageData(0,0,canvas.width, tmpCanv.height);
        tmpCtx.putImageData(topImageData,0,0);
        
        // common function to blur partial image got from origin canvas.
        blurImg.src = tmpCanv.toDataURL(this.imageType);
        ctx.globalAlpha = 1 / (2 * blur);
        for (let y = -blur; y < blur; y += blurStep) {
            for (let x = -blur; x <= blur; x += blurStep) {
                // drawImage(image/canvas/video, offsetX, offsetY) // repeat offsetDraw to blur the image !! curious. parseInt(canvas.height/10)
                ctx.drawImage(blurImg, x, y);
                if (x >= 0 && y >= 0) ctx.drawImage(blurImg, -(x - blurOffset), -(y - blurOffset));
            }
        }

        // get bottom partial image
        let offsetY = canvas.height - tmpCanv.height;
        bottomImageData = ctx.getImageData(0, offsetY, canvas.width, tmpCanv.height);
        tmpCtx.putImageData(bottomImageData,0,0);

        // common function to blur partial image got from origin canvas.  blur the specific part!!!
        blurImg.src = tmpCanv.toDataURL(this.imageType);
        ctx.globalAlpha = 1 / (2 * blur);
        for (let y = -blur; y < blur; y += blurStep) {
            for (let x = -blur; x <= blur; x += blurStep) {
                // drawImage(image/canvas/video, offsetX, offsetY) // repeat offsetDraw to blur the image !! curious. parseInt(canvas.height/10)
                ctx.drawImage(blurImg, x, y + offsetY);
                if (x >= 0 && y >= 0) ctx.drawImage(blurImg, -(x - blurOffset), -(y + offsetY - blurOffset));
            }
        }

        ctx.globalAlpha = 1;

    } catch (error) {
        console.error("error with the blurCanvas process..");
    }
}

Blurify.prototype.blurCanvas = function() {
    var canvas;
    if (this.$els instanceof Array && this.$els[0] !== undefined && this.$els[0].tagName === "CANVAS") {
        canvas = this.$els[0];
    }
    if (!canvas) return;
    // blurify current canvas by blur..
    this.blurify(canvas, this.blur);
}

Blurify.prototype.drawImage = function() {
    if (this.$els instanceof Array && this.$els[0] !== undefined && this.$els[0].tagName === "CANVAS") {
        let canvas = this.$els[0], ctx;    
        ctx = canvas.getContext("2d");
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);
        return this.$els[0]
    } else {
        return null;
    }
}
