const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database setup (replace with your MongoDB URI)
mongoose.connect('mongodb://localhost:27017/musicplayer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User schema and model
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
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Serve static files
app.use(express.static('public'));

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.status(200).send('Authenticated');
    } else {
        res.status(401).send('Not Authenticated');
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username }, (err, user) => {
        if (err || !user) {
            return res.status(401).send('Invalid credentials');
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).send('Invalid credentials');
            }

            req.session.userId = user._id;
            res.status(200).send('Logged in');
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
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }

        res.redirect('/');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
