/* global webrtcDetectedBrowser:false, io:false */
'use strict';

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

window.onbeforeunload = function () {
    hangup();
};

var sendChannel, receiveChannel, sendButton, sendTextarea, receiveTextarea,
    localVideo, remoteVideo, isChannelReady, isInitiator, isStarted,
    localStream, remoteStream,
    // Peer Connection
    pc, pc_config, pc_constraints, sdpConstraints,
    room, socket,
    // getUserMedia constraints
    constraints;

sendButton      = document.getElementById('sendButton');
sendTextarea    = document.getElementById('dataChannelSend');
receiveTextarea = document.getElementById('dataChannelReceive');

localVideo      = document.querySelector('#localVideo');
remoteVideo     = document.querySelector('#remoteVideo');

sendButton.onclick = sendData;

isChannelReady = false;
isInitiator    = false;
isStarted      = false;

pc_config = (function (browser) {
    var url;
    url = browser === 'firefox' ? 'stun:23.21.150.121' : 'stun:stun.l.google.com:19302';
    return {'iceServers': [{'url': url}]};
}(webrtcDetectedBrowser));

pc_constraints = {
    'optional': [{'DtlsSrtpKeyAgreement': true}]
};

sdpConstraints = {};

room = prompt('Enter room name:');
socket = io.connect('http://localhost:3000');

if (room !== '') {
    console.log('Create or join room', room);
    socket.emit('create or join', room);
}

constraints = {video: true, audio: true};

function handleUserMedia(stream) {
    localStream = stream;
    attachMediaStream(localVideo, stream);
    console.log('Adding local stream');
    sendMessage('got user media');
}

function handleUserMediaError(error) {
    console.log('navigator.getUserMedia error:', error);
}

// Server-mediated message exchanging
// 1. Server -> CLient

// Handle 'created' message coming back from server:
// This peer is the initiator
socket.on('created', function (room) {
    console.log('Created room', room);
    isInitiator = true;

    navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    console.log('Getting user media with constraints', constraints);
    checkAndStart();
});

socket.on('full', function (room) {
    console.log('Room', room, 'is full.');
});

socket.on('join', function (room) {
    console.log('Another peer mage a request to join room', room);
    console.log('This peer is the initiator of room', room, '!');
    isChannelReady = true;
});

socket.on('joined', function (room) {
    console.log('This peer has joined room', room);
    isChannelReady = true;

    navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
    console.log('Getting user media with constraints', constraints);
});

socket.on('log', function (array) {
    console.log.apply(console, array);
});

socket.on('message', function (message) {
    console.log('Received message:', message);
    if (message === 'got user media') {
        checkAndStart();
    } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
            checkAndStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
    }
});

// 2. Client -> Server

function sendMessage(message) {
    console.log('Sending message:', message);
    socket.emit('message', message);
}

// Channel negotiation trigger function
function checkAndStart() {
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
        createPeerConnection();
        isStarted = true;
        if (isInitiator) { doCall(); }
    }
}

// Peer Connection management
function createPeerConnection () {
    try {
        pc = new RTCPeerConnection(pc_config, pc_constraints);
        pc.addStream(localStream);
        pc.onicecandidate = handleIceCandidate;

        console.log(
            "Created RTCPeerConnection with:\n" +
            "config: '" + JSON.stringify(pc_config) + "'\n" +
            "constraints: '" + JSON.stringify(pc_constraints) + "'"
        );
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ', e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }

    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;

    if (isInitiator) {
        try {
            // Create a reliable data channel
            sendChannel = pc.createDataChannel('sendDataChannel', {reliable: true});
            trace('Created send data channel');
        } catch (e) {
            alert('Failed to create data channel.');
            trace('createDataChannel() failed with exception:', e.message);
        }
        sendChannel.onopen    = handleSendChannelStateChange;
        sendChannel.onclose   = handleSendChannelStateChange;
        sendChannel.onmessage = handleMessage;
    } else {
        // Joiner
        pc.ondatachannel = gotReceiveChannel;
    }
}

// Data channel management
function sendData() {
    var data = sendTextarea.value;
    if (isInitiator) { sendChannel.send(data); }
    else { receiveChannel.send(data); }

    trace('Sent data: ', data);
}

// Handlers
function gotReceiveChannel(event) {
    trace('Receive Channel Callback');
    
    receiveChannel           = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen    = handleReceiveChannelStateChange;
    receiveChannel.onclose   = handleReceiveChannelStateChange;
}

function handleMessage(event) {
    trace('Received message:', event.data);
    receiveTextarea.value += event.data +'\n';
}

function handleSendChannelStateChange() {
    var readyState = sendChannel.readyState;
    trace('Send channel state is:', readyState);

    if (readyState === 'open') {
        dataChannelSend.disabled = false;
        dataChannelSend.focus();
        dataChannelSend.placeholder = '';
        sendButton.disabled = false;
    } else {
        dataChannelSend.disabled = true;
        sendButton.disabled = true;
    }
}

function handleReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    trace('Receive channel state is:', readyState);

    if (readyState === 'open') {
        dataChannelSend.disabled = false;
        dataChannelSend.focus();
        dataChannelSend.placeholder = '';
        sendButton.disabled = false;
    } else {
        dataChannelSend.disabled = true;
        sendButton.disabled = true;
    }
}

// ICE candidates management
function handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    } else {
        console.log('End of candidates.');
    }
}

// Create offer
function doCall() {
    console.log('Creating Offer...');
    pc.createOffer(setLocalAndSendMessage, onSignalingError, sdpConstraints);
}

function onSignalingError(error) {
    console.log('Failed to create signaling message: ', error.name);
}

function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer(setLocalAndSendMessage, onSignalingError, sdpConstraints);
}

// Success handler for both createOffer() and createAnswer()
function setLocalAndSendMessage(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    sendMessage(sessionDescription);
}

// Remote stream handlers
function handleRemoteStreamAdded(event) {
    console.log('Remote stream added');
    attachMediaStream(remoteVideo, event.stream);
    console.log('Remote stream attached.');
    remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event:', event);
}

// Clean-up functions
function hangup() {
    console.log('Hanging up.');
    stop();
    sendMessage('Bye!');
}

function handleRemoteHangup() {
    console.log('Session terminated');
    stop();
    isInitiator = false;
}

function stop(){
    isStarted = false;
    if (sendChannel) { sendChannel.close(); }
    if (receiveChannel) { receiveChannel.close(); }
    if (pc) { pc.close(); }
    pc = null;
    sendButton.disabled = true;
}