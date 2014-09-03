(function () {
    var socket, ui, currentName, updateCurrentName;

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

    updateCurrentName = function (name) {
        currentName = name;
        ui.$currentName.text(name);
        ui.$nameForm.find('#name').val('');
    }

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
                        '<td><span id = "call" class="glyphicon glyphicon-earphone"</td>' +
                    '</tr>';
        });
        ui.$activeUsers.html(list);
    });
}());