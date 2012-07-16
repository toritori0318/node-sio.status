var sio = require('socket.io');

exports.listen = function (server, options, fn) {

  var timer = 0;
  var message_count = 0;
  var message_size = 0;

  sio.Manager.prototype.message_incr = function (data) {
      message_count++;
      if(data) {
          message_size += data.toString().length;
      }
  };

  sio.Manager.prototype.info = function () {
      var memory = process.memoryUsage();

      var conn_count = 0;
      for (var key in this.rooms) {
          conn_count += this.rooms[key].length;
      }

      var message_count_per_sec = message_count / timer;
      var message_size_per_sec  = message_size / timer;

      var message_count_per_conn = message_count / conn_count;
      message_count_per_conn = (conn_count > 0) ? message_count_per_conn / timer : 0;
      var message_size_per_conn = message_size / conn_count;
      message_size_per_conn = (conn_count > 0) ? message_size_per_conn / timer: 0;

      var info = {
          memory_rss               : memory.rss
         ,memory_heap_total        : memory.heapTotal
         ,memory_heap_used         : memory.heapUsed
         ,total_connection_count   : conn_count
         ,message_count_per_sec    : message_count_per_sec
         ,message_size_per_sec     : message_size_per_sec
         ,message_count_per_conn_per_sec  : message_count_per_conn
         ,message_size_per_conn_per_sec   : message_size_per_conn
      };

      // clear
      timer = 0;
      message_count = 0;
      message_size = 0;

      return info;
  };

  // timer
  setInterval(function () { timer++; }, 1000);

  var io = sio.listen(server, options, fn);

  var status_options = {};
  if(options && options.status) {
      status_options = options.status;
  }

  if(status_options.auto) {
      var watch_event = status_options.watch_event;

      io.sockets.on('connection', function (socket) {

          // watch event
          if(watch_event && watch_event.length > 0) {
              for (var i=0;i<watch_event.length;i++) {
                  socket.on(watch_event, function (data) {
                      io.message_incr(data);
                  });
              }
          }
      });
  }

  return io;
};

