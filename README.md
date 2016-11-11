## Jqmap2

this is <strong>web mobile map project</strong> based on jQuery Mobile and <a href="http://openlayers.org/">OpenLayers</a> which can run in mobile browser.

if you have any question ,welcome to commemt.

there are also several demo from mapbox. 
cause I am going to replace ol2 with mapbox gl js or ol3.
**performance** are key element for mobile webapp, so light weighted
is more preferred.

- index2.html -> mapbox loading points from geojson
- 3 -> mapbox extrude 3d building from "height" props
- 4 -> mapbox load offline tiles.
- 5 -> mapbox animate positions like slideshow.

## Recently Update 2016/10/28:
Currently <a href="https://www.mapbox.com/mapbox-gl-js/">Mapbox GL JS</a> is applied to build A totally new flightgame, with pitch, bearing in viewport and webgl render.

Game ScreenShot:
![flight_screenshot](https://github.com/alex2wong/Jqmap2/blob/master/Asset/flight_screenshot.png?raw=true)

### **Demos** for you:
<a href="http://alex2wong.github.io/Jqmap2/"> Mobile web map </a>, the JqueryMobile and Openlayer2 webApp.
<a href="http://123.206.201.245:3002/flight.html"> Flight Game </a>, press WSAD for move, Space to fire, Enjoy it!

## Todo:
- add websocket to support multiplayer (completed!)
- optimize touch events to promote mobile performance
- display other player's fire action and sync Robot Status to all client, not emit to client speratedly anymore.
- optimize calculation in fire animation. promote game influence.(completed!)
- add mini map to navigate enemy drone.

