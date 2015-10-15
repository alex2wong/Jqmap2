/// <reference path="OpenLayers.js" />
/// <reference path="access.js" />
/// <reference path="heatmap.js" />


// OpenLayers.ProxyHost = "proxy.cgi?url=";
OpenLayers.ProxyHost = 'MyProxy.ashx?URL=';
//OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "#333333";


function init() {
    // 使用指定的文档元素创建地图
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

    geourl = "http://localhost:8099/";
    geourl2 = "http://58.198.183.239:8080/";    //一个子节点geoserver202地址
    geourl3 = "http://172.28.85.126:8000/";        //第二个子节点 geoserver 202地址
    Tileurl= "http://localhost:86/";

    var option = {
        units: 'm',
        //zoom为0到17级156543.033906248, 78271.516953124, 
        resolutions: [39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740675],
        projection: new OpenLayers.Projection('EPSG:900913'),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        maxExtent: new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7)
        //center: new OpenLayers.LonLat(-98.11, 39.11)

    };
    map = new OpenLayers.Map("mapContain", option);


    var osm = new OpenLayers.Layer.OSM("OSM在线地图");
    //map.addLayer(osm);

    var base = new OpenLayers.Layer.WMS("世界是亮的", geourl + "geoserver/wms",
                    {
                        layers: 'cite:tiledNight',
                        srs: 'EPSG:4326',
                        format: 'image/png'
                    }, { singleTile: false }
    );

    var google = new OpenLayers.Layer.Google("Google Streets");
    var bingkey = "AhDAFewd7qaiwPyXoA20cwKQsPWPNObU5FChfNTwBzyU7fdznrYAzW9OCPuEAxb7";
    var Bingmap = new OpenLayers.Layer.Bing({
        key:bingkey,
        type:"Aerial"
    });
    
    //geoserver/gwc/service/wms
    var ImageService = new OpenLayers.Layer.WMS("影像金字塔", geourl2 + "geoserver/wms", {

        layers: 'cite:ImageService',   //  加载 pyramid 插件提供的影像服务ImageService
        srs: "EPSG:3857",      
        format: "image/png",
        transparent: true,
        tiled: 'true'
        //tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
    }, { isBaseLayer: false });
   var ImageService2 = new OpenLayers.Layer.WMS("影像金字塔", geourl3 + "geoserver/wms", {

        layers: 'cite:ImageService',   //  加载 pyramid 插件提供的影像服务ImageService
        srs: "EPSG:3857",
        format: "image/png",
        transparent: true,
        tiled:'true'
        
    }, { isBaseLayer: false });
   //map.addLayer(ImageService2);

    var SHlandsat = new OpenLayers.Layer.WMS("上海GWC瓦片", geourl + "geoserver/gwc/service/wms", {
        layers: 'cite:landsatSHB5WGS', format: 'image/png', srs: 'EPSG:4326'
    }, { tileSize: new OpenLayers.Size(256, 256), isBaseLayer: false });

    var shroad = new OpenLayers.Layer.WMS("上海街道图层", geourl + "geoserver/gwc/service/wms",
       { layers: 'cite:road_utm', format: 'image/png', srs: 'EPSG:900913' },
        {maxScale: 5, minScale: 50, tileSize: new OpenLayers.Size(256, 256), isBaseLayer: false }
       );
    var basesat = new OpenLayers.Layer.WMS("影像底图", geourl2 + "geoserver/wms", {
        layers: "cite:Earth2",
        srs: "EPSG:3857",
        format: "image/png",
        transparent: true,
        tiled: 'true'
    }, { isBaseLayer: true }
    );

    vlayer = new OpenLayers.Layer.Vector("船只和绘制", {   // 如果layer没有指定srs，则默认为map的空间参考3857

        renderers: renderer,
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                externalGraphic: "Scripts/img/IconOrange.png",
                fillColor: "#0FFFFF",
                fillOpacity: 0.5,
                strokeColor: "#333333",
                graphicOpacity: 1,
                rotation: 0,
                pointRadius: 10
            }, OpenLayers.Feature.Vector.style["default"])),
            "select": new OpenLayers.Style({
                strokeColor: "#333333",
                externalGraphic: "Scripts/img/IconPink.png",
                graphicOpacity: 1,
                rotation: 0,
                pointRadius: 12
            })
        })
    });

    querylayer = new OpenLayers.Layer.Vector("路径", {
        //strategies: [new OpenLayers.Strategy.BBOX()],
        renderers: renderer,
        projection:new OpenLayers.Projection('EPSG:4326'),
        srsName:"EPSG:4326",
        //maxResolution: 0.35135,
        
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                strokeColor: "#1A94E6",
                fillColor: "#09C7F7",
                strokeWidth: 6,
                pointRadius:8,
                fillOpacity: 0.8
            }, OpenLayers.Feature.Vector.style["default"])),
            "select": new OpenLayers.Style({
                strokeColor: "#1A94E6",
                fillColor: "#09C7F7",
                strokeWidth: 8,
                pointRadius: 8,
                fillOpacity: 0.9
                })           

        })
    });

    // setting layer style
    var sketchStyle = new OpenLayers.Style(null, {
        rules: [new OpenLayers.Rule({
            symbolizer: {
                "Polygon": {
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "#333333",
                    fillColor: "#00FFFF",
                    fillOpacity: (location == "province" ? 1 : 0.25)
                },
                "Point": {
                    strokeWidth: 1,
                    strokeOpacity: 1,
                    strokeColor: "#333333",
                    fillColor: "white",
                    fillOpacity: 1,
                    pointRadius: 3,
                    graphicName: "square",
                    rotation: 45
                }
            }
        })]
    });
    var myStyle = new OpenLayers.StyleMap({
        "default": sketchStyle
    });

    //querystring = document.getElementById("text1").value;

    //待完成： 给图层添加 鼠标悬停事件，显示label
    var capital = new OpenLayers.Layer.Vector('国家首都', {

        strategies: [new OpenLayers.Strategy.BBOX()],
        projection: new OpenLayers.Projection("EPSG:4326"),
        protocol: new OpenLayers.Protocol.WFS({
            version: "1.0.0",
            srsName: "EPSG:4326",
            url: geourl + "geoserver/wfs",
            featureType: "natcapitals",
            geometryName: "geom",
            featureNS: "http://www.opengeospatial.net/cite"

        }),
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333",
                fillColor: "white",
                fillOpacity: 1,
                pointRadius: 3,
                graphicName: "square",
                rotation: 45,
                //label:"${city_name}",

                fontSize: "12px",
                fontWeight: "bold",
                labelXOffset: "10",
                labelYOffset: "10",
                labelOutlineColor: "white",
                labelOutlineWidth: 2
            }
        }),
        filter: new OpenLayers.Filter.Logical({
            type: OpenLayers.Filter.Logical.AND,
            filter: [
                    new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.BETWEEN,
                        property: "POP_RANK",
                        lowerBoundary: 1,
                        upperBoundary: 8
                    }),
                    new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "CITY_NAME",
                        value: "Beijing"
                    })
            ]
        })
    });


    var layerListener={

        featureover: function(e) {
                //alert('b');
                var feature = e.feature;
                CenterLonLat=feature.geometry.getBounds().getCenterLonLat();   //
                // var site=feature.data.f1.replace("?","");

                var html="<div id='popup' style=' padding:2px;'>" +
                                         "</br>" +
                                         // "Site:" + site+ "</br>" +
                                         "<div style='height:1px;width:100%;background:#808080;overflow:hidden;'></div>" +
                                         "pm10: " + feature.data.name + "</br>" +
                                         // "pm2.5: " + feature.data.pm25 + "</br>" +
                                         // "time:" + feature.data.timestamp + "</br>" +  
                                          "</div>",
            
                popup_hover = new OpenLayers.Popup.CSSFramedCloud("chicken", 
                    CenterLonLat,new OpenLayers.Size(100,30), html ,null, true, PopupClose);
//              popup_hover.autoSize = true;
                
               feature.popup = popup_hover;
//               popup_hover.feature = feature;
               map.addPopup(popup_hover, true);
    
                e.feature.renderIntent = "select";   //悬停时 将feature渲染为 select 状态。。 如何在列表中添加这个事件。
                e.feature.layer.drawFeature(e.feature);

            },
        featureout:function(e){
                e.feature.popup.destroy();
                e.feature.renderIntent = "default";
                e.feature.layer.drawFeature(e.feature);
        }
       /* featureclick:function(e){
                chartdata=[];                
                charttitle= e.feature.data.f1;
                charttitle=charttitle.replace("?","");

                chartdata[0]= parseInt(e.feature.data.pm10);
                chartdata[1]=parseInt(e.feature.data.pm25);
                chartdata[2]=parseInt(e.feature.data.so2);
                chartinit(chartdata,charttitle);
        }*/
    }

    
    shiplayer = new OpenLayers.Layer.Vector('查询结果', {
        //strategies: [new OpenLayers.Strategy.BBOX()],
        projection: new OpenLayers.Projection("EPSG:4326"),
        renderers: renderer,
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                externalGraphic: "Scripts/img/IconBlue.png",                
                graphicOpacity: 0.9,
                rotation: 0,
                pointRadius: 14,

                strokeColor: "#ee9900",
                fillColor:"#ee9900",
                strokeWidth:2,
                strokeLinecap:"round",
                strokeDashstyle:"longdash",

//                label:"${shiptype}",

                fontSize: "10px",
                fontColor:"gray",
                fontWeight: "Bold",
                labelXOffset: "10",
                labelYOffset: "-10"
//                labelOutlineColor: "transparent"
//                labelOutlineWidth: 
            }, OpenLayers.Feature.Vector.style["default"])),            
            "select": new OpenLayers.Style({
                strokeColor: "#333333",
                externalGraphic:"Scripts/img/Icon.png",
                graphicOpacity:  1,
                rotation: 0,
                pointRadius: 16,

                strokeColor: "#ee9900",
                fillColor:"#ee9900",
                strokeWidth:4,
                strokeLinecap:"round",
                strokeDashstyle:"longdash"
            })
        }),
        eventListeners:layerListener
    });

    var JsonR = new OpenLayers.Format.GeoJSON();
    var fcollection =JsonR.read('{"features":[{"geometry":{"coordinates":[0,0],"type":"Point"},"id":"ci4mq26hs04lkjlqwjugr3muj","properties":{"description":"","id":"marker-marker-i4mq26fu1p","marker-color":"#3887be","marker-size":"medium","marker-symbol":"embassy","title":"Welcome to Mapbox!"},"type":"Feature"},{"geometry":{"coordinates":[100.617942,13.909407],"type":"Point"},"id":"ci4mqcwrp03l6kspgmomyx0fz","properties":{"description":"","id":"marker-i4mq9h4l0","marker-color":"#1087bf","marker-size":"medium","marker-symbol":"airport","title":"曼谷机场"},"type":"Feature"},{"geometry":{"coordinates":[[100.620346,13.904075],[100.553054,13.795406],[100.545501,13.760728],[100.553741,13.716038],[100.507049,13.673343],[100.57434,13.590597],[100.546875,13.519172]],"type":"LineString"},"id":"ci4mqcwrq03l7kspgjya9ph8h","properties":{"description":"","id":"marker-i4mqavzq1","stroke":"#fa946e","stroke-opacity":1,"stroke-width":5,"title":"去海边"},"type":"Feature"},{"geometry":{"coordinates":[[[100.518379,13.815077],[100.535202,13.829079],[100.567131,13.826745],[100.602836,13.791071],[100.634422,13.773066],[100.638542,13.671675],[100.526275,13.659331],[100.484733,13.694024],[100.46379,13.733715],[100.490913,13.778401],[100.518379,13.815077]]],"type":"Polygon"},"id":"ci4mqcwrs03l8kspgi699vy4f","properties":{"description":"","fill":"#cccccc","fill-opacity":0.30000001192092896,"id":"marker-i4mqc6dt2","stroke":"#3ca0d3","stroke-opacity":1,"stroke-width":4,"title":"市区"},"type":"Feature"},{"geometry":{"coordinates":[[121.596679,31.165809],[117.377929,30.183121],[112.280273,28.188243],[109.951171,26.352497],[106.30371,23.160563],[103.535156,19.932041],[101.030273,15.029685],[100.67871,14.115267]],"type":"LineString"},"id":"ci4mqxpul00bdjdqwuujx3x4d","properties":{"description":"","id":"marker-i4mqtkkm0","stroke":"#9c89cc","stroke-opacity":1,"stroke-width":4,"title":"上海到曼谷"},"type":"Feature"}],"id":"huangyixiu.kmk851nd","type":"FeatureCollection"}')
    for(var i in fcollection)
    {
        fcollection[i].geometry.transform("EPSG:4326","EPSG:3857")
        fcollection[i].attributes.name=fcollection[i].attributes.title
    }

    shiplayer.addFeatures(fcollection);    


    tms = new OpenLayers.Layer.TMS("区域高分影像", "", {
        type: 'png',
        getURL: overlay_getTileURL,
        alpha: true,
        transparent: true,
        isBaseLayer: false, buffer: 0, displayOutsideMaxExtent: true
    });

    function overlay_getTileURL(bounds) {  //this 指的是tms 这个图层
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));  //this.tileSize.w
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
        var z = this.map.getZoom()+2;
        if (this.maxExtent.intersectsBounds(bounds)) {
           // return this.url + z + "/" + x + "/" + y + "." + this.type;
          return Tileurl + z + "/" + x + "_" + y + "." + this.type;
        } else {
            return "";
        }
    }

    var myTile= new OpenLayers.Layer.MyCache("myCache",Tileurl+"TileCache",
        {
            format: 'image/png',
            type: 'png',            
            transparent: true,
            isBaseLayer: false, buffer: 0, displayOutsideMaxExtent: true,
    });
    if (OpenLayers.Util.alphaHack() == false) { myTile.setOpacity(0.6); }
   
       
    var gaodelayer = new OpenLayers.Layer.GaodeCache("Gaode", 
                ["http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7"]
//                "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7",
//                "http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7",
//                "http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7"]
                );
    var trafficLayer = new OpenLayers.Layer.TrafficLayer("GaodeTraffic",
        "http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1", { isBaseLayer: false });

    var controlOptions = {
        mapOptions:option,
        layers: [osm]
    };
    templayer = new OpenLayers.Layer.Vector("temp", { displayInLayerSwitcher: false });
    map.addLayer(templayer);
    templayer.setZIndex(341)

    gamelayer = new OpenLayers.Layer.MapboxLayer("游戏风格", "https://a.tiles.mapbox.com/v3/examples.bc17bb2a");
    voyagelayer = new OpenLayers.Layer.MapboxLayer("航海地图", "https://d.tiles.mapbox.com/v3/examples.a3cad6da");
    HDlayer = new OpenLayers.Layer.MapboxLayer("高清影像", "https://a.tiles.mapbox.com/v3/examples.map-qfyrx5r8");
    

    map.addLayer(osm);
    map.addLayer(gaodelayer);

    map.addLayer(basesat);
    map.addLayer(Bingmap);
    map.addLayers([gamelayer,voyagelayer,HDlayer]);    
    map.addLayer(querylayer); 
    map.addLayer(shiplayer);//目前用来绘制查询所得医院点



    //add control 
    map.zoomToMaxExtent();
    var center = new OpenLayers.LonLat(110.14, 13.424);
    center.transform("EPSG:4326", "EPSG:900913");
    map.setCenter(center,5);

    layercontrol=new OpenLayers.Control.LayerSwitcher({
        div:document.getElementById("layercontrol"),
        'ascending': false,
        roundedCorner:false
    });
    map.addControl(layercontrol);
    locate = new OpenLayers.Control.MousePosition({ 'div': OpenLayers.Util.getElement('location') });
    map.addControl(locate);
    scale = new OpenLayers.Control.Scale({ 'div': OpenLayers.Util.getElement('scale') });
    map.addControl(scale);
    map.addControl(new OpenLayers.Control.ScaleLine());
    //map.addControl(new OpenLayers.Control.OverviewMap(controlOptions));

//    //控件panel      //10/31日 尝试加载最简单的图层
//    var world = new OpenLayers.Control.ZoomToMaxExtent({
//        icon: "img/zoom-world-mini.png",
//        title: "缩放到全球",
//        text: ""
//    });
//    var pan = new OpenLayers.Control.DragPan({
//        icon: "../theme/default/img/pan_on.png",
//        title: "拖动浏览",
//        text: ""
//    });

    vlayerControl = new OpenLayers.Control.SelectFeature([vlayer, querylayer, shiplayer], {
        icon: "../theme/default/img/pan_on.png",
        title: "查询要素",
        text: ""
    }, {

        clickout: true, toggle: false,
        multiple: false, hover: true,
        toggleKey: "ctrlKey", // ctrl key removes from selection
        multipleKey: "shiftKey" // shift key adds to selection

    });
    
    map.addControl(vlayerControl);
    vlayerControl.activate();
//    var panel = new OpenLayers.Control.Panel(
//                    {
//                        div: document.getElementById("panel"),
//                        defaultControl: vlayerControl,
//                        createControlMarkup: function (control) {
//                            var button = document.createElement("button"),
//                                iconSpan = document.createElement("img"),
//                                textSpan = document.createElement("span");

//                            if (control.icon) {
//                                iconSpan.src = control.icon;
//                            }
//                            button.appendChild(iconSpan);
//                            if (control.text) {
//                                textSpan.innerHTML = control.text;
//                            }
//                            button.appendChild(textSpan);
//                            return button;
//                        }
//                    });



//    var clc = new EraseLayer(vlayer, {
//        icon: "img/marker.png", title: "清除图层", text: ""
//    });
//    var edit = new OpenLayers.Control.ModifyFeature(vlayer, {
//        icon: "theme/default/img/draw_point_on.png",
//        title: "编辑要素",
//        text: "",
//        displayClass: 'olControlModifyFeature'
//    });
//    //    var drawfeature = new OpenLayers.Control.EditingToolbar(vlayer, {
//    //        icon: "theme/default/img/add_point_on.png",
//    //        title: "绘制要素",
//    //        text: ' 绘制',
//    //        displayClass: 'olEditingToolbar'
//    //    });
//    var drawPolygon = new OpenLayers.Control.DrawFeature(vlayer, OpenLayers.Handler.Polygon, {
//        icon: "img/draw_polygon_on.png", title: "绘制多边形"
//    });
//    drawPolygon.events.on({ "featureadded": drawCom });
//    function drawCom(ev) {
//        var geometry = ev.feature.geometry;
//    }
//    function drawCompleted(ev) {
//        var geometry = ev.feature.geometry;
//        var wkt = new OpenLayers.Format.WKT();
//        var feature = ev.feature; //暂时用于popup位置的
//        var featureCenter = feature.geometry.getBounds().getCenterLonLat();
//        popup = new OpenLayers.Popup.CSSFramedCloud("featurePopup",
//                                         featureCenter,
//                                         null,
//                                         "<div id='popup' style=' padding:12px;'>" +
//                                         "</br>" +
//                                         "type:" + "<input id='type' type='text'>" + "</br>" +
//                                         "Name:" + "<input id='Name' type='text'>" + "</br>" +
//                                         "<input id='submit' type='button' value='标注舰船' onclick='insert()' />" + "</br>" +
//                                          "</div>",
//                                         null, true, PopupClose);
//        feature.popup = popup;
//        popup.feature = feature;
//        map.addPopup(popup, true);

//        var geometryclone = geometry.clone();
//        geometryclone.transform("EPSG:900913", "EPSG:4326");
//        shiptype = document.getElementById('type').value;
//        shipname = document.getElementById('Name').value;
//        var feature2 = new OpenLayers.Feature();
//        feature2.geometry = geometryclone;
//        insertText = wkt.write(feature2);
//        //      
//    }

//    function PopupClose(evt) {
//        // 'this' is the popup.
//        //        var feature = this.feature;
//        //        if (feature.layer) { // The feature is not destroyed
//        //            vlayerControl.unselect(feature);
//        //        } else { // After "moveend" or "refresh" events on POIs layer all 
//        //            //     features have been destroyed by the Strategy.BBOX
//        this.destroy();

//    }

//    var drawPoint = new OpenLayers.Control.DrawFeature(vlayer, OpenLayers.Handler.Point, {
//        icon: "img/aircraft.jpg", title: "绘制点"
//    });
//    drawPoint.events.on({ "featureadded": drawCompleted }); //当要素添加成功时候执行的函数
//    //    
//    var del = new DeleteFeature(vlayer, {
//        icon: "img/eraseFeature.png", title: "清除图层", text: ""
//    });

//    var boxquery = new OpenLayers.Control.DrawFeature(vlayer, OpenLayers.Handler.Polygon, {
//        icon: "img/view_next_on.png", title: "画框查询"
//    });
//    boxquery.events.on({ "featureadded": done });

//    function done(evt) {
//        var geometry = evt.feature.geometry;     //画框查询，开始向数据库发送查询的范围。
//        geometry.transform("EPSG:900913", "EPSG:4326");
//        var Bound = geometry.getBounds();
//        document.getElementById("ulx").value = Bound.left;
//        document.getElementById("uly").value = Bound.top;
//        document.getElementById('lrx').value = Bound.right;
//        document.getElementById('lry').value = Bound.bottom;

//        //$.POST("Handler_mongo.ashx",{            
//        //    type: "query_spatial_grid", 
//        //    bound: Bound 
//        //},
//        //    function (data) {
//        //        alert(data);                
//        //    }
//        //);
//        var xmlrequest = new XMLHttpRequest();        
//        xmlrequest.open("POST", "Handler_mongo.ashx", true);
//        var content = "type=" + "query_spatial_grid" + "&bound=" + Bound;
//        xmlrequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
//        xmlrequest.onreadystatechange = function () {
//            if (xmlrequest.readyState == 4 && xmlrequest.status == 200) {
//                alert(xmlrequest.responseText);
//            }
//            //vlayer.addFeatures(bufferFeature);
//        }
//        xmlrequest.send(content);
//        //alert(Bound);

//    }


//    

//    panel.addControls([vlayerControl, world, drawPolygon, drawPoint, edit, del, boxquery]);
//    //    map.addControl(drawfeature);
//    //  panel.addControls([nav.next, nav.previous]);
//    map.addControl(panel);

   //查询功能

   info = new OpenLayers.Control.WMSGetFeatureInfo(
                       {
                           url: geourl + "geoserver/wms",
                           title: "get info by clicking",
                           queryVisible: true,
                           eventListeners: {
                               getfeatureinfo: function (e) {
                                   map.addPopup(new OpenLayers.Popup.FramedCloud(
                               "chicken",
                               map.getLonLatFromPixel(e.xy),
                               new OpenLayers.Size(30, 30),
                               e.text,
                               null,
                               true
                               ));

                               }

                           }
                       });
   map.addControl(info);
   info.activate();

//    //    map.events.register('click', map, mapclick);

//    function mapclick(e) {
//        document.getElementById("nodelist").innerHTML = "loading";
//        var params = {
//            REQUEST: "GetFeatureInfo",
//            EXCEPTIONS: "application/vnd.ogc.se_xml",
//            BBOX: map.getExtent().toBBOX(),
//            X: e.xy.x,
//            Y: e.xy.y,
//            INFO_FORMAT: 'text/html',
//            QUERY_LAYERS: map.layers[0].params.LAYERS,
//            FEATURE_COUNT: 50,
//            Layers: ['topp:states', 'cite:natcapitals'],
//            Styles: '',
//            Srs: 'EPSG:4326',
//            WIDTH: map.size.w,
//            HEIGHT: map.size.h,
//            format: 'image/jpeg'
//        };

//        OpenLayers.loadURL = function (uri, params, caller, onComplete, onFailure) {
//            if (typeof params == 'string') { params = OpenLayers.Util.getParameters(params); }
//            var success = (onComplete) ? onComplete : OpenLayers.nullHandler; var failure = (onFailure) ? onFailure : OpenLayers.nullHandler; return OpenLayers.Request.GET({ url: uri, params: params, success: success, failure: failure, scope: caller });
//        };

//        OpenLayers.loadURL(geourl + "geoserver/wms", params, this, setHTML, setFail);

//        //  OpenLayers.loadURL("geoserverProxy.aspx?url=http://58.198.182.214:8080/geoserver/wms", params, this, setHTML, setFail);
//        OpenLayers.Event.stop(e);

//    }


//    //create Feature point test 
//    var point = new OpenLayers.Geometry.Point(125.7, 31.5);
//    var proj = new OpenLayers.Projection("EPSG:4326");
//    point.transform("EPSG:4326", map.getProjectionObject());
//    var pointFeature = new OpenLayers.Feature.Vector(point);
//    var point2 = new OpenLayers.Geometry.Point(128.2, 42.4);
//    point2.transform(proj, map.getProjectionObject());
//    var pointFeature2 = new OpenLayers.Feature.Vector(point2);
//    pointFeature2.attributes = {
//        name: "shipfleet",
//        title: "ship",
//        type: "FishingBoat",
//        SUB_REGION: "PACIFIC"
//    };
//    pointFeature.attributes = {
//        name: "No.Bush",
//        title: "ship",
//        type: "Aircraft Carrier",
//        favColor: 'red',
//        align: 'cm',
//        Region: 'West Pacific'
//    };
//    var wkt1 = new OpenLayers.Format.WKT();
//    var polygon1 = wkt1.read("POLYGON((7.174072265625 32.5634765625, 57.799072265625 37.4853515625, 92.955322265625 0.2197265625, 73.970947265625 -13.1396484375, 5.767822265625 -23.6865234375, 7.174072265625 32.5634765625))");

//    vlayer.addFeatures([pointFeature, pointFeature2]);


//    //// Interaction; not needed for initial display.


//    wfstest.events.on({
//        'featureselected': onFeatureSelect,
//        'featureunselected': onFeatureUnselect
//    });
    querylayer.events.on({
        'featureselected': onFeatureSelect,
        'featureunselected': onFeatureUnselect
    });
  
   shiplayer.events.on({
       'featureselected': onFeatureSelect,
       'featureunselected': onFeatureUnselect
   });

    // function queryTile(evt) {
    //     var feature = evt.feature;

    //     Qbound = feature.geometry.getBounds();  //判断Bound内的舰船数量。并且显示其名称到div中！
        
    //     var featureCenter = feature.geometry.getBounds().getCenterLonLat();
    //     var Width = Qbound.getWidth(); var Height = Qbound.getHeight();
    //     var WHratio = Width / Height;
    //     var imgWidth = 300; imgHeight = Math.round(imgWidth / WHratio);

    //     imgurl = geourl + 'geoserver/wms?bbox=' + Qbound + '&styles=raster&Format=image/png&request=GetMap&layers=cite:landsatSHB5WGS&width=' + imgWidth + '&height=' + imgHeight + '&srs=EPSG:900913';
    //     //        imgurl=http://localhost:8080/geoserver/wms?bbox=-130,24,-66,50&styles=population&Format=image/png&request=GetMap&layers=topp:states&width=550&height=250&srs=EPSG:4326
    //     //htmlurl = 'http://localhost:8080/geoserver/wms?bbox=' + Qbound + '&styles=raster&Format=application/openlayers&request=GetMap&layers=cite:landsatSHB5WGS&width=300px&height=250px&srs=EPSG:900913';

    //     popup = new OpenLayers.Popup.CSSFramedCloud("featurePopup",
    //                                      featureCenter,
    //                                      null,
    //                                      "<div  id='popup' style='padding:15px;'>" +

    //                                      //"<img src="+ imgurl +">" + "</br>" +
    //                                      "瓦片分辨率(米):" + map.getResolution() + "</br>" +
    //                                      "舰船数量:" + "未知" + "</br>" +
    //                                      "所属国:" + feature.attributes.ShipOwnCountry + "</br>" +
    //                                      "活跃时间:" + feature.attributes.ActiveTime + "</br>" +
    //                                      "船只类型:" + feature.attributes.ShipType + "</br>" +
    //                                      "<input id='delftr' type='button' value='删除标注' onclick='del()' />" +
    //                                      "<input id='zscale' type='text' value=1  />" +
    //                                      "<input id='zoomTo' type='button' value='缩放至' onclick='ZoomTo()' />" + "</div>"
    //                                      ,
    //                                      null, true, onPopupClose);
    //     feature.popup = popup;
    //     popup.feature = feature;
    //     map.addPopup(popup, true);


    // }


    // Needed only for interaction, not for the display.
    function onPopupClose(evt) {
        // 'this' is the popup.
        var feature = this.feature;
        if (feature.layer) { // The feature is not destroyed
            vlayerControl.unselect(feature);
        } else { // After "moveend" or "refresh" events on POIs layer all 
            //     features have been destroyed by the Strategy.BBOX
            this.destroy();
        }
    }
   function onFeatureSelect(evt) {
       feature = evt.feature;
      // fid = feature.fid
       var format = new OpenLayers.Format.WKT();
       //inputwkt = format.write(feature);
       var featureCenter = feature.geometry.getBounds().getCenterLonLat();
       popup = new OpenLayers.Popup.CSSFramedCloud("featurePopup",
                                        featureCenter,
                                        null,
                                        "<div id='popup' style=' padding:12px;'>" +
//                                        "<img src='../Scripts/img/Ac.png'>" + "</br>" +
                                        
                                        "" + feature.attributes.name + "</br>" +
//                                        "Region:" + feature.attributes.SUB_REGION + "</br>" +                                        
                                        "</div>"
                                        ,
                                        null, true, onPopupClose);
       feature.popup = popup;
       popup.feature = feature;
       map.addPopup(popup, true);
       //document.getElementById("scale").innerHTML = featureCenter;

       //map.panTo(featureCenter);
   }



    function onFeatureUnselect(evt) {
        feature = evt.feature;
        if (feature.popup) {
            popup.feature = null;
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
    }

//geolocate模块
    var style = {
        fillColor: 'blue',
        fillOpacity: 0.1,
        strokeWidth: 0
    };

    vector = new OpenLayers.Layer.Vector('定位点');  //标注定位点的矢量图层
    map.addLayer(vector);

    //var pulsate = function (feature) {
    //    var point = feature.geometry.getCentroid(),
    //        bounds = feature.geometry.getBounds(),
    //        radius = Math.abs((bounds.right - bounds.left) / 2),
    //        count = 0,
    //        grow = 'up';

    //    var resize = function () {
    //        if (count > 16) {
    //            clearInterval(window.resizeInterval);
    //        }
    //        var interval = radius * 0.03;
    //        var ratio = interval / radius;
    //        switch (count) {
    //            case 4:
    //            case 12:
    //                grow = 'down'; break;
    //            case 8:
    //                grow = 'up'; break;
    //        }
    //        if (grow !== 'up') {
    //            ratio = -Math.abs(ratio);
    //        }
    //        feature.geometry.resize(1 + ratio, point);
    //        vector.drawFeature(feature);
    //        count++;
    //    };
    //    window.resizeInterval = window.setInterval(resize, 50, point, radius);
    //};

    geolocate = new OpenLayers.Control.Geolocate({
        bind: false,
        geolocationOptions: {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 7000
        }
    });
    map.addControl(geolocate);
    firstGeolocation = true;
    geolocate.events.register("locationupdated", geolocate, function (e) {
        vector.removeAllFeatures();
        locationFeature=new OpenLayers.Feature.Vector(e.point)        
        var lon = e.point.x; var lat = e.point.y;
        //e.point.transform("EPSG:4326", "EPSG:900913");
        var circle = new OpenLayers.Feature.Vector(
            OpenLayers.Geometry.Polygon.createRegularPolygon(
                new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                e.position.coords.accuracy / 2,
                20,
                0
            ),
            {},
            style
        );
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    //externalGraphic: "../img/here.gif",
                    //graphicWidth: 30,
                    //graphicHeight: 30,
                    //graphicOpacity:0.5,
                    graphicName: 'circle',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 6
                }
            ),
            circle
        ]);
        if (firstGeolocation) {
            map.zoomToExtent(vector.getDataExtent());
           // pulsate(circle);
            firstGeolocation = false;
            this.bind = true;            
            
        }
    });
    geolocate.events.register("locationfailed", this, function () {
        OpenLayers.Console.log('Location detection failed');
    });    




} //end of init() 



//// 缓冲区 核心功能。。 通过发送post请求到数据库，参数为send（）中的参数content字串
////      //BuffJson 定向到connect.aspx 页面，请求缓冲区。
////查询数据库中的记录，直接发送get或者post请求为上策
//function BuffJson() {


//    var wkt = new OpenLayers.Format.WKT();
//    bufferFeature = new OpenLayers.Feature();
//    var xmlrequest = new XMLHttpRequest();

//    //  alert(inputwkt);
//    var bufdist = document.getElementById("BuffDist").value
//    if (bufdist.toString().length > 5) {
//        alert("input correct degrees");
//    }
//    // 需要验证用户输入的逻辑性,待修改.如果检验提交的表单
//    //  xmlrequest.open("GET", "connect.aspx?geom=" + inputwkt + "&dist=" + bufdist, true);
//    xmlrequest.open("POST", "connect.aspx", true);
//    var content = "geom=" + inputwkt + "&dist=" + bufdist;
//    //    xmlrequest.setRequestHeader("Content-Length", content.length);
//    xmlrequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
//    xmlrequest.onreadystatechange = function () {
//        if (xmlrequest.readyState == 4 && xmlrequest.status == 200) {
//            var objs = eval(xmlrequest.responseText);
//            //alert(objs.length); // 2
//            // alert(objs[0].st_astext.toString());
//            wktext = objs[0].st_astext.toString();
//            bufferFeature = wkt.read(wktext);
//            // bufferFeature.geometry.transform("EPSG:4326","EPSG:3857");

//            //                    var str1 = wkt.write(bufferFeature);
//            //                    alert(str1);
//        }
//        querylayer.addFeatures(bufferFeature);
//    }
//    xmlrequest.send(content);

//    //return bufferFeature;                       
//}

//function MoveToShip2(ary1, ary2) {    
//    var point = new OpenLayers.LonLat(ary1, ary2);    
//    point.transform("EPSG:4326", "EPSG:900913");
//    map.panTo(point);
//    map.zoomTo(3);
//    //var geometry = new OpenLayers.Geometry.Point(ary1, ary2);
//    //geometry.transform("EPSG:4326", "EPSG:900913");
//    //var feature=new OpenLayers.Feature();
//    //feature.geometry=geometry;
//    //vlayer.addFeatures(feature);

//}


////WFS查询 代码，返回适合条件的xml ，解析为feature

//function query() {

//    str = document.getElementById("text1").value;
//    var filter1 = new OpenLayers.Filter.Logical({
//        type: OpenLayers.Filter.Logical.AND,
//        filter: [
//                    new OpenLayers.Filter.Comparison({
//                        type: OpenLayers.Filter.Comparison.LIKE,
//                        property: "pop_rank",
//                        value: "*" + str + "*"
//                    }),
//                    new OpenLayers.Filter.Spatial({
//                        type: OpenLayers.Filter.Spatial.BBOX,
//                        property: "geom",
//                        value: map.getExtent()
//                    })
//        ]
//    });
//    var filter2 = new OpenLayers.Filter.Logical({
//        type: OpenLayers.Filter.Logical.AND,
//        filters: [
//                        new OpenLayers.Filter.Comparison({
//                            type: OpenLayers.Filter.Comparison.LIKE,
//                            property: "STATE_NAME",
//                            value: "*" + str + "*"
//                        })
//        //                        new OpenLayers.Filter.Comparison({
//        //                            type:OpenLayers.Filter.Comparison.BETWEEN,
//        //                            property: "the_geom",
//        //                            value: map.getExtent()
//        //                        })
//        ]
//    });
//    var filter_1_0 = new OpenLayers.Format.Filter.v1_0_0();
//    var xml = new OpenLayers.Format.XML();


//    var xmlPara = '<wfs:GetFeature service="WFS" version="1.0.0" ' +
//  'outputFormat="GML2" ' +
//  'xmlns:topp="http://www.openplans.org/topp" ' +
//  'xmlns:wfs="http://www.opengis.net/wfs" ' +
//  'xmlns:ogc="http://www.opengis.net/ogc" ' +
//  'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
//  'xsi:schemaLocation="http://www.opengis.net/wfs  http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"> ' +
//  ' <wfs:Query typeName="topp:states"> ' + xml.write(filter_1_0.write(filter2)) + '</wfs:Query> </wfs:GetFeature>';
//    //'<ogc:Filter> <PropertyIsEqualTo> <PropertyName>STATE_NAME</PropertyName> <Literal>'+str+'</Literal> </PropertyIsEqualTo> </ogc:Filter> </wfs:Query> </wfs:GetFeature> ';

//    var xmlCapital = '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.0.0" ' +
//    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
//    'xmlns:cite="http://www.opengeospatial.net/cite"> ' +
//    'xmlns:ogc="http://www.opengis.net/ogc" ' +
//    'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"> ' +
//    '<wfs:Query typeName="cite:natcapitals"  ' + xml.write(filter_1_0.write(filter1)) + '</wfs:Query> </wfs:GetFeature>';


//    request = OpenLayers.Request.POST({
//        url: geourl + "geoserver/wfs",
//        data: xmlPara,
//        callback: onComplete

//    });
//} // end of query function

//function onComplete(request) {
//    //    alert("send Post OK");
//    var gmlParse = new OpenLayers.Format.GML();
//    features = gmlParse.read(request.responseText);

//    for (var f in features) {
//        feature = features[f];
//        //clonefeature = feature.clone();
//        feature.geometry.transform("EPSG:4326", "EPSG:900913");
//        //                   
//        //                    feature.attribute = {
//        //                        title: feature.data.STATE_NAME,
//        //                        type: "states"
//        //                    };
//        //                
//        querylayer.addFeatures(feature);
//    }

//}

//function ECregion() {
//    var point1 = new OpenLayers.LonLat(131.6562, 21.29255);
//    point1.transform("EPSG:4326", "EPSG:3857");
//    map.panTo(point1);
//    map.zoomTo(2);


//}
//function WPregion() {
//    var point1 = new OpenLayers.LonLat(-95, 34);
//    point1.transform("EPSG:4326", "EPSG:3857");
//    map.panTo(point1);
//    map.zoomTo(2);
//}


//function insert() {
//    var xmlrequest = new XMLHttpRequest();

//    //  xmlrequest.open("GET", "connect.aspx?geom=" + inputwkt + "&dist=" + bufdist, true);
//    xmlrequest.open("GET", "connect.aspx?geom=" + insertText + "&shiptype=" + shiptype + "&shipname=" + shipname, true);
//    //    var content = "geom=" + insertText;
//    //    xmlrequest.setRequestHeader("Content-Length", content.length);
//    //    xmlrequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
//    xmlrequest.onreadystatechange = function () {
//        if (xmlrequest.readyState == 4 && xmlrequest.status == 200) {
//            alert('Insert ok');
//            shiplayer.redraw();
//        }
//        //shiplayer.addFeatures(feature);
//    }
//    xmlrequest.send(null);


//}

//function cancel(ev) {
//    ev.feature.destroy();
//    vlayer.redraw();
//}

//function del() {

//    var xmlrequest = new XMLHttpRequest();
//    var sql = 'del';
//    //  xmlrequest.open("GET", "connect.aspx?geom=" + inputwkt + "&dist=" + bufdist, true);
//    xmlrequest.open("GET", "connect.aspx?fid=" + fid + '&sql=' + sql, true);
//    //    var content = "geom=" + insertText;
//    //    xmlrequest.setRequestHeader("Content-Length", content.length);
//    //    xmlrequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
//    xmlrequest.onreadystatechange = function () {
//        if (xmlrequest.readyState == 4 && xmlrequest.status == 200) {
//            alert('Delete ok');
//            shiplayer.redraw();
//        }
//        //shiplayer.addFeatures(feature);
//    }
//    xmlrequest.send(null);

//}

//function ZoomTo() {
//    alert("功能待开放");
//    //map.zoomTo(5);
//}
document.getElementById('locate').onclick = function () {
    OpenLayers.Console.log('start locate');
    vector.removeAllFeatures();
    geolocate.deactivate();
    //document.getElementById('track').checked = false;
    geolocate.watch =false;
    //firstGeolocation = true;
    geolocate.activate();
};
function upLoadData()
{

    if (typeof(locationFeature) == "undefined") { alert("请先定位"); return }
    
    locationFeature.geometry.transform("EPSG:900913", "EPSG:4326")
    var locationText = locationFeature.geometry.x.toFixed(4).toString() + " " + locationFeature.geometry.y.toFixed(4).toString()
    //var Wkt = new OpenLayers.Format.WKT()
    //locationText = Wkt.write(locationFeature)
    //insertDate = new Date()
    var param = {"location":locationText,"type":"postSave","disc":"小四到此一游"};
    $.ajax({
        type: "post",
        async: false,
        url: "query.ashx",
        data: param,
        dataType: "text",
        success: function (info) { alert(info) },
        error: function (error) { alert("insert failed"); }
    });
    //$.post("query.ashx", param,
    //function () {
    //   alert("上传成功");
    //});
    
}

function onPopupClose(evt) {
    // 'this' is the popup.
    var feature = this.feature;
    if (feature.layer) { // The feature is not destroyed
        vlayerControl.unselect(feature);
    } else { // After "moveend" or "refresh" events on POIs layer all 
        //     features have been destroyed by the Strategy.BBOX
        this.destroy();
    }
}

function featureSel(feature) {
    var featureCenter = feature.geometry.getBounds().getCenterLonLat();
    popup = new OpenLayers.Popup.CSSFramedCloud("featurePopup",
                                        featureCenter,
                                        null,
                                        "<div id='popup' style=' padding:12px;'>" +
    //                                        "<img src='../Scripts/img/Ac.png'>" + "</br>" +

                                        "" + feature.attributes.name + "</br>" +
    //                                        "Region:" + feature.attributes.SUB_REGION + "</br>" +                                        
                                        "</div>"
                                        ,
                                        null, true, onPopupClose);
    feature.popup = popup;
    popup.feature = feature;
    map.addPopup(popup, true);

}




function xwy(region){
    //var point =new OpenLayers.LonLat(-157.960,21.35295);
    if(region=="xwy")
    {
        var pointGeo= new OpenLayers.Geometry.Point(-157.960,21.35295);
    }
    else if(region=="djw")
    {
        var pointGeo= new OpenLayers.Geometry.Point(139.650,35.295);
    }
    else if(region== "sh")
    {
        var pointGeo= new OpenLayers.Geometry.Point(121.541,30.662);
        pointGeo.transform("EPSG:4326","EPSG:3857");
        var point =new OpenLayers.LonLat(pointGeo.x,pointGeo.y);
        map.panTo(point);
        map.zoomTo(8);
        return;
    }
    pointGeo.transform("EPSG:4326","EPSG:3857");
    var point =new OpenLayers.LonLat(pointGeo.x,pointGeo.y);
    map.panTo(point);
    map.zoomTo(8);
    
}


function MoveToPoint(x,y) {
    var point =new OpenLayers.LonLat(x,y); 
//    var point = new OpenLayers.LonLat(feature["location"]["lng"],feature["location"]["lat"]);
    map.panTo(point);
    map.zoomTo(11);   
    window.location.href='#pageone';
    
    var size = new OpenLayers.Size(16,20);
    var icon = new OpenLayers.Icon('../Scripts/img/marker1.png', size, "");/// "img/Ac.png" />
    var mark=new OpenLayers.Marker(new OpenLayers.LonLat(x,y),icon);
    
    marker.addMarker(mark);
    window.setTimeout(function(){ mark.destroy();},2000);
}

function onLiSelect(x,y,hosname) {
       
       window.location.href='#pageone';
       var feature =new OpenLayers.Feature();
       var geometry= new OpenLayers.Geometry.Point(x,y);
       feature.geometry= geometry;
       feature.attributes={"name":hosname};  
       shiplayer.removeFeatures( shiplayer.selectedFeatures,null);    //消除上一次添加的feature。
       shiplayer.addFeatures(feature);

       feature.renderIntent = "select"; 
       shiplayer.redraw();

       var point = new OpenLayers.LonLat(x,y);
       map.panTo(point);
       map.zoomTo(11);
      
   }

function DrawPoint(responseTxt) {

    var result = responseTxt;
    

    if (result == "")
        {alert("未查询到结果");
        return;}
    else {
            
            var Geojsonr = new OpenLayers.Format.GeoJSON();
            var wkt = new OpenLayers.Format.WKT();

            var _arr = [];
            var list = document.getElementById("list");
            list.innerHTML="";

            var polygon = new OpenLayers.Geometry.LineString();

            for (var i in result) {      
//               
                var hospital= wkt.read(result[i]["st_astext"].toString());
                var hosname= result[i]["hname"];
                hospital.geometry.transform("EPSG:4326", "EPSG:3857");
                polygon.addComponent(hospital.geometry)
                hospital.attributes={"name":result[i]["hname"],"shiptype":""};                
                shiplayer.addFeatures(hospital);
                if (i < 7) { //将前7条记录以列表形式显示
                    var x = hospital.geometry.x; var y = hospital.geometry.y;
                    var _html = '<li><a href="#" onclick="onLiSelect(' + x + "," + y + ",\'" + hosname + '\');return false;" >' +
                    // var _html = '<li><a href="#" onclick="onLiSelect('+ hospital +');return false;" >' +
                '<p> ' + result[i]["hname"] + '</p>' +
                '</a></li>';
                    _arr.push(_html);  //push每个列表字串到数组_arr中
                }
            }
            if (_arr.length > 0) {
//                对于一个数组_arr,将所有元素join成一个字串,Join之后字串是逗号分隔
                list.innerHTML = _arr.join("");
//                list.listview('refresh');
            }
            window.location.href = "#pageone";                         
            map.panTo(new OpenLayers.LonLat(x,y));
            map.zoomToExtent(polygon.getBounds())
          
        }

    }

    function DrawCircle(lon, lat, radius) {// lon,lat With SRID:3857,radius in meters
        templayer.removeAllFeatures();
        var point = new OpenLayers.Geometry.Point(lon, lat);
        var circle = new OpenLayers.Feature.Vector(new 
        OpenLayers.Geometry.Polygon.createRegularPolygon(point, radius, 40, 0));   
        templayer.addFeatures(circle);
}

function searchplace() {
    var name = $("#keyword").val();
    if(name=="")
    {
        alert("不能为空");
        return;
    }
    var param={"distric":"上海","type":"query","hospital":name};
    $.get("query.ashx", param,
    function (json) { templayer.removeAllFeatures(); shiplayer.removeAllFeatures(); DrawPoint(json); $("#list").listview('refresh'); }, "json")
    //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
    //jsonpCallback:"flightHandler",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据

   
//    $.ajax({
//            type:"post",
//            async: false,
//            url:"query.ashx",
//            data:param,
//            dataType:"json",
//            success:function(json){DrawPoint(json);$("#list").listview('refresh');},
//            error:function(){alert("fail");}    //ajax 是比较复杂的包含错误处理函数的 请求函数
//    });

}

function searchnear() {
    var wkt = new OpenLayers.Format.WKT();
    var centerFeature = shiplayer.selectedFeatures[0];
    if (centerFeature == undefined)
    {
        alert("请选择一个中心点")
        return
    }
    var X = centerFeature.geometry.x;var Y = centerFeature.geometry.y;
    centerFeature.geometry.transform("EPSG:3857", "EPSG:4326");
    var centerwkt = wkt.write(centerFeature);

    var param = { "type": "querynear","geom":centerwkt };
    $.ajax({
        type: "post",
        async: false,
        url: "query.ashx",
        data: param,
        dataType: "json",
        success: function (json) { shiplayer.removeAllFeatures(); DrawCircle(X, Y, 2200); DrawPoint(json); $("#list").listview('refresh'); },
        error: function () { alert("fail"); }
    });

}

function DrawPath(json)
{   
    
    var result = json;
    if (result == "")    //result 是 Text结构的，不是geojson
        {alert("未查询到结果");
        return;}
    else {
        //shiplayer.removeAllFeatures();
            var geoCollection = new OpenLayers.Geometry.Collection();
            var Geojsonr = new OpenLayers.Format.GeoJSON();
            var wkt = new OpenLayers.Format.WKT();
            var roads= Array();

            for (var i in result) {      
//              
                var geojson= result[i]["st_astext"];
                if(geojson !=null)  // 只有road有空间实体，才能添加
                {
                    var pathfeature= wkt.read(geojson);    //linestring feature
                  
                    var pathname="";
                    if( result[i]["name"]==null)
                    {
                        pathname="";
                    }
                    else { pathname=result[i]["name"]; }
                    pathfeature.geometry.transform("EPSG:4326", "EPSG:3857");
                    geoCollection.addComponent(pathfeature.geometry);
                    pathfeature.attributes={"name":pathname};                
                    querylayer.addFeatures(pathfeature); 
                    
                }
            }
            geoCollection.calculateBounds();
            map.zoomToExtent(geoCollection.bounds);         
            querylayer.redraw();           
            
         }
    
}

function pathplan()
{
    var points = $("#keyword").val().split(",");  //数组
    if(points[0]=="")
    {
        alert("请输入起止节点代号");
        return ;
    }
    
    var param={"type":"shortpath","start":points[0],"end":points[1]};
    $.ajax({
        type:"post",
        async:false,
        url: "query.ashx",
        data:param,
        dataType:"json",
        success: function (json) { DrawPath(json); window.location.href = "#pageone"; },
        error:function(){alert("fail");}
    });

}

function SwitchBase(mapid)
{
    switch (mapid)
    {
        case 1:
            map.setBaseLayer(gamelayer);
            break;
        case 2:
            map.setBaseLayer(voyagelayer);
            break;
        case 3:            
            map.setBaseLayer(HDlayer);
            break;
            

    }
}

function updateStore()
{

    var param = { "type": "useHttpWebApproach", "serviceurl": "http://58.198.183.143:8099/geoserver/",
        "login": "j_spring_security_check"
    };
    var param2 = {
        "type": "useHttpWebApproach", "serviceurl": "http://58.198.183.143:8099/geoserver/",
        "login": "j_spring_security_check",
        "prefix2": "web/?wicket:interface=:22:rasterStoreForm:save::IActivePageBehaviorListener:0:&wicket:ignoreIfNotActive=true&random=0.04496526625007391"
    }
      $.ajax({
          type: "post",
          async: false,
          url: "query.ashx",
          data: param2,
          //dataType: "jsonp",
//          jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
//          ////             jsonpCallback:"flightHandler",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
//          //
          success: function () { alert("成功更新服务");  },
          error: function () { alert("fail"); }
      });


//      $.ajax({
//          type: "post",
//          async: false,
//          url: "query.ashx",
//          data: param2,         
//          success: function () { alert("成功更新服务"); },
//          error: function () { alert("fail"); }
//        
//      });
  }

  function loginserv() {
      var param = { "username":"admin","password":"geoserver" };
      $.ajax({
          type: "post",
          async: false,
          url: "http://58.198.183.143:8099/geoserver/j_spring_security_check",
          data: param,
          datatype: "text/html",
          success: function (data) { $.cookie('CurrProduct', data, { expires: 365, path: '/' }); alert(data.ProductID); },
          error: function () { alert("fail"); }
      });



      //$('#track').onclick = function () {
      //    vector.removeAllFeatures();
      //    geolocate.deactivate();
      //    if (this.checked) {
      //        geolocate.watch = true;
      //        firstGeolocation = true;
      //        geolocate.activate();
      //    }
      //};
      //$('#track').checked = false;

//      $.ajax({
//          type: "get",
//          async: false,
//          url: "http://58.198.183.143:8099/geoserver/web/",
//          data: "",
//          success: function () { alert("ok"); },
//          error: function () { alert("fail"); }
//      });
  }

//}


    $(document).ready(function () {
        $("#menu").mmenu({
            //slidingSubmenus: false
        }
      );



    });

