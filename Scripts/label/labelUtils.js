var styleCache = {}
var styleFunction = function(feature, resolution) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  var name = feature.get('name');
  var magnitude = parseFloat(name.substr(2));
  var radius = 5 + 20 * (magnitude - 5);
  // 不同的等级，计算不同radius..如果已有style，就不重新赋值style。
  var style = styleCache[radius];
  if (!style) {
    style = [new ol.style.Style({
      image: new ol.style.Circle({
        radius: radius,
        fill: new ol.style.Fill({
          // color: 'rbga(255,204,51,0.5)'
          color: 'rgba(255, 204, 51, 0.6)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 204, 0, 0.2)',
          width: 0
        })
      })
    })];
    styleCache[radius] = style;
  }
  return style;
}

/**
 * @return {Array.<number>} Flat midpoint.
 */
ol.geom.LineString.prototype.getFlatMidpoint = function() {
  if (this.flatMidpointRevision_ != this.getRevision()) {
    this.flatMidpoint_ = this.getCoordinateAt(0.5, this.flatMidpoint_);
    this.flatMidpointRevision_ = this.getRevision();
  }
  return this.flatMidpoint_;
};
ol.geom.Polygon.prototype.getFlatMidpoint = ol.geom.Polygon.prototype.getFlatInteriorPoint;
ol.geom.MultiPolygon.prototype.getFlatMidpoint = function () {
    if (this.getPolygons().length && this.getPolygons()[0].getInteriorPoint 
        && this.getPolygons()[0].getInteriorPoint().getLastCoordinate)
    {
        return this.getPolygons()[0].getInteriorPoint().getLastCoordinate();
    }
    return null;
}
ol.geom.Point.prototype.getFlatMidpoint = ol.geom.Point.prototype.getLastCoordinate;

// var vector = new ol.layer.Vector();

function LabelEngine(opt) {
    this.visitedLabels = [];
    this.labelNum = 0;  
    this.styleFunctionTimer = 0;
    this.labelFields = opt.labelFields || ['NAME', "name"];
    this.labelSwitch = true;
    this.distStrat = opt.distStrat;
    this.helperSource = opt.helperSource || null;
    this.init = function() {
        this.visitedLabels = [];
        this.labelNum = 0;
        this.styleFunctionTimer = 0;
    }
    this.log = function () {
        console.log("## Debug: last moveend generat label-> " + this.labelNum + " times in styleFunction " + this.styleFunctionTimer + " times");
    }
}

/**
 * input curFeature, check with visitedLabels
 * return curFeature text to avoid overlapse.
 */
LabelEngine.prototype.generateLabel = function(feature, resolution, name, helper, bufferRatio) {
    var overlapse = false, extent = null, curExtent, featureClone = feature.clone();
    buffer = resolution * bufferRatio, 
    text = feature.getProperties()[name];
    if (this.visitedLabels.length === 0) {
        // 本次缩放，第一个feature，直接加入池中.
        if (this.helperSource && this.helperSource.clear) this.helperSource.clear();       
        featureClone.setProperties({"lenKey":text.length});
        this.visitedLabels.push(featureClone);
    } else {
        var curLabelFeature, 
        curGeom = feature.getGeometry();
        if (!curGeom.getFlatMidpoint) return;
        curMidPoint = curGeom.getFlatMidpoint();
        buffer *= text.length;
        // when use label Extent as Feature to judge, generate curLabel's bufferFeature.
        if (!this.distStrat) {
            curExtent = curGeom.getExtent();
            this.midPoint2Extent(curExtent, curMidPoint, buffer);
            // labelExtent2Feature
            curLabelFeature = this.extent2Feature(curExtent);
            if (!curLabelFeature) return;
        } else {                        
            if (curMidPoint instanceof Array === false) return;
        }
        for (var j = this.visitedLabels.length-1; j > -1; j --) {
            // for each feature's extent, check curGeom intersectsExtent or not.
            var Midpoint, curBuffer,
            visitingF = this.visitedLabels[j],
            visitingGeom = visitingF.getGeometry(),
            labelLen = visitingF.getProperties()["lenKey"];
            if (!visitingGeom.getFlatMidpoint) continue;
            Midpoint = visitingGeom.getFlatMidpoint();
            curBuffer = buffer;
            buffer = resolution * bufferRatio;
            buffer *= labelLen||5;
            // if apply intersectsExtent.
            if (!this.distStrat) {
                extent = visitingGeom.getExtent();
                this.midPoint2Extent(extent, Midpoint, buffer);
                overlapse = curLabelFeature.getGeometry().intersectsExtent(extent);
            } else {
                var BufferDist = curBuffer + buffer;
                overlapse = cmpDist(curMidPoint, Midpoint, BufferDist);
            }

            if (overlapse) {
              return "";
            }
        }
        featureClone.setProperties({"lenKey":text.length});
        this.visitedLabels.push(featureClone);
    }
    this.labelNum += 1;
    if (helper && curExtent) {
        this.BufferHelper(curExtent);
    }
    return text;
}

LabelEngine.prototype.getLabelText = function(feature) {
    for (var i = 0; i < labelFields.length; i ++) {
        var key = labelFields[i], props = feature.getProperties();
        if (props[key] !== undefined) {
            return props[key];
        }
    }
    return "";
}

/**
 * dist less than bufferDist means overlapse.
 */
function cmpDist(source, target, bufferDist) {
    var dist = calcDist(source, target);
    return dist < bufferDist;
}

// source, target is coordinates. return distance in Rad.
function calcDist(source, target) {
    return  Math.sqrt(Math.pow((source[0] - target[0]), 2) + Math.pow((source[1] - target[1]), 2));
}

/**
 * extent for text label.
 */
LabelEngine.prototype.midPoint2Extent = function(extent, Midpoint, buffer) {    
    extent[0] = Midpoint[0] - buffer;
    extent[1] = Midpoint[1] - buffer/1.0;
    extent[2] = Midpoint[0] + buffer;
    extent[3] = Midpoint[1] + buffer/1.0;
}

/**
 * input extent, create polygon then add to drawsource.features
 * return buffered polygon help watch overlapse check!!
 */
LabelEngine.prototype.BufferHelper = function(extent) {
    var BufferFeature = this.extent2Feature(extent);
    if (this.helperSource && BufferFeature) {
        this.helperSource.getFeatures().push(BufferFeature);
        // console.warn("Generating Label and BufferHelper for curResolution");
    }
}

/**
 * Extent2Feature
 */
LabelEngine.prototype.extent2Feature = function(extent) {
    if (extent instanceof Array === false) return null; 
    var BufferFeature = new ol.Feature();
    var geometry = null;
    if (!geometry) {
      geometry = new ol.geom.Polygon(null);
    }
    // 构建多边形
    geometry.setCoordinates([[
        [extent[0],extent[1]], [extent[2],extent[1]], [extent[2],extent[3]], [extent[0],extent[3]], [extent[0],extent[1]]
      ]]);
    BufferFeature.setGeometry(geometry);
    return BufferFeature;
}

/**
 * Label Engine should be applyed to this.
 * feature.getProperties: get label priority/name/ better location..
 */

LabelEngine.prototype.getText = function(feature, resolution, opt) {    
    var labelField = opt.field || "name";
    var lang = opt.lang || "zh";
    var bufferRatio = lang === "zh" ? 7 : 3;
    var helper = opt.helper;
    var text = this.generateLabel(feature, resolution, labelField, helper, bufferRatio);
    return text;
};

/**
 * should be included in our labelEngin Class, directly called by APP code.
 */
LabelEngine.prototype.createTextStyle = function(feature, resolution, opt) {
    this.styleFunctionTimer += 1;
    var maxResolution = opt.maxRes || 22550; // 小于 1: maxRes 这个比例尺就不显示标注. 在大比例尺下可以显示标注
    if (resolution > maxResolution || !this.labelSwitch) {
        return new ol.style.Text({
            text: "",
        });
    }
    var fontSet = opt.weight||"normal" + " " + opt.size||"13px";
    return new ol.style.Text({
        textAlign: "center",
        offsetY: 8,
        text: this.getText(feature, resolution, opt),
        fill: new ol.style.Fill({
            color: "#222"
        }),
        font: fontSet,
        // canvas.getContext("2d").setStroke()!! custom Label Engine!
        stroke: new ol.style.Stroke({
            color: "#eee",
            width: "3"
        })
    });
}
