document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const musicList = document.getElementById('music-list');
    const musicPlayerZone = document.getElementById('music-player-zone');
    const showSongsButton = document.getElementById('show-songs');
    const backToLandingButton = document.getElementById('back-to-landing');
    const goHomeButton = document.getElementById('go-home');
    const songList = document.getElementById('song-list');
    const audio = new Audio();
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isRandom = false;

    showSongsButton.addEventListener('click', () => {
        fetch('/songs')
            .then(response => response.json())
            .then(songs => {
                songList.innerHTML = '';
                songs.forEach((song, index) => {
                    const li = document.createElement('li');
                    li.textContent = song;
                    li.addEventListener('click', () => {
                        loadTrack(index);
                        playTrack();
                        musicPlayerZone.style.display = 'block';
                        musicList.style.display = 'none';
                    });
                    songList.appendChild(li);
                });
                musicList.style.display = 'block';
                landingPage.style.display = 'none';
            });
    });

    backToLandingButton.addEventListener('click', () => {
        musicList.style.display = 'none';
        musicPlayerZone.style.display = 'none';
        landingPage.style.display = 'block';
    });

    goHomeButton.addEventListener('click', () => {
        musicPlayerZone.style.display = 'none';
        landingPage.style.display = 'block';
    });

    function loadTrack(index) {
        const track = musicListData[index];
        audio.src = `music/${track}`;
        audio.load();
        document.querySelector('.track-name').textContent = track.split('.')[0];
        document.querySelector('.track-artist').textContent = 'Artist Name';
        document.querySelector('.now-playing').textContent = `Playing music ${index + 1} of ${musicListData.length}`;
        document.querySelector('.track-art').style.backgroundImage = `url(images/${track.split('.')[0]}.jpeg)`;
        updateTimer = setInterval(() => {
            document.querySelector('.seek_slider').value = (audio.currentTime / audio.duration) * 100;
            document.querySelector('.current-time').textContent = formatTime(audio.currentTime);
            document.querySelector('.total-duration').textContent = formatTime(audio.duration);
        }, 1000);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function playTrack() {
        audio.play();
        isPlaying = true;
        document.querySelector('.playpause-track i').classList.replace('fa-play-circle', 'fa-pause-circle');
        document.querySelector('.track-art').classList.add('rotate');
        document.querySelector('#wave').classList.add('loader');
    }

    function pauseTrack() {
        audio.pause();
        isPlaying = false;
        document.querySelector('.playpause-track i').classList.replace('fa-pause-circle', 'fa-play-circle');
        document.querySelector('.track-art').classList.remove('rotate');
        document.querySelector('#wave').classList.remove('loader');
    }

    function playpauseTrack() {
        isPlaying ? pauseTrack() : playTrack();
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % musicListData.length;
        loadTrack(currentTrackIndex);
        playTrack();
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + musicListData.length) % musicListData.length;
        loadTrack(currentTrackIndex);
        playTrack();
    }

    function setVolume() {
        audio.volume = document.querySelector('.volume_slider').value / 100;
        document.getElementById('volume-symbol').className = audio.volume === 0 ? 'fa fa-volume-off' : 'fa fa-volume-down';
    }

    function seekTo() {
        audio.currentTime = (document.querySelector('.seek_slider').value / 100) * audio.duration;
    }

    function randomTrack() {
        isRandom = !isRandom;
        document.querySelector('.random-track i').classList.toggle('fa-random', isRandom);
        document.querySelector('.random-track i').classList.toggle('fa-random-active', !isRandom);
    }

    function repeatTrack() {
        audio.loop = !audio.loop;
        document.querySelector('.repeat-track i').classList.toggle('fa-repeat', audio.loop);
        document.querySelector('.repeat-track i').classList.toggle('fa-repeat-1', !audio.loop);
    }

    audio.addEventListener('ended', () => {
        isRandom ? nextTrack() : nextTrack();
    });

    document.querySelector('.playpause-track').addEventListener('click', playpauseTrack);
    document.querySelector('.next-track').addEventListener('click', nextTrack);
    document.querySelector('.prev-track').addEventListener('click', prevTrack);
    document.querySelector('.volume_slider').addEventListener('input', setVolume);
    document.querySelector('.seek_slider').addEventListener('input', seekTo);
    document.querySelector('.random-track').addEventListener('click', randomTrack);
    document.querySelector('.repeat-track').addEventListener('click', repeatTrack);

    // Sample music list data
    const musicListData = [
        'destruction.mp3',
        'kante.mp3',
        'silence.mp3',
        'Toni-Ann Singh.mp3'
    ];

    // Load the first track initially
    loadTrack(currentTrackIndex);
});
