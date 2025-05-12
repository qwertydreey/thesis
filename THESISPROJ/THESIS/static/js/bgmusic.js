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

    if (savedBgmVolume) {
        previousBgmVolume = savedBgmVolume;
    }
    if (savedBgmMute === 'true') {
        isBgmMuted = true;
    }
    if (savedSfxVolume) {
        sfxVolume = savedSfxVolume;
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
        if (isBgmMuted) return; // Don't change volume if BGM is muted
        const value = volumeSlider.value;
        const percentage = (value / volumeSlider.max) * 100;
        bgMusic.volume = value / 100;  // Adjust volume (0 to 1)
        volumeSlider.style.background = `linear-gradient(to right, #4a90e2 ${percentage}%, #d3d3d3 ${percentage}%)`;

        // Save the volume to localStorage
        localStorage.setItem('bgmVolume', value);
    }

    function updateSfxVolume() {
        sfxVolume = sfxVolumeSlider.value / 100;

        // Save the volume to localStorage
        localStorage.setItem('sfxVolume', sfxVolume);
    }

    // Mute function for Background Music
    function toggleBgmMute() {
        if (isBgmMuted) {
            bgMusic.volume = volumeSlider.value / 100;  // Use the slider value when unmuting
            isBgmMuted = false;
        } else {
            previousBgmVolume = volumeSlider.value;  // Store the current volume when muting
            bgMusic.volume = 0;
            isBgmMuted = true;
        }

        // Save mute status to localStorage
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
                bgMusic.volume = volumeSlider.value / 100;  // Restore volume based on slider value
                isBgmMuted = false;
            }

            // Save mute status to localStorage
            localStorage.setItem('bgmMuted', isBgmMuted);
        });
    }

    // Add event listener for mute checkbox (SFX)
    const sfxMuteCheckbox = document.getElementById("sfxMuteCheckbox");
    if (sfxMuteCheckbox) {
        sfxMuteCheckbox.checked = isSfxMuted;
        sfxMuteCheckbox.addEventListener('change', function (e) {
            if (e.target.checked) {
                isSfxMuted = true;
            } else {
                isSfxMuted = false;
            }

            // Save mute status to localStorage
            localStorage.setItem('sfxMuted', isSfxMuted);
        });
    }

    // Function to play SFX with volume control
    window.playSound = function (src, delay = 0) {
        if (isSfxMuted) return; // Prevent SFX from playing if muted
        setTimeout(() => {
            const sound = new Audio(src);
            sound.volume = sfxVolume; // Set the volume for SFX
            sound.play();
        }, delay);
    };

    // Auto play background music after first click to bypass autoplay policy
    document.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(err => {
                console.warn('Autoplay blocked:', err);
            });
        }
    }, { once: true });

    // Expose functions to globally control background music
    window.muteBgMusic = function () {
        bgMusic.muted = true;
    };

    window.unmuteBgMusic = function () {
        bgMusic.muted = false;
    };

    window.toggleBgMusic = function () {
        bgMusic.muted = !bgMusic.muted;
    };

    // Expose the toggle for SFX mute
    window.toggleSfxMute = function () {
        isSfxMuted = !isSfxMuted;
        localStorage.setItem('sfxMuted', isSfxMuted);
    };
});
