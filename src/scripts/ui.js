/* global $:false */
$(function () {
    $('.conversation_id').select();

    // setTimeout(function(){
    //     $('.inner_content').css('opacity', '1');
    // }, 800);

    function moveGuideSection() {
        var $section, distanceToMove;
        $section = $('.guide');

        distanceToMove = $(document).height() - $('.image_container').height();
        $section.animate({
            'margin-top': '-' + distanceToMove + 'px'
        }, 600, function () {
            // $section.css({ position: 'fixed', top: distanceToMove });
            console.log('fsdfdsf');
        });
    }

    $('.how_does_it_work').click(moveGuideSection);
});