// grid.js require turf.js to build geojson grid

/* 
	这边确定几个规则，
	1.图层可见并且在RealRes分辨率以上，则开启简化。
	2.图层在RealRes分辨率之下，则显示原始图形。

	Thinking：
	1.实时简化算法需要耗时计算，不简化则交互卡顿，如何平衡。
	2.可否考虑构建矢量数据金字塔，存成多层级geojson。
	3.加载本地LOD，根据分辨率，加载对应层级geojson。
 */

var lodpara = {
	viewadjusted: false,
	fs: null,
	formater: new ol.format.GeoJSON(),
	/*maxfsInExtent: 1000,*/
	greenstyle: new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#94E452'
            })
          }),
	waterstyle: new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#2196F3'
            })
        }),
	tolratio: 3.00,

	/* 10m 分辨率以下就不做简化。。数据量大，简化算法太费时 */
	noSimpleRes: 10,
	layername:'',
	cache:{}

}


/*
  simplify geometry.using olsimplify or turf
  change feature.source by two way. ol.Collection.push() or addfeature()
  ? don't know the performance of two methods...
  
  has jump Geometry which area is smaller than res*res
 */
function lod(layername){
		// console.log(evt);
		var resolution = map.getView().getResolution();
		var resarea = resolution*resolution*0.5;
		var tolerance = resolution*3.00;
		// console.log('resolution change: ' + resolution);
		// 在用户第一次缩放的时候调整 样式和图层顺序
		if (!lodpara.viewadjusted) {adjustView();}

		try{
			var layer = getlayername(lodpara.layername)?getlayername(lodpara.layername):null;
			if (!layer){return;}
			// 最大可见分辨率，320m，小于10m则不开简化。
			layer.setMaxResolution(320);
			if (resolution > 320 || layer.get('visible') == false){return;}
			else if (resolution <10) {
				layer.getSource().clear();
				layer.getSource().addFeatures(lodpara.fs);
				return;
			}
			// 如果已经深度拷贝原始要素信息，则每次都从原始要素计算简化。
			lodpara.fs = lodpara.fs?lodpara.fs:layer.getSource().getFeatures().concat();

			console.log(resolution.toFixed(1));
			if (lodpara.cache[resolution.toFixed(1)]){
				layer.getSource().clear();
				layer.getSource().addFeatures(lodpara.cache[resolution.toFixed(1)]);
				return;
			}

			var simjobj = null,simolfeatures = [],stime = new Date().getTime();

			// ol.features -> jsonstr - > simplify (jsonobj) -> jsonstr -> ol.features
			for (var i = 0; i < lodpara.fs.length; i++) {
				if (lodpara.fs[i].getGeometry().getArea() < resarea){continue;}
				var simfeature = turfsimplify(lodpara.fs[i],tolerance);
				if (simfeature.getGeometry().getCoordinates()[0].length < 5){
					continue;
				}
				simolfeatures.push(simfeature);
			}
			lodpara.cache[resolution.toFixed(1)] = simolfeatures;
			cachelod("http://localhost:8000/cache", lodpara.formater.writeFeatures(simolfeatures));
			console.log('ready cache to server.');

			layer.getSource().clear();
			var etime = new Date().getTime();
			console.log('layer remain '+ simolfeatures.length +' features, clear old feauture. elapsed: '+ (etime-stime)+ 'ms');
			layer.getSource().addFeatures(simolfeatures);
		}
		catch(e){
			console.log(e);
		}
	}

simplify('Green.shp');

function adjustView(){
	getlayername('Green')?getlayername('Green').setStyle(lodpara.greenstyle):console.log('');
	getlayername('water.shp')?getlayername('water.shp').setStyle(lodpara.waterstyle):console.log('');
	getlayername('Green.shp')?getlayername('Green.shp').setStyle(lodpara.greenstyle):console.log('');
	getlayername('110m_land.shp')?getlayername('110m_land.shp').setMinResolution(6000):console.log('');
    getlayername('water.shp')?getlayername('water.shp').setZIndex(15):console.log('');
    getlayername('用户绘制图层')?getlayername('用户绘制图层').setZIndex(20):console.log('');
    getlayername('shanghai_road')?getlayername('shanghai_road').setZIndex(120):console.log('');
    lodpara.viewadjusted = true;
}

function olsimplify(){

}

/* 
  ofeature: input ol.feature
  return: turf simplified ofeature
 */
function turfsimplify(ofeature, tolerance){
	var geojsonstr = lodpara.formater.writeFeature(ofeature);
	// simplify receive JSONobject, simolfeatures is ol type
	var jsonobj = JSON.parse(geojsonstr);
	simjobj = turf.simplify(jsonobj, tolerance, false);				
	return lodpara.formater.readFeature(JSON.stringify(simjobj));
}

function simplify(layername){
	lodpara.layername = layername;
	map.getView().on('change:resolution',lod);
}

function unsim(layername){
	lodpara.layername = layername;
	lodpara.fs = null;
	map.getView().un('change:resolution',lod);	
}


/* 
  post LOD geojson to Server
  url: post to Server Hanlder( save to filesys).
  jsoncont: jsonstr data
 */
function cachelod(url, jsoncont){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        // status 服务器端状态
        if (xhr.readyState == 4 && xhr.status == 200){
            data = JSON.parse(xhr.responseText);
			if (data.mes){
				console.log(data.mes);
			}		
        }
    }
    var body = {
    	'content': jsoncont
    }
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type","text/json");
 	//另外,数据是通过send方法发送的
 	xhr.send("content="+jsoncont);

}

/* search data at front end by properties */
function searchFeature(attri){
	// data cached is tranversed to find specific record.
	// test B-tree and Sort.
}


