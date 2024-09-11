// public/login.js
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('jwt', data.token);
            window.location.reload();
        } else {
            document.getElementById('login-error-message').textContent = 'Invalid credentials';
        }
    })
    .catch(error => console.error('Error:', error));
}

function checkAuth() {
    const token = localStorage.getItem('jwt');

    fetch('/check-auth', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'same-origin',
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
    .catch(error => console.error('Error:', error));
}

function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(message => {
        if (message === 'Registered') {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        } else {
            document.getElementById('register-error-message').textContent = message;
        }
    })
    .catch(error => console.error('Error:', error));
}

function logout() {
    localStorage.removeItem('jwt');
    window.location.reload();
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}
