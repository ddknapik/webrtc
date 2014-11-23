/* global io, $, _ */
var socket, ui, currentName;

socket = io();

ui.$nameForm.submit(function (evt) {
    var name;
    evt.preventDefault();
    name = $(this).find('#name').val();
    if (name.length === 0) { return false; }
    
    socket.emit('rename', name);
    return false;
});

function bindActiveUsers() {
    $('.call').click(function () {
        var recipient;
        recipient = $(this).data('user');
        socket.emit('call', recipient);
        showPreview();
    });
}

function updateCurrentName(name) {
    currentName = name;
    ui.$currentName.text(name);
    ui.$nameForm.find('#name').val('');
}

socket.on('callReceived', function (res) {
    var $panel, $submit;
    $panel  = $('#call-panel');
    $submit = $panel.find('.btn-success');
    $panel.find('.caller-name').text(res.caller);
    $submit.data('room', res.room);
    $panel.removeClass('hide');
    $submit.click(function () {
        socket.emit('answerCall', res.room);
        $submit.unbind('click');
        $panel.addClass('hide');
    });
});

socket.on('joined', function (room) {
    console.log('This peer has joined room ' + room);
    isChannelReady = true;
    navigator.getUserMedia(mediaConstraints, handleLocalStream, handleLocalStreamError);
    console.log('Getting user media with constraints', mediaConstraints);
});

socket.on('idAssigned', function (res) {
    updateCurrentName(res.name);
    console.log('Hey guest! You are now known as', res.name);
});

socket.on('peerJoins', function (res) {
    console.log('socket', res.socketId, ' joined this channel.');
});

socket.on('created', function (res) {
    console.log('socket', res.socketId, 'joined channel', res.channel);
});

socket.on('message', function (res) {
    console.log('-- MESSAGE --', res.body);
});

socket.on('renameResult', function (res) {
    if (res.success) {
        updateCurrentName(res.name);
        console.log('Your name has been changed to', res.name);
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
