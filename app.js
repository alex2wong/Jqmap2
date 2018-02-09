/**
 * author: alex2wong
 * git: https://github.com/alex2wong
 * repo: https://github.com/alex2wong/Jqmap2
 */

// require
var express = require('express'),
  path = require('path'),
  app = express(),
  fs = require('fs'),
  // server = require('https').createServer(options,app),
  // io = require('socket.io').listen(server),
  proxy = require('./proxy'),
  log4js = require('log4js');

// var options = {
//   key: fs.readFileSync('../../tmp/ssl/server.key'),
//   cert: fs.readFileSync('../../tmp/ssl/server.crt')
// }

server = require('http').createServer(app);
io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3002);
app.set('app', __dirname);
// serve static file in root dir. for url: "", return: "".
app.use(express.static(path.join(__dirname, '')));

// config CORS to provide service to cross domain page.
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "alex2wong.github.io, 111.231.11.20, *");
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

/** get current clients info.. */
app.get("/api/clients", function(req, res) {
  res.write(JSON.stringify(clients));
  res.end();
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
      backups: 10,
      category: 'normal'  
    }
  ],
  replaceConsole: false
});
/** should be exposed to socket msg handler.. */
logger = log4js.getLogger('normal');
logger.setLevel("INFO");

app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO}));

// clients Array. store realtime status of all drones.
var clients = [], msgs = [];
var sockets = {}, sockCount = 0;
var robots = [];

var enemyIndex = 0;
// Emit a robot enemy every 12 seconds.
timer1 = setInterval(function(){
  var randomCoord =  randInfo();
  var randomEnemy = {
    name: '敌机' + enemyIndex,
    direction: 0,
    coordinates: randomCoord
  }
  var EnemyMsg = {
    'author': 'System',
    'type': 'message'
  };

  if (enemyIndex < 1000) enemyIndex += 1;
  else {
      enemyIndex = 0;
  }
  EnemyMsg['text'] = randomEnemy;
  EnemyMsg['time'] = getTime();
  console.warn(`timer sockets ready to broadCast, sockCount:${sockCount}`);
  lastClient = clients[clients.length-1];
  if (sockCount > 0 ) {
    // robots.push(randomEnemy);  
    //// broadcast msg with active socket instance..
    for(k in sockets) {
      console.warn(`for soc name:${k}, socket instance:${sockets[k]}`);
      if (sockets[k] && k == lastClient.name) {
        console.warn(`### sockets ${k} broadcast robot info ${EnemyMsg['text']}, ${lastClient.name}`);
        sockets[k].broadcast.emit('message', EnemyMsg);
        // sockets[clients[0].name].emit('message', EnemyMsg);
        break;
      }
    }
  }
}, 12000);

// register WebSocket connect listener, each connection has one socket.
io.on('connection', function(socket) {
  socket.emit('open');

  // init client drone obj for each connection !!
  var client = {
    // socket: socket,
    name: false,
    color: getColor(),
    // direction in Rad, coordinates in LngLat
    direction: 0,
    coordinates: [0, 0],
    life: 100,
    defeat: 0
  }

  // message from client.
  socket.on('message', function handleMsg(msg) {
    var obj = {
      time: getTime(),
      color: client.color
    };
    var droneStatus = msg;

    // if it is first msg, init the drone! and push to pool!
    if (!client.name && droneStatus.name) {
      client.name = droneStatus.name;
      client.direction = droneStatus.direction;
      client.history = [];
      if (droneStatus.point) {
        client.coordinates = droneStatus.point.coordinates;
      }
      // client.life = droneStatus.life;
      clients.push(client);
      sockets[client.name] = socket;
      sockCount += 1;

      // this welcome obj is ready to emit to All clients.
      obj['text'] = client;
      obj['author'] = 'System';
      obj['type'] = 'welcome';
      logger.info(client.name + " login, login@" + obj["time"]);
      console.log(client.name + "logged in");
      console.log("add socket instance: " + client.name, "current active socks num: " + sockCount);
      printData(clients, "name");

      socket.emit('system', obj);
      // broadcast the welcome from system.
      socket.broadcast.emit('message', obj);

    } else if (client.name == droneStatus.name){
      // if it is not the first message, sync the droneStatus
      client.direction = droneStatus.direction;
      client.coordinates = droneStatus.point.coordinates;
      client.message = droneStatus.message;
      if(droneStatus.message) client.history.push(droneStatus.message);
      client.life = droneStatus.life;
      client.firing = droneStatus.firing;  

      obj['text'] = client;
      obj['author'] = 'System';
      obj['type'] = 'message';
      if (client.message) {
        msgs.push({
          time: getTime(),
          from : client.name,
          content: client.message
        });
        logger.info(client.name + " say: " + client.message);
        printData(clients, "name");
        logger.info(client.name + " say @location: " + client.coordinates[0].toFixed(3) 
          + "," + client.coordinates[1].toFixed(3) + " @" + getTime());
      }

      // // 返回消息（可以省略）
      // socket.emit('message', obj);

      // broadcast this droneStatus to all other clients.
      socket.broadcast.emit('message', obj);
    } 
    // if receive DamageDrone info
    else if(!droneStatus.life) {
      // droneStatus Now reprensent 
      obj['text'] = droneStatus;
      obj['author'] = client.name;
      obj['type'] = 'defeat';
      droneStatus.death += 1;
      deathCoords = droneStatus.point.coordinates;
      logger.warn(droneStatus.name + " was defeated @location: " + deathCoords[0].toFixed(3) 
          + "," + deathCoords[1].toFixed(3) + " @" + getTime());
      socket.broadcast.emit('message', obj);
    }
    temp = handleData(clients, 'name', client.name, false);
    if (temp) {
      temp = client;
    }

  });  

  socket.on('disconnect', function disconHandler() {
    var obj = {
      time: getTime(),
      color: client.color,
      author: 'System',
      text: client.name,
      type: 'disconnect'
    };

    // 广播用户已退出
    socket.broadcast.emit('system', obj);
    logger.warn(client.name + " disconnect, @" + obj["time"]);
    console.warn(client.name + " disconnect");
    // socket instance should be deleted from sockets pool. delInSockets, delInClients.
    handleData(clients,"name",client.name,true);
    sockets[client.name] = null; sockCount -= 1;
    console.warn("delete socket instance: " + client.name, "current active socks num: " + sockCount);
    printData(clients, 'name');
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

/**
 * return dist between two lonlat points..
 * @param {*array} p1 
 * @param {*array} p2 
 */
var calcDist = function(p1, p2) {
  if (p1 instanceof Array && p2 instanceof Array) {
    return Math.sqrt(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2));
  }
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

/**
 * Just print Data Pool items..
 */
function printData(dataPool, key) {
  if (dataPool !== undefined && dataPool.length ) {
    var ind = 0;
    console.log("Item number: " + dataPool.length);
    dataPool.forEach((item)=>{
      console.log(ind + " :" + item[key]);
      ind += 1;
    });
  }
}

/**
 * Common Function to find/del Data pool.
 * @param dataPool:array, pool objs to handle
 * @param key:string, field to search item
 * @param value: string
 * @param del: boolean, delete item or not.
 */
function handleData(dataPool, key, value, del) {
    var delet = del;
    if (dataPool !== undefined && dataPool.length ) {
      for(var i = 0; i< dataPool.length; i++) {
        if (dataPool[i][key] == value) {          
          if (delet) {
            dataPool.splice(i, 1);
            console.log("DELETE pool data: " + value);
            return null;
          } else {
            return dataPool[i];
          }
        }
      }
    }
    return null;
}

/**
 * @param fn {Function}
 * @param delay {Number}
 * @return {Function}
 */
function debounce(fn, delay) {
    var timer;
    // timer is closure in mem.. returned function is the listener..
    return function() {
        var context = this;
        var args = arguments;
        // clear the previous timer to prevent the function call.
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args)
        }, delay);
    }
}
