var ui, localStream, setupLocalVideo, showTips,
    sendChannel, receiveChannel, sdpConstraints, mediaConstraints,
    webrtcDetectedBrowser, isInitiator;

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
    $currentName: $('#current-name')
};

window.onbeforeunload = function () {
    hangup();
}

ui.$previewBtn.click(function () {
    ui.$jumbotron.html('<video id="local-video" autoplay></div>')
    showPreview();
});

setupLocalVideo = function (stream, $videoEl) {
    var videoSrc;
    localStream = stream
    videoSrc    = window.URL ? URL.createObjectURL(stream) : stream;
    $videoEl.attr('src', videoSrc);
    $videoEl.show();
};

showTips = function () {
    ui.$jumbotron.append(
        '<h1>Great job!</h1>' +
        '<p>What are you waiting for? Just call any of your friends listed on the left!</p>'
    );
}

function handleLocalStream (stream) {
    console.log('Local stream obtained.');
    setupLocalVideo(stream, $videoEl);
    showTips();
}

function handleLocalStreamError (err) {
    console.log(err);
}

function showPreview() {
    var $videoEl;
    console.log('Obtaining access to camera and microphone.');
    $videoEl = $('#local-video');
    $videoEl.hide();
    navigator.getUserMedia(mediaConstraints, handleLocalStream, handleLocalStreamError);
    setupPeerConnection();
}

function setupPeerConnection () {
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