var options = { };

var app = require('express').createServer()
  , io = require('../../lib/sio.status').listen(app, options);

app.listen(8000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/status', function (req, res) {
  res.json(io.info());
});

io.sockets.on('connection', function (socket) {

  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    io.message_incr(data);
    console.log(data);
  });
});

