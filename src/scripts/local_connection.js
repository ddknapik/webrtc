(function () {
    var ui, localStream, showPreview;

    ui = {
        $sidebar: $('#sidebar'),
        $main: $('#main'),
        $previewBtn: $('#preview-btn'),
        $jumbotron: $('.jumbotron')
    };

    ui.$previewBtn.click(function () {
        ui.$jumbotron.fadeOut('normal');
        $('<video id="local-video" autoplay></div>').prependTo(ui.$sidebar);
        showPreview();
    });

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
            var videoSrc;
            console.log('Local stream obtained.');
            localStream = stream
            videoSrc    = window.URL ? URL.createObjectURL(stream) : stream;
            $videoEl.attr('src', videoSrc);
            $videoEl.show();
        }, function (err) {
            console.log(err);
        });
    }

}());