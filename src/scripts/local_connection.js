(function () {
    var ui, localStream, showPreview, setupLocalVideo, showTips;

    ui = {
        $sidebar: $('#sidebar'),
        $main: $('#main'),
        $previewBtn: $('#preview-btn'),
        $jumbotron: $('.jumbotron')
    };

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

    showPreview = function () {
        var $videoEl;
        console.log('Obtaining access to camera and microphone.');
        $videoEl = $('#local-video');
        $videoEl.hide();
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        
        navigator.getUserMedia({
            audio: true,
            video: true
        }, function (stream) {
            console.log('Local stream obtained.');
            setupLocalVideo(stream, $videoEl);
            showTips();
        }, function (err) {
            console.log(err);
        });
    }

}());