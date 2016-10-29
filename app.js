/**
 * author: alex2wong
 * git: https://github.com/alex2wong
 * repo: https://github.com/alex2wong/Jqmap2
 */

// require
var express = require('express'),
  path = require('path'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);


app.set('port', process.env.PORT || 3002);
app.set('app', __dirname);
// serve static file in root dir. for url: "", return: "".
app.use(express.static(path.join(__dirname, '')));
// config the default HTML. set rootPath in res.send(path[,option])
app.get('/', function(req, res) {
  res.sendFile('index.html',{
    root: __dirname
  });
});

app.get('/flight', function(req, res) {
  res.sendFile('flight.html',{
    root: __dirname
  });
});

io.set('log level', 1);

// clients Array. store realtime status of all drones.
var clients = [];

// register WebSocket connect listener, each connection has one socket.
io.on('connection', function(socket) {
  console.log('One client connected..');
  socket.emit('open');

  // init client drone obj for each connection !!
  var client = {
    // socket: socket,
    name: false,
    color: getColor(),
    // direction in Rad, coordinates in LngLat
    direction: 0,
    coordinates: [0, 0],
    life: 100
  }
  var timer1;

  // message from client.
  socket.on('message', function(msg) {
    var obj = {
      time: getTime(),
      color: client.color
    };
    var droneStatus = msg;

    // if it is first msg, init the drone! and push to pool!
    if (!client.name && droneStatus.name) {
      client.name = droneStatus.name;
      client.direction = droneStatus.direction;
      if (droneStatus.point) {
        client.coordinates = droneStatus.point.coordinates;
      }
      // client.life = droneStatus.life;
      clients.push(client);

      // this welcome obj is ready to emit to All clients.
      obj['text'] = client;
      obj['author'] = 'System';
      obj['type'] = 'welcome';
      console.log(client.name + ' login');

      socket.emit('system', obj);
      // broadcast the welcome from system.
      socket.broadcast.emit('message', obj);

    } else if (client.name == droneStatus.name){
      // if it is not the first message, sync the droneStatus
      client.direction = droneStatus.direction;
      client.coordinates = droneStatus.point.coordinates;
      // client.life = droneStatus.life;

      obj['text'] = client;
      obj['author'] = 'System';
      obj['type'] = 'message';
      // console.log(client.name + ' sync status: ' + msg);

      // // 返回消息（可以省略）
      // socket.emit('message', obj);

      // broadcast this droneStatus to all other clients.
      socket.broadcast.emit('message', obj);
    } 
    // if receive DamageDrone info
    else if(!droneStatus.life){
      // droneStatus Now reprensent 
      obj['text'] = droneStatus;
      obj['author'] = client.name;
      obj['type'] = 'defeat';
      console.warn(client.name + ' defeated ' + droneStatus.name);
      socket.broadcast.emit('message', obj);
    }

  });

  // for each client connection, emit a robot enemy every 5 seconds.
  timer1 = setInterval(function(){
    var randomCoord =  randInfo();
    var randomEnemy = {
      name: '敌机',
      direction: 0,
      coordinates: randomCoord
    }
    var EnemyMsg = {
      'author': 'System',
      'type': 'message'
    };
    EnemyMsg['text'] = randomEnemy;
    EnemyMsg['time'] = getTime();
    socket.emit('message', EnemyMsg);
  }, 20000);

  socket.on('disconnect', function() {
    var obj = {
      time: getTime(),
      color: client.color,
      author: 'System',
      text: client.name,
      type: 'disconnect'
    };

    // 广播用户已退出
    socket.broadcast.emit('system', obj);
    clearInterval(timer1);
    console.log(client.name + 'Disconnect');
  });

});

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

// 随机生成坐标点，模拟实时坐标数据
var randInfo = function() {
  var lng = Math.random() * 2 + 119;
  var lat = Math.random() * 2 + 29;
  var point = [lng, lat];
  return point;
}

var getTime = function() {
  var date = new Date();
  return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

var getColor = function() {
  var colors = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'pink', 'red', 'green',
    'orange', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue'
  ];
  return colors[Math.round(Math.random() * 10000 % colors.length)];
}