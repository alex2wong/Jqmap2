var selectlayers = [];
  selectlayers.push(shroad);

  /*$ = function(ele){
    return document.querySelector(ele);
  }*/

  function printlayerinfo(){
    map.getLayers().forEach(function(layer,i){
      console.log(layer.get('title'),i,layer.getZIndex())
    });
  }

  var util = {
    map: null,
    gl: getlayer,
    gli: getlayerindex,
    zl: zoomToLayer,
    mstartpos:{x:0, y:0},
    mstoppos:{x:0, y:0},
    moffset:{x:0, y:0}
  }

  util.event = {
    addDrag : function(ele){
      ele.onmousedown = function(evt){
        console.log("dragging from "+ evt.clientX + ',' + evt.clientY);
        util.mstartpos.x = evt.clientX;
        util.mstartpos.y = evt.clientY;

        ele.onmousemove = function(evt){
          console.log("mt "+ evt.clientX + ',' + evt.clientY);
        }

        ele.onmouseup = function(evt){
          // ele.onmousedown = null;
          ele.onmousemove = null;
          util.moffset.x = evt.clientX - util.mstartpos.x;
          util.moffset.y = evt.clientY - util.mstartpos.y;
          console.log("offset is "+util.moffset.x+','+util.moffset.y);
        }
      }
    }
  }

  // var mdiv =  document.getElementById("map");
  // var mvp = map.getViewport();
  // util.event.addDrag(mvp);
  // var canv = document.getElementsByTagName("canvas")[0];
  // var ctx = canv.getContext("2d");
  // ctx.fillRect(100,100,200,200);
  

  // var nc= document.createElement("canvas");
  // nc.width = 300;nc.height = 300;
  // nc.style.position = "relative";
  // mvp.appendChild(nc);
  // nctx = nc.getContext("2d");
  // nctx.fillRect(100,100,200,200);

  function getlayername(layername)
  {
    var layers = map.getLayers().array_ || map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].get('title') == layername){
        return layers[i];
      }
    }
    return null;
  }

  function getlayer(index){
    var layers = map.getLayers().array_ || map.getLayers().getArray();
    return layers[index];
    // return index;
  }
  function getlayerindex(ollayer){
    return map.getLayers().array_.indexOf(ollayer);
  }

	var tian_base = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "http://t{1-7}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
            }),
            title:"天地图-无偏"
        });


        var tian_diming = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "http://t{1-7}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}"
            }),
            title:"天地图注记"
        }); 

        var geoqdark = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url:"http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}"
            }),
            title:"geoq暗夜底图-有偏"
        });

        var features = new ol.Collection();
        // wrapX:false means 可以穿越日期变更线
        var drawsource = new ol.source.Vector({
          wrapX:false,
          features:features
        });
        var drawvector = new ol.layer.Vector({
          title:"用户绘制图层",
          source: drawsource,
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.1)'
            }),
            stroke: new ol.style.Stroke({
              color: '#f44336',
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({
                color: '#ffcc33'
              })
            })
          })
        });

        var vstyle = new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#5d5555'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff5d8',
              width: 1
            }),
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({
                color: '#ffcc33'
              })
            })
          });
        var greenstyle = new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#4caf50'
            })
          });
        var waterstyle = function (feature, resolution){
          return new ol.style.Style({
              fill: new ol.style.Fill({
                color: '#2196F3'
              }),
              // text: createTextStyle(feature, resolution, {
              //     maxRes: 450,
              //     field: "name",
              //     weight: "bold",
              //     size: "14px",
              // })
          });
        }

        /* set Style of layer */
        function setStyle(layername, prop){
            map.getLayers().forEach(function(layer,i){
              var title = layer.get('title');
              console.log(title,i);
              if (title == layername){
                layer.setStyle(prop);
              }
          })
        }

        // res is shpobj defined by shp.js. has properties: fileCode,shapeType,records(array of record)..record = {number,length,shape}.. shape = {type,content={parts,points}}
        //var parsedShp = null
        // road_UTM.shp 110m_land.shp D:\yingjieftp\part-00000\上海基础数据\ShanghaiCityBuffer1km.shp
        var loadshp = function(shppath){
          // load is async process. 异步执行过程。
          SHPParser.load(shppath, 
            function(res) {
              console.log('ok', res);
              //parsedShp = res;
              var parseetime = new Date().getTime();
              console.log('shapefile contain '+res.records.length+' features. timeelpase '+ (parseetime- parsetime)+ 'ms');
              var nfeatures = new ol.Collection();
              var newlayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                  features:nfeatures
                }),
                title: shppath,
                style: vstyle
              });
              map.addLayer(newlayer);
              createlayerdiv();
              bindControl();
              //selectlayers.push(newlayer);
              var stime = new Date().getTime();
              // add res(shpobj) 2 vector layer. transform struct. each record means one feature.
              for (var i = res.records.length - 1; i >= 0; i--) {
                 // start to transform to struct known by OL.
                 var shptype = res.records[i].shape.type;
                 var shpcontent = res.records[i].shape.content.points;
                 var coords = []
                  var coord = [0,0]
                  // length must be even. first i is odd!! second is even, the push to coords.
                  for (var j = shpcontent.length - 1; j >= 0; j--) {
                    if(j%2==1){
                      coord[1] = shpcontent[j];
                    }else{
                      coord[0] = shpcontent[j];
                      coords.push(coord);
                      coord = [];
                    }
                  }
                  var geoms = null;
                 if (shptype == 5){
                    var coordscontain = [];
                    coordscontain.push(coords);
                    geoms = new ol.geom.Polygon(coordscontain);
                  }
                  if(shptype == 3){
                    geoms = new ol.geom.LineString(coords);
                  }
                  geoms.transform("EPSG:4326","EPSG:3857");
                  var fpoly = new ol.Feature(geoms);
                  //drawvector.getSource().addFeature(fpoly);
                  nfeatures.push(fpoly);
               }
               var etime = new Date().getTime();
               console.log('push features to vector colletion finish, timeelpase '+ (etime-stime)+ 'ms');
               res = null;
            },
            function(err){ console.log('error', res); });
        }      

        parsetime = new Date().getTime();
        
        //loadshp("cpdmpop2010_poly_wgs.shp");
        // Performance need to be promoted. Cache manage not good!. refer to mapshaper.org. How to render tens of thousands of Data with limited buffer..
        
        // 默认是click要素出发选择事件。
        var select = new ol.interaction.Select({
          condition: ol.events.condition.pointerMove,
          layers: selectlayers
          //multi:// 选中当前pixel 的多个要素还是一个！
        });
        var selectedFeatures = select.getFeatures();

        // var selectPointerMove = new ol.interaction.Select({
        //   condition: ol.events.condition.pointerMove
        // });
        var dragrotateandzoom = new ol.interaction.DragRotateAndZoom({
          condition:ol.events.condition.altKeyOnly
        });

        var dragbox = new ol.interaction.DragBox({
          condition:ol.events.condition.shiftKeyOnly,
          style:new ol.style.Style({
            stroke: new ol.style.Stroke({
              color:[0,0,255,1]
            })
          })
        });        
        var scaleLineControl = new ol.control.ScaleLine();

        var roadMaxRes = 60, helper = true, distStrat = false;
        /**
         * layer init and map drag/zoom will trigger this func.
         */
        function roadStyleFunction(feature, resolution) {
          return new ol.style.Style({
              stroke : new ol.style.Stroke({
                color: 'rgba(255,255,10,.0)',
                // width: 5/(feature.getProperties()["CLASS"]%40)
              }),
              // 根据配置 返回道路的文字标注！！
              text: labelEngine.createTextStyle(feature, resolution, {
                  maxRes: roadMaxRes,
                  field: "NAME",
              })
          });
        }

        // 城市点要素的文字标注配置！！
        function cityStyleFunction(feature, resolution) {
          return new ol.style.Style({
              image: new ol.style.Circle({
                fill: new ol.style.Fill({
                        color: "#ffc107"
                      }),
                radius: 4
              }),
              // 根据配置 返回城市的文字标注！！
              text: labelEngine.createTextStyle(feature, resolution, {
                  maxRes: 25000,
                  field: "city",
                  lang: "en",
              }),
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
          maxResolution: roadMaxRes,
          title: "shanghai_road",
          style: roadStyleFunction
        });

        var extent = [120.78489, 30.68767, 121.95649, 31.58687];

        layercol = [
             //geoqdark,
             tian_base,
             //sh_img,
             //tian_diming,
             vector,
             shroad,
             cities,
             drawvector
            ];        
        
        var map = new ol.Map({
            layers: layercol,
            controls: ol.control.defaults({
            }).extend([
                new ol.control.MousePosition({
                  coordinateFormat: ol.coordinate.createStringXY(4),
                  projection:ol.proj.get("EPSG:4326"),
                  className: 'custom-mouse-position',
                  target: document.getElementById("mouse-position")
                }),
                //new ol.control.ZoomSlider(),
                new ol.control.ZoomToExtent({
                  "extent": ol.proj.transformExtent([119, 30, 122, 32],"EPSG:4326","EPSG:3857")
                })
            ]),
            interactions:ol.interaction.defaults({
            }).extend([
                select,dragrotateandzoom,dragbox
            ]),
            // 绑定 div
            target: 'map',
            view: new ol.View({
                // 默认是3857的web墨卡托
                center: ol.proj.transform([121.3, 31.3], 'EPSG:4326', 'EPSG:3857'),
                zoom: 12
            })
        });

        // 加载各种基础数据
        // loadshp("110m_land.shp");
        // loadshp('Asset/china.shp');
        // loadshp('Green.shp');
        setTimeout(function() {
          loadshp('Asset/water.shp');
          if (getlayername('Asset/water.shp')) {
              var waters = getlayername('Asset/water.shp').getSource().getFeatures();
              for(var i=0; i < waters.length; i++) {
                  waters[i].setProperties({"name": "黄浦江"});
              }
          }
        }, 500);

        $('#map')[0].style.backgroundColor = '#333';
        /* getlayername('用户绘制图层').setZIndex(20);*/


        map.once('postcompose',function(){console.log("render finish, timeelpase "+ (new Date().getTime()-parsetime) +" ms")});
        // construct layerTree
        function createlayerdiv()
        {
          var layercont =$(".layers")[0];
          var lihtmls = [];
          var lihtml = "";
          // function(layer, i) layer is ol.layer object
          map.getLayers().forEach(function(layer,i){
            var title = layer.getProperties().title;
            lihtml = '<li id="layer'+ i +'"><label class="checkbox" for="vlayer'+ i +'"><input id="vlayer'+ i +'" class="visible" type="checkbox">'+ title +' </input><input class="opacity" type="range" min="0" max="1" step="0.01"></input></label></li>'
            lihtmls.push(lihtml);
          })
          layercont.innerHTML = lihtmls.join("");
        };
        createlayerdiv();

        // bindInputs???
        function bindControl(){map.getLayers().forEach(function(layer, i) {
          bindInputs('#layer' + i, layer);
          if (layer instanceof ol.layer.Group) {
            layer.getLayers().forEach(function(sublayer, j) {
              bindInputs('#layer' + i + j, sublayer);
            });
          }
        })};
        bindControl();

        var info = $('#info');
        //var info = document.getElementById("info");
        info.tooltip({
          animation: false,
          trigger: 'manual'
        });

        var displayFeatureInfo = function(pixel) {
          info.css({
            left: pixel[0] + 'px',
            top: (pixel[1] - 15) + 'px'
          });
          var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            // 所有图层都返回要素, 也可以进行限定。
            if(layer && layer.getProperties().title === "shanghai_road")
              return feature;
          });
          if (feature) {
            info.tooltip('hide')
                .attr('data-original-title', feature.get('name'))
                .tooltip('fixTitle')
                .tooltip('show');
          } 
          else{
            info.tooltip('hide');
          }
        };

        //针对整个map容器内的鼠标移动事件，所以没有图层限制
        map.on('pointermove', function(evt) {
          if (evt.dragging) {
            info.tooltip('hide');
            return;
          }
          displayFeatureInfo(map.getEventPixel(evt.originalEvent));
        });

        var labelEngine = new LabelEngine({
          labelFields: ['city', 'NAME'],
          helperSource: drawsource,
          distStrat: distStrat,
        });
        map.on('moveend', function(evt) {
            if (labelEngine && labelEngine.init) {
                labelEngine.log();
                labelEngine.init();
            }
            adjustView();
            document.body.style.cursor = "default";
        });

        map.on('movestart', function(evt) {
            drawsource.clear();
            document.body.style.cursor = "move";
        })

        select.on("select",function(evt){
          var featureselect = evt.selected;
          //console.log("select features , count " + featureselect.length );
          // ol.Map {"control,interaction,view,layers"} - ol.Layer{"visible,opacity,title"}- ol.Source{"url"}   

          // ol.Collection {"array_":[ol.Feature,ol.Feature]}
          // ol.Feature{"properties":{},"geometry":{"type":"Point/LineString/Polygon/MuliPolygon","coordinate":[x,y]/[[x1,y1],[],[]],[[],[],[]]}}, ol.Geometry {"extent":}

          //ol.Geometry([x,y]).transform("EPSG:3857","EPSG:4326")


        });
        //var projection = ol.proj.get('EPSG:3857');  

        var selinfobox = document.getElementById("selectinfo");

        dragbox.on("boxend",function(e){          
          selectedFeatures.clear();
          var selinfo = [];
          // 实际上dragbox是可以用来绘制矩形框的inter控件。但可以做多用途，放大到指定extent，或者旋转view ，或者多选。自由定制. 目前设定只框选一个图层
          var extent = dragbox.getGeometry().getExtent();
          shroad.getSource().forEachFeatureIntersectingExtent(extent,function(feature){
            selectedFeatures.push(feature);
            selinfo.push(feature.getProperties().NAME);
          });

          if (selinfo.length>0)
          {
            selinfobox.innerHTML = selinfo.join();
          }
        });
    
    function adjustView(){
        getlayername('Asset/water.shp')?getlayername('Asset/water.shp').setStyle(waterstyle):console.log('');
        getlayername('用户绘制图层')?getlayername('用户绘制图层').setZIndex(20):console.log('');
        getlayername('shanghai_road')?getlayername('shanghai_road').setZIndex(120):console.log('');
        getlayername('cities')?getlayername('cities').setZIndex(100):console.log("");        
    }

    // set textPathStyle according inputs
    function setTextPath(){
        if (getlayername('用户绘制图层')) {
            getlayername('用户绘制图层').setTextPathStyle(function(f) {
            return [ new ol.style.Style(
          {	text: new ol.style.TextPath(
            {	
              text: "text follow curve",
              font: "12px Arial",
              fill: new ol.style.Fill ({ color:"#369" }),
              stroke: new ol.style.Stroke({ color:"#fff", width:3 }),
              // textBaseline: $("#textBaseline").val(),
              // textAlign: $("#textAlign").val(),
              rotateWithView: true,
              // textOverflow: $("#overflow").val(),
              // minWidth: Number($("#minwidth").val())
            }),
            // geometry: $("#cspline").prop("checked") ? f.getGeometry().cspline() : null
          })]
            })
        }
    }

    /* input layername */
    function zoomToLayer(targetlayer){
      if (arguments[0] == undefined){
        var layerindex = map.getLayers().array_.length-1;
        targetlayer = map.getLayers().array_[layerindex];
      }
      else{
        targetlayer = getlayername(targetlayer);
      }

      console.log('new added layer has feature num: '+ targetlayer.getSource().getFeatures().length);
      var extent = targetlayer.getSource().getExtent();
      try {
        var fgeom = targetlayer.getSource().getFeatures()[0].getGeometry();
        //[120.78489, 30.68767, 121.95649, 31.58687];
        var simplegeom = new ol.geom.LineString([[extent[0],extent[1]],[extent[2],extent[3]]]);
        map.getView().fit(fgeom,map.getSize());
      } catch(e) {
        // statements
        console.log("This layer is not visible or has no feature");
      }
    }

    var shpfiles = document.getElementById("shpfile");
    fileselect = function(){
      var f = shpfile.files[0];// f has attri {lastModified,name,size,type...}
      var reader = new FileReader();
      var ftype = f.name.split(".")[1];
      isBinary = f.name.split(".")[1] == "shp"?true:false;
      var nfeatures = new ol.Collection();
      var newlayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features:nfeatures
        }),
        title: f.name.split(".")[0]
      });

      // accept only EPSG:4326 lonlat geojson
      if(ftype == "json"||ftype == "geojson"){
        reader.readAsText(f);
        reader.onload = function() {
           // body...  
           var jsonR = new ol.format.GeoJSON();
           var fs = jsonR.readFeatures(reader.result);
           for (i in fs){
              if (fs[i].getGeometry().extent_[0] > 180 || fs[i].getGeometry().extent_[0] < -180){
                nfeatures.push(fs[i]);
                continue;
              }
              fs[i].getGeometry().transform("EPSG:4326","EPSG:3857");
              //newlayer.getSource().addFeature(fs[i]);
              nfeatures.push(fs[i]);
           }
        }
        //zoomToLayer(layersnum-1);
      }
      if(isBinary){
        // read shpfile

      }

      map.addLayer(newlayer);
      createlayerdiv();
      bindControl();
      selectlayers.push(newlayer);
      var layersnum = map.getLayers().array_.length;
      //map.on("postcompose",zoomToLayer(layersnum-1));
    }

    var taxiimage = new ol.style.Circle({
        radius: 3,
        snapToPixel: false,
        fill: new ol.style.Fill({ color: 'yellow' })
        //stroke: new ol.style.Stroke({ color: 'red', width: 1 })
    });

    //var speed = 100
    var n = 1000
    var omegatime = 15000 // duration
    var timestamp = [];
    //  set animation of taxi
    function taxiani(event) {
        var vectorContext = event.vectorContext;
        var framState = event.frameState;
        timestamp.push(framState.time);
        timeratio = timestamp.length > 1 ? (timestamp[timestamp.length - 1] - timestamp[0]) / omegatime : 0.0;
        if (timeratio > 1.00)
        {
            console.log("duration over!");
            // map.un("postcompose", taxiani);
        }
        var coordinates = []
        var roadfs = shroad.getSource().getFeatures();
        n = roadfs.length-1;
        // each line get the start and end coord, calc the animation point in the line.
        for (i = 0; i < n; ++i) {
            var roadcoords = roadfs[i].getGeometry().getCoordinates();
            var fpoint = roadcoords[0];
            var lpoint = roadcoords[roadcoords.length - 1];
            var x = (lpoint[0] - fpoint[0]) * timeratio + fpoint[0];
            var y = (lpoint[1] - fpoint[1]) * timeratio + fpoint[1];
            coordinates.push([x, y]);
        }
        vectorContext.setImageStyle(taxiimage);
        vectorContext.drawMultiPointGeometry(new ol.geom.MultiPoint(coordinates), null);
        map.render();
    }
    //map.on("postcompose", taxiani);
    //map.render();

    var marker = new ol.Overlay({
      position: [121.13,31.44],
      name :'11'
    });
    map.addOverlay(marker);
    // earthquick 2 top
    getlayer(0).setZIndex(10);