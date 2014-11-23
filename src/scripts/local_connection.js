/* global $ */
var ui, localStream, setupLocalVideo,
    sendChannel, sdpConstraints, mediaConstraints,
    webrtcDetectedBrowser, isInitiator, isStarted,
    isChannelReady, peerConnectionConfig, peerConnectionConstraints;

isStarted = false;
isChannelReady = false;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

peerConnectionConfig = (function () {
    if (webrtcDetectedBrowser === 'firefox') {
        return {'iceServers': [{'url':'stun:23.21.150.121'}]};
    } else {
        return {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
    }
}());

peerConnectionConstraints = {
    'optional': [
        { 'DtlsSrtpKeyAgreement': true }
    ]
};

sdpConstraints = {};
mediaConstraints = { video: true, audio: true };

ui = {
    $sidebar: $('#sidebar'),
    $main: $('#main'),
    $previewBtn: $('#preview-btn'),
    $remoteVide: $('#remote-video'),
    $jumbotron: $('.jumbotron'),
    $nameForm: $('#name-form'),
    $activeUsers: $('#active-users tbody'),
    $currentName: $('#current-name'),
    $localVideo: $('#local-video'),
    $remoteVideo: $('#remote-video')
};

function hangup() {
    console.log('end');
}

window.onbeforeunload = function () {
    hangup();
};

setupLocalVideo = function (stream) {
    var videoSrc;
    localStream = stream;
    videoSrc    = window.URL ? URL.createObjectURL(stream) : stream;
    ui.$localVideo.attr('src', videoSrc);
    ui.$localVideo.show();
};

function handleLocalStream (stream) {
    console.log('Local stream obtained.');
    setupLocalVideo(stream);
}

function handleLocalStreamError (err) {
    console.log(err);
}

function setupPeerConnection () {
    var connection;
    console.log('channel is ready?', isChannelReady);
    if (isStarted || typeof localStream === 'undefined' || !isChannelReady) {
        return;
    }
    connection = new RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);
    connection.addStream(localStream);
    connection.onicecandidate = handleIceCandidate;
    console.log('Created RTCPeerConnnection');
    connection.onaddstream = handleRemoteStreamAdded;
    connection.onremovestream = handleRemoteStreamRemoved;
    if (isInitiator) {
        // Create a reliable data channel
        sendChannel = connection.createDataChannel("sendDataChannel", {reliable: true});
        trace('Created send data channel');
        sendChannel.onopen = handleSendChannelStateChange;
        sendChannel.onmessage = handleMessage;
        sendChannel.onclose = handleSendChannelStateChange;
    } else { // Joiner
        connection.ondatachannel = gotReceiveChannel;
    }
    isStarted = true;
}

function showPreview() {
    console.log('Obtaining access to camera and microphone.');
    // ui.$localVideo.hide();
    isInitiator = true;
    // isChannelReady = true;
    navigator.getUserMedia(mediaConstraints, handleLocalStream, handleLocalStreamError);
    setupPeerConnection();
}