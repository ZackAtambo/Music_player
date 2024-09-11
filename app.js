const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Simple session setup for user authentication
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Mock data store
let users = [];

// Handle user registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ error: 'User already exists' });
    }
    users.push({ username, password });
    res.status(200).json({ message: 'Registration successful' });
});

// Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.user = username; // Save user to session
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Check user authentication status
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ message: 'Authenticated' });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
