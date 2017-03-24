## Jqmap2
Jqmap2 contains sets of **web app** based on <a href="https://www.mapbox.com/mapbox-gl-js/">Mapbox GL JS</a> and socket.io

Currently <a href="https://www.mapbox.com/mapbox-gl-js/">Mapbox GL JS</a> is applied to build A totally new flightgame, with pitch, bearing in viewport and webgl render.

Game ScreenShot:

![flight_screenshot](https://github.com/alex2wong/Jqmap2/blob/master/Asset/flight_screenshot.jpg?raw=true)

### ↓Openlayer label without overlap<br>
![openlayer label without overlap](https://github.com/alex2wong/Jqmap2/blob/master/Asset/Label_Func3.gif)
<br>
if interested, visit [ISSUE1](https://github.com/alex2wong/Jqmap2/issues/1) for more information.

### **Demos** for you:
<a href="http://alex2wong.github.io/Jqmap2/label.html"> Label Example </a>, Openlayer label **without overlap**, Update 2017/3/22.
<br>
<a href="http://alex2wong.github.io/Jqmap2/"> Mobile web map </a>, the JqueryMobile and Openlayer2 webApp.
<br>
<a href="http://123.206.201.245/flight.html"> Flight Game </a>, press WSAD for move, Space to fire, Enjoy it!
<br>
<a href="http://alex2wong.github.io/Jqmap2/index2.html" > First view flight </a>, press WSAD for move

## Todo List (Updated 2017/3/10):
- add websocket to support multiplayer (completed!)
- optimize touch events to promote mobile performance (completed!)
- display other player's fire action and sync Robot Status to all client, not emit to client speratedly anymore.
- optimize calculation in fire animation. promote game influence.(completed!)
- add mini map to navigate enemy drone(completed).
- add chatPopup to map, clear to show who talks.(completed).
- **!important**: refactor code structure based on es6. (inprogress..)
- **!important**: add AI-robot module to current robot flight which can follow and fire at player. (completed)


## **Related Blog**

一年多前见过一个多人聊天室应用，是张丹老师写的一个 [socket.io 教程](http://blog.csdn.net/comhaqs/article/details/23824005) （原链接点不开，贴一个转帖的），觉得socket这个东西很神奇。后来研究生期间的一个项目也用到了.Net的socket，多个客户端之间的通信， 觉得很有意思，也是那一次比较全面地认识和应用了事件委托等等一些概念。最近受群里研究mapbox的热情和@扯淡大叔， @老羽 @F3earth 所有成员的帮助和启发， 突发奇想花了点时间基于**mapbox gl js**和**socket.io**做了一个 [飞机大战游戏！](http://123.206.201.245/flight.html)，虽然功能界面很简陋。而且代码也比较原始，还没有好好重构。但是基本有了个架子，简单记下来分析下。如果对源码感兴趣或者想参与开发和优化工作，请访问git仓库: [Jqmap2](https://github.com/alex2wong/Jqmap2)


### 整体架构
简单来说，整个游戏的设计思路就是：
- **服务器**从启动开始就监听任何客户端发来了websocket 连接请求，有了连接（connection事件）后，就把客户端初次发来的用户名称、当前飞机的坐标、朝向作为一个client 加入客户端数据池（目前简单处理为clients数组）中。那么至此一个客户端的数据就同步到了服务器端。
- 以后这个客户端的飞机坐标、朝向等信息也定时发送（socket.send）给服务器端，以便于服务器端同时**广播**（broadcast）给所有其他客户端。那么其实服务端就说清楚了，也就是负责中转消息，目的还是让所有客户端视野中的玩家飞机状态保持一致。
- 既然websocket是双向通信，**客户端**也需要定时发送消息给服务器端，并且更重要的是处理服务器端发来的各种消息（message事件），分辨哪些是欢迎用户上线的消息，普通的玩家位置同步消息，抑或是 A 击败了 B 这样的消息。

这一过程中前端和服务器保持着websocket 连接，并且不断在通信。相比传统的轮询和long poll，这样更加节省流量和性能。
总体来说，游戏的逻辑是基于各种消息事件的，connection事件产生一个socket连接，socket连接会有message 事件等等。
### 后端websocket
废话说了这么多，简单看看一些关键代码如何实现。
```
// 后端关键流程实现
var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); // 引入socket.io 库
io.on('connection', function(socket) { // 开始监听客户端的websocket连接请求，connection事件产生 socket 对象
    socket.emit('open'); // 向该客户端发送open事件.
    // init client drone obj for each connection !!
    var client = {
        name: false,
        color: getColor(),
        direction: 0,
        coordinates: [0, 0]
    }
    // message from client.
    socket.on('message', function(msg) {
        if (!client.name && msg.name) { // 如果是第一次连接，把用户的名字存储起来，并且广播给所有客户端。
          var obj  = { }; // 构建发送给其他客户端的消息
          obj = msg;
          clients.push(client); // 加入后台维持的客户端数组
          socket.broadcast.emit('message', obj); // 广播欢迎语给其他客户端
        } else if ( client.name == msg.name ) { // 客户端发来的飞机状态消息
            // 广播给其他客户端
          socket.broadcast.emit('message', obj);
        }
    }
}

```
后台处理过程相对简单，基本只需接受某客户端发来的消息，转发给其他客户端即可( 随机敌机位置什么的就不讲了，当然后期要改成所有客户端共享一套敌机信息，这样就可以一起打同一个BOSS了)。但前端需要根据业务需求将服务器传来的消息分别处理

### 前端socket和飞机模型
前端业务相对复杂， 除了应对websocket 消息之外，需要构建一套飞机的数据模型，包括位置，速度，朝向，血量，武器装备等（可以非常复杂，目前就简单处理）。

```
var socket;
try {
    socket = io.connect("http://123.206.201.245:3002");
    socket.on('open', function(){  // 当服务端确认连接后，开始发送第一次数据。
        statusBar.innerText = "已经连上服务器..";
        var askName = prompt("来，取个名字", "");
    }
    socket.on("message", function(json) { // 其实收到的是js 对象，这一点很牛逼。因为双向通信过程中传递的是 Binary 形式的数据，不需要再次解析了。
      if (json.type === "welcome" && json.text.name) {
          // .. 显示其他用户登录消息
      } else if (json.type === "defeat") {
          // .. 在前端的敌机数据模型中移除空血槽的飞机
      } else if (drone && json.text.name != drone.name) {
          // .. 传来的其他客户端飞机消息
          featureCol.features.forEach(function(drone) {
          // featureCol 是所有敌机数据集合，根据用户名check是更新还是新增.
          }
      }
   }
```
其他问题包括：
- 飞机的数据涉及到随时变更上传服务器，以及渲染两个用处。渲染采用**geojson对象** 作为 mapbox api中source 的data，那么是否是一接到服务器端消息就去重绘所有飞机位置呢。这边通过setInterval 定时调用source 的 setData()方法，实现重绘。
- 飞机子弹的轨迹计算，涉及到用户按下空格键的瞬间飞机的位置和朝向，根据设定的子弹飞行时间做一个动画显示
- 子弹和敌机的**碰撞检测**，简化处理：设定一个常数作为飞机体积，在子弹飞行过程中实时计算子弹和敌机距离。在地图处于小比例尺下增大检测半径，地图处于大比例尺下相应减小检测半径。
- 目前可能子弹飞行过程中碰撞检测的**计算量偏大**，会有卡顿问题，CPU占用较高，整个应用消耗**内存100~130Mb左右**, 这个有待优化。

挑一两点分析下，一个是子弹的飞行过程，一个是Robot敌机的随机行为控制
```
// setPostion is to update Mydrone position.
function setPosition() {
    // direction in Rad. Generally, 1 Rad stands for 100km
    var current_rotate = map.getBearing(); 
    if (!manual && Math.random() > 0.95) { // 这边有意思，在每秒50帧的情况下，不是每一帧都会随机微调飞机的方向。而是5%的概率。
        direction += (Math.random() - 0.5) /5;
    }    
    // 根据飞机朝向和速度更新位置。
    point.coordinates[0] += speed * Math.sin(direction) / 100;
    point.coordinates[1] += speed * Math.cos(direction) / 100;
    
    // 校正飞机的朝向显示。因为默认情况下mapbox是根据你的视角随时调整图标方向。但实际上飞机图标的朝向必须和飞机运行方向一致，而不是简单的和标注一样。
    current_rotate = (-current_rotate) + direction * (180 / Math.PI);
}
```
以下是子弹飞行的计算过程.
```
// start: fire location, target: bullet destination, duration: total animation time
function renderBulvar(start, target, direction, duration) {
    // target is geojson POINT, add Temp point in layer.. 
    var interval = 20, ratio = interval/duration, real_point = start, range = 0.4, count = 0, hitted = false;
    if (target.coordinates) {
        var targetSource = map.getSource('drone-target');
        window.setInterval(function(){
            if (count > duration/interval) { // 到达终点，不计算了
            } else {
                // 子弹每一帧跑一定比例的路程，最终到达指定终点
                real_point.coordinates[0] += Math.sin(direction)*ratio*range;
                real_point.coordinates[1] += Math.cos(direction)*ratio*range;
                targetSource.setData(real_point);
                if (!hitted){
                    hitted = testCrash(real_point.coordinates); // 感觉这里的hitted 有问题.
                }
                count += 1;
            }
        }, interval);
    }
```

到这里其实基本介绍了这个游戏的制作过程，经历了一些不成熟的想法，总共花了近十个小时完成目前的开发。还没有严谨地考虑过代码结构和 函数复杂程序，特别是子弹飞行和碰撞等部分，碰撞到后就终结子弹飞行等等。各位如果感兴趣，愿意完成 To DO list中的事情或者有何建议，请访问git仓库: [Jqmap2](https://github.com/alex2wong/Jqmap2) 。请各位大神多提修改意见！欢迎Star

