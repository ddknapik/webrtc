(function () {
    var socket, ui, currentName, updateCurrentName, bindActiveUsers;

    socket = io();

    ui = {
        $nameForm: $('#name-form'),
        $activeUsers: $('#active-users tbody'),
        $currentName: $('#current-name')
    }

    ui.$nameForm.submit(function (evt) {
        var name;
        evt.preventDefault();
        name = $(this).find('#name').val();
        if (name.length === 0) { return false; }
        
        socket.emit('rename', name);
        return false;
    });

    bindActiveUsers = function () {
        $('.call').click(function () {
            var recipient;
            recipient = $(this).data('user');
            socket.emit('call', recipient)
        });
    }

    updateCurrentName = function (name) {
        currentName = name;
        ui.$currentName.text(name);
        ui.$nameForm.find('#name').val('');
    }

    socket.on('callReceived', function (res) {
        console.log(res.callee + ' wants to talk with you.');
        socket.emit('answerCall', res.room);
    });

    socket.on('idAssigned', function (res) {
        updateCurrentName(res.name);
        console.log('Hey guest! You are now known as ' + res.name);
    });

    socket.on('peerJoins', function (res) {
        console.log('socket ' + res.socketId + ' joined this channel.');
    });

    socket.on('created', function (res) {
        console.log('socket ' + res.socketId + ' joined channel ' + res.channel);
    });

    socket.on('message', function (res) {
        console.log('-- MESSAGE -- ' + res.body);
    });

    socket.on('renameResult', function (res) {
        if (res.success) {
            updateCurrentName(res.name);
            console.log('Your name has been changed to ' + res.name);
        } else {
            console.log(res.message);
        }
    });

    socket.on('activeUsers', function (res) {
        var list;
        list = _.map(res.users, function (userName) {
            if (userName === currentName) { return ''; }
            return '<tr>' +
                        '<td>' + userName + '</td>' +
                        '<td><span data-user="' + userName + '" class="call glyphicon glyphicon-earphone"></td>' +
                    '</tr>';
        });
        ui.$activeUsers.html(list);
        bindActiveUsers();
    });
}());