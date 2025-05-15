document.addEventListener('DOMContentLoaded', function () {
    const bodyBgmAttr = document.body.getAttribute('data-bgm');
    let bgMusicSrc = '/static/sfx/default.mp3';
    let bgMusic;
    let volumeSlider = document.getElementById('volume');
    let sfxVolumeSlider = document.getElementById('sfx-volume');
    let isBgmMuted = false;
    let previousBgmVolume = 50;  // Default volume
    let sfxVolume = 1;
    let isSfxMuted = false;

    // Get saved volume and mute settings from localStorage
    const savedBgmVolume = localStorage.getItem('bgmVolume');
    const savedBgmMute = localStorage.getItem('bgmMuted');
    const savedSfxVolume = localStorage.getItem('sfxVolume');
    const savedSfxMute = localStorage.getItem('sfxMuted');

    if (savedBgmVolume !== null) {
        previousBgmVolume = parseInt(savedBgmVolume, 10);
    }
    if (savedBgmMute === 'true') {
        isBgmMuted = true;
    }
    if (savedSfxVolume !== null) {
        sfxVolume = parseFloat(savedSfxVolume);
    }
    if (savedSfxMute === 'true') {
        isSfxMuted = true;
    }

    // Set the music source based on the page map or default
    if (bodyBgmAttr === 'dynamic') {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedMap = urlParams.get('map') || 'multiplication';
        const selectedStage = parseInt(urlParams.get('stage'), 10) || 1;

        const mapMusicSources = {
            multiplication: '/static/bgm/multiplication.mp3',
            addition: '/static/bgm/addition.mp3',
            subtraction: '/static/bgm/subtraction.mp3',
            division: '/static/bgm/division.mp3',
            counting: '/static/bgm/counting.mp3',
            comparison: '/static/bgm/comparison.mp3',
            numerals: '/static/bgm/numerals.mp3',
            placevalue: '/static/bgm/placevalue.mp3'
        };

        bgMusicSrc = mapMusicSources[selectedMap] || '/static/sfx/default.mp3';
    } else if (bodyBgmAttr) {
        bgMusicSrc = bodyBgmAttr;
    }

    // Create and append the audio element for background music
    bgMusic = document.createElement('audio');
    bgMusic.src = bgMusicSrc;
    bgMusic.loop = true;
    bgMusic.volume = isBgmMuted ? 0 : previousBgmVolume / 100;
    bgMusic.id = 'bg-music';
    bgMusic.autoplay = false;

    document.body.appendChild(bgMusic);

    // Set up volume slider for BGM
    if (volumeSlider) {
        volumeSlider.value = previousBgmVolume;
        volumeSlider.addEventListener('input', updateBgmVolume);
        updateBgmVolume(); // Initialize the volume slider state on load
    }

    // Set up volume slider for SFX
    if (sfxVolumeSlider) {
        sfxVolumeSlider.value = sfxVolume * 100;
        sfxVolumeSlider.addEventListener('input', updateSfxVolume);
    }

    function updateBgmVolume() {
        if (isBgmMuted) return;
        const value = volumeSlider.value;
        const volume = value / 100;
        bgMusic.volume = volume;
        localStorage.setItem('bgmVolume', value);
    }

    function updateSfxVolume() {
        if (isSfxMuted) return;
        sfxVolume = sfxVolumeSlider.value / 100;
        localStorage.setItem('sfxVolume', sfxVolume);
    }

    // Mute function for Background Music
    function toggleBgmMute() {
        if (isBgmMuted) {
            bgMusic.volume = volumeSlider.value / 100;
            isBgmMuted = false;
        } else {
            previousBgmVolume = volumeSlider.value;
            bgMusic.volume = 0;
            isBgmMuted = true;
        }
        localStorage.setItem('bgmMuted', isBgmMuted);
    }

    // Mute function for SFX
    function toggleSfxMute() {
        isSfxMuted = !isSfxMuted;
        localStorage.setItem('sfxMuted', isSfxMuted);
    }

    // Add event listener for mute checkbox (BGM)
    const muteCheckbox = document.getElementById("muteCheckbox");
    if (muteCheckbox) {
        muteCheckbox.checked = isBgmMuted;
        muteCheckbox.addEventListener('change', function (e) {
            if (e.target.checked) {
                bgMusic.volume = 0;
                isBgmMuted = true;
            } else {
                bgMusic.volume = volumeSlider.value / 100;
                isBgmMuted = false;
            }
            localStorage.setItem('bgmMuted', isBgmMuted);
        });
    }

    // Add event listener for mute checkbox (SFX)
    const sfxMuteCheckbox = document.getElementById("sfxMuteCheckbox");
    if (sfxMuteCheckbox) {
        sfxMuteCheckbox.checked = isSfxMuted;
        sfxMuteCheckbox.addEventListener('change', function (e) {
            isSfxMuted = e.target.checked;
            localStorage.setItem('sfxMuted', isSfxMuted);
        });
    }

    // Function to play SFX with volume control
    window.playSound = function (src, delay = 0) {
        if (isSfxMuted) return;
        setTimeout(() => {
            const sound = new Audio(src);
            sound.volume = sfxVolume;
            sound.play();
        }, delay);
    };

    // Auto play background music after first user interaction
    document.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(err => {
                console.warn('Autoplay blocked:', err);
            });
        }
    }, { once: true });

    // Global controls
    window.muteBgMusic = function () {
        bgMusic.muted = true;
    };

    window.unmuteBgMusic = function () {
        bgMusic.muted = false;
    };

    window.toggleBgMusic = function () {
        bgMusic.muted = !bgMusic.muted;
    };

    window.toggleSfxMute = function () {
        toggleSfxMute();
    };
});
