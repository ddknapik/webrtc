/* global $:false */
$(function () {
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
        $section.css({ position: 'fixed', bottom: 0 });
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
});