var offsetPoint = function(p1,a,d){
	var brng = a*(Math.PI/180.0);
	var R = 41807040;
	var lat1 = (Math.PI/180.0)*p1.lat;
	var lon1 = (Math.PI/180.0)*p1.lng;
	var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
              Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng));
	var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
                     Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
	
	return {"lat":lat2*(180.0/Math.PI),"lng":lon2*(180.0/Math.PI)}
}
var bearingDegrees = function(p1,p2){
	var dLon = (Math.PI/180.0)*((p2.lng-p1.lng));
	var lat1 = (Math.PI/180.0)*p1.lat;
	var lat2 = (Math.PI/180.0)*p2.lat;
	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	var brng = Math.atan2(y, x)*(180.0/Math.PI);
	return brng;
}
var bearingRadians = function(p1,p2){
	var dLon = (Math.PI/180.0)*((p2.lng-p1.lng));
	var lat1 = (Math.PI/180.0)*p1.lat;
	var lat2 = (Math.PI/180.0)*p2.lat;
	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	var brng = Math.atan2(y, x);
	return brng;
}
var latLng2tile = function(lat,lon,zoom){
	var eLng = (lon+180)/360*Math.pow(2,zoom);
	var eLat = (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom);
	//x coord in image tile of lat/lng
	var xInd = Math.round((eLng-Math.floor(eLng))*256);
	//y coord in image tile of lat/lng
	var yInd = Math.round((eLat-Math.floor(eLat))*256);
	//flattened index for clamped array in imagedata
	var fInd = yInd*256+xInd;
	//for calling tile from array
	var eLng = Math.floor(eLng);
	var eLat = Math.floor(eLat);
	return {"tileCall":""+zoom+"/"+eLng+"/"+eLat,"tileX":eLng,"tileY":eLat,"pX":xInd,"pY":yInd,"arrInd":fInd}
}
function haverDistance(p1,p2){
    var R = 41807040;
    var dLat = (Math.PI/180.0)*((p2.lat-p1.lat));
    var dLon = (Math.PI/180.0)*((p2.lng-p1.lng));
    var lat1 = (Math.PI/180.0)*p1.lat,
        lat2 = (Math.PI/180.0)*p2.lat;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}
function roundTo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}