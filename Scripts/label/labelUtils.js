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

// var roadstyle = 

var vector = new ol.layer.Vector(
//   {
//   source: new ol.source.Vector({  
//     url: 'examples/data/kml/2012_Earthquakes_Mag5.kml',
//     format: new ol.format.KML({
//         extractStyles:false
//     }),
//     wrapX:false
//   }),

//   style:styleFunction,
//   title:"earthquake",
//   name:'11'
// }
);


var labelOption = {
    maxResolution: 150,
    checkCollide: true,
    helper: false,
    labelSwitch: true
}

function LabelEngine(opt) {
    this.visitedLabels = [];
    this.labelNum = 0;  
    this.styleFunctionTimer = 0;
    this.bufferRatio = 3,
    this.options = opt|| {
        maxResolution: 100000000,
        checkCollide: true,
        helper: false,
        labelSwitch: true,
        labelField: "name"
    }
    this.generateLabel = generateLabel; 
    this.init = function() {
        this.visitedLabels = [];
        this.labelNum = 0;
        this.styleFunctionTimer = 0;
    }
}

var visitedLabels = [], labelNum = 0, styleFunctionTimer = 0,
 helper = false, labelSwitch = true, bufferRatio = 7, distStrat = true, labelFields = ['city', 'NAME'];
/** 
 * for optimization. TODO.
 */
function findInVisited() {
    
}

/**
 * judge input Lable overlapse with visited ?!
 */
function isOverlapse(feature) {
    
}

/**
 * input curFeature, check with visitedLabels
 * return curFeature text to avoid overlapse.
 */
function generateLabel(feature, resolution, checkCollide, name) {
    var overlapse = false, extent = null, curExtent, featureClone = feature.clone();
    buffer = resolution * bufferRatio, 
    text = feature.getProperties()[name];
    if (visitedLabels.length === 0) {
        // 本次缩放，第一个feature，直接加入池中.
        drawsource.clear();
        console.warn("clear BufferHelper of last move!");        
        featureClone.setProperties({"lenKey":text.length});
        visitedLabels.push(featureClone);
    } else if (checkCollide) {
        var curLabelFeature, 
        curGeom = feature.getGeometry();
        if (!curGeom.getFlatMidpoint) return;
        curMidPoint = curGeom.getFlatMidpoint();
        buffer *= text.length;
        // when use label Extent as Feature to judge, generate curLabel's bufferFeature.
        if (!distStrat) {
            curExtent = curGeom.getExtent();
            midPoint2Extent(curExtent, curMidPoint, buffer);
            // labelExtent2Feature
            curLabelFeature = extent2Feature(curExtent);
            if (!curLabelFeature) return;
        } else {                        
            if (curMidPoint instanceof Array === false) return;
        }
        for (let j = 0; j < visitedLabels.length; j ++) {
            // for each feature's extent, check curGeom intersectsExtent or not.
            var Midpoint, curBuffer,
            visitingF = visitedLabels[j],
            visitingGeom = visitingF.getGeometry(),
            labelLen = visitingF.getProperties()["lenKey"];
            if (!visitingGeom.getFlatMidpoint) continue;
            Midpoint = visitingGeom.getFlatMidpoint();
            curBuffer = buffer;
            buffer = resolution * bufferRatio;
            buffer *= labelLen||5;
            // if apply intersectsExtent.
            if (!distStrat) {
                extent = visitingGeom.getExtent();
                midPoint2Extent(extent, Midpoint, buffer);
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
        visitedLabels.push(featureClone);
    }
    labelNum += 1;
    if (helper && curExtent) {
        BufferHelper(curExtent);
    }
    return text;
}

/** 
 * calc Label Extent with feature FlatMidPoint
 * cached in visitedLabels !!!
 */
function feature2Label() {

}

function getLabelText(feature) {
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
function midPoint2Extent(extent, Midpoint, buffer) {    
    extent[0] = Midpoint[0] - buffer;
    extent[1] = Midpoint[1] - buffer/1.0;
    extent[2] = Midpoint[0] + buffer;
    extent[3] = Midpoint[1] + buffer/1.0;
}

/**
 * input extent, create polygon then add to drawsource.features
 * return buffered polygon help watch overlapse check!!
 */
function BufferHelper(extent) {
    var BufferFeature = extent2Feature(extent);
    if (features && drawsource && BufferFeature) {
        features.push(BufferFeature);
        // console.warn("Generating Label and BufferHelper for curResolution");
    }
}


/**
 * Extent2Feature
 */
function extent2Feature(extent) {
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

var getText = function(feature, resolution, opt) {
    var maxResolution = opt.maxRes || 22550; // 小于 1: maxRes 这个比例尺就不显示标注. 在大比例尺下可以显示标注
    var labelField = opt.field || "name";
    var checkCollide = true;
    if (resolution > maxResolution || !labelSwitch) {
        return ""
    } 
    var text = generateLabel(feature, resolution, checkCollide, labelField);
    return text;
};

function createTextStyle(feature, resolution, opt) {
  var fontSet = opt.weight||"normal" + " " + opt.size||13;
  return new ol.style.Text({
    textAlign: "center",
    offsetY: 8,
    text: getText(feature, resolution, opt),
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

/**
 * layer init and map drag/zoom will trigger this func.
 */
function roadStyleFunction(feature, resolution) {
  styleFunctionTimer += 1;
  return new ol.style.Style({
      stroke : new ol.style.Stroke({
        color: 'rgba(255,255,10,0.7)',
        width: 5/(feature.getProperties()["CLASS"]%40)
      }),
      // 根据配置 返回道路的文字标注！！
      text: createTextStyle(feature, resolution, {
          maxRes: 120,
          field: "NAME"
      })
  });
}

// 城市点要素的文字标注配置！！
function cityStyleFunction(feature, resolution) {
  styleFunctionTimer += 1;
  return new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
                color: "#ffc107"
              }),
        radius: 4
      }),
      // 根据配置 返回城市的文字标注！！
      text: createTextStyle(feature, resolution, {
          maxRes: 25000,
          field: "city",
          weight: "bold",
          size: 16,
      })
  });
}

// test layer.Image and layer.Vector
var polyworld = new ol.layer.Vector({
  source: new ol.source.Vector({
    url:'Asset/countries.geojson',
    format: new ol.format.GeoJSON({
    })
  }),
  visible: true,
  title: "countries",
});

// test layer.Image and layer.Vector
var cities = new ol.layer.Vector({
  source: new ol.source.Vector({
    url:'Asset/cities.json',
    format: new ol.format.GeoJSON({
    })
  }),
  visible: true,
  title: "cities",
  style: cityStyleFunction
});

// test layer.Image and layer.Vector
var shroad = new ol.layer.Vector({
  source: new ol.source.Vector({
    url:'Asset/shroad.json',
    format: new ol.format.EsriJSON({
    })
  }),
  visible: true,
  maxResolution: 250,
  title: "shanghai_road",
  style: roadStyleFunction
});
//$.ajax({"url":"12.ashx","success":function(data){ ol.Geometry();ol.Feature(ol.Geometry);ol.source.addFeature(*) }})

var extent = [120.78489, 30.68767, 121.95649, 31.58687];
// var projection = new ol.proj.Projection({
//   code: 'xkcd-image',
//   units: 'pixels',
//   extent: extent
// });
var sh_img = new ol.layer.Image({
  source: new ol.source.ImageStatic({
    // attributions: [
    //   new ol.Attribution({            
    //   })
    // ],
    // url: 'http://imgs.xkcd.com/comics/online_communities.png',
    url:'GMap at zoom 12.png',
    projection: ol.proj.get("EPSG:3857"),
    imageExtent: ol.proj.transformExtent(extent,"EPSG:4326","EPSG:3857")
  }),
  title:"上海遥感影像"
});


// // this example uses d3 for which we don't have an externs file. 
// // Histgram has 10 bins.
// var minVgi = 0;
// var maxVgi = 0.25;
// var bins = 10;

// function vgi(pixel) {
//   var r = pixel[0] / 255;
//   var g = pixel[1] / 255;
//   var b = pixel[2] / 255;
//   return (2 * g - r - b) / (2 * g + r + b);
// }

// /**
//  * Summarize values for a histogram.
//  * @param {numver} value A VGI value.
//  * @param {Object} counts An object for keeping track of VGI counts.
//  */
// function summarize(value, counts) {
//   var min = counts.min;
//   var max = counts.max;
//   var num = counts.values.length;
//   if (value < min) {
//     // do nothing
//   } else if (value >= max) {
//     counts.values[num - 1] += 1;
//   } else {
//     var index = Math.floor((value - min) / counts.delta);
//     counts.values[index] += 1;
//   }
// }

// var imgsource = sh_img.getSource();

// // create a raster source 
// var raster = new ol.source.Raster({
//   source: [imgsource],
//   /**
//    * Run calculations on pixel data.
//    * @param {Array} pixels :List of pixels (one per source).
//    * @param {Object} data :User data object.
//    * @return {Array} The output pixel.
//    */
//   operation: function(pixels,data){
//     var pixel = pixels[0];
//     var value = vgi(pixel);
//     summarize(value, data.counts);
//     if(value >= data.threshold) {
//       pixel[0] = 0;
//       pixel[1] = 255;
//       pixel[2] = 0;
//       pixel[3] = 128;
//     } else {
//       pixel[3] = 0;
//     }
//     return pixel;
//   },
//   lib:{
//     vgi:vgi,
//     summarize:summarize
//   }
// });

// raster.set('threshold', 0.1);
// function createCounts(min, max, num) {
//   var values = new Array(num);
//   for (var i = 0; i < num; ++i) {
//     values[i] = 0;
//   }
//   return {
//     min: min,
//     max: max,
//     values: values,
//     delta: (max - min) / num
//   };
// }

// raster.on('beforeoperations', function(event) {
//   event.data.counts = createCounts(minVgi, maxVgi, bins);
//   event.data.threshold = raster.get('threshold');
// });

// raster.on('afteroperations', function(event) {
//   schedulePlot(event.resolution, event.data.counts, event.data.threshold);
// });

// var map = new ol.Map({
//   layers: [
//     new ol.layer.Tile({
//       source: bing
//     }),
//     new ol.layer.Image({
//       source: raster
//     })
//   ],
//   target: 'map',
//   view: new ol.View({
//     center: [-9651695, 4937351],
//     zoom: 13,
//     minZoom: 12,
//     maxZoom: 19
//   })
// });


// var timer = null;
// function schedulePlot(resolution, counts, threshold) {
//   if (timer) {
//     clearTimeout(timer);
//     timer = null;
//   }
//   timer = setTimeout(plot.bind(null, resolution, counts, threshold), 1000 / 60);
// }

// var barWidth = 15;
// var plotHeight = 150;
// var chart = d3.select('#plot').append('svg')
//     .attr('width', barWidth * bins)
//     .attr('height', plotHeight);

// var chartRect = chart[0][0].getBoundingClientRect();

// var tip = d3.select(document.body).append('div')
//     .attr('class', 'tip');

// function plot(resolution, counts, threshold) {
//   var yScale = d3.scale.linear()
//       .domain([0, d3.max(counts.values)])
//       .range([0, plotHeight]);

//   var bar = chart.selectAll('rect').data(counts.values);

//   bar.enter().append('rect');

//   bar.attr('class', function(count, index) {
//     var value = counts.min + (index * counts.delta);
//     return 'bar' + (value >= threshold ? ' selected' : '');
//   })
//   .attr('width', barWidth - 2);

//   bar.transition().attr('transform', function(value, index) {
//     return 'translate(' + (index * barWidth) + ', ' +
//         (plotHeight - yScale(value)) + ')';
//   })
//   .attr('height', yScale);

//   bar.on('mousemove', function(count, index) {
//     var threshold = counts.min + (index * counts.delta);
//     if (raster.get('threshold') !== threshold) {
//       raster.set('threshold', threshold);
//       raster.changed();
//     }
//   });

//   bar.on('mouseover', function(count, index) {
//     var area = 0;
//     for (var i = counts.values.length - 1; i >= index; --i) {
//       area += resolution * resolution * counts.values[i];
//     }
//     tip.html(message(counts.min + (index * counts.delta), area));
//     tip.style('display', 'block');
//     tip.transition().style({
//       left: (chartRect.left + (index * barWidth) + (barWidth / 2)) + 'px',
//       top: (d3.event.y - 60) + 'px',
//       opacity: 1
//     });
//   });

//   bar.on('mouseout', function() {
//     tip.transition().style('opacity', 0).each('end', function() {
//       tip.style('display', 'none');
//     });
//   });

// }

// function message(value, area) {
//   var acres = (area / 4046.86).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
//   return acres + ' acres at<br>' + value.toFixed(2) + ' VGI or above';
// }