(function() {
  $(function() {
    var $nav, $slides, $slideshow, pause_slideshow, show_slide, slide_count, slide_first, slide_last, slideshow_delay, slideshow_index, slideshow_timeout, start_slideshow;
    $slideshow = $(document.getElementById('slideshow'));
    $slides = $slideshow.children('li');
    $nav = $(document.getElementById('slides')).children('li').children('a');
    slideshow_timeout = null;
    slide_count = $slides.length;
    slide_first = 0;
    slide_last = slide_count - 1;
    slideshow_index = slide_last;
    slideshow_delay = 3000;
    pause_slideshow = function() {
      return clearTimeout(slideshow_timeout);
    };
    show_slide = function() {
      var $active;
      $nav.removeClass('active').eq(slide_last - slideshow_index).addClass('active');
      $slides.filter(":lt(" + slideshow_index + ")").each(function(i) {
        var $this, slide_offset;
        $this = $(this);
        slide_offset = slideshow_index - i;
        return setTimeout(function() {
          $this.children('.image').css({
            'z-index': i,
            top: slide_offset * 10,
            left: slide_offset * 10,
            width: 640 - (slide_offset * 20),
            opacity: 1
          });
          return $this.children('.description').css({
            opacity: 0
          });
        }, slide_offset * 50);
      });
      $slides.filter(":gt(" + slideshow_index + ")").each(function(i) {
        var $this;
        $this = $(this);
        return setTimeout(function() {
          $this.children('.image').css({
            top: 440,
            opacity: 0
          });
          return $this.children('.description').css({
            opacity: 0
          });
        }, i * 50);
      });
      $active = $slides.eq(slideshow_index);
      $active.children('.description').css({
        opacity: 1
      });
      return $active.children('.image').css({
        'z-index': slide_last,
        top: 0,
        left: 0,
        width: 640,
        opacity: 1
      });
    };
    start_slideshow = function() {
      pause_slideshow();
      show_slide();
      slideshow_index--;
      if (slideshow_index < 0) {
        slideshow_index = slide_last;
      }
      return slideshow_timeout = setTimeout(function() {
        return start_slideshow();
      }, slideshow_delay);
    };
    start_slideshow();
    return $nav.hover(function(e) {
      e.preventDefault();
      pause_slideshow();
      slideshow_index = slide_last - $nav.index($(this));
      return show_slide();
    });
  });
}).call(this);
