(function($) {

    $.fn.videoPlayer = function(options) {


        const settings = {
            playerWidth: '0.95',
            videoClass: 'video'
        };

        if(options) {
            $.extend(settings, options);
        }


        return this.each(function() {

            $(this)[0].addEventListener('loadedmetadata', function() {

                const volanim = function() {

                    for(let i = 0; i < 1; i += 0.1) {

                        const fi = Number(Math.floor(i * 10)) / 10;
                        const volid = (fi * 10) + 1;

                        if($volume === 1) {
                            if($volhover === true) {
                                $that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-11');
                            } else {
                                $that.find('.volume-icon').removeClass().addClass('volume-icon v-change-11');
                            }
                        }
                        else if($volume === 0) {
                            if($volhover === true) {
                                $that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-1');
                            } else {
                                $that.find('.volume-icon').removeClass().addClass('volume-icon v-change-1');
                            }
                        }
                        else if($volume > (fi-0.1) && volume < fi && !$that.find('.volume-icon').hasClass('v-change-'+volid)) {
                            if($volhover === true) {
                                $that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-'+volid);
                            } else {
                                $that.find('.volume-icon').removeClass().addClass('volume-icon v-change-'+volid);
                            }
                        }

                    }
                };
                const $this = $(this);
                const $settings = settings;

                $this.wrap('<div class="'+$settings.videoClass+'"></div>');


                const $that = $this.parent('.' + $settings.videoClass);

                {

                    $( '<div class="player">'
                        + '<div class="play-pause play">'
                        + '<span class="play-button">&#9658;</span>'
                        + '<div class="pause-button">'
                        + '<span> </span>'
                        + '<span> </span>'
                        + '</div>'
                        + '</div>'
                        + '<div class="progress">'
                        + '<div class="progress-bar">'
                        + '<div class="button-holder">'
                        + '<div class="progress-button"> </div>'
                        + '</div>'
                        + '</div>'
                        + '<div class="time">'
                        + '<span class="ctime">00:00</span>'
                        + '<span class="stime"> / </span>'
                        + '<span class="ttime">00:00</span>'
                        + '</div>'
                        + '</div>'
                        + '<div class="volume">'
                        + '<div class="volume-holder">'
                        + '<div class="volume-bar-holder">'
                        + '<div class="volume-bar">'
                        + '<div class="volume-button-holder">'
                        + '<div class="volume-button"> </div>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '<div class="volume-icon v-change-0">'
                        + '<span> </span>'
                        + '</div>'
                        + '</div>'
                        + '<div class="fullscreen"> '
                        + '<a href="#"> </a>'
                        + '</div>'
                        + '</div>').appendTo($that);

                }


                let $videoWidth = $this.width();
                $that.width($videoWidth+'px');

                $that.find('.player').css({'width' : ($settings.playerWidth*100)+'%', 'left' : ((100-$settings.playerWidth*100)/2)+'%'});


                let $spc = $(this)[0],
                    $duration = $spc.duration,
                    $volume = $spc.volume,
                    currentTime;

                let $mclicking = false,
                    $vclicking = false,
                    $volhover = false,
                    $playing = false,
                    $begin = false,
                    $progMove,
                    $draggingProgress,
                    $storevol,
                    x = 0,
                    y = 0,
                    updProgWidth = 0,
                    volume = 0;

                $volume = $spc.volume;

                $that.bind('selectstart', function() { return false; });

                const progWidth = $that.find('.progress').width();


                const bufferLength = function () {

                    const buffered = $spc.buffered;

                    $that.find('[class^=buffered]').remove();

                    let $maxBuffer;
                    let $minBuffer;
                    if (buffered.length > 0) {

                        let i = buffered.length;

                        while (i--) {
                            $maxBuffer = buffered.end(i);
                            $minBuffer = buffered.start(i);

                            const bufferOffset = ($minBuffer / $duration) * 100;
                            const bufferWidth = (($maxBuffer - $minBuffer) / $duration) * 100;

                            $('<div class="buffered"></div>').css({
                                "left": bufferOffset + '%',
                                'width': bufferWidth + '%'
                            }).appendTo($that.find('.progress'));

                        }
                    }
                };

                bufferLength();

                const timeUpdate = function ($ignore) {

                    const time = Math.round(($('.progress-bar').width() / progWidth) * $duration);

                    const curTime = $spc.currentTime;

                    let seconds = 0,
                        minutes = Math.floor(time / 60),
                        tminutes = Math.floor($duration / 60),
                        tseconds = Math.floor(($duration) - (tminutes * 60));

                    if (time) {
                        seconds = Math.round(time) - (60 * minutes);

                        if (seconds > 59) {
                            seconds = Math.round(time) - (60 * minutes);
                            if (seconds === 60) {
                                minutes = Math.round(time / 60);
                                seconds = 0;
                            }
                        }

                    }

                    updProgWidth = (curTime / $duration) * progWidth;

                    if (seconds < 10) {
                        seconds = '0' + seconds;
                    }
                    if (tseconds < 10) {
                        tseconds = '0' + tseconds;
                    }

                    if ($ignore !== true) {
                        $that.find('.progress-bar').css({'width': updProgWidth + 'px'});
                        $that.find('.progress-button').css({'left': (updProgWidth - $that.find('.progress-button').width()) + 'px'});
                    }

                    $that.find('.ctime').html(minutes + ':' + seconds);
                    $that.find('.ttime').html(tminutes + ':' + tseconds);

                    if ($spc.currentTime > 0 && $spc.paused === false && $spc.ended === false) {
                        bufferLength();
                    }

                };

                timeUpdate();
                $spc.addEventListener('timeupdate', timeUpdate);

                $that.find('.play-pause').bind('click', function() {

                    $playing = !($spc.currentTime > 0 && $spc.paused === false && $spc.ended === false);

                    if($playing === false) {
                        $spc.pause();
                        $(this).addClass('play').removeClass('pause');
                        bufferLength();
                    } else {
                        $begin = true;
                        $spc.play();
                        $(this).addClass('pause').removeClass('play');
                    }

                });


                $that.find('.progress').bind('mousedown', function(e) {

                    $mclicking = true;

                    if($playing === true) {
                        $spc.pause();
                    }

                    x = e.pageX - $that.find('.progress').offset().left;

                    currentTime = (x / progWidth) * $duration;

                    $spc.currentTime = currentTime;

                });

                $that.find('.volume-bar-holder').bind('mousedown', function(e) {

                    $vclicking = true;

                    y = $that.find('.volume-bar-holder').height() - (e.pageY - $that.find('.volume-bar-holder').offset().top);

                    if(y < 0 || y > $(this).height()) {
                        $vclicking = false;
                        return false;
                    }

                    $that.find('.volume-bar').css({'height' : y+'px'});
                    $that.find('.volume-button').css({'top' : (y-($that.find('.volume-button').height()/2))+'px'});

                    $spc.volume = $that.find('.volume-bar').height() / $(this).height();
                    $storevol = $that.find('.volume-bar').height() / $(this).height();
                    $volume = $that.find('.volume-bar').height() / $(this).height();

                    volanim();

                });

                volanim();

                $that.find('.volume').hover(function() {
                    $volhover = true;
                }, function() {
                    $volhover = false;
                });

                const body_html = $('body, html');

                body_html.bind('mousemove', function(e) {

                    if($begin === true) {
                        $that.hover(function() {
                            $that.find('.player').stop(true, false).animate({'opacity' : '1'}, 0.5);
                        }, function() {
                            $that.find('.player').stop(true, false).animate({'opacity' : '0'}, 0.5);
                        });
                    }
                    if ($mclicking === true) {
                        const buttonWidth = $that.find('.progress-button').width();

                        x = e.pageX - $that.find('.progress').offset().left;

                        if ($playing === true) {
                            if (currentTime < $duration) {
                                $that.find('.play-pause').addClass('pause').removeClass('play');
                            }
                        }

                        if (x < 0) {
                            $spc.currentTime = 0;
                        } else if (x > progWidth) {
                            $spc.currentTime = $duration;
                        } else {
                            currentTime = (x / progWidth) * $duration;
                            $spc.currentTime = currentTime;
                        }

                        $that.find('.progress-bar').css({'width': $progMove + 'px'});

                        $that.find('.progress-button').css({'left': ($progMove - buttonWidth) + 'px'});

                    }

                    if($vclicking === true) {

                        y = $that.find('.volume-bar-holder').height() - (e.pageY - $that.find('.volume-bar-holder').offset().top);

                        let volMove = 0;

                        if($that.find('.volume-holder').css('display') === 'none') {
                            $vclicking = false;
                            return false;
                        }

                        if(!$that.find('.volume-icon').hasClass('volume-icon-hover')) {
                            $that.find('.volume-icon').addClass('volume-icon-hover');
                        }


                        if(y < 0 || y === 0) {

                            $volume = 0;
                            volMove = 0;

                            $that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-11');

                        } else if(y > $(this).find('.volume-bar-holder').height() || (y / $that.find('.volume-bar-holder').height()) === 1) {

                            $volume = 1;
                            volMove = $that.find('.volume-bar-holder').height();

                            $that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-1');

                        } else {

                            $volume = $that.find('.volume-bar').height() / $that.find('.volume-bar-holder').height();
                            volMove = y;

                        }

                        $that.find('.volume-bar').css({'height' : volMove+'px'});
                        $that.find('.volume-button').css({'top' : (volMove+$that.find('.volume-button').height())+'px'});

                        volanim();

                        $spc.volume = $volume;
                        $storevol = $volume;


                    }


                    if($volhover === false) {

                        $that.find('.volume-holder').stop(true, false).fadeOut(100);
                        $that.find('.volume-icon').removeClass('volume-icon-hover');

                    }

                    else {
                        $that.find('.volume-icon').addClass('volume-icon-hover');
                        $that.find('.volume-holder').fadeIn(100);
                    }


                });

                $spc.addEventListener('ended', function() {

                    $playing = false;

                    if($draggingProgress === false) {
                        $that.find('.play-pause').addClass('play').removeClass('pause');
                    }

                });

                $that.find('.volume-icon').bind('mousedown', function() {

                    $volume = $spc.volume; // Update volume

                    if(typeof $storevol == 'undefined') {
                        $storevol = $spc.volume;
                    }

                    if($volume > 0) {
                        $spc.volume = 0;
                        $volume = 0;
                        $that.find('.volume-bar').css({'height' : '0'});
                        volanim();
                    }
                    else {
                        $spc.volume = $storevol;
                        $volume = $storevol;
                        $that.find('.volume-bar').css({'height' : ($storevol*100)+'%'});
                        volanim();
                    }


                });


                body_html.bind('mouseup', function() {

                    $mclicking = false;
                    $vclicking = false;
                    if($playing === true) {
                        $spc.play();
                    }

                    bufferLength();


                });

                const fullscreen = $('.fullscreen');

                if(!$spc.requestFullscreen) {
                    fullscreen.hide();
                }

                fullscreen.click(function() {

                    if ($spc.requestFullscreen) {
                        $spc.requestFullscreen();
                    }
                });
            });
        });
    }
})(jQuery);