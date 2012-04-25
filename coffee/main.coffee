$ ->

  $slideshow = $(document.getElementById('slideshow'))
  $slides = $slideshow.children('li')

  $nav = $(document.getElementById('slides')).children('li').children('a')

  slideshow_timeout = null
  slide_count = $slides.length
  slide_first = 0
  slide_last = slide_count - 1
  slideshow_index = slide_last
  slideshow_delay = 3000

  pause_slideshow = ->
    clearTimeout(slideshow_timeout)

  show_slide = ->
    $nav.removeClass('active').eq(slide_last - slideshow_index).addClass('active')

    $slides.filter(":lt(#{slideshow_index})").each (i) ->
      $this = $(this)
      slide_offset = slideshow_index - i
      setTimeout ->
        $this.children('.image').css('z-index': i, top: slide_offset * 10, left: slide_offset * 10, width: 640 - (slide_offset * 20), opacity: 1)
        $this.children('.description').css(opacity: 0)
      , slide_offset * 50

    $slides.filter(":gt(#{slideshow_index})").each (i) ->
      $this = $(this)
      setTimeout ->
        $this.children('.image').css(top: 440, opacity: 0)
        $this.children('.description').css(opacity: 0)
      , i * 50

    $active = $slides.eq(slideshow_index)
    $active.children('.description').css(opacity: 1)
    $active.children('.image').css('z-index': slide_last, top: 0, left: 0, width: 640, opacity: 1)

  start_slideshow = ->
    pause_slideshow()

    show_slide()

    slideshow_index--
    slideshow_index = slide_last if slideshow_index < 0

    slideshow_timeout = setTimeout ->
      start_slideshow()
    , slideshow_delay

  start_slideshow()

  $nav.hover (e) ->
    e.preventDefault()
    pause_slideshow()

    slideshow_index = slide_last - $nav.index($(this))
    show_slide()
