
// Music Player Functions
let now_playing = document.querySelector('.now-playing');
let track_art = document.querySelector('.track-art');
let track_name = document.querySelector('.track-name');
let track_artist = document.querySelector('.track-artist');

let playpause_btn = document.querySelector('.playpause-track');
let next_btn = document.querySelector('.next-track');
let prev_btn = document.querySelector('.prev-track');

let seek_slider = document.querySelector('.seek_slider');
let volume_slider = document.querySelector('.volume_slider');
let curr_time = document.querySelector('.current-time');
let total_duration = document.querySelector('.total-duration');
let wave = document.getElementById('wave');
let randomIcon = document.querySelector('.fa-random');
let curr_track = document.createElement('audio');

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;

const music_list = [
    {
        img: 'images/Toni-Ann Singh.jpg',
        name: 'Toni-Ann Singh',
        artist: 'Burna Boy, Popcaan',
        music: 'Toni-Ann Singh.mp3'
    },
    {
        img: 'images/kante.jpeg',
        name: 'kante',
        artist: 'Davido, Fave',
        music: 'music/kante.mp3'
    },
    {
        img: 'images/silence.jpeg',
        name: 'silence',
        artist: 'Popcaan',
        music: 'music/silence.mp3'
    },
    {
        img: 'images/destruction.jpeg',
        name: 'destruction',
        artist: 'Tommy Lee',
        music: 'music/destruction.mp3'
    }
];

function loadTrack(track_index) {
    clearInterval(updateTimer);
    reset();

    curr_track.src = music_list[track_index].music;
    curr_track.load();

    track_art.style.backgroundImage = "url(" + music_list[track_index].img + ")";
    track_name.textContent = music_list[track_index].name;
    track_artist.textContent = music_list[track_index].artist;
    now_playing.textContent = "Playing music " + (track_index + 1) + " of " + music_list.length;

    updateTimer = setInterval(setUpdate, 1000);

    curr_track.addEventListener('ended', nextTrack);
    random_bg_color();
}

function random_bg_color() {
    let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    let a = function () {
        return Math.floor(Math.random() * 16);
    };
    let color1 = '#' + hex[a()] + hex[a()] + hex[a()] + hex[a()] + hex[a()] + hex[a()];
    let color2 = '#' + hex[a()] + hex[a()] + hex[a()] + hex[a()] + hex[a()] + hex[a()];

    let angle = 'to right';
    let gradient = 'linear-gradient(' + angle + ',' + color1 + ', ' + color2 + ')';
    document.body.style.background = gradient;
}

function reset() {
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
}

function randomTrack() {
    isRandom ? pauseRandom() : playRandom();
}

function playRandom() {
    isRandom = true;
    randomIcon.classList.add('randomActive');
}

function pauseRandom() {
    isRandom = false;
    randomIcon.classList.remove('randomActive');
}

function repeatTrack() {
    let current_index = track_index;
    loadTrack(current_index);
    playTrack();
}

function playpauseTrack() {
    isPlaying ? pauseTrack() : playTrack();
}

function playTrack() {
    curr_track.play();
    isPlaying = true;
    track_art.classList.add('rotate');
    wave.classList.add('loader');
    playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
    curr_track.pause();
    isPlaying = false;
    track_art.classList.remove('rotate');
    wave.classList.remove('loader');
    playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
    if (track_index < music_list.length - 1 && isRandom === false) {
        track_index += 1;
    } else if (track_index < music_list.length - 1 && isRandom === true) {
        let random_index = Number.parseInt(Math.random() * music_list.length);
        track_index = random_index;
    } else {
        track_index = 0;
    }
    loadTrack(track_index);
    playTrack();
}

function prevTrack() {
    if (track_index > 0) {
        track_index -= 1;
    } else {
        track_index = music_list.length - 1;
    }
    loadTrack(track_index);
    playTrack();
}

function seekTo() {
    let seekto = curr_track.duration * (seek_slider.value / 100);
    curr_track.currentTime = seekto;
}

function setVolume() {
    curr_track.volume = volume_slider.value / 100;
}

function setUpdate() {
    let seekPosition = 0;
    if (!isNaN(curr_track.duration)) {
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;

        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }
}

// Registration Function
function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    // Send POST request to the backend
    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.status === 200) {
            alert('Registration successful!');
            showLogin(); // Switch to the login form
        } else {
            response.json().then(data => {
                document.getElementById('register-error-message').textContent = data.error;
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Login Function
function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Send POST request to the backend
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.status === 200) {
            alert('Login successful!');
            window.location.reload(); // Reload the page to update UI
        } else {
            response.json().then(data => {
                document.getElementById('login-error-message').textContent = data.error;
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Show Register Form
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Show Login Form
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Check if the user is authenticated when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    fetch('http://localhost:3000/check-auth', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.status === 200) {
            document.getElementById('music-player').style.display = 'block';
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'none';
        } else {
            document.getElementById('music-player').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Logout Function
function logout() {
    fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.status === 200) {
            alert('Logged out!');
            window.location.reload(); // Reload to show the login form
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
