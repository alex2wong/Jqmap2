## Jqmap2
Jqmap2 contains sets of **web app** based on <a href="https://www.mapbox.com/mapbox-gl-js/">Mapbox GL JS</a> and socket.io

Currently <a href="https://www.mapbox.com/mapbox-gl-js/">Mapbox GL JS</a> is applied to build A totally new flightgame, with pitch, bearing in viewport and webgl render.

Game ScreenShot:

![flight_screenshot](https://github.com/alex2wong/Jqmap2/blob/master/Asset/flight_screenshot.jpg?raw=true)

Roads Style and Rectangle label background
![Roads Style_screenshot](https://github.com/alex2wong/Jqmap2/blob/master/Asset/roadsStyle-roundRect.jpg?raw=true)
[Rectangle label background based on Canvas](http://alex2wong.github.io/Jqmap2/labelbg.html) Thanks@Yang

[Mapbox cloud example](http://alex2wong.github.io/Jqmap2/examples/cloudlayer/)
![Mapbox cloud example](https://github.com/alex2wong/Jqmap2/blob/master/Asset/images/cloudlayer.gif)

### ↓Openlayer label without overlap<br>
![openlayer label without overlap](https://github.com/alex2wong/Jqmap2/blob/master/Asset/Label_Func3.gif)
<br>
if interested **how it works**, visit [WIKI](https://github.com/alex2wong/Jqmap2/wiki/Openlayer-%E5%AE%9E%E7%8E%B0%E5%B8%A6%E7%A2%B0%E6%92%9E%E6%A3%80%E6%B5%8B%E7%9A%84%E6%A0%87%E6%B3%A8) for more information.

### **Demos** for you:
<a href="http://alex2wong.github.io/Jqmap2/label.html"> Label Example </a>, Openlayer label Engine, Update 2017/5/17. Simple config, easy use.
<br>
```
// new LabelEngine.
var labelEngine = new LabelEngine({
      labelFields: ['city', 'NAME'],
      distStrat: true,
    });

// refresh timer each moveend.
map.on('moveend', function(evt) {
    if (labelEngine) {
        labelEngine.log();
        labelEngine.init();
    }
});

// config layer styleFunction as usual
function cityStyleFunction(feature, resolution) {
  return new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
                color: "#ffc107"
              }),
        radius: 4
      }),
      // config layer label option
      text: labelEngine.createTextStyle(feature, resolution, {
          maxRes: 25000,
          field: "city",
          lang: "en",
      }),
  });
}

```
<br>
<a href="http://alex2wong.github.io/Jqmap2/proxy.html"> Proxy Example </a>, Get  resource by Nodejs Proxy, input busline name in DEMO to get the line coordinates.
<br>
<a href="http://alex2wong.github.io/Jqmap2/blur.html"> Blur Example </a>, blur partial canvas context, based on js lib [blurify](https://github.com/alex2wong/blurify).
<br>
<a href="http://alex2wong.github.io/Jqmap2/"> Mobile web map </a>, the JqueryMobile and Openlayer2 webApp.
<br>
<a href="http://111.231.11.20/flight.html"> Flight Game </a>, press WSAD for move, Space to fire, Enjoy it!
<br>
<a href="http://alex2wong.github.io/Jqmap2/index2.html" > First view flight </a>, press WSAD for move

## Todo List:
- add websocket to support multiplayer (completed!)
- optimize touch events to promote mobile performance (completed!)
- display other player's fire action and sync Robot Status to all client, not emit to client speratedly anymore.
- optimize calculation in fire animation. promote game influence.(completed!)
- add mini map to navigate enemy drone(completed).
- add chatPopup to map, clear to show who talks.(completed).
- **!important**: refactor code structure based on es6. (inprogress..)
- **!important**: add AI-robot module to current robot flight which can follow and fire at player. (completed)

