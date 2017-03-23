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

function LabelEngine() {
    this.features = features || [];
    this.visitedLabels = [];
    this.options = opt||{ 
      buffer: 10
    };
    this.removeDupl = function() {
        // tranverse features to removeDupl, then cached in visitedLabels
    }
    this.isOverlapse = isOverlapse;
    this.init = function() {
        this.visitedLabels = [];
    }
}

var visitedLabels = [], labelNum = 0, styleFunctionTimer = 0, helper = false, labelSwitch = true;

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
function generateLabel(feature, resolution, checkCollide) {
    var overlapse = false, extent = null, buffer = resolution * 7;
    if (visitedLabels.length === 0) {
        // 本次缩放，第一个feature，直接加入池中. !important 可以考虑采用二分法，去屏幕中央的要素开始检查.
        drawsource.clear();
        console.warn("clear BufferHelper of last move!");
        visitedLabels.push(feature);
    } else if (checkCollide) {
        var curGeom = feature.getGeometry();
        var curExtent = curGeom.getExtent();
        var curMidPoint = curGeom.getFlatMidpoint();
        buffer *= feature.getProperties().NAME.length;
        midPoint2Extent(curExtent, curMidPoint, buffer);
        // console.log("created current LabelExtent.." + curExtent);
        // generate curLabel's bufferFeature.
        var curLabelFeature = extent2Feature(curExtent);
        if (!curLabelFeature) return;
        for (let j = 0; j < visitedLabels.length; j ++) {
            // for each feature's extent, check curGeom intersectsExtent or not .. MAYBE: calc extent by Text Length!
            extent = visitedLabels[j].getGeometry().getExtent();
            var Midpoint = visitedLabels[j].getGeometry().getFlatMidpoint();
            buffer = resolution * 7;
            buffer *= visitedLabels[j].getProperties().NAME.length;
            midPoint2Extent(extent, Midpoint, buffer);
            // extentBuffer(extent, resolution);
            // feature.geometry inter with Label Extent.. it should be Label inter Label check!!
            overlapse = curLabelFeature.getGeometry().intersectsExtent(extent);
            if (overlapse) {
              return "";
            }
        } 
        visitedLabels.push(feature);
    }
    labelNum += 1;
    if (helper) {
        BufferHelper(extent);
    }    
    return feature.getProperties().NAME;
}

/** 
 * calc Label Extent with feature FlatMidPoint
 * cached in visitedLabels !!!
 */
function feature2Label() {

}

/**
 * extent for text label.
 */
function midPoint2Extent(extent, Midpoint, buffer) {
    // if (extent instanceof Array === false) return;
    extent[0] = Midpoint[0] - buffer;
    extent[1] = Midpoint[1] - buffer/1.0;
    extent[2] = Midpoint[0] + buffer;
    extent[3] = Midpoint[1] + buffer/1.0;
}

var BufferRatio = 0.05;
/**
 * 精确地来说，需要通过feature的center来估算text的最小外接矩形. 作为extent，
 * 并且每个Label 的最小外接矩形 做overlapse 检测是最准确的. 目前先简化为要素extent
 */
function extentBuffer(extent, resolution) {
    extent[0] -= resolution * BufferRatio;
    extent[1] -= resolution * BufferRatio; 
    extent[2] += resolution * BufferRatio; 
    extent[3] += resolution * BufferRatio;
    // return bufferExtent;
}

/**
 * input extent, create polygon then add to drawsource.features
 * return buffered polygon help watch overlapse check!!
 */
function BufferHelper(extent) {
    var BufferFeature = extent2Feature(extent);
    if (features && drawsource && BufferFeature) {
        features.push(BufferFeature);
        console.warn("Generating Label and BufferHelper for curResolution");
    }
}

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

var getText = function(feature, resolution) {
    var maxResolution = 150; // 小于 1: maxRes 这个比例尺就不显示标注. 在大比例尺下可以显示标注
    var checkCollide = true;
    if (resolution > maxResolution || !labelSwitch) {
        return ""
    } 
    var text = generateLabel(feature, resolution, checkCollide);
    
    // else if (type == 'shorten') {
    //   text = text.trunc(12);
    // } 
    return text;
};

function createTextStyle(feature, resolution) {
  return new ol.style.Text({
    textAlign: "center",
    text: getText(feature, resolution),
    fill: new ol.style.Fill({
      color: "#222"
    }),
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
      fill: new ol.style.Fill(
      {
        color: 'blue'
      }),
      stroke : new ol.style.Stroke({
        color: 'yellow',
        width: 3
      }),
      // 显示 文字标注！！
      text: createTextStyle(feature, resolution)
  });
}

// test layer.Image and layer.Vector
var shroad = new ol.layer.Vector({
  source: new ol.source.Vector({
    url:'Asset/shroad.json',
    format: new ol.format.EsriJSON({
    })
  }),
  visible: true,
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