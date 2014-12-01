var socketio = require('socket.io'), io;

function countUsers(room) {
    var users;
    users = Object.keys( io.nsps['/'].adapter.rooms[room] || {} );
    return users.length;
}

exports.listen = function (server) {
    io = socketio.listen(server);

    io.sockets.on('connection', function (socket) {
        socket.on('message', function (message) {
            // log('# got message: ', message);
            // channel-only broadcast
            // socket.broadcast.to(message.channel).emit('message', message);
            socket.broadcast.emit('message', message);
        });

        socket.on('create or join', function (room) {
            var numClients = countUsers(room);

            log('# Room' + room + ' has ' + numClients + ' client(s)');
            log('# Request to create or join room', room);
            if (numClients === 0) {
                socket.join(room);
                socket.emit('created', room);
            } else if (numClients === 1) {
                io.sockets.in(room).emit('join', room);
                socket.join(room);
                socket.emit('joined', room);
            } else {
                socket.emit('full', room);
            }
        });

        function log() {
            var array = ['>>>> '];
            for (var i = arguments.length - 1; i >= 0; i =- 1) {
                array.push(arguments[i]);
            }
            socket.emit('log', array);
        }
    });
};