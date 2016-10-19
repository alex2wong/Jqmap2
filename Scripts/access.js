/// <reference path="OpenLayers.js" />


//define a new class DeleteFeature
var DeleteFeature = OpenLayers.Class(OpenLayers.Control, {
    initialize: function (layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layer = layer;
        this.handler = new OpenLayers.Handler.Feature(
            this, layer, { click: this.clickFeature }
        );
    },
    clickFeature: function (feature) {
        // if feature doesn't have a fid, destroy it
        if (feature.fid == undefined) {
            this.layer.destroyFeatures([feature]);
        } else {
            feature.state = OpenLayers.State.DELETE;
            this.layer.events.triggerEvent("afterfeaturemodified",
                                           { feature: feature });
            feature.renderIntent = "select";
            this.layer.drawFeature(feature);
        }
    },
    setMap: function (map) {
        this.handler.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Control.DeleteFeature"
});


var EraseLayer = OpenLayers.Class(OpenLayers.Control, {
    initialize: function (layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.layer = layer;
        this.handler = new OpenLayers.Handler.Feature(
            this, layer, { click: this.eraselayer }
        );
    },
    eraselayer: function (layer) {
        this.layer.removeAllFeatures();
        alert("all clear");
    },
    setMap: function (map) {
        this.handler.setMap(map);
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Control.EraseLayer"
});

var Click = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function (options) {
        this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
        OpenLayers.Control.prototype.initialize.apply(
                        this, [options]);
        this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.clickhere
                        }, this.handlerOptions
                    );
    },

    clickhere: function (e) {
        var lonlat = map.getLonLatFromPixel(e.xy);
        lonlat.transform("EPSG:900913", "EPSG:4326");
        alert(lonlat);
        //        alert("You clicked near " + lonlat.lat + " N, " +
        //                                              +lonlat.lon + " E");
    },
    CLASS_NAME: "OpenLayers.Control.Click"

});

// 加载高德街道图层的自定义类
 OpenLayers.Layer.GaodeCache = OpenLayers.Class(OpenLayers.Layer.TMS, {

            tileOriginCorner: 'tl',

            type: 'png',

            myResolutions: [
                            //156543.0339,
                           // 78271.516953125,
                            39135.7584765625,
                            19567.87923828125,
                            9783.939619140625,
                            4891.9698095703125,
                            2445.9849047851562,
                            1222.9924523925781,
                            611.4962261962891,
                            305.74811309814453,
                            152.87405654907226,
                            76.43702827453613,
                            38.218514137268066,
                            19.109257068634033,
                            9.554628534317016,
                            4.777314267158508,
                            2.388657133579254,
                            1.194328566789627,
                            0.5971642833948135
            ],

            tileOrigin: new OpenLayers.LonLat(-20037508.3427892, 20037508.3427892),

            initialize: function (name, url, options) {

                OpenLayers.Layer.TMS.prototype.initialize.apply(this, [name, url, options]);
            },

            getURL: function (bounds) {
                var res = this.map.getResolution();
//                var x = parseInt((bounds.getCenterLonLat().lon - this.tileOrigin.lon) / (256 * res));
//                var y = parseInt((this.tileOrigin.lat - bounds.getCenterLonLat().lat) / (256 * res));
//                var z = this.map.getZoom();
//                if (Math.abs(this.myResolutions[z] - res) > 0.0000000000000000001) {
//                    for (var i = 0; i < this.myResolutions.length; i++) {
//                        if (Math.abs(this.myResolutions[i] - res) <= 0.0000000000000000001) {
//                            z = i;
//                            break;
//                        }
//                    }
//                }


//                if (OpenLayers.Util.isArray(this.url)) {
//                    var serverNo = parseInt( Math.random(0, this.url.length));
//                    return this.url[serverNo] + "&z="+z + '&y=' + y + '&x=' + x;
//                }else{
//                    return this.url + "&z="+z + '&y=' + y + '&x=' + x;
                //                }
                var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));  //this.tileSize.w
                var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
                var z = this.map.getZoom()+2;
                if (this.maxExtent.intersectsBounds(bounds)) {
                    // return this.url + z + "/" + x + "/" + y + "." + this.type;
                    return this.url + "&z=" + z + '&y=' + y + '&x=' + x;
                } else {
                    return "";
                }
            }

    });

// 加载mapbox 的切片类
OpenLayers.Layer.MapboxLayer = OpenLayers.Class(OpenLayers.Layer.TMS, {

            tileOriginCorner: 'tl',

            type: 'png',

            myResolutions: [
                            //156543.0339,
                           // 78271.516953125,
                            39135.7584765625,
                            19567.87923828125,
                            9783.939619140625,
                            4891.9698095703125,
                            2445.9849047851562,
                            1222.9924523925781,
                            611.4962261962891,
                            305.74811309814453,
                            152.87405654907226,
                            76.43702827453613,
                            38.218514137268066,
                            19.109257068634033,
                            9.554628534317016,
                            4.777314267158508,
                            2.388657133579254,
                            1.194328566789627,
                            0.5971642833948135
            ],

            tileOrigin: new OpenLayers.LonLat(-20037508.3427892, 20037508.3427892),

            initialize: function (name, url, options) {

                OpenLayers.Layer.TMS.prototype.initialize.apply(this, [name, url, options]);
            },

            getURL: function (bounds) {
                var res = this.map.getResolution();
                var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));  //this.tileSize.w
                var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
                var z = this.map.getZoom()+2;
                if (this.maxExtent.intersectsBounds(bounds)) {
                    // return this.url + z + "/" + x + "/" + y + "." + this.type;
                    return this.url + "/" + z + '/' + x + '/' + y + "." + this.type;
                } else {
                    return "";
                }
            }

    });


// 加载自主切割图层的自定义类
 OpenLayers.Layer.MyCache = OpenLayers.Class(OpenLayers.Layer.TMS, {

            //tileOriginCorner: 'tl',

            type: 'jpg',

            myResolutions: [
                            //156543.0339,
                            //78271.516953125,
                            39135.7584765625,
                            19567.87923828125,
                            9783.939619140625,
                            4891.9698095703125,
                            2445.9849047851562
                            /*1222.9924523925781,
                            611.4962261962891,
                            305.74811309814453,
                            152.87405654907226,
                            76.43702827453613,
                            38.218514137268066,
                            19.109257068634033,
                            9.554628534317016,
                            4.777314267158508,
                            2.388657133579254,
                            1.194328566789627,
                            0.5971642833948135*/
            ],

            tileOrigin: new OpenLayers.LonLat(-20037508.3427892, 20037508.3427892),

            initialize: function (name, url, options) {

                OpenLayers.Layer.TMS.prototype.initialize.apply(this, [name, url, options]);
            },

            getURL: function (bounds) {
                var res = this.map.getResolution();
                var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));  //this.tileSize.w
                var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
                var z = this.map.getZoom();
                if (this.maxExtent.intersectsBounds(bounds)) {
                    // return this.url + z + "/" + x + "/" + y + "." + this.type;
                    return this.url  +'/' + y + '_' + x + "." + this.type;
                } else {
                    return "";
                }
            }

 });




 OpenLayers.Layer.TrafficLayer = OpenLayers.Class(OpenLayers.Layer.TMS, {

     tileOriginCorner: 'tl',

     type: 'png',

     myResolutions: [
                     156543.0339,
                     78271.516953125,
                     39135.7584765625,
                     19567.87923828125,
                     9783.939619140625,
                     4891.9698095703125,
                     2445.9849047851562,
                     1222.9924523925781,
                     611.4962261962891,
                     305.74811309814453,
                     152.87405654907226,
                     76.43702827453613,
                     38.218514137268066,
                     19.109257068634033,
                     9.554628534317016,
                     4.777314267158508,
                     2.388657133579254,
                     1.194328566789627,
                     0.5971642833948135
     ],

     //原点在左上角，属于Google切片规范
     tileOrigin: new OpenLayers.LonLat(-20037508.3427892, 20037508.3427892),

     initialize: function (name, url, options) {

         OpenLayers.Layer.TMS.prototype.initialize.apply(this, [name, url, options]);
     },

     getURL: function (bounds) {
         
         var res = this.map.getResolution();        
         var x = Math.round((bounds.left - this.maxExtent.left) / (res * 256));  //this.tileSize.w
         var y = Math.round((this.maxExtent.top - bounds.top) / (res * 256));
         var z = 14 - this.map.getZoom();
         if (z < 7)
         {
             x = x * 15; y = y * 15;
         }
         if (z > 6)
         {
             x = x * 2; y = y * 2;
         }
         if (this.maxExtent.intersectsBounds(bounds)) {
             // return this.url + z + "/" + x + "/" + y + "." + this.type;
             return this.url + "&zoom=" + z + '&y=' + y + '&x=' + x;
         } else {
             return "";
         }
     }

 });

    function DrawPath(startindex) {
        order = startindex;
        if (order == 0) { var length = DrawPath2(order); }
        while (order < length) {
            var t = setTimeout("DrawPath2(" + order + ")", 0 + order * 1000);
            order++;
        }
        //while (order < 3) {
        //    var int = setInterval("DrawPath2(" + order + ")", 5000);
        //    order++;
        //}
        //var intv = setInterval("DrawPath2()", 2000);
    }

    function DrawPath2(order) {

        var Json = '{ "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [129.7239, 19.541] }, "properties": { "ShipName": "ship-0", "ShipOwnCountry": "China", "ShipSize": { "Length": 800, "Width": 200 }, "Azimuth": 45, "ShipType": "", "ShipTeam": "", "ShipHomePort": "", "ActiveTime": "2014/10/09 22:32:23", "Weaponry": { "ShipECM": "", "AirForceEquip": "", "AirDefenceEquip": "" }, "AerialCarrierMaxLimit": 1000, "PassengerNumbers": 1000, "MaxSpeed": 50, "Draught": 15, "Displacement": 10, "InvestigationTime": "", "ShipNumberInTheGivenRange": 3, "SourceImage": { "ImageID": "Image0", "location": { "type": "Point", "coordinates": [119.541, 29.541] }, "BandNumber": 5, "SpatialReferenceInformation": "", "ResolutionRatio": "1024*1024" } } }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [121.7239, 11.541] }, "properties": { "ShipName": "ship-0", "ShipOwnCountry": "China", "ShipSize": { "Length": 800, "Width": 200 }, "Azimuth": 45, "ShipType": "", "ShipTeam": "", "ShipHomePort": "", "ActiveTime": "2014/10/10 22:32:23", "Weaponry": { "ShipECM": "", "AirForceEquip": "", "AirDefenceEquip": "" }, "AerialCarrierMaxLimit": 1000, "PassengerNumbers": 1000, "MaxSpeed": 50, "Draught": 15, "Displacement": 10, "InvestigationTime": "", "ShipNumberInTheGivenRange": 3, "SourceImage": { "ImageID": "Image0", "location": { "type": "Point", "coordinates": [29.7239, 119.541] }, "BandNumber": 5, "SpatialReferenceInformation": "", "ResolutionRatio": "1024*1024" } } }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [122.7239, 14.541] }, "properties": { "ShipName": "ship-0", "ShipOwnCountry": "China", "ShipSize": { "Length": 800, "Width": 200 }, "Azimuth": 45, "ShipType": "", "ShipTeam": "", "ShipHomePort": "", "ActiveTime": "2014/10/11 22:32:23", "Weaponry": { "ShipECM": "", "AirForceEquip": "", "AirDefenceEquip": "" }, "AerialCarrierMaxLimit": 1000, "PassengerNumbers": 1000, "MaxSpeed": 50, "Draught": 15, "Displacement": 10, "InvestigationTime": "", "ShipNumberInTheGivenRange": 3, "SourceImage": { "ImageID": "Image0", "location": { "type": "Point", "coordinates": [29.7239, 119.541] }, "BandNumber": 5, "SpatialReferenceInformation": "", "ResolutionRatio": "1024*1024" } } }] }';
        var Jsonr = new OpenLayers.Format.GeoJSON();
        var features = Jsonr.read(Json);
        var style = {
            strokeColor: "#DDDD22",
            strokeWidth: 5,
            strokeOpacity: 0.7,
            title: "battleship"

        };
        var date = [];
        if (order == 0) { features[0].geometry.transform("EPSG:4326", "EPSG:900913"); vlayer.addFeatures(features[0]); return features.length; }
        else {

            features[order - 1].geometry.transform("EPSG:4326", "EPSG:900913");
            features[order].geometry.transform("EPSG:4326", "EPSG:900913");

            var line = new OpenLayers.Geometry.LineString([features[order - 1].geometry, features[order].geometry]);   //数组array是用[]包括的，{}是字典。。
            var linef = new OpenLayers.Feature.Vector(line, {}, style);
            querylayer.addFeatures(linef);
            vlayer.addFeatures(features[order]);

        }
        //for (var i in features)
        //{
        //    //date[i] = Date.parse(features[i].data["ActiveTime"].replace(/-/g, "/"));
        //    features[i].geometry.transform("EPSG:4326", "EPSG:900913");
        //    //setTimeout("vlayer.addFeatures(" + features[i] + ")", 1000);
        //   // setTimeout("alert('nimeia')",5000);
        //}

    }
       

OpenLayers.Popup.CSSFramedCloud = OpenLayers.Class(OpenLayers.Popup.Framed, {
    autoSize: true,
    panMapIfOutOfView: true,
    fixedRelativePosition: false,

    positionBlocks: {
        "tl": {
            'offset': new OpenLayers.Pixel(44, -6),
            'padding': new OpenLayers.Bounds(5, 14, 5, 5),
            'blocks': [
                {
                    className: 'olwidgetPopupStemTL',
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(null, 4, 32, null),
                    position: new OpenLayers.Pixel(0, -28)
                }
            ]
        },
        "tr": {
            'offset': new OpenLayers.Pixel(-44, -6),
            'padding': new OpenLayers.Bounds(5, 14, 5, 5),
            'blocks': [
                {
                    className: "olwidgetPopupStemTR",
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(32, 4, null, null),
                    position: new OpenLayers.Pixel(0, -28)
                }
            ]
        },
        "bl": {
            'offset': new OpenLayers.Pixel(44, 6),
            'padding': new OpenLayers.Bounds(5, 5, 5, 14),
            'blocks': [
                {
                    className: "olwidgetPopupStemBL",
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(null, null, 32, 4),
                    position: new OpenLayers.Pixel(0, 0)
                }
            ]
        },
        "br": {
            'offset': new OpenLayers.Pixel(-44, 6),
            'padding': new OpenLayers.Bounds(5, 5, 5, 14),
            'blocks': [
                {
                    className: "olwidgetPopupStemBR",
                    size: new OpenLayers.Size(20, 20),
                    anchor: new OpenLayers.Bounds(32, null, null, 4),
                    position: new OpenLayers.Pixel(0, 0)
                }
            ]
        }
    },

    initialize: function (id, lonlat, contentSize, contentHTML, anchor, closeBox,
                    closeBoxCallback, relativePosition, separator) {
        if (relativePosition && relativePosition != 'auto') {
            this.fixedRelativePosition = true;
            this.relativePosition = relativePosition;
        }
        if (separator === undefined) {
            this.separator = ' of ';
        } else {
            this.separator = separator;
        }

        this.olwidgetCloseBox = closeBox;
        this.olwidgetCloseBoxCallback = closeBoxCallback;
        this.page = 0;
        OpenLayers.Popup.Framed.prototype.initialize.apply(this, [id, lonlat,
            contentSize, contentHTML, anchor, false, null]);
    },

    /*
    * 构造popup内部容器。
    */
    setContentHTML: function (contentHTML) {
        if (contentHTML !== null && contentHTML !== undefined) {
            this.contentHTML = contentHTML;
        }

        if (this.contentDiv !== null) {
            var popup = this;

            // 清空旧数据
            this.contentDiv.innerHTML = "";

            // 创建内部容器
            var containerDiv = document.createElement("div");
            containerDiv.innerHTML = this.contentHTML;
            containerDiv.className = 'olwidgetPopupContent';
            this.contentDiv.appendChild(containerDiv);

            // 创建关闭按钮
            if (this.olwidgetCloseBox) {
                var closeDiv = document.createElement("div");
                closeDiv.className = "olwidgetPopupCloseBox";
                closeDiv.innerHTML = "close";
                closeDiv.onclick = function (event) {
                    popup.olwidgetCloseBoxCallback.apply(popup, arguments);
                };
                this.contentDiv.appendChild(closeDiv);
            }
            if (this.autoSize) {
                this.registerImageListeners();
                this.updateSize();
            }
        }
    },

    /*
    * 重写createBlocks：使用CSS样式而不是特定的img图片
    */
    createBlocks: function () {
        this.blocks = [];

        // since all positions contain the same number of blocks, we can
        // just pick the first position and use its blocks array to create
        // our blocks array
        var firstPosition = null;
        for (var key in this.positionBlocks) {
            firstPosition = key;
            break;
        }

        var position = this.positionBlocks[firstPosition];
        for (var i = 0; i < position.blocks.length; i++) {

            var block = {};
            this.blocks.push(block);

            var divId = this.id + '_FrameDecorationDiv_' + i;
            block.div = OpenLayers.Util.createDiv(divId,
                null, null, null, "absolute", null, "hidden", null
            );
            this.groupDiv.appendChild(block.div);
        }
    },
    /*
    * 重写updateBlocks
    */
    updateBlocks: function () {
        if (!this.blocks) {
            this.createBlocks();
        }
        if (this.size && this.relativePosition) {
            var position = this.positionBlocks[this.relativePosition];
            for (var i = 0; i < position.blocks.length; i++) {

                var positionBlock = position.blocks[i];
                var block = this.blocks[i];

                // adjust sizes
                var l = positionBlock.anchor.left;
                var b = positionBlock.anchor.bottom;
                var r = positionBlock.anchor.right;
                var t = positionBlock.anchor.top;

                // note that we use the isNaN() test here because if the
                // size object is initialized with a "auto" parameter, the
                // size constructor calls parseFloat() on the string,
                // which will turn it into NaN
                //
                var w = (isNaN(positionBlock.size.w)) ? this.size.w - (r + l)
                                                      : positionBlock.size.w;

                var h = (isNaN(positionBlock.size.h)) ? this.size.h - (b + t)
                                                      : positionBlock.size.h;

                block.div.style.width = (w < 0 ? 0 : w) + 'px';
                block.div.style.height = (h < 0 ? 0 : h) + 'px';

                block.div.style.left = (l !== null) ? l + 'px' : '';
                block.div.style.bottom = (b !== null) ? b + 'px' : '';
                block.div.style.right = (r !== null) ? r + 'px' : '';
                block.div.style.top = (t !== null) ? t + 'px' : '';

                block.div.className = positionBlock.className;
            }

            this.contentDiv.style.left = this.padding.left + "px";
            this.contentDiv.style.top = this.padding.top + "px";
        }
    },
    updateSize: function () {

        return OpenLayers.Popup.prototype.updateSize.apply(this, arguments);

    },

    CLASS_NAME: "OpenLayers.Popup.CSSFramedCloud"
});

