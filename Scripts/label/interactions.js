// some interactions

var typeSelect = document.getElementById('type');
// 全局变量. 记录上一次addInteraction用户选择的绘图控件
var draw;
function addInteraction() {
  var value = typeSelect.value;
  if (value !== 'None') {
    var geometryFunction, maxPoints;
    if (value === 'Square') {
      value = 'Circle';
      geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
    } else if (value === 'Box') {
      value = 'LineString';
      maxPoints = 2;
      geometryFunction = function(coordinates, geometry) {
        if (!geometry) {
          geometry = new ol.geom.Polygon(null);
        }
        var start = coordinates[0];
        var end = coordinates[1];
        geometry.setCoordinates([
          [start, [start[0], end[1]], end, [end[0], start[1]], start]
        ]);
        return geometry;
      };
    }
    draw = new ol.interaction.Draw({
      //source: drawsource,
      features:features,
      type: /** @type {ol.geom.GeometryType} */ (value),
      geometryFunction: geometryFunction,
      maxPoints: maxPoints
    });
    map.addInteraction(draw);
  }
}
typeSelect.onchange = function(e) {
	map.removeInteraction(draw);
	addInteraction();
};
addInteraction();

var modify = new ol.interaction.Modify({
	features:features,
	// the SHIFT key must be pressed to delete vertices, so
	// that new vertices can be drawn at the same position
	// of existing vertices
	deleteCondition: function(event) {
		return ol.events.condition.shiftKeyOnly(event) &&
	    	ol.events.condition.singleClick(event);
	}
});

var removebtn = document.getElementById("removedraw");
removebtn.onclick = function(){
	map.removeInteraction(draw);
	console.log("draw removed");
}
var removedrawed = document.getElementById("removedrawed");
removedrawed.onclick = function(){
	drawsource.clear();
	console.log("remove all features in user layer!");
}

var features2wgs = function(features){
	var fs = [];
	for(f in features)
	{
		gclone = features[f].getGeometry().clone().transform("EPSG:3857","EPSG:4326");
		var fclone = new ol.Feature(gclone);
		fclone.setProperties(features[f].getProperties());  
		fs.push(fclone);
	}
	return fs;
}

var exportkml = document.getElementById("exportkml");
exportkml.onclick = function(){
	var kmlformatter = new ol.format.KML();
	var kmlstr = kmlformatter.writeFeatures(features2wgs(selectedFeatures.array_));
	console.log(kmlstr);
	selinfobox.innerHTML = kmlstr;
}

var exportgeojson = document.getElementById("exportgeojson");
exportgeojson.onclick = function(){
	var formatter = new ol.format.EsriJSON();
	var jsonstr = formatter.writeFeatures(features2wgs(selectedFeatures.array_));
	console.log(jsonstr);
	selinfobox.innerHTML = jsonstr;
}

function toggleHelper() {
		helper = !helper;
		console.warn("toggle label buffer Helper");
}

function toggleLabel() {
		labelSwitch = !labelSwitch;
		console.warn("toggle label display !");
}


function toggleStrategy() {
		distStrat = !distStrat;
		console.warn("toggle distStrat !");
}
