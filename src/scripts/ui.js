/* global $:false, ZeroClipboard:false */
$(function () {
    var clipboardClient;
    $('.conversation_id').select();

    // setTimeout(function(){
    //     $('.inner_content').css('opacity', '1');
    // }, 800);

    function moveGuideSection() {
        var $section, distanceToMove, imageHeight, offset, batko;
        $section    = $('.guide');
        batko = $(window).height() - $('.guide').height();
        imageHeight = $('.image_container').height() - batko;
        console.log(imageHeight);
        $section.hide();
        $section.css({ position: 'fixed', bottom: 0 });
        $section.slideDown();
        // $section.show({ easing: 'slide' });
        $(window).scroll(function (event) {
            offset = $('body').scrollTop();
            console.log(offset);
            if (offset >= imageHeight) {
                console.log('fsdfdsfdsfsd');
                $section.css({ position: 'static' });
                $(window).unbind();
                return;
            }
        });
    }

    $('.how_does_it_work').click(moveGuideSection);
    clipboardClient = new ZeroClipboard( document.getElementById('copy_to_clipboard') );

    clipboardClient.on('aftercopy', function (event) {
        var copiedData = event.data['text/plain'];
        console.log(copiedData);

        // $('.inner_content')
        $('body').prepend("<div class='video_overlay'>DUPA</div>");
        $('.video_overlay').slideDown();
    });

    // var offset, currentPosition;
    // offset = $('.image_container').height() + $('.guide').height();
    // offset = $('.guide').height();
    // $(window).scroll(function () {
    //     currentPosition = $('body').scrollTop();
    //     console.log(currentPosition);
    //     if (currentPosition === offset) {
    //         $('.dupa').css({
    //             position: 'fixed',
    //             bottom: 0,
    //             zIndex: 1999
    //         });
    //         console.log('fsdfsfdssd');
    //     }
    // });
});