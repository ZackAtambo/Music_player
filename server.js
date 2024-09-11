const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3001; // Updated port

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musicplayer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Ensure secret is defined
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));
app.use(express.static('public'));

// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'kadush', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/check-auth', authenticateJWT, (req, res) => {
    res.status(200).send('Authenticated');
});

app.post('/login',
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Check hard-coded credentials (for testing only)
        if (username === 'zack' && password === '#0721729091') {
            const token = jwt.sign({ username: 'zack' }, process.env.JWT_SECRET || 'kadush', { expiresIn: '1h' });
            return res.json({ token });
        }

        // Check credentials in database
        User.findOne({ username }, (err, user) => {
            if (err || !user) {
                return res.status(401).send('Invalid credentials');
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err || !isMatch) {
                    return res.status(401).send('Invalid credentials');
                }

                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'kadush', { expiresIn: '1h' });
                res.json({ token });
            });
        });
    }
);

app.post('/register',
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Error registering user');
            }

            const newUser = new User({ username, password: hashedPassword });
            newUser.save(err => {
                if (err) {
                    console.error('Error saving user:', err);
                    return res.status(500).send('Error registering user');
                }
                res.status(200).send('Registered');
            });
        });
    }
);

app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
