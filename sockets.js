var socketio      = require('socket.io'),
    _             = require('lodash'),
    guestId       = 1,
    usernames     = {},
    namesTaken    = [],
    currentRoom   = [],
    conversations = [],
    io, assignGuestId, otherUsersInRoom, joinRoom,
    usernamesInRoom, refreshActiveUsers;

function assignGuestId(socket) {
    var name;
    name = 'Guest#' + guestId;
    usernames[socket.id] = name;
    namesTaken.push(name);
    socket.emit('idAssigned', {
        name: name
    });
    ++guestId;
}

function usernamesInRoom(room) {
    var users, collectedUsernames = [];
    users = Object.keys( io.nsps['/'].adapter.rooms[room] || {} );
    for (var index in users) {
        var socketId = users[index];
        collectedUsernames.push(usernames[socketId]);
    }
    return collectedUsernames;
}

function otherUsersInRoom(room, socket) {
    var users, message;
    users = Object.keys( io.nsps['/'].adapter.rooms[room] || {} );
    if (users.length === 1) { return 'You are the very first user here.'; }
    message = 'Other users in the room: ';
    for (var index in users) {
        var socketId = users[index];
        if (socketId === socket.id) { continue; }
        if (index > 0) { message += ', '; }
        message  += usernames[socketId];
    }
    return message;
}

function joinRoom(socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinRoom', { room: room });
    socket.broadcast.to(room).emit('message', {
        body: usernames[socket.id] + ' has joined ' + room + '.'
    });
    socket.emit('message', {
        body: otherUsersInRoom(room, socket)
    });
    refreshActiveUsers(room);
}

function refreshActiveUsers() {
    io.emit('activeUsers', {
        users: usernamesInRoom('Public')
    });
}

exports.listen = function (server) {
    io = socketio.listen(server);
    
    io.on('connection', function (socket) {
        assignGuestId(socket);
        joinRoom(socket, 'Public');
        
        socket.on('disconnect', function () {
            var idIndex;
            idIndex = namesTaken.indexOf(usernames[socket.id]);
            delete namesTaken[idIndex];
            delete usernames[socket.id];
        });

        socket.on('answerCall', function (conversationId) {
            var conversation;
            conversation = _.find(conversations, function (el) {
                return el.room === conversationId;
            });
            io.sockets.connected[conversation.caller].emit('message', {
                body: 'Jest nieźle :)'
            });
            socket.emit('joined', conversationId);
        });

        socket.on('call', function (recipient) {
            var recipientId, randomNumber, conversationId, recipientSocket;
            
            randomNumber   = Math.floor((Math.random() * 9999) + 1);
            conversationId = randomNumber.toString();
            recipientId    = _.findKey(usernames, function (name) {
                return name === recipient;
            });
            
            conversations.push({
                caller: socket.id,
                recipient: recipientId,
                room: conversationId
            });
            recipientSocket = io.sockets.connected[recipientId];
            recipientSocket.emit('callReceived', {
                caller: usernames[socket.id],
                room: conversationId
            });
        });
        
        socket.on('rename', function (name) {
            var previousName, previousNameIdx;
            if (namesTaken.indexOf(name) !== -1) {
                socket.emit('renameResult', {
                    success: false,
                    message: name + 'has already been taken'
                });
            }
            previousName = usernames[socket.id];
            previousNameIdx = namesTaken.indexOf(previousName);
            namesTaken.push(name);
            usernames[socket.id] = name;
            delete namesTaken[previousNameIdx];
            socket.emit('renameResult', {
                success: true,
                name: name
            });
            refreshActiveUsers(currentRoom[socket.id]);
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                body: previousName + ' changed his name to ' + name
            });
        });
    });

};