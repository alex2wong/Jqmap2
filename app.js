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
  io = require('socket.io').listen(server),
  proxy = require('./proxy');
  log4js = require('log4js');


app.set('port', process.env.PORT || 3002);
app.set('app', __dirname);
// serve static file in root dir. for url: "", return: "".
app.use(express.static(path.join(__dirname, '')));

// config CORS to provide service to cross domain page.
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, accept, origin, content-type");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("Content-Type", "application/json");
  next();
})

// config the default HTML. set rootPath in res.send(path[,option])
app.get('/', function(req, res) {
  res.sendFile('index.html',{
    root: __dirname
  });
});

app.get('/proxy', function(req, res) {
  proxy(req, res);
})

app.get('/flight', function(req, res) {
  res.sendFile('flight.html',{
    root: __dirname
  });
});

io.set('log level', 1);
// config the back-end log.
log4js.configure({
  appenders: [
    {type: 'console'},
    {
      type: 'file',
      filename: 'logs/flight.log',
      maxLogSize: 1024*1024,
      backups: 3,
      category: 'normal'  
    }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel("INFO");

app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO}));

// clients Array. store realtime status of all drones.
var clients = [];
var sockets = [];
var robots = [];

// Emit a robot enemy every 12 seconds.
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
  if (sockets.length > 0) {
    logger.info("Currently, connection number is: " + sockets.length);
    robots.push(randomEnemy);  
    sockets[0].sock.broadcast.emit('message', EnemyMsg);
  }
  // socket.emit('message', EnemyMsg);
}, 12000);

// register WebSocket connect listener, each connection has one socket.
io.on('connection', function(socket) {
  logger.info('One client connected..');
  sockets.push({
    "sock": socket
  });
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
      logger.info(client.name + ' login');

      socket.emit('system', obj);
      // broadcast the welcome from system.
      socket.broadcast.emit('message', obj);

    } else if (client.name == droneStatus.name){
      // if it is not the first message, sync the droneStatus
      client.direction = droneStatus.direction;
      client.coordinates = droneStatus.point.coordinates;
      client.message = droneStatus.message;
      client.firing = droneStatus.firing;
      // client.life = droneStatus.life;

      obj['text'] = client;
      obj['author'] = 'System';
      obj['type'] = 'message';
      if (client.message) {
        logger.info(client.name + ' say: ' + client.message);
      }

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
      logger.warn(client.name + ' defeated ' + droneStatus.name);
      socket.broadcast.emit('message', obj);
    }

  });  

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
    logger.warn(client.name + ' disconnect');
  });

});

server.listen(app.get('port'), function() {
  logger.info("Express server listening on port " + app.get('port'));
});

/**
 * return random initial direction for Robot Drone. unit: rad.
 */
var randDirect = function() {
  return Math.random() * 2 * Math.PI;
}

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