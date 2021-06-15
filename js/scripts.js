const video = document.getElementById('video');
const controls = document.querySelectorAll('.controls');
const controlsTop = document.querySelector('.controls-top');
const controlsBottom = document.querySelector('.controls-bottom');
const slider = document.getElementById('slider');
const uiSlider = document.getElementsByClassName('noUi-connects');
const playButton = document.getElementById('playpause');
const playButtonReplay = playButton.querySelector('.replay');
const playButtonIcons = document.querySelectorAll('#playpause svg');
const playbackAnimation = document.getElementById('playback-animation');
const playbackIcons = playbackAnimation.querySelectorAll('svg');
const videoContainer = document.getElementById('video-container');
const sliderTooltip = document.getElementsByClassName('slider-tooltip');
const videoSource = document.getElementById('video-source');

const url = window.location.href;
const source = new URL(url).searchParams.get('source');
const poster = new URL(url).searchParams.get('poster');
if (source) {
    videoSource.setAttribute('src', source);
    video.load();
}
if (poster) {
    video.setAttribute('poster', poster);
    video.load();
}

const videoWorks = !!document.createElement('video').canPlayType;

if (videoWorks) {
    video.controls = false;
    controls.forEach(con => {
        con.classList.remove('hidden');
    });
}

//slider
noUiSlider.create(slider, {
    start: [0],
    behaviour: 'drag-tap',
    step: 1,
    margin: 0,
    padding: 0,
    connect: 'lower',
    format: wNumb({
        decimals: 2,
    }),
    range: {
        'min': 0,
        'max': 1
    },
});


function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

    return {
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2),
    };
}

function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    const time = formatTime(videoDuration);
    slider.noUiSlider.updateOptions({
        range: {
            'min': 0,
            'max': videoDuration
        },

    });
}

video.addEventListener('loadedmetadata', initializeVideo);

function togglePlay() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function updatePlayButtonIcons() {
    let i;
    let length = playButtonIcons.length;
    for (i = 0; i < length; i++) {
        playButtonIcons[i].classList.add('hidden');
    }
    if (video.paused) {
        playButtonIcons[0].classList.remove('hidden');
        playButton.setAttribute('data-title', 'Play (k)');
    } else {
        playButtonIcons[1].classList.remove('hidden');
        playButton.setAttribute('data-title', 'Pause (k)');
    }
    togglePlaybackIcons();
}

function togglePlaybackIcons() {
    playbackIcons.forEach(icon => {
        icon.classList.toggle('hidden');
    })
}

playButton.addEventListener('click', togglePlay);
playbackAnimation.addEventListener('click', togglePlay);
playButton.addEventListener('click', updatePlayButtonIcons);
playbackAnimation.addEventListener('click', updatePlayButtonIcons);
video.addEventListener('click', togglePlay);
video.addEventListener('click', updatePlayButtonIcons);

function animatePlayBack() {
    playbackAnimation.animate([
        {
            opacity: 1,
            transform: "translate(-50%, -50%) scale(1)",
        },
        {
            opacity: 0,
            transform: "translate(-50%, -50%) scale(1.3)",
        }
    ], {
        duration: 500,
    })
}

video.addEventListener('click', animatePlayBack);


function showControls() {
    controlsTop.style.display = 'flex';
    controlsBottom.classList.remove('hidden');
}
function hideControls() {
    if (video.paused || video.ended) {
        return;
    }
    controlsTop.style.display = 'none';
    controlsBottom.classList.add('hidden');

}

video.addEventListener('mouseenter', showControls);
video.addEventListener('mouseleave', hideControls);
controlsBottom.addEventListener('mouseenter', showControls);
controlsBottom.addEventListener('mouseleave', hideControls);
controlsTop.addEventListener('mouseenter', showControls);
controlsTop.addEventListener('mouseleave', hideControls);


function checkReplay() {
    if (video.ended) {
        playButtonIcons.forEach(icon => {
            icon.classList.add('hidden');
        });
        playButtonReplay.classList.remove('hidden');
        playButton.setAttribute('data-title', 'Replay (k)');
    }
}


video.addEventListener('timeupdate', checkReplay);

function showSliderTooltip(event) {
    sliderTooltip[0].style.display = 'inline-block';
    let offset = event.clientX - video.getBoundingClientRect().left - Number(window.getComputedStyle(controlsBottom, null).getPropertyValue('padding-left').toString().split('p')[0]);
    sliderTooltip[0].style.left = offset + "px";
    const posTime = Math.round((offset / event.target.clientWidth) * parseInt(video.duration, 10));
    const time = formatTime(posTime);
    sliderTooltip[0].innerText = `${time.minutes}:${time.seconds}`;
}

function hideSliderTooltip() {
    sliderTooltip[0].style.display = 'none';
}

uiSlider[0].addEventListener('mousemove', showSliderTooltip);
uiSlider[0].addEventListener('mouseleave', hideSliderTooltip);
const tooltip = document.createElement('div');
tooltip.classList.add('slider-tooltip');
uiSlider[0].appendChild(tooltip);


function keyboardShortcuts(e) {
    switch (e.key) {
        case 'k': case 'K': case ' ': togglePlay(); updatePlayButtonIcons(); break;
        case 'ArrowLeft': video.currentTime -= 10; break;
        case 'ArrowRight': video.currentTime += 10; break;
        default: return;
    }
}

document.addEventListener('keyup', keyboardShortcuts);


slider.noUiSlider.on('change', (values, handle) => {
    video.currentTime = values[handle];
});
slider.noUiSlider.on('change', function () {
    slider.noUiSlider.set(this.value);
});

function updateProgress() {
    slider.noUiSlider.set(video.currentTime);
}

let currentTime = video.currentTime;
setInterval(() => {
    if (currentTime !== video.currentTime) {
        updateProgress();
    }
    currentTime = video.currentTime
}, 100);
