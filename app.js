const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    secret: process.env.SESSION_SECRET || '#aP9x$7jK#5w!h8RbY2v+T@1mNfQz3',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('public'));

// Hard-coded credentials for testing
const HARD_CODED_USERNAME = 'zack';
const HARD_CODED_PASSWORD = '#0721729091';

// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check hard-coded credentials
    if (username === HARD_CODED_USERNAME && password === HARD_CODED_PASSWORD) {
        const token = jwt.sign({ username: HARD_CODED_USERNAME }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error registering user');
        }

        const newUser = new User({ username, password: hashedPassword });
        newUser.save(err => {
            if (err) {
                return res.status(500).send('Error registering user');
            }
            res.status(200).send('Registered');
        });
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
