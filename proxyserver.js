var express = require('express'),
  path = require('path'),
  fs = require('fs'),
  app = express(),
  options = {
    key: fs.readFileSync("../../tmp/ssl/server.key"),
    cert: fs.readFileSync("../../tmp/ssl/server.crt")
  }
  server = require('https').createServer(options, app),
  proxy = require('./proxy'),
  log4js = require('log4js');

app.set('port', process.env.PORT || 3003);
app.set('app', __dirname);

app.use(express.static(path.join(__dirname, '')));

// config CORS to provide service to cross domain page.
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With, accept, origin, content-type");
   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
         // res.header("Content-Type", "application/json");
   next();
})

app.get('/', function(req, res) {
  res.sendFile('index.html', {
    root: __dirname
  })
})

app.get('/proxy', function(req, res) {
  proxy(req, res);
})

server.listen(app.get('port'), function() {
  console.log("custom Proxy Server listening on port " + app.get('port'));
})

